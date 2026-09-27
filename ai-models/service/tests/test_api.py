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
        "request_id": "test-request-001",
        "Hours Studied": 5,
        "Previous Scores": 70,
        "Extracurricular Activities": "Yes",
        "Sleep Hours": 7,
        "Sample Question Papers Practiced": 5
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["request_id"] == "test-request-001"
    assert "prediction" in data
    assert data["target"] == "Performance Index"
    assert data["model"] == "Linear Regression"
    assert data["model_version"] == "1.0.0"
    assert isinstance(data["prediction"], float)

    assert 0 <= data["prediction"] <= 100


def test_predict_invalid_extracurricular_activity():
    payload = {
        "request_id": "test-request-002",
        "Hours Studied": 5,
        "Previous Scores": 70,
        "Extracurricular Activities": "Maybe",
        "Sleep Hours": 7,
        "Sample Question Papers Practiced": 5
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 400


def test_predict_missing_field():
    payload = {
        "request_id": "test-request-003",
        "Hours Studied": 5,
        "Previous Scores": 70,
        "Extracurricular Activities": "Yes",
        "Sleep Hours": 7
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 422