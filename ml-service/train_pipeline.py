#!/usr/bin/env python3
"""
CodeAlpha Credit Scoring Model - Standalone Training Pipeline
Trains Random Forest, Gradient Boosting, Logistic Regression, and Decision Tree.
Outputs metrics, confusion matrices, ROC curves, and serialized model artifacts.
"""
import sys
import os

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.ml.trainer import CreditModelTrainer

def main():
    print("=" * 70)
    print("[CodeAlpha ML Internship] - Task 1: Credit Scoring Model")
    print("=" * 70)
    trainer = CreditModelTrainer()
    metrics = trainer.train_and_evaluate(n_samples=50000)
    
    print("\n" + "=" * 70)
    print("MODEL EVALUATION SUMMARY")
    print("=" * 70)
    print(f"{'Model Name':<22} | {'Accuracy':<9} | {'Precision':<9} | {'Recall':<9} | {'F1-Score':<9} | {'ROC-AUC':<9}")
    print("-" * 75)
    for name, res in metrics["models"].items():
        print(f"{name:<22} | {res['accuracy']:<9.4f} | {res['precision']:<9.4f} | {res['recall']:<9.4f} | {res['f1_score']:<9.4f} | {res['roc_auc']:<9.4f}")
    print("=" * 75)
    print(f"Best Model: {metrics['best_model']}")
    print(f"Model Artifacts and Metrics saved in: ./saved_models/")

if __name__ == "__main__":
    main()
