from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import json
import os
import pandas as pd


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
# REQUEST MODEL
# ============================================================

class PredictionRequest(BaseModel):
    request_id: str = Field(..., min_length=1)

    hours_studied: float = Field(
        ...,
        alias="Hours Studied",
        ge=0
    )

    previous_scores: float = Field(
        ...,
        alias="Previous Scores",
        ge=0
    )

    extracurricular_activities: str = Field(
        ...,
        alias="Extracurricular Activities"
    )

    sleep_hours: float = Field(
        ...,
        alias="Sleep Hours",
        ge=0
    )

    sample_question_papers_practiced: float = Field(
        ...,
        alias="Sample Question Papers Practiced",
        ge=0
    )


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
    print(
        f"[INFO] AI Service req={request.request_id} nhận request dự đoán"
    )
    if request.extracurricular_activities not in ["Yes", "No"]:
        raise HTTPException(
            status_code=400,
            detail="Extracurricular Activities must be Yes or No"
        )

    input_data = {
        "Hours Studied": request.hours_studied,
        "Previous Scores": request.previous_scores,
        "Extracurricular Activities": request.extracurricular_activities,
        "Sleep Hours": request.sleep_hours,
        "Sample Question Papers Practiced": request.sample_question_papers_practiced
    }

    input_df = pd.DataFrame([input_data])

    raw_prediction = model.predict(input_df)[0]

    # Giới hạn điểm dự đoán trong khoảng 0 - 100
    final_prediction = max(
        0.0,
        min(100.0, float(raw_prediction))
    )

    return {
        "request_id": request.request_id,
        "prediction": round(final_prediction, 2),
        "target": "Performance Index",
        "model": metadata["model_name"],
        "model_version": "1.0.0"
    }