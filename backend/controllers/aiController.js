// aiController.js - This handles AI-related requests

const { processWithAI, geminiHealth, listModels } = require('../services/aiService');
const Resume = require('../models/Resume');

// Process text with AI
async function processText(req, res) {
  try {
    console.log('Processing text with AI');
    
    const { text, jobRole } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Process with AI service
    const results = await processWithAI({ extractedText: text }, jobRole || 'General Position');
    
    res.json({
      message: 'Text processed successfully',
      results: results
    });
    
  } catch (error) {
    console.error('Error in processText:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  processText,
  async health(req, res) {
    // Zero external calls in mock mode
    if (String(process.env.AI_MODE).toLowerCase() === 'mock' || String(process.env.AI_DISABLED) === '1') {
      const key = process.env.GEMINI_API_KEY || '';
      const masked = key ? `${key.slice(0, 6)}…${key.slice(-4)}` : null;
      return res.json({
        envLoaded: true,
        hasKey: Boolean(key),
        maskedKey: masked,
        model: process.env.GEMINI_MODEL || 'mock',
        health: { ok: true, mocked: true, reason: 'AI_MODE=mock' },
        availableModels: [],
        modelsStatus: { ok: true, mocked: true }
      });
    }

    const key = process.env.GEMINI_API_KEY || '';
    const masked = key ? `${key.slice(0, 6)}…${key.slice(-4)}` : null;
    const [health, models] = await Promise.all([geminiHealth(), listModels()]);
    res.json({
      envLoaded: true,
      hasKey: Boolean(key),
      maskedKey: masked,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      health,
      availableModels: models?.ok ? models.models : undefined,
      modelsStatus: models
    });
  }
};