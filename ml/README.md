# Optional Python training

Production inference lives in `lib/ai/riskService.ts`.

To train a Random Forest artefact locally:

```bash
pip install scikit-learn numpy joblib
python ml/train_model.py
```

This writes `model.joblib`. It is not loaded at runtime on Vercel.
