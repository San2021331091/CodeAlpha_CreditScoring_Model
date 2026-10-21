import os
import json
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import (
    ApplicantInput, PredictionResponse, BatchPredictionRequest,
    WhatIfRequest, WhatIfResponse
)
from app.ml.predictor import CreditPredictor
from app.ml.trainer import CreditModelTrainer, MODELS_DIR

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("credit-scoring-ml")

app = FastAPI(
    title="CodeAlpha Credit Scoring ML Engine",
    description="High-performance machine learning microservice for creditworthiness assessment, risk tiering, and explainability.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend and NestJS gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = CreditPredictor()

@app.get("/")
def root():
    return {
        "service": "CodeAlpha Credit Scoring ML Engine",
        "status": "online",
        "model_ready": predictor.is_ready(),
        "active_model": predictor.model_name if predictor.is_ready() else "None",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": predictor.is_ready()
    }

@app.post("/api/ml/predict", response_model=PredictionResponse)
def predict_credit(input_data: ApplicantInput):
    try:
        data_dict = input_data.model_dump()
        model_type = data_dict.pop("model_type", "Random Forest")
        result = predictor.predict_single(data_dict, model_type=model_type)
        return result
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/api/ml/batch-predict")
def batch_predict(batch: BatchPredictionRequest):
    try:
        results = []
        for applicant in batch.applicants:
            data_dict = applicant.model_dump()
            res = predictor.predict_single(data_dict, model_type=batch.model_type)
            results.append(res)
        return {"total_processed": len(results), "predictions": results}
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/what-if", response_model=WhatIfResponse)
def simulate_what_if(req: WhatIfRequest):
    try:
        orig_dict = req.applicant.model_dump()
        model_type = orig_dict.pop("model_type", "Random Forest")
        
        # Original prediction
        orig_res = predictor.predict_single(orig_dict, model_type=model_type)
        
        # Apply simulated delta
        sim_dict = orig_dict.copy()
        if req.scenario.debt_reduction > 0:
            sim_dict["total_debt"] = max(0.0, sim_dict["total_debt"] - req.scenario.debt_reduction)
            
        if req.scenario.income_increase > 0:
            sim_dict["annual_income"] = sim_dict["annual_income"] + req.scenario.income_increase
            
        if req.scenario.utilization_target is not None:
            sim_dict["credit_utilization_ratio"] = max(0.01, min(1.0, req.scenario.utilization_target))
            
        if req.scenario.savings_increase > 0:
            sim_dict["savings_balance"] = sim_dict["savings_balance"] + req.scenario.savings_increase
            
        sim_res = predictor.predict_single(sim_dict, model_type=model_type)
        
        score_diff = sim_res["credit_score"] - orig_res["credit_score"]
        prob_diff = round(sim_res["default_probability"] - orig_res["default_probability"], 4)
        
        insights = []
        if score_diff > 0:
            insights.append(f"Projected score improvement of +{score_diff} points (from {orig_res['credit_score']} to {sim_res['credit_score']}).")
        elif score_diff < 0:
            insights.append(f"Score may decline by {abs(score_diff)} points under this scenario.")
        else:
            insights.append("No significant score variation detected with current parameters.")
            
        if orig_res["risk_tier"] != sim_res["risk_tier"]:
            insights.append(f"Risk tier upgraded from '{orig_res['risk_tier']}' to '{sim_res['risk_tier']}'.")
            
        if orig_res["recommended_interest_rate_pct"] > sim_res["recommended_interest_rate_pct"]:
            rate_savings = orig_res["recommended_interest_rate_pct"] - sim_res["recommended_interest_rate_pct"]
            insights.append(f"Estimated interest rate reduction of {rate_savings:.2f}% APR.")
            
        return {
            "original": orig_res,
            "simulated": sim_res,
            "score_delta": score_diff,
            "default_prob_delta": prob_diff,
            "insights": insights
        }
    except Exception as e:
        logger.error(f"What-If simulation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ml/metrics")
def get_metrics():
    metrics_path = os.path.join(MODELS_DIR, "metrics.json")
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="Metrics not found. Please train models first.")
    with open(metrics_path, "r") as f:
        return json.load(f)

@app.get("/api/ml/models")
def get_available_models():
    metrics_path = os.path.join(MODELS_DIR, "metrics.json")
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="Metrics not found. Please train models first.")

    with open(metrics_path, "r") as f:
        data = json.load(f)
    return {
        "active_model": data["best_model"],
        "available_models": list(data["models"].keys())
    }

def _run_retraining(n_samples: int):
    trainer = CreditModelTrainer()
    trainer.train_and_evaluate(n_samples=n_samples)
    predictor._load_artifacts()

@app.post("/api/ml/retrain")
def trigger_retrain(background_tasks: BackgroundTasks, samples: int = 50000):
    background_tasks.add_task(_run_retraining, samples)
    return {
        "status": "retraining_scheduled",
        "samples": samples,
        "message": f"Model retraining initiated with {samples} training instances in background."
    }
