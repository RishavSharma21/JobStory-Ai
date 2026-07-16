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



async function generateCoverLetter(req, res) {
  try {
    const { resumeId, resumeText, jobRole, jobDescription, tone, length } = req.body;

    let textToUse = resumeText || '';
    let roleToUse = jobRole || 'Software Engineer';
    let jdToUse = jobDescription || '';

    // Support fetching by resumeId with IDOR protection
    if (resumeId) {
      if (!resumeId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid resume ID format' });
      }

      const Resume = require('../models/Resume');
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      // IDOR Protection
      const jwt = require('jsonwebtoken');
      const token = req.header('x-auth-token');
      let userId = null;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          userId = decoded.user?.id || decoded.user?._id || null;
        } catch (_) { }
      }

      if (resume.user && String(resume.user) !== String(userId)) {
        return res.status(403).json({ error: 'Access Denied', message: 'You do not have permission to access this resume' });
      }

      textToUse = resume.extractedText || '';
      roleToUse = jobRole || resume.targetJobRole || 'Software Engineer';
      if (!jdToUse && resume.aiAnalysis?.jobMatching?.jobDescription) {
        jdToUse = resume.aiAnalysis.jobMatching.jobDescription;
      }
    }

    if (!textToUse) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const { generateCoverLetterText } = require('../services/aiService');
    const coverLetter = await generateCoverLetterText(textToUse, roleToUse, jdToUse, tone, length);

    res.json({
      success: true,
      coverLetter: coverLetter
    });
  } catch (error) {
    console.error('Error in generateCoverLetter:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  processText,
  generateCoverLetter,
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