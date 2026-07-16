// ai.js - This defines the URLs for AI operations

const express = require('express');
const router = express.Router();
const { processText, generateCoverLetter, health } = require('../controllers/aiController');

// POST /api/ai/process - Process text with AI
router.post('/process', processText);

// POST /api/ai/cover-letter - Generate customized cover letter with AI
router.post('/cover-letter', generateCoverLetter);

// GET /api/ai/health - Check env & Gemini connectivity
router.get('/health', health);

module.exports = router;