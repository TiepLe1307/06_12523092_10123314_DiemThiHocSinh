const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const Prediction = require('./models/Prediction');
const historyRoutes = require('./routes/historyRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || 'http://ai-service:8001';

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'backend',
        timestamp: new Date().toISOString()
    });
});

app.use('/api', historyRoutes);

app.post('/api/predict', async (req, res) => {
    const reqId =
        typeof req.body.request_id === 'string' &&
        req.body.request_id.trim() !== ''
            ? req.body.request_id
            : crypto.randomUUID();

    console.log(
        `[${new Date().toISOString()}] INFO backend req=${reqId} nhận request từ FE`
    );

    const data = req.body;

    const validInput =
        typeof data["Hours Studied"] === 'number' &&
        Number.isFinite(data["Hours Studied"]) &&
        data["Hours Studied"] >= 0 &&

        typeof data["Previous Scores"] === 'number' &&
        Number.isFinite(data["Previous Scores"]) &&
        data["Previous Scores"] >= 0 &&

        typeof data["Sleep Hours"] === 'number' &&
        Number.isFinite(data["Sleep Hours"]) &&
        data["Sleep Hours"] >= 0 &&

        typeof data["Sample Question Papers Practiced"] === 'number' &&
        Number.isFinite(data["Sample Question Papers Practiced"]) &&
        data["Sample Question Papers Practiced"] >= 0 &&

        ["Yes", "No"].includes(
            data["Extracurricular Activities"]
        );

    if (!validInput) {
        console.warn(
            `[${new Date().toISOString()}] WARN backend req=${reqId} dữ liệu đầu vào không hợp lệ`
        );

        return res.status(400).json({
            error: "invalid_input",
            detail: "Dữ liệu không khớp schema yêu cầu.",
            request_id: reqId
        });
    }

    try {
        console.log(
            `[${new Date().toISOString()}] INFO backend req=${reqId} validate OK -> đang gọi AI Service...`
        );

        const aiPayload = {
            request_id: reqId,
            "Hours Studied": data["Hours Studied"],
            "Previous Scores": data["Previous Scores"],
            "Extracurricular Activities":
                data["Extracurricular Activities"],
            "Sleep Hours": data["Sleep Hours"],
            "Sample Question Papers Practiced":
                data["Sample Question Papers Practiced"]
        };

        const aiResponse = await axios.post(
            `${AI_SERVICE_URL}/predict`,
            aiPayload,
            { timeout: 10000 }
        );

        console.log(
            `[${new Date().toISOString()}] INFO backend req=${reqId} AI trả kết quả prediction=${aiResponse.data.prediction}`
        );

        const predictionRecord = await Prediction.create({
            request_id: reqId,
            hours_studied: data["Hours Studied"],
            previous_scores: data["Previous Scores"],
            extracurricular_activities:
                data["Extracurricular Activities"],
            sleep_hours: data["Sleep Hours"],
            sample_question_papers_practiced:
                data["Sample Question Papers Practiced"],
            prediction: aiResponse.data.prediction,
            target: aiResponse.data.target,
            model: aiResponse.data.model,
            model_version: aiResponse.data.model_version
        });

        console.log(
            `[${new Date().toISOString()}] INFO backend req=${reqId} đã lưu lịch sử MongoDB`
        );

        return res.status(200).json({
            request_id: reqId,
            prediction: predictionRecord.prediction,
            target: predictionRecord.target,
            model: predictionRecord.model,
            model_version: predictionRecord.model_version
        });

    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] ERROR backend req=${reqId} lỗi gọi AI:`,
            error.message
        );

        return res.status(500).json({
            error: "ai_service_error",
            detail: "Không thể kết nối hoặc xử lý từ AI Service.",
            request_id: reqId
        });
    }
});

module.exports = app;