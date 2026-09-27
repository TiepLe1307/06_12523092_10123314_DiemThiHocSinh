from fastapi import FastAPI, HTTPException
import joblib
import json
import os
import uuid
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
# PREDICT (Nhận trực tiếp dict và chặn biên từ 0 đến 100)
# ============================================================

@app.post("/predict")
def predict(payload: dict):
    try:
        # Lấy dữ liệu linh hoạt dù viết hoa, có dấu cách hay chữ thường
        hours = payload.get("Hours Studied", payload.get("hours_studied"))
        scores = payload.get("Previous Scores", payload.get("previous_scores"))
        extracur = payload.get("Extracurricular Activities", payload.get("extracurricular_activities"))
        sleep = payload.get("Sleep Hours", payload.get("sleep_hours"))
        papers = payload.get("Sample Question Papers Practiced", payload.get("sample_question_papers_practiced"))

        if extracur not in ["Yes", "No"]:
            raise HTTPException(
                status_code=400,
                detail="extracurricular_activities must be Yes or No"
            )

        request_id = str(uuid.uuid4())

        input_data = {
            "Hours Studied": float(hours),
            "Previous Scores": float(scores),
            "Extracurricular Activities": str(extracur),
            "Sleep Hours": float(sleep),
            "Sample Question Papers Practiced": float(papers)
        }

        input_df = pd.DataFrame([input_data])
        raw_prediction = model.predict(input_df)[0]
        
        # Chặn giá trị đầu ra luôn nằm trong khoảng [0, 100]
        final_prediction = max(0.0, min(100.0, float(raw_prediction)))

        return {
            "request_id": request_id,
            "prediction": round(final_prediction, 2),
            "target": "Performance Index",
            "model": metadata["model_name"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi xử lý dữ liệu đầu vào: {str(e)}")