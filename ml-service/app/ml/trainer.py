import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)

from app.ml.data_generator import generate_credit_dataset
from app.ml.feature_engineering import (
    engineer_features, CATEGORICAL_COLS, NUMERICAL_COLS, ENGINEERED_COLS
)

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "saved_models")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

class CreditModelTrainer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
        self.feature_names: List[str] = []
        self.models: Dict[str, Any] = {}
        self.metrics: Dict[str, Any] = {}
        
    def prepare_data(self, df: pd.DataFrame):
        # Split raw rows first so fitting the scaler and encoder cannot see
        # information from validation or held-out test applicants.
        train_df, test_df = train_test_split(
            df, test_size=0.2, random_state=42, stratify=df['is_default']
        )
        train_df, validation_df = train_test_split(
            train_df, test_size=0.2, random_state=42,
            stratify=train_df['is_default']
        )
        train_features = engineer_features(train_df)
        validation_features = engineer_features(validation_df)
        test_features = engineer_features(test_df)

        encoded_cat = self.encoder.fit_transform(train_features[CATEGORICAL_COLS])
        encoded_cat_names = list(self.encoder.get_feature_names_out(CATEGORICAL_COLS))

        num_cols = NUMERICAL_COLS + ENGINEERED_COLS
        scaled_num = self.scaler.fit_transform(train_features[num_cols])
        self.feature_names = num_cols + encoded_cat_names

        def transform(features):
            return np.hstack([
                self.scaler.transform(features[num_cols]),
                self.encoder.transform(features[CATEGORICAL_COLS])
            ])

        X_train = np.hstack([scaled_num, encoded_cat])
        return (
            X_train, train_features['is_default'].values,
            transform(validation_features), validation_features['is_default'].values,
            transform(test_features), test_features['is_default'].values
        )
        
    def train_and_evaluate(self, n_samples: int = 50000):
        print(f"Generating realistic credit dataset ({n_samples} samples)...")
        df = generate_credit_dataset(n_samples=n_samples, random_seed=42)
        
        # Save sample raw dataset
        raw_csv_path = os.path.join(DATA_DIR, "credit_dataset.csv")
        df.to_csv(raw_csv_path, index=False)
        print(f"Saved dataset to {raw_csv_path}")
        
        X_train, y_train, X_validation, y_validation, X_test, y_test = self.prepare_data(df)
        
        model_definitions = {
            "Random Forest": RandomForestClassifier(
                n_estimators=120, max_depth=12, min_samples_split=6,
                class_weight='balanced', random_state=42, n_jobs=-1
            ),
            "Gradient Boosting": GradientBoostingClassifier(
                n_estimators=100, learning_rate=0.08, max_depth=5,
                random_state=42
            ),
            "Logistic Regression": LogisticRegression(
                max_iter=1000, class_weight='balanced', random_state=42
            ),
            "Decision Tree": DecisionTreeClassifier(
                max_depth=6, class_weight='balanced', random_state=42
            )
        }
        
        results = {}
        best_model_name = None
        best_validation_roc_auc = -1.0
        
        for name, model in model_definitions.items():
            print(f"Training {name}...")
            model.fit(X_train, y_train)

            validation_prob = model.predict_proba(X_validation)[:, 1]
            validation_auc = float(roc_auc_score(y_validation, validation_prob))
            
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred
            
            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, zero_division=0))
            rec = float(recall_score(y_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, zero_division=0))
            auc = float(roc_auc_score(y_test, y_prob))
            
            cm = confusion_matrix(y_test, y_pred).tolist()
            fpr, tpr, _ = roc_curve(y_test, y_prob)
            
            # Downsample ROC curve points for clean JSON payload
            roc_indices = np.linspace(0, len(fpr) - 1, num=min(30, len(fpr)), dtype=int)
            roc_points = [{"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)} for i in roc_indices]
            
            # Feature importance if available
            importance_dict = {}
            if hasattr(model, "feature_importances_"):
                importances = model.feature_importances_
                top_indices = np.argsort(importances)[::-1]
                for idx in top_indices[:15]:
                    importance_dict[self.feature_names[idx]] = round(float(importances[idx]), 4)
            elif hasattr(model, "coef_"):
                coefs = np.abs(model.coef_[0])
                top_indices = np.argsort(coefs)[::-1]
                for idx in top_indices[:15]:
                    importance_dict[self.feature_names[idx]] = round(float(coefs[idx]), 4)
            
            results[name] = {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(auc, 4),
                "validation_roc_auc": round(validation_auc, 4),
                "confusion_matrix": {
                    "true_negative": cm[0][0],
                    "false_positive": cm[0][1],
                    "false_negative": cm[1][0],
                    "true_positive": cm[1][1]
                },
                "roc_curve": roc_points,
                "top_features": importance_dict
            }
            
            # Save individual model
            safe_name = name.lower().replace(" ", "_")
            joblib.dump(model, os.path.join(MODELS_DIR, f"{safe_name}_model.joblib"))
            self.models[name] = model
            
            if validation_auc > best_validation_roc_auc:
                best_validation_roc_auc = validation_auc
                best_model_name = name
                
        # Save preprocessor artifacts
        preprocessor = {
            "scaler": self.scaler,
            "encoder": self.encoder,
            "feature_names": self.feature_names,
            "categorical_cols": CATEGORICAL_COLS,
            "numerical_cols": NUMERICAL_COLS,
            "engineered_cols": ENGINEERED_COLS,
            "best_model_name": best_model_name
        }
        joblib.dump(preprocessor, os.path.join(MODELS_DIR, "preprocessor.joblib"))
        
        # Save best model copy as best_model.joblib
        joblib.dump(self.models[best_model_name], os.path.join(MODELS_DIR, "best_model.joblib"))
        
        overall_metrics = {
            "best_model": best_model_name,
            "training_samples": len(X_train),
            "validation_samples": len(X_validation),
            "test_samples": len(X_test),
            "selection_metric": "validation_roc_auc",
            "models": results,
            "dataset_summary": {
                "total_records": len(df),
                "default_rate": round(float(df['is_default'].mean()), 4),
                "num_features": len(self.feature_names)
            }
        }
        
        with open(os.path.join(MODELS_DIR, "metrics.json"), "w") as f:
            json.dump(overall_metrics, f, indent=2)
            
        print(f"Training completed! Best model: {best_model_name} (validation ROC-AUC: {best_validation_roc_auc:.4f})")
        return overall_metrics

if __name__ == '__main__':
    trainer = CreditModelTrainer()
    trainer.train_and_evaluate(50000)
