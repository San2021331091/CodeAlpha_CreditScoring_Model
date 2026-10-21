# CreditAlpha — Credit Risk Assessment

CreditAlpha provides applicant credit scoring, model evaluation, scenario simulation, explainability, and an application review workspace.

---

## 📌 Project Overview

The frontend requests predictions and model metrics from the API services. Applications are created from submitted applicant profiles, and portfolio analytics are calculated from those application records. No demo applicants or fabricated portfolio totals are preloaded.

The application review store is currently in memory: newly submitted applications are available while the gateway process is running and are cleared when it restarts. The included training dataset is synthetic. The model's 300–850 display score and underwriting rules are for evaluation only and are not validated for real lending or equivalent to a bureau score.

---

## 🧠 Machine Learning Methodology

### 1. Feature Engineering
The pipeline derives deep behavioral and financial ratios from raw applicant history:
- **Debt-to-Income (DTI) Ratio**: $\frac{\text{Total Debt}}{\text{Annual Income} + 1}$
- **Savings-to-Debt Ratio**: $\frac{\text{Savings Balance}}{\text{Total Debt} + 500}$
- **Expense-to-Income Ratio**: $\frac{\text{Monthly Expenses} \times 12}{\text{Annual Income}}$
- **Estimated Installment & Cashflow**: Monthly disposable margin after amortization.
- **Credit Burden Index**: Composite indicator balancing revolving utilization, delinquencies, and hard inquiries.
- **Payment Reliability Score**: $1.0 - (\text{Missed Payments} \times 0.18 + \text{Derogatory Records} \times 0.35)$

### 2. Model Performance Benchmark
The analytics view reads the current model results from the ML service's `metrics.json`, generated during training. The trainer creates 50,000 synthetic financial profiles by default, uses a stratified train/validation/test split, fits preprocessing only to training rows, and selects the best model by validation ROC-AUC. Metrics displayed by the application reflect that file rather than fixed dashboard values.

### 3. Illustrative Score and Risk Tiers
From the predicted probability of default $P(\text{default})$:
$$\text{Credit Score} = 850 - \text{round}(P(\text{default}) \times 550)$$

These cutoffs and associated rates are fixed demo rules. The score is not calibrated to any bureau score, and the model has only been evaluated against generated labels.

---

## 📂 Project Structure

```
CodeAlpha_CreditScoring_Model/
├── ml-service/                 # FastAPI Python ML Microservice
│   ├── app/
│   │   ├── api/                # API routes
│   │   ├── ml/                 # Data generator, feature engineering, trainer, predictor
│   │   ├── models/             # Pydantic validation schemas
│   │   └── main.py             # FastAPI entry point
│   ├── data/                   # Generated credit dataset CSV
│   ├── saved_models/           # Serialized models (.joblib) & metrics.json
│   ├── train_pipeline.py       # Standalone training script
│   ├── requirements.txt
│   └── Dockerfile
│
├── backend-gateway/            # NestJS TypeScript API Gateway
│   ├── src/
│   │   ├── credit-scoring/     # Module proxying ML engine
│   │   ├── applications/       # Loan application CRUD & manual override
│   │   ├── analytics/          # KPI metrics & portfolio stats
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                   # Next.js 15 + Shadcn UI Frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router (layout, page, globals.css)
│   │   ├── components/         # ScoreGauge, PredictorForm, WhatIfSandbox, AnalyticsLab, etc.
│   │   └── lib/                # Color palettes, currency formatters, utils
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── docker-compose.yml          # Multi-container orchestration
├── start_services.ps1          # 1-click Windows launcher script
└── README.md
```

---

## 🚀 Quickstart Guide

### Option 1: 1-Click Launch (Windows PowerShell)
```powershell
.\start_services.ps1
```

### Option 2: Run via Docker Compose
```bash
docker-compose up --build
```

### Option 3: Manual Step-by-Step Setup

#### Step 1: Start ML Microservice
```bash
cd ml-service
pip install -r requirements.txt
python train_pipeline.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Docs available at: `http://127.0.0.1:8000/docs`*

#### Step 2: Start NestJS Backend Gateway
```bash
cd ../backend-gateway
npm install
npm run build
npm start
```
*Gateway running at: `http://localhost:3001`*

#### Step 3: Start Next.js Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 🧪 Interactive Features Walkthrough

1. **Credit Underwriting**:
   - Use one of the labeled synthetic **Try an example** inputs to run Random Forest, Gradient Boosting, Logistic Regression, or Decision Tree, or enter applicant values manually.
   - Example inputs run predictions only; they are not automatically saved to the applications portfolio.
   - Review the model score, risk estimate, rate, and explanation returned by the scoring service.
2. **Explainability & Attribution**:
   - View exact positive factors (low utilization, long credit history) and risk drivers (delinquencies, high DTI).
   - Read actionable AI advice on how the borrower can elevate their rating.
3. **What-If Scenario Sandbox**:
   - Adjust debt, income, utilization, and savings changes, then send the scenario to the ML service.
   - Compare the returned model predictions for the original and adjusted applicant.
4. **Model Performance Lab**:
   - Inspect cross-model accuracy, precision, recall, F1, and ROC-AUC comparisons.
   - Interactive **Confusion Matrix** with Type I / Type II error breakdowns.
   - Feature Importance ranking bars.
5. **Applications Management**:
   - The portfolio starts empty. Save a scored applicant from the explainability panel to create an application.
   - Filter applicants by risk tier and approval status.
   - Exercise underwriter discretion with **Manual Overrides** (Approve / Decline / Add Conditions).
   - Export callset to CSV.

---

## 📹 Video Explanation & Submission Checklist

As required by CodeAlpha instructions:
- [ ] Upload repository to GitHub under: `CodeAlpha_CreditScoring_Model`
- [ ] Record video walkthrough demonstrating:
  1. Overview of the Credit Scoring problem and feature engineering.
  2. Training pipeline output and model evaluation metrics (ROC-AUC, Precision, Recall, F1).
  3. Live demonstration of the Next.js frontend with score gauge and What-If simulator.
  4. Explanation of NestJS Gateway and FastAPI ML microservice architecture.
- [ ] Post video on LinkedIn tagging **@CodeAlpha** with the GitHub repository link.
- [ ] Submit task URL via the official CodeAlpha Submission Form.

---

## 👨‍💻 Author & Acknowledgements
- Developed by: **Santosh Saha**
- Role: Machine Learning Intern at [CodeAlpha](https://www.codealpha.tech/)
- Task: Task 1 — Credit Scoring Model
- Program: CodeAlpha Machine Learning Internship
