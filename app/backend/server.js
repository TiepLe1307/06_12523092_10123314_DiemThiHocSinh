// app/backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Đã sửa 'localhost' thành 'ai-service' để kết nối đúng trong mạng Docker Compose
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8001';
const PORT = process.env.PORT || 8000;

// API Health Check (cho Docker kiểm tra trạng thái)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'backend', timestamp: new Date() });
});

// API chính nhận request từ Frontend
app.post('/api/predict', async (req, res) => {
    const reqId = crypto.randomBytes(4).toString('hex');
    console.log(`[${new Date().toISOString()}] INFO backend req=${reqId} nhận request từ FE`);

    const data = req.body;

    // Validate dữ liệu đầu vào theo đúng schema bài toán
    if (
        typeof data["Hours Studied"] !== 'number' ||
        typeof data["Previous Scores"] !== 'number' ||
        typeof data["Sleep Hours"] !== 'number' ||
        typeof data["Sample Question Papers Practiced"] !== 'number' ||
        !["Yes", "No"].includes(data["Extracurricular Activities"])
    ) {
        console.warn(`[${new Date().toISOString()}] WARN backend req=${reqId} dữ liệu đầu vào không hợp lệ`);
        return res.status(400).json({
            error: "invalid_input",
            detail: "Dữ liệu không khớp schema yêu cầu.",
            request_id: reqId
        });
    }

    try {
        console.log(`[${new Date().toISOString()}] INFO backend req=${reqId} validate OK -> đang gọi sang AI Service...`);
        
        // Chuyển tiếp request sang AI Service
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, data);
        
        console.log(`[${new Date().toISOString()}] INFO backend req=${reqId} 200 OK trả kết quả về FE`);
        res.json({
            request_id: reqId,
            prediction: aiResponse.data.prediction,
            model_version: aiResponse.data.model_version || '1.0.0'
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR backend req=${reqId}`, error.message);
        res.status(500).json({ error: "Lỗi kết nối đến AI Service", request_id: reqId });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend đang chạy tại http://localhost:${PORT}`);
});