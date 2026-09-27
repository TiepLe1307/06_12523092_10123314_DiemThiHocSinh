const express = require('express');
const Prediction = require('../models/Prediction');

const router = express.Router();

router.get('/history', async (req, res) => {
    try {
        const history = await Prediction.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return res.status(200).json({
            total: history.length,
            data: history
        });
    } catch (error) {
        console.error('❌ Lỗi lấy lịch sử:', error.message);

        return res.status(500).json({
            error: 'history_error',
            detail: 'Không thể lấy lịch sử dự đoán.'
        });
    }
});

module.exports = router;