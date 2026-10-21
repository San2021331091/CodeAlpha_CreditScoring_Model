import numpy as np
import pandas as pd
from typing import List

CATEGORICAL_COLS = ['home_ownership', 'loan_purpose']

NUMERICAL_COLS = [
    'age', 'annual_income', 'monthly_expenses', 'total_debt',
    'savings_balance', 'credit_history_years', 'open_credit_lines',
    'credit_utilization_ratio', 'missed_payments_last_2yrs',
    'num_derogatory_records', 'hard_inquiries_last_6m',
    'loan_amount_requested', 'loan_term_months', 'employment_years'
]

ENGINEERED_COLS = [
    'debt_to_income_ratio',
    'savings_to_debt_ratio',
    'expense_to_income_ratio',
    'credit_burden_index',
    'payment_reliability_score',
    'estimated_monthly_installment',
    'disposable_monthly_cashflow',
    'loan_to_income_ratio'
]

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes key financial ratios and credit risk indicators from raw features.
    """
    df = df.copy()
    
    # 1. Debt-to-Income (DTI) Ratio
    # Annual debt obligations / annual income
    df['debt_to_income_ratio'] = np.clip(df['total_debt'] / (df['annual_income'] + 1.0), 0.0, 5.0)
    
    # 2. Savings-to-Debt Ratio
    df['savings_to_debt_ratio'] = np.clip(df['savings_balance'] / (df['total_debt'] + 500.0), 0.0, 10.0)
    
    # 3. Expense to Income Ratio
    df['expense_to_income_ratio'] = np.clip((df['monthly_expenses'] * 12.0) / (df['annual_income'] + 1.0), 0.0, 2.0)
    
    # 4. Estimated Monthly Installment (assuming standard 8.5% interest rate amortization)
    monthly_rate = 0.085 / 12.0
    terms = np.maximum(df['loan_term_months'], 1)
    df['estimated_monthly_installment'] = df['loan_amount_requested'] * (
        (monthly_rate * (1 + monthly_rate)**terms) /
        (np.maximum((1 + monthly_rate)**terms - 1, 1e-5))
    )
    
    # 5. Disposable Monthly Cashflow after new loan installment
    df['disposable_monthly_cashflow'] = (df['annual_income'] / 12.0) - df['monthly_expenses'] - df['estimated_monthly_installment']
    
    # 6. Loan to Income Ratio
    df['loan_to_income_ratio'] = np.clip(df['loan_amount_requested'] / (df['annual_income'] + 1.0), 0.0, 3.0)
    
    # 7. Credit Burden Index (composite indicator of high utilization, inquiries, and delinquencies)
    df['credit_burden_index'] = (
        (df['credit_utilization_ratio'] * 0.45) +
        (np.clip(df['missed_payments_last_2yrs'], 0, 8) * 0.12) +
        (np.clip(df['hard_inquiries_last_6m'], 0, 6) * 0.06) +
        (np.clip(df['num_derogatory_records'], 0, 4) * 0.20)
    )
    
    # 8. Payment Reliability Score (0.0 to 1.0 scale)
    penalty = (df['missed_payments_last_2yrs'] * 0.18) + (df['num_derogatory_records'] * 0.35)
    df['payment_reliability_score'] = np.clip(1.0 - penalty, 0.0, 1.0)
    
    return df

def get_feature_column_names() -> List[str]:
    """Returns the ordered list of all numeric and engineered feature column names."""
    return NUMERICAL_COLS + ENGINEERED_COLS

