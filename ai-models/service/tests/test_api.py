from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "ok"
    assert data["model_loaded"] is True


def test_model_info():
    response = client.get("/model-info")

    assert response.status_code == 200

    data = response.json()

    assert data["project"] == "Student Performance Prediction"
    assert data["task"] == "regression"
    assert data["model_name"] == "Linear Regression"


def test_predict():
    payload = {
        "hours_studied": 5,
        "previous_scores": 70,
        "extracurricular_activities": "Yes",
        "sleep_hours": 7,
        "sample_question_papers_practiced": 5
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert "request_id" in data
    assert "prediction" in data
    assert data["target"] == "Performance Index"
    assert data["model"] == "Linear Regression"

    assert isinstance(data["prediction"], float)


def test_predict_invalid_extracurricular_activity():
    payload = {
        "hours_studied": 5,
        "previous_scores": 70,
        "extracurricular_activities": "Maybe",
        "sleep_hours": 7,
        "sample_question_papers_practiced": 5
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 400