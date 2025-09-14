// ai.js - This defines the URLs for AI operations

const express = require('express');
const router = express.Router();
const { processText } = require('../controllers/aiController');

// POST /api/ai/process - Process text with AI
router.post('/process', processText);

module.exports = router;