const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(
            `🚀 Backend đang chạy tại http://localhost:${PORT}`
        );
        console.log(
            `🤖 AI Service URL: ${process.env.AI_SERVICE_URL || 'http://ai-service:8001'}`
        );
    });
});