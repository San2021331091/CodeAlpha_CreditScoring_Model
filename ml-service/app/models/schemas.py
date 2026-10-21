from pydantic import BaseModel, Field
from typing import List, Optional

class ApplicantInput(BaseModel):
    age: int = Field(35, ge=18, le=95, description="Applicant age")
    annual_income: float = Field(65000.0, ge=1000.0, description="Annual pre-tax income in USD")
    monthly_expenses: float = Field(2200.0, ge=100.0, description="Total monthly living expenses in USD")
    total_debt: float = Field(15000.0, ge=0.0, description="Total outstanding debt across all accounts in USD")
    savings_balance: float = Field(12000.0, ge=0.0, description="Total liquid savings and checkings balance in USD")
    credit_history_years: float = Field(8.0, ge=0.1, le=60.0, description="Length of credit history in years")
    open_credit_lines: int = Field(5, ge=0, le=50, description="Total number of active credit cards and loan accounts")
    credit_utilization_ratio: float = Field(0.28, ge=0.0, le=1.0, description="Revolving credit balance / total credit limit (0.0 - 1.0)")
    missed_payments_last_2yrs: int = Field(0, ge=0, le=30, description="Number of payments overdue by 30+ days in past 2 years")
    num_derogatory_records: int = Field(0, ge=0, le=10, description="Bankruptcies, foreclosures, or collections")
    hard_inquiries_last_6m: int = Field(1, ge=0, le=20, description="Hard inquiries made by lenders in last 6 months")
    loan_amount_requested: float = Field(20000.0, ge=500.0, description="Requested principal loan amount in USD")
    loan_term_months: int = Field(36, ge=6, le=120, description="Requested loan duration in months")
    employment_years: float = Field(5.0, ge=0.0, le=50.0, description="Years in current or continuous employment")
    home_ownership: str = Field("MORTGAGE", description="RENT, MORTGAGE, OWN, or OTHER")
    loan_purpose: str = Field("DEBT_CONSOLIDATION", description="DEBT_CONSOLIDATION, HOME_IMPROVEMENT, BUSINESS, MAJOR_PURCHASE, MEDICAL, EDUCATION")
    model_type: Optional[str] = Field("Random Forest", description="Model variant to use for scoring")

class FactorDetail(BaseModel):
    factor: str
    impact: str
    detail: str

class FinancialSummary(BaseModel):
    debt_to_income_ratio: float
    credit_utilization_ratio: float
    disposable_monthly_cashflow: float
    payment_reliability_score: float
    credit_burden_index: float

class ExplainabilityResponse(BaseModel):
    positive_factors: List[FactorDetail]
    risk_drivers: List[FactorDetail]
    actionable_recommendations: List[str]

class PredictionResponse(BaseModel):
    credit_score: int
    score_range: str
    default_probability: float
    risk_tier: str
    risk_level: str
    badge_color: str
    model_used: str
    approval_status: str
    max_loan_approved: float
    recommended_interest_rate_pct: float
    financial_summary: FinancialSummary
    explainability: ExplainabilityResponse

class BatchPredictionRequest(BaseModel):
    applicants: List[ApplicantInput]
    model_type: Optional[str] = "Random Forest"

class ScenarioDelta(BaseModel):
    debt_reduction: float = 0.0
    income_increase: float = 0.0
    utilization_target: Optional[float] = None
    savings_increase: float = 0.0

class WhatIfRequest(BaseModel):
    applicant: ApplicantInput
    scenario: ScenarioDelta

class WhatIfResponse(BaseModel):
    original: PredictionResponse
    simulated: PredictionResponse
    score_delta: int
    default_prob_delta: float
    insights: List[str]

