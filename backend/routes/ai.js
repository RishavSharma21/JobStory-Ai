// ai.js - This defines the URLs for AI operations

const express = require('express');
const router = express.Router();
const { processText, health } = require('../controllers/aiController');

// POST /api/ai/process - Process text with AI
router.post('/process', processText);

// GET /api/ai/health - Check env & Gemini connectivity
router.get('/health', health);

module.exports = router;