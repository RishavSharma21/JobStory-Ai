// frontend/src/utils/api.js
const API_BASE_URL = 'http://localhost:5000';

export const uploadResume = async (file, jobRole) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('jobRole', jobRole);

  const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload resume');
  }

  return response.json();
};

export const analyzeResume = async (resumeId, jobRole) => {
  const response = await fetch(`${API_BASE_URL}/api/resume/${resumeId}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobRole }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to analyze resume');
  }

  return response.json();
};

export const getResume = async (resumeId) => {
  const response = await fetch(`${API_BASE_URL}/api/resume/${resumeId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get resume');
  }

  return response.json();
};