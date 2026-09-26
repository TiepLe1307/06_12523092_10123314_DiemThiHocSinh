from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import json
import os
import uuid


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "model.joblib"
)

SCHEMA_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "schema.json"
)

METADATA_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "metadata.json"
)


# ============================================================
# LOAD MODEL
# ============================================================

model = joblib.load(MODEL_PATH)

with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
    schema = json.load(f)

with open(METADATA_PATH, "r", encoding="utf-8") as f:
    metadata = json.load(f)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="Student Performance Prediction AI Service",
    description="AI Service dự đoán điểm thi của học sinh",
    version="1.0.0"
)


# ============================================================
# REQUEST SCHEMA
# ============================================================

class PredictionRequest(BaseModel):
    hours_studied: float = Field(..., ge=0)
    previous_scores: float = Field(..., ge=0)
    extracurricular_activities: str
    sleep_hours: float = Field(..., ge=0)
    sample_question_papers_practiced: float = Field(..., ge=0)


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }


# ============================================================
# MODEL INFO
# ============================================================

@app.get("/model-info")
def model_info():
    return metadata


# ============================================================
# PREDICT
# ============================================================

@app.post("/predict")
def predict(request: PredictionRequest):

    if request.extracurricular_activities not in ["Yes", "No"]:
        raise HTTPException(
            status_code=400,
            detail="extracurricular_activities must be Yes or No"
        )

    request_id = str(uuid.uuid4())

    input_data = {
        "Hours Studied": request.hours_studied,
        "Previous Scores": request.previous_scores,
        "Extracurricular Activities": request.extracurricular_activities,
        "Sleep Hours": request.sleep_hours,
        "Sample Question Papers Practiced":
            request.sample_question_papers_practiced
    }

    import pandas as pd

    input_df = pd.DataFrame([input_data])

    prediction = model.predict(input_df)[0]

    return {
        "request_id": request_id,
        "prediction": round(float(prediction), 2),
        "target": "Performance Index",
        "model": metadata["model_name"]
    }