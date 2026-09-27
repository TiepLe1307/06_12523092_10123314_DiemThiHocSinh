const request = require('supertest');

jest.mock('axios');

jest.mock('../models/Prediction', () => ({
    create: jest.fn()
}));

const axios = require('axios');
const Prediction = require('../models/Prediction');
const app = require('../app');

describe('Backend API', () => {
    test('GET /health trả về trạng thái OK', async () => {
        const response = await request(app)
            .get('/health');

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('ok');
        expect(response.body.service).toBe('backend');
    });

    test('POST /api/predict từ chối dữ liệu thiếu trường', async () => {
        const response = await request(app)
            .post('/api/predict')
            .send({
                request_id: 'test-missing-001',
                "Hours Studied": 5,
                "Previous Scores": 70,
                "Extracurricular Activities": "Yes",
                "Sleep Hours": 7
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('invalid_input');
        expect(response.body.request_id).toBe('test-missing-001');
    });

    test('POST /api/predict từ chối giá trị hoạt động ngoại khóa không hợp lệ', async () => {
        const response = await request(app)
            .post('/api/predict')
            .send({
                request_id: 'test-invalid-001',
                "Hours Studied": 5,
                "Previous Scores": 70,
                "Extracurricular Activities": "Maybe",
                "Sleep Hours": 7,
                "Sample Question Papers Practiced": 5
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('invalid_input');
        expect(response.body.request_id).toBe('test-invalid-001');
    });

    test('POST /api/predict dự đoán thành công', async () => {
        axios.post.mockResolvedValue({
            data: {
                prediction: 66.8,
                target: 'Performance Index',
                model: 'Linear Regression',
                model_version: '1.0.0'
            }
        });

        Prediction.create.mockResolvedValue({
            request_id: 'test-valid-001',
            prediction: 66.8,
            target: 'Performance Index',
            model: 'Linear Regression',
            model_version: '1.0.0'
        });

        const response = await request(app)
            .post('/api/predict')
            .send({
                request_id: 'test-valid-001',
                "Hours Studied": 5,
                "Previous Scores": 75,
                "Extracurricular Activities": "Yes",
                "Sleep Hours": 7,
                "Sample Question Papers Practiced": 3
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.request_id).toBe('test-valid-001');
        expect(response.body.prediction).toBe(66.8);
        expect(response.body.target).toBe('Performance Index');
        expect(response.body.model).toBe('Linear Regression');
        expect(response.body.model_version).toBe('1.0.0');

        expect(axios.post).toHaveBeenCalled();
        expect(Prediction.create).toHaveBeenCalled();
    });
});