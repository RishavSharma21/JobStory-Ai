// aiController.js - This handles AI-related requests

const { processWithAI } = require('../services/aiService');
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
  processText
};