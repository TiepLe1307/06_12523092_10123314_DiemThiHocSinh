const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
    {
        request_id: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        hours_studied: {
            type: Number,
            required: true,
            min: 0
        },

        previous_scores: {
            type: Number,
            required: true,
            min: 0
        },

        extracurricular_activities: {
            type: String,
            required: true,
            enum: ['Yes', 'No']
        },

        sleep_hours: {
            type: Number,
            required: true,
            min: 0
        },

        sample_question_papers_practiced: {
            type: Number,
            required: true,
            min: 0
        },

        prediction: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        target: {
            type: String,
            default: 'Performance Index'
        },

        model: {
            type: String,
            default: 'Linear Regression'
        },

        model_version: {
            type: String,
            default: '1.0.0'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Prediction', predictionSchema);