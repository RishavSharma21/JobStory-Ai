// resume.js - This defines the URLs for resume operations

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// Import controller functions directly
const resumeController = require('../controllers/resumeController');

// POST /api/resume/upload - Upload and parse a resume
router.post('/upload', upload.single('resume'), resumeController.uploadResume);

// POST /api/resume/:id/analyze - Analyze a resume with AI
router.post('/:id/analyze', resumeController.analyzeResume);

// GET /api/resume/:id - Get resume details
router.get('/:id', resumeController.getResume);

// GET /api/resume - Get all resumes (history)
router.get('/', resumeController.getAllResumes);

// DELETE /api/resume/:id - Delete a resume
router.delete('/:id', resumeController.deleteResume);

module.exports = router;