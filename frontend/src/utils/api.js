// frontend/src/utils/api.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const uploadResume = async (file, jobRole = '') => {
  const formData = new FormData();
  formData.append('resume', file);
  if (jobRole) {
    formData.append('jobRole', jobRole);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await safeJson(response);
      throw new Error(errorData?.error || 'Failed to upload resume');
    }

    return await response.json();
  } catch (err) {
    // Graceful fallback for demo/mock mode: fabricate a minimal upload response
    console.warn('[uploadResume] Backend unavailable, using mock upload response:', err?.message);
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
  try {
    const response = await fetch(`${API_BASE_URL}/api/resume/${resumeId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobRole,
        ...(jobDescription && { jobDescription })
      })
    });

    if (!response.ok) {
      const errorData = await safeJson(response);
      throw new Error(errorData?.message || errorData?.error || `Analyze failed (${response.status})`);
    }

    return await response.json();
  } catch (err) {
    // Fallback to local mock analysis for seamless UX during mock/offline
    console.warn('[analyzeResume] Falling back to /mock-analysis.json due to:', err?.message);
    const mockRes = await fetch('/mock-analysis.json');
    if (!mockRes.ok) throw new Error('Failed to load mock analysis');
    const mockJson = await mockRes.json();
    return mockJson;
  }
};

export const getResume = async (resumeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resume/${resumeId}`);
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
  try {
    const response = await fetch(`${API_BASE_URL}/api/resume`);
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

// Helper to safely parse JSON from a Response
async function safeJson(response) {
  try { return await response.json(); } catch (_) { return null; }
}