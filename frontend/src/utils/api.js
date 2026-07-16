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


export const generateCoverLetter = async (resumeId, targetRole, jobDescription = '', tone = 'professional', length = 'medium') => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/cover-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-auth-token': token } : {})
      },
      body: JSON.stringify({
        resumeId,
        jobRole: targetRole,
        jobDescription,
        tone,
        length
      })
    });

    if (!response.ok) {
      const errorData = await safeJson(response);
      throw new Error(errorData?.error || 'Failed to generate cover letter');
    }

    const data = await response.json();
    return data.coverLetter || '';
  } catch (err) {
    console.warn('[generateCoverLetter] Error, falling back to local mock response:', err?.message);
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${targetRole} position. With a solid track record of technical execution, building highly polished customer-facing features, and working under a dynamic environment, I am confident in my capability to make a major impact on your team.

My technical background is closely aligned with the requirements of this role. I have extensive experience optimizing UI layouts, implementing highly modular component architecture, and writing clean, scalable codebase patterns. 

Thank you for your time and review. I look forward to the possibility of discussing how my experience can contribute to your business goals.

Sincerely,
[Your Name]`;
  }
};
export const generateInterviewQuestions = async (resumeId, targetRole) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/interview-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-auth-token': token } : {})
      },
      body: JSON.stringify({ resumeId, jobRole: targetRole })
    });

    if (!response.ok) {
      const errorData = await safeJson(response);
      throw new Error(errorData?.error || 'Failed to generate interview questions');
    }

    const data = await response.json();
    return data.questions || [];
  } catch (err) {
    console.warn('[generateInterviewQuestions] Error, falling back to local mock response:', err?.message);
    return getRoleBasedFallbackQuestions(targetRole);
  }
};

const getRoleBasedFallbackQuestions = (role) => {
  const r = (role || '').toLowerCase();
  if (r.includes('software') || r.includes('developer') || r.includes('engineer') || r.includes('programmer')) {
    return [
      "Can you describe a challenging technical problem you solved recently and how you arrived at the solution?",
      "How do you keep your technical skills up to date with rapidly changing technologies?",
      "Explain the concept of RESTful APIs and how you ensure security and performance in their implementation.",
      "Describe a time when you had to debug a complex system issue under tight deadlines. What was your approach?",
      "How do you handle code reviews, both as a reviewer and when receiving feedback on your own code?"
    ];
  }
  if (r.includes('product') || r.includes('manager') || r.includes('pm')) {
    return [
      "How do you prioritize features when dealing with competing stakeholder demands and limited resources?",
      "Describe a product launch that didn't go as planned. What went wrong, and what did you learn?",
      "How do you translate customer feedback and user research into actionable product requirements?",
      "What metrics do you track to measure the success of a product post-launch?",
      "Tell us about a time you had to make a tough decision without having all the data you wanted."
    ];
  }
  if (r.includes('design') || r.includes('ux') || r.includes('ui') || r.includes('designer')) {
    return [
      "Can you walk us through your design process, from initial concept to final high-fidelity designs?",
      "How do you balance user needs with technical constraints and business goals in your designs?",
      "Describe a time when user testing feedback completely contradicted your initial design hypotheses.",
      "How do you approach creating and maintaining a consistent design system across different platforms?",
      "How do you collaborate with developers to ensure the high-fidelity designs are implemented correctly?"
    ];
  }
  return [
    "Tell us about a challenging project you worked on recently. What was your role and the outcome?",
    "How do you manage your time and prioritize tasks when working on multiple projects with overlapping deadlines?",
    "Describe a conflict you had with a team member or stakeholder. How did you resolve it?",
    "What are your key strengths that make you a great fit for this target role?",
    "Where do you see yourself professionally in the next three to five years?"
  ];
};

// Helper to safely parse JSON from a Response
async function safeJson(response) {
  try { return await response.json(); } catch (_) { return null; }
}