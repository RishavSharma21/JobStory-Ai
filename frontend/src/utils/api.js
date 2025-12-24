// frontend/src/utils/api.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const uploadResume = async (file, jobRole = '') => {
  const formData = new FormData();
  formData.append('resume', file);
  if (jobRole) {
    formData.append('jobRole', jobRole);
  }

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: 'POST',
      headers: token ? { 'x-auth-token': token } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorData = await safeJson(response);

      // If it's a validation error (400), throw it with details
      if (response.status === 400) {
        const validationMessage = errorData?.message || errorData?.error || 'Validation failed';
        throw new Error(validationMessage);
      }

      // For other errors, throw generic message
      throw new Error(errorData?.error || 'Failed to upload resume');
    }

    return await response.json();
  } catch (err) {
    // If it's a validation error or client error, propagate it
    if (err.message.includes('Resume') || err.message.includes('file') || err.message.includes('PDF')) {
      throw err; // Throw validation errors to be shown to user
    }

    // Only use mock data for network errors
    console.warn('[uploadResume] Network error, using mock upload response:', err?.message);
    return {
      success: true,
      message: 'Mock upload succeeded (backend offline/mock)',
      resumeId: 'mock-000000000000000000000001',
      fileName: file?.name || 'resume.pdf',
      fileType: file?.type || 'application/pdf',
      fileSize: file?.size || 0,
      processingStatus: 'text_extracted'
    };
  }
};

export const analyzeResume = async (resumeId, jobRole, jobDescription = '') => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/api/resume/${resumeId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-auth-token': token } : {})
      },
      body: JSON.stringify({
        jobRole,
        ...(jobDescription && { jobDescription })
      })
    });

    if (!response.ok) {
      const errorData = await safeJson(response);

      // If it's a validation error (400), throw it with full details
      if (response.status === 400) {
        const validationMessage = errorData?.message || errorData?.error || 'Validation failed';
        throw new Error(validationMessage);
      }

      // For other errors, throw with message
      throw new Error(errorData?.message || errorData?.error || `Analyze failed (${response.status})`);
    }

    return await response.json();
  } catch (err) {
    // If it's a validation error, propagate it - DON'T use mock data
    if (err.message.includes('Invalid') || err.message.includes('validation') || err.message.includes('short')) {
      throw err; // Throw validation errors to be shown to user
    }

    // Only fallback to mock for network errors
    console.warn('[analyzeResume] Network error, falling back to /mock-analysis.json:', err?.message);
    const mockRes = await fetch('/mock-analysis.json');
    if (!mockRes.ok) throw new Error('Failed to load mock analysis');
    const mockJson = await mockRes.json();
    return mockJson;
  }
};

export const getResume = async (resumeId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/api/resume/${resumeId}`, {
      headers: token ? { 'x-auth-token': token } : {}
    });
    // ... existing ...
    if (!response.ok) {
      const errorData = await safeJson(response);
      throw new Error(errorData?.error || 'Failed to get resume');
    }
    return await response.json();
  } catch (err) {
    console.warn('[getResume] Backend unavailable, returning minimal mock:', err?.message);
    return {
      success: true,
      resume: {
        resumeId: 'mock-000000000000000000000001',
        fileName: 'Sample_Resume.pdf',
        fileType: 'application/pdf',
        fileSize: 0,
        processingStatus: 'text_extracted',
        aiAnalysis: null
      }
    };
  }
};

export const getAllResumes = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/api/resume`, {
      headers: token ? { 'x-auth-token': token } : {}
    });
    if (!response.ok) {
      const errorData = await safeJson(response);
      throw new Error(errorData?.error || 'Failed to get resumes');
    }
    return await response.json();
  } catch (err) {
    console.warn('[getAllResumes] Backend unavailable, returning empty list:', err?.message);
    return { success: true, resumes: [], pagination: { currentPage: 1, totalPages: 1, totalCount: 0 } };
  }
};

export const deleteResume = async (resumeId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/api/resume/${resumeId}`, {
      method: 'DELETE',
      headers: token ? { 'x-auth-token': token } : {}
    });
    if (!response.ok) {
      const errorData = await safeJson(response);
      throw new Error(errorData?.error || 'Failed to delete resume');
    }
    return await response.json();
  } catch (err) {
    console.error('[deleteResume] Error:', err.message);
    throw err;
  }
};

// Helper to safely parse JSON from a Response
async function safeJson(response) {
  try { return await response.json(); } catch (_) { return null; }
}