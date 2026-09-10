#!/usr/bin/env python3
"""
WMHS training stub — Random Forest classifier for maternal risk.

This script is an artefact of the PRD. Production inference runs in
TypeScript (lib/ai/riskService.ts) so Vercel serverless does not need Python.

Usage (optional, local only):
    python ml/train_model.py
"""

from __future__ import annotations

import json
from pathlib import Path

try:
    import joblib
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
except ImportError as exc:
    raise SystemExit(
        "Install scikit-learn, numpy and joblib to train the optional model."
    ) from exc

FEATURE_NAMES = [
    "age",
    "systolic_bp",
    "diastolic_bp",
    "blood_sugar",
    "heart_rate",
    "body_temperature",
    "severe_headache",
    "blurred_vision",
    "swelling",
    "vaginal_bleeding",
    "abdominal_pain",
    "dizziness",
    "low_fetal_movement",
    "high_stress",
]


def synthesise(n: int = 2000, seed: int = 42):
    rng = np.random.default_rng(seed)
    X = np.column_stack(
        [
            rng.integers(16, 45, n),
            rng.normal(118, 18, n).clip(90, 200),
            rng.normal(76, 12, n).clip(50, 130),
            rng.normal(95, 25, n).clip(60, 280),
            rng.normal(82, 12, n).clip(50, 140),
            rng.normal(36.8, 0.4, n).clip(35.5, 40.5),
            rng.binomial(1, 0.12, n),
            rng.binomial(1, 0.08, n),
            rng.binomial(1, 0.15, n),
            rng.binomial(1, 0.06, n),
            rng.binomial(1, 0.1, n),
            rng.binomial(1, 0.14, n),
            rng.binomial(1, 0.05, n),
            rng.binomial(1, 0.2, n),
        ]
    )
    score = (
        (X[:, 1] >= 140).astype(float) * 0.3
        + (X[:, 2] >= 90).astype(float) * 0.2
        + (X[:, 3] >= 140).astype(float) * 0.15
        + X[:, 6] * 0.1
        + X[:, 7] * 0.1
        + X[:, 9] * 0.25
        + X[:, 12] * 0.2
    )
    y = np.where(score >= 0.45, 2, np.where(score >= 0.2, 1, 0))
    return X, y


def main() -> None:
    X, y = synthesise()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    model = RandomForestClassifier(
        n_estimators=200, max_depth=8, random_state=42, class_weight="balanced"
    )
    model.fit(X_train, y_train)
    acc = float(model.score(X_test, y_test))
    out_dir = Path(__file__).resolve().parent
    joblib.dump(model, out_dir / "model.joblib")
    (out_dir / "metrics.json").write_text(
        json.dumps({"accuracy": round(acc, 3), "features": FEATURE_NAMES}, indent=2)
    )
    print(f"Saved model.joblib with hold-out accuracy {acc:.3f}")


if __name__ == "__main__":
    main()
