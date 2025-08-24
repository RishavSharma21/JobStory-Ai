// src/utils/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Upload resume file
export const uploadResume = async (file, jobRole) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('jobRole', jobRole);

  const response = await fetch(`${API_BASE_URL}/resume/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
};

// Generate AI stories
export const generateStories = async (resumeId, jobRole) => {
  const response = await fetch(`${API_BASE_URL}/ai/generate-stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeId, jobRole }),
  });

  return handleResponse(response);
};

// Generate interview questions
export const generateInterviewQuestions = async (resumeId, jobRole) => {
  const response = await fetch(`${API_BASE_URL}/ai/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeId, jobRole }),
  });

  return handleResponse(response);
};

// Get user resume data
export const getResumeData = async (resumeId) => {
  const response = await fetch(`${API_BASE_URL}/resume/${resumeId}`);
  return handleResponse(response);
};

// Save practice session
export const savePracticeSession = async (sessionData) => {
  const response = await fetch(`${API_BASE_URL}/practice/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData),
  });

  return handleResponse(response);
};

// Get practice history
export const getPracticeHistory = async (resumeId) => {
  const response = await fetch(`${API_BASE_URL}/practice/history/${resumeId}`);
  return handleResponse(response);
};

// Analyze answer quality
export const analyzeAnswer = async (question, answer) => {
  const response = await fetch(`${API_BASE_URL}/ai/analyze-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, answer }),
  });

  return handleResponse(response);
};

// Export stories to PDF
export const exportStories = async (storiesData) => {
  const response = await fetch(`${API_BASE_URL}/export/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(storiesData),
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  // Return blob for download
  return response.blob();
};

// Get ATS score for resume
export const getATSScore = async (resumeId) => {
  const response = await fetch(`${API_BASE_URL}/resume/ats-score/${resumeId}`);
  return handleResponse(response);
};