import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

from app.ml.feature_engineering import (
    engineer_features, CATEGORICAL_COLS, NUMERICAL_COLS, ENGINEERED_COLS
)

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "saved_models")

class CreditPredictor:
    def __init__(self):
        self.preprocessor = None
        self.model = None
        self.model_name = "Random Forest"
        self._load_artifacts()
        
    def _load_artifacts(self):
        prep_path = os.path.join(MODELS_DIR, "preprocessor.joblib")
        model_path = os.path.join(MODELS_DIR, "best_model.joblib")
        
        if os.path.exists(prep_path) and os.path.exists(model_path):
            self.preprocessor = joblib.load(prep_path)
            self.model = joblib.load(model_path)
            self.model_name = self.preprocessor.get("best_model_name", "Random Forest")
            print(f"Loaded artifacts for {self.model_name}")
        else:
            print("Model artifacts not yet generated. Run training first.")
            
    def is_ready(self) -> bool:
        return self.preprocessor is not None and self.model is not None

    def transform_features(self, input_dict: Dict[str, Any]) -> np.ndarray:
        df = pd.DataFrame([input_dict])
        df_feat = engineer_features(df)
        
        scaler = self.preprocessor["scaler"]
        encoder = self.preprocessor["encoder"]
        
        # Categoricals
        cat_df = df_feat[CATEGORICAL_COLS]
        encoded_cat = encoder.transform(cat_df)
        
        # Numerics
        num_cols = NUMERICAL_COLS + ENGINEERED_COLS
        num_data = df_feat[num_cols]
        scaled_num = scaler.transform(num_data)
        
        return np.hstack([scaled_num, encoded_cat]), df_feat

    def predict_single(self, input_data: Dict[str, Any], model_type: Optional[str] = None) -> Dict[str, Any]:
        if not self.is_ready():
            self._load_artifacts()
            if not self.is_ready():
                raise RuntimeError("Models are not trained yet. Please train models first.")
                
        # Select active model if user specified an alternative
        active_model = self.model
        active_name = self.model_name
        if model_type:
            safe_type = model_type.lower().replace(" ", "_")
            alt_path = os.path.join(MODELS_DIR, f"{safe_type}_model.joblib")
            if os.path.exists(alt_path):
                active_model = joblib.load(alt_path)
                active_name = model_type
                
        X_vec, df_feat = self.transform_features(input_data)
        
        # Probability of default (class 1)
        if hasattr(active_model, "predict_proba"):
            probs = active_model.predict_proba(X_vec)[0]
            default_prob = float(probs[1])
        else:
            pred = active_model.predict(X_vec)[0]
            default_prob = float(pred)
            
        # Illustrative 300-850 display score. This is not a FICO score.
        credit_score = int(np.clip(round(850 - (default_prob * 550)), 300, 850))
        
        # Determine risk tier and loan recommendation
        if credit_score >= 750:
            risk_tier = "Excellent"
            risk_level = "Very Low"
            badge_color = "emerald"
            approval_status = "Approved (Fast Track)"
            max_loan_approved = float(input_data.get("loan_amount_requested", 25000))
            recommended_interest_rate = 5.25
        elif credit_score >= 670:
            risk_tier = "Good"
            risk_level = "Low"
            badge_color = "blue"
            approval_status = "Approved"
            max_loan_approved = float(input_data.get("loan_amount_requested", 25000))
            recommended_interest_rate = 7.50
        elif credit_score >= 580:
            risk_tier = "Fair"
            risk_level = "Moderate"
            badge_color = "amber"
            approval_status = "Conditional Approval (Manual Review)"
            max_loan_approved = float(input_data.get("loan_amount_requested", 25000)) * 0.75
            recommended_interest_rate = 12.75
        else:
            risk_tier = "Poor"
            risk_level = "High"
            badge_color = "rose"
            approval_status = "Declined"
            max_loan_approved = 0.0
            recommended_interest_rate = 19.99

        # Generate Explainability: positive & negative factors, recommendations
        positive_factors = []
        risk_drivers = []
        recommendations = []
        
        utilization = float(input_data.get("credit_utilization_ratio", 0.3))
        dti = float(df_feat["debt_to_income_ratio"].iloc[0])
        missed = int(input_data.get("missed_payments_last_2yrs", 0))
        savings = float(input_data.get("savings_balance", 0))
        inquiries = int(input_data.get("hard_inquiries_last_6m", 0))
        history_yrs = float(input_data.get("credit_history_years", 5))
        
        # Utilization analysis
        if utilization <= 0.25:
            positive_factors.append({
                "factor": "Low Credit Utilization",
                "impact": "High Positive",
                "detail": f"Credit utilization is {utilization*100:.1f}%, well below the safe 30% threshold."
            })
        elif utilization > 0.50:
            risk_drivers.append({
                "factor": "High Credit Utilization",
                "impact": "High Negative",
                "detail": f"Using {utilization*100:.1f}% of available credit limit, indicating heavy balance dependence."
            })
            recommendations.append("Reduce outstanding revolving balances to bring credit utilization below 30%.")
            
        # DTI analysis
        if dti < 0.35:
            positive_factors.append({
                "factor": "Healthy Debt-to-Income",
                "impact": "Positive",
                "detail": f"Debt-to-Income ratio is {dti*100:.1f}%, leaving comfortable disposable margin."
            })
        elif dti > 0.60:
            risk_drivers.append({
                "factor": "Elevated Debt-to-Income Ratio",
                "impact": "High Negative",
                "detail": f"Total debt is {dti*100:.1f}% of annual income, limiting debt service capacity."
            })
            recommendations.append("Pay down existing obligations before taking on additional installment debt.")
            
        # Missed payments
        if missed == 0:
            positive_factors.append({
                "factor": "Pristine Payment Track Record",
                "impact": "High Positive",
                "detail": "0 delinquent or late payments in the past 24 months."
            })
        else:
            risk_drivers.append({
                "factor": "Recent Delinquency History",
                "impact": "High Negative",
                "detail": f"Recorded {missed} missed payment(s) in the past 2 years."
            })
            recommendations.append("Establish automatic bill payments to ensure 100% on-time payment track record.")
            
        # Savings reserve
        monthly_exp = float(input_data.get("monthly_expenses", 2000))
        months_reserve = savings / (monthly_exp + 1e-3)
        if months_reserve >= 6:
            positive_factors.append({
                "factor": "Robust Emergency Savings Reserve",
                "impact": "Positive",
                "detail": f"Liquid savings cover approximately {months_reserve:.1f} months of expenses."
            })
        elif months_reserve < 2:
            risk_drivers.append({
                "factor": "Thin Liquidity Buffer",
                "impact": "Moderate Negative",
                "detail": f"Savings buffer is less than 2 months of living expenses (${savings:,.0f})."
            })
            recommendations.append("Build emergency liquid savings to cover at least 3 to 6 months of mandatory expenses.")
            
        # Credit history length
        if history_yrs >= 8:
            positive_factors.append({
                "factor": "Mature Credit History",
                "impact": "Positive",
                "detail": f"{history_yrs:.1f} years of established bureau credit accounts."
            })
        elif history_yrs < 2:
            recommendations.append("Keep existing oldest credit accounts open to build long-term credit tenure.")
            
        # Inquiries
        if inquiries >= 4:
            risk_drivers.append({
                "factor": "High Velocity of Credit Inquiries",
                "impact": "Moderate Negative",
                "detail": f"{inquiries} hard credit inquiries recorded in the last 6 months."
            })
            recommendations.append("Pause new credit applications for 6 months to minimize hard inquiry impact.")
            
        if not recommendations:
            recommendations.append("Maintain existing financial discipline and keep utilization under 15% for optimum score.")

        return {
            "credit_score": credit_score,
            "score_range": "300 - 850",
            "default_probability": round(default_prob, 4),
            "risk_tier": risk_tier,
            "risk_level": risk_level,
            "badge_color": badge_color,
            "model_used": active_name,
            "approval_status": approval_status,
            "max_loan_approved": max_loan_approved,
            "recommended_interest_rate_pct": recommended_interest_rate,
            "financial_summary": {
                "debt_to_income_ratio": round(float(df_feat["debt_to_income_ratio"].iloc[0]), 3),
                "credit_utilization_ratio": round(utilization, 3),
                "disposable_monthly_cashflow": round(float(df_feat["disposable_monthly_cashflow"].iloc[0]), 2),
                "payment_reliability_score": round(float(df_feat["payment_reliability_score"].iloc[0]), 3),
                "credit_burden_index": round(float(df_feat["credit_burden_index"].iloc[0]), 3)
            },
            "explainability": {
                "positive_factors": positive_factors,
                "risk_drivers": risk_drivers,
                "actionable_recommendations": recommendations
            }
        }

