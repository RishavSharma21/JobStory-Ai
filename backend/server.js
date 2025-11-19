// server.js - This is the main file that starts your backend server

const express = require('express');  // Web framework for Node.js
const cors = require('cors');        // Allows frontend to communicate with backend
const mongoose = require('mongoose'); // Database connection tool
const dotenv = require('dotenv');    // Loads environment variables from .env file
const path = require('path');

// Load environment variables from backend/.env regardless of CWD
dotenv.config({ path: path.join(__dirname, '.env') });

// Quick diagnostics for GEMINI key presence (masked)
const geminiKey = process.env.GEMINI_API_KEY || '';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
if (geminiKey) {
  const masked = `${geminiKey.slice(0, 6)}…${geminiKey.slice(-4)}`;
  console.log(`[Env] GEMINI_API_KEY detected: ${masked}`);
  console.log(`[Env] GEMINI_MODEL: ${geminiModel}`);
} else {
  console.warn('[Env] GEMINI_API_KEY is NOT set. AI analysis will use fallback.');
  console.log(`[Env] GEMINI_MODEL: ${geminiModel}`);
}

// Create Express app
const app = express();

// Middleware - These are like filters that process requests before they reach your routes
app.use(cors());                           // Enable cross-origin requests
app.use(express.json());                   // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Connect to MongoDB database (non-fatal on failure for mock/demo)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-analyzer')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error (continuing in mock mode if enabled):', err?.message || err);
  });

// Routes - load with safeguards so server doesn't crash on require errors
try {
  const resumeRoutes = require('./routes/resume');
  app.use('/api/resume', resumeRoutes);
} catch (e) {
  console.error('[Route Load] resume routes failed:', e?.message || e);
  const fallback = express.Router();
  fallback.all('*', (_req, res) => res.status(503).json({ error: 'Resume routes unavailable', details: 'Server in degraded mode' }));
  app.use('/api/resume', fallback);
}

try {
  const aiRoutes = require('./routes/ai');
  app.use('/api/ai', aiRoutes);
} catch (e) {
  console.error('[Route Load] ai routes failed:', e?.message || e);
  const fallback = express.Router();
  fallback.get('/health', (_req, res) => {
    const key = process.env.GEMINI_API_KEY || '';
    res.json({ envLoaded: true, hasKey: Boolean(key), model: process.env.GEMINI_MODEL || 'mock', health: { ok: true, mocked: true, reason: 'degraded' } });
  });
  app.use('/api/ai', fallback);
}

// Test route - Visit http://localhost:5000 to see if server is running
app.get('/', (req, res) => {
  res.json({ message: 'Resume Analyzer Backend API is running!', mode: process.env.AI_MODE || 'normal' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test`);
});