import numpy as np
import pandas as pd


def generate_credit_dataset(n_samples: int = 50000, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates synthetic applicant records and default labels for a demo.
    These rows are not observed bureau or bank outcomes.
    """
    np.random.seed(random_seed)
    # Base demographics and financial metrics
    age = np.random.randint(21, 75, size=n_samples)
    
    # Annual income log-normally distributed around $62,000
    annual_income = np.random.lognormal(mean=11.0, sigma=0.55, size=n_samples)
    annual_income = np.clip(annual_income, 18000, 280000).round(2)
    
    # Monthly expenses roughly 35-70% of monthly income with variance
    monthly_income = annual_income / 12.0
    expense_ratio = np.random.uniform(0.35, 0.72, size=n_samples)
    monthly_expenses = (monthly_income * expense_ratio + np.random.normal(0, 200, n_samples)).round(2)
    monthly_expenses = np.clip(monthly_expenses, 600, monthly_income * 0.95)
    
    # Existing debt correlated with income and age
    debt_multiplier = np.random.uniform(0.1, 1.8, size=n_samples)
    total_debt = (annual_income * debt_multiplier * 0.4 + np.random.exponential(5000, n_samples)).round(2)
    total_debt = np.clip(total_debt, 0, 220000)
    
    # Savings balance correlated with disposable income
    disposable_monthly = monthly_income - monthly_expenses
    savings_balance = np.maximum(500, (disposable_monthly * np.random.uniform(2, 36, n_samples) + np.random.lognormal(8, 0.8, n_samples))).round(2)
    savings_balance = np.clip(savings_balance, 200, 150000)
    
    # Credit history in years correlated with age
    max_history = np.maximum(1, age - 18)
    credit_history_years = np.clip(np.random.uniform(0.5, max_history), 0.5, 45.0).round(1)
    
    # Open credit lines (1 to 20)
    open_credit_lines = np.clip((credit_history_years * 0.6 + np.random.poisson(3, n_samples)).astype(int), 1, 24)
    
    # Credit utilization ratio (0.0 to 1.0)
    # Higher debt relative to income increases utilization
    base_util = (total_debt / (annual_income + 1)) * 0.5 + np.random.beta(2, 5, n_samples)
    credit_utilization_ratio = np.clip(base_util, 0.02, 0.98).round(3)
    
    # Missed payments in last 2 years (heavily zero-inflated)
    missed_prob = np.where(credit_utilization_ratio > 0.65, 0.45, 0.12)
    has_missed = np.random.binomial(1, missed_prob)
    missed_payments_last_2yrs = has_missed * np.random.geometric(p=0.45, size=n_samples)
    missed_payments_last_2yrs = np.clip(missed_payments_last_2yrs, 0, 9)
    
    # Derogatory records (bankruptcies, charge-offs)
    derog_prob = np.where(missed_payments_last_2yrs >= 3, 0.35, 0.04)
    num_derogatory_records = np.random.binomial(1, derog_prob) * np.random.randint(1, 4, size=n_samples)
    
    # Hard inquiries in last 6 months (0 to 8)
    hard_inquiries_last_6m = np.random.poisson(lam=1.2 + (credit_utilization_ratio * 1.5), size=n_samples)
    hard_inquiries_last_6m = np.clip(hard_inquiries_last_6m, 0, 8)
    
    # Requested loan details
    loan_amount_requested = np.random.choice([3000, 5000, 10000, 15000, 20000, 25000, 35000, 50000], size=n_samples,
                                             p=[0.10, 0.15, 0.22, 0.20, 0.15, 0.08, 0.06, 0.04])
    loan_term_months = np.random.choice([12, 24, 36, 48, 60], size=n_samples, p=[0.1, 0.2, 0.4, 0.2, 0.1])
    
    # Employment years
    max_emp = np.maximum(0.5, age - 20)
    employment_years = np.clip(np.random.exponential(6.0, size=n_samples), 0.0, max_emp).round(1)
    
    # Categoricals
    home_ownership = np.random.choice(['RENT', 'MORTGAGE', 'OWN', 'OTHER'], size=n_samples, p=[0.42, 0.46, 0.10, 0.02])
    loan_purpose = np.random.choice(
        ['DEBT_CONSOLIDATION', 'HOME_IMPROVEMENT', 'BUSINESS', 'MAJOR_PURCHASE', 'MEDICAL', 'EDUCATION'],
        size=n_samples,
        p=[0.45, 0.18, 0.12, 0.10, 0.08, 0.07]
    )
    
    # Target variable: is_default (latent risk formula based on real credit scoring principles)
    # Higher utilization, higher DTI, missed payments, low savings -> increases default probability
    dti_est = total_debt / (annual_income + 1)
    
    z = (
        - 3.2
        + 3.8 * credit_utilization_ratio
        + 1.8 * dti_est
        + 0.65 * missed_payments_last_2yrs
        + 0.85 * num_derogatory_records
        + 0.25 * hard_inquiries_last_6m
        - 0.8 * np.log1p(savings_balance / 1000.0)
        - 0.04 * credit_history_years
        - 0.03 * employment_years
        + 0.00002 * loan_amount_requested
        + np.where(home_ownership == 'RENT', 0.25, 0.0)
        - np.where(home_ownership == 'OWN', 0.35, 0.0)
        + np.random.normal(0, 0.4, size=n_samples) # idiosyncratic noise
    )
    
    # Sigmoid function for probability
    default_prob = 1.0 / (1.0 + np.exp(-z))
    is_default = (np.random.uniform(0, 1, size=n_samples) < default_prob).astype(int)
    
    df = pd.DataFrame({
        'age': age,
        'annual_income': annual_income,
        'monthly_expenses': monthly_expenses,
        'total_debt': total_debt,
        'savings_balance': savings_balance,
        'credit_history_years': credit_history_years,
        'open_credit_lines': open_credit_lines,
        'credit_utilization_ratio': credit_utilization_ratio,
        'missed_payments_last_2yrs': missed_payments_last_2yrs,
        'num_derogatory_records': num_derogatory_records,
        'hard_inquiries_last_6m': hard_inquiries_last_6m,
        'loan_amount_requested': loan_amount_requested,
        'loan_term_months': loan_term_months,
        'employment_years': employment_years,
        'home_ownership': home_ownership,
        'loan_purpose': loan_purpose,
        'is_default': is_default
    })
    
    return df

if __name__ == '__main__':
    df = generate_credit_dataset(1000)
    print(f"Generated sample dataset: {df.shape}, Default rate: {df['is_default'].mean():.2%}")
