// services/aiService.js - PRECISE & TOKEN-EFFICIENT Campus Placement Resume Analysis
const fetch = require('node-fetch');

// ====== OPTIMIZED PROMPT - INDUSTRY READY (TIER 1) ======
function buildCampusPlacementPrompt(resumeText, targetJobRole, jobDescription = '') {
  const jobDescriptionSection = jobDescription ? `
TARGET JOB DESCRIPTION:
${jobDescription}

` : '';

  return `You are an elite, highly strict Applicant Tracking System (ATS) parsing algorithm used by Fortune 500 companies. Your task is to mathematically evaluate the candidate's resume against their target role. 

CONTEXT:
- Target Role: ${targetJobRole || 'Professional'}
${jobDescriptionSection}

--------------------------------------------------
RESUME CONTENT:
${resumeText}
--------------------------------------------------

INSTRUCTIONS FOR SCORING (STRICT & HARSH ADDITIVE METHOD):
Most average resumes should score between 40-55. A good resume should score between 60-70. Only truly exceptional top-1% resumes score 80+. Calibrate your grading perfectly to these standards.

CRITICAL: Do not deduct from 100. You MUST start at a BASE SCORE of 35 and ADD points ONLY if the resume proves it earns them.

1. IMPACT & BUSINESS VALUE (Max +20 points)
- Add 0 points if bullet points just list generic tasks/responsibilities.
- Add +10 points if 2-3 bullet points contain hard metrics (%, $, numbers).
- Add +20 points ONLY if almost every bullet point is quantified and shows direct business outcome.

2. ACTION VERBS & CLARITY (Max +15 points)
- Add 0 points if weak verbs are used ("Helped", "Worked on", "Assisted") or personal pronouns ("I", "my") are present.
- Add +8 points if generic action verbs are used correctly without pronouns.
- Add +15 points ONLY if very strong verbs ("Architected", "Spearheaded", "Optimized") are consistently used everywhere.

3. FORMATTING, LENGTH, & PROFESSIONALISM (Max +10 points)
- Add 0 points if there are typos, missing contact info (email/phone), missing core sections, or if it is under 300 words.
- Add +10 points ONLY if the grammar is absolutely flawless, all contact info is present, and formatting is highly professional.

4. RELEVANCE & KEYWORDS (Max +20 points)
- Extract the core skills required for the Target Role.
- Add 0 points if crucial technical/soft skills are completely missing in the resume bullet points.
- Add +10 points for partial alignment.
- Add +20 points ONLY if the candidate proves top-tier expertise directly in their project/experience bullet points.

Theoretical maximum is 100 (which is impossible). Add your scores together (35 + Impact + Verbs + Formatting + Keywords) to get the final score.

### STEP 2: JSON OUTPUT
Format the output EXACTLY to this JSON structure:

{
  "atsScore": {
    "score": <Calculated Number 0-100 (Usually between 45-75)>,
    "level": "<'Poor' if < 50, 'Fair' if 50-69, 'Good' if 70-84, 'Excellent' if 85+>",
    "explanation": "<A 2-3 sentence professional summary explaining the score>"
  },
  "overallScore": <SAME NUMBER AS atsScore.score>,
  "sectionScores": {
    "education": <Number 0-10>,
    "skills": <Number 0-10>,
    "projects": <Number 0-10>,
    "experience": <Number 0-10>,
    "formatting": <Number 0-10>
  },
  "grammarSpelling": [
    "<String: List specific typos and grammar errors found>"
  ],
  "quickFixes": [
    "<String: CATEGORY: Specific actionable fix 1 (e.g., 'METRICS: Add data to your project descriptions to show impact')>",
    "<String: CATEGORY: Specific actionable fix 2>",
    "<String: CATEGORY: Specific actionable fix 3>"
  ],
  "recruiterImpression": {
    "verdict": "<String: Positive/Neutral/Negative>",
    "skimTime": "<String: e.g., '10 seconds'>",
    "topObservation": "<String: The most glaring issue or biggest strength>"
  },
  "atsAnalysis": {
    "missingKeywords": ["<String: Missing critical skills>"],
    "presentKeywords": ["<String: Skills found in resume>"],
    "keywordMatchScore": <Number 0-100>,
    "missingRequiredKeywords": ["<String: Required but missing skills>"]
  },
  
  // Legacy fields for compatibility
  "redFlags": [],
  "actionPlan": { "high": [], "medium": [], "low": [] }
}
`;
}




// Fallback skill extractor
function extractSkillsFallback(text) {
  const commonSkills = [
    "Java", "Python", "C++", "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Express",
    "Spring", "Hibernate", "Django", "Flask", "SQL", "MySQL", "PostgreSQL", "MongoDB", "AWS", "Azure",
    "Docker", "Kubernetes", "Git", "GitHub", "HTML", "CSS", "SASS", "Linux", "Agile", "Scrum",
    "Machine Learning", "Deep Learning", "Data Analysis", "Communication", "Leadership", "Problem Solving",
    "OOP", "DSA", "Data Structures", "Algorithms"
  ];

  const found = [];
  const lowerText = text.toLowerCase();

  commonSkills.forEach(skill => {
    // Use word boundary check to avoid partial matches (e.g. "Java" in "JavaScript")
    // Exception for C++ which has special chars
    if (skill === "C++") {
      if (lowerText.includes("c++")) found.push(skill);
    } else {
      const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`);
      if (regex.test(lowerText)) {
        found.push(skill);
      }
    }
  });

  return [...new Set(found)]; // Remove duplicates
}

// Main AI processing function with retry logic and model fallbacks
async function processWithAI(resumeDocument, targetJobRole = 'Not specified', jobDescription = '') {
  console.log(`Starting campus placement AI analysis for: ${resumeDocument.fileName}`);
  const startTime = Date.now();

  // Short-circuit: mock mode to disable external API calls
  if (String(process.env.AI_MODE).toLowerCase() === 'mock' || String(process.env.AI_DISABLED) === '1') {
    const resumeText = resumeDocument.cleanedText || resumeDocument.extractedText || '';
    const mock = generateCampusPlacementFallback(resumeText, targetJobRole);
    mock.warning = 'AI_MODE=mock: returning deterministic mock analysis (no external calls).';
    mock.fallbackReason = 'mock_mode';
    mock.isServerUnavailable = false;
    mock.aiModel = 'mock-generator';
    return mock;
  }

  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!apiKey && !groqKey) {
    console.warn('Neither GEMINI_API_KEY nor GROQ_API_KEY is set. Returning fallback campus placement analysis.');
    const resumeText = resumeDocument.cleanedText || resumeDocument.extractedText;
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error('No text found in the resume document.');
    }
    const fallback = generateCampusPlacementFallback(resumeText, targetJobRole);
    fallback.warning = 'AI key missing: using fallback analysis. Set GEMINI_API_KEY or GROQ_API_KEY in backend/.env to enable real AI.';
    fallback.fallbackReason = 'missing_api_key';
    return fallback;
  }

  // Get resume text (support both old and new extractor formats)
  const resumeText = resumeDocument.cleanedText || resumeDocument.extractedText;
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('No text found in the resume document.');
  }

  // Retry logic & model fallbacks
  const maxRetries = 3; // Reduced from 5
  const retryDelayBase = 1000;

  // CRITICAL FIX: Use working flash-latest model as primary
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const fallbackModels = ['gemini-2.0-flash-exp', 'gemini-1.5-pro'];
  const modelCandidates = [primaryModel, ...fallbackModels];

  // Add Groq models if key exists (Prioritize Groq if Gemini is failing)
  if (groqKey) {
    console.log('🚀 Groq API Key detected. Adding Groq models to candidates.');
    modelCandidates.unshift('groq/llama-3.3-70b-versatile');
    modelCandidates.push('groq/mixtral-8x7b-32768');
  }

  // Reduce payload risk: trim very long resumes (server-side safeguard)
  const MAX_CHARS = 15000;
  const safeText = resumeText.length > MAX_CHARS ? resumeText.slice(0, MAX_CHARS) + '\n...[truncated]' : resumeText;

  for (const model of modelCandidates) {
    console.log(`[AI] Trying model: ${model}`);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let rawResponseText = '';

        // Build the campus placement prompt with actual values
        const prompt = buildCampusPlacementPrompt(safeText, targetJobRole, jobDescription);

        // --- GROQ API HANDLER ---
        if (model.startsWith('groq/')) {
          console.log(`Attempt ${attempt}/${maxRetries}: Sending prompt to Groq API (${model})...`);
          const cleanModel = model.replace('groq/', '');

          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: prompt }],
              model: cleanModel,
              temperature: 0.2,
              response_format: { type: "json_object" }
            })
          });

          if (!response.ok) {
            const err = await response.text();
            console.error(`Groq API Error (${response.status}):`, err);
            if (response.status === 429) break; // Rate limit, try next model
            throw new Error(`Groq API Error: ${response.status}`);
          }

          const json = await response.json();
          rawResponseText = json.choices[0].message.content;
        }
        // --- GEMINI API HANDLER ---
        else {
          console.log(`Attempt ${attempt}/${maxRetries}: Sending campus placement analysis prompt to Gemini API...`);
          // Ensure model name is clean (no models/ prefix for the ID part)
          const cleanModel = model.replace(/^models\//, '');
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

          console.log(`[AI] Endpoint: ${endpoint.substring(0, 80)}...`);

          const requestBody = {
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 4000, // Increased to prevent truncation
              topP: 0.95,
              topK: 40,
              responseMimeType: 'application/json'
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            ]
          };

          const apiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            timeout: 25000
          });

          if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error(`Gemini API Error (${apiResponse.status}):`, errorText.substring(0, 100));

            // CRITICAL FIX: If Rate Limited (429), DO NOT RETRY this model. Switch to next model immediately.
            if (apiResponse.status === 429) {
              console.warn(`[AI] Quota exceeded for ${model}. Switching to next model immediately.`);
              break; // Break inner retry loop, move to next model
            }

            // Check if it's a temporary error that we should retry
            if (apiResponse.status === 503 || apiResponse.status === 500) {
              console.error(`Retryable error (${apiResponse.status}) - Attempt ${attempt}/${maxRetries}`);

              if (attempt < maxRetries) {
                const delay = retryDelayBase * attempt;
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }
            }
            break; // Break for other errors
          }

          const json = await apiResponse.json();

          // Try multiple extraction paths
          rawResponseText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

          // Fallback: check if text is in different location
          if (!rawResponseText && json?.candidates?.[0]?.text) {
            rawResponseText = json.candidates[0].text;
          }

          // Fallback: check grounding metadata
          if (!rawResponseText && json?.candidates?.[0]?.groundingMetadata?.retrievalQueries?.[0]) {
            rawResponseText = json.candidates[0].groundingMetadata.retrievalQueries[0];
          }

          // Check if model is in thinking mode (no parts array)
          if (!rawResponseText && json?.candidates?.[0]?.content && !json.candidates[0].content.parts) {
            console.warn('⚠️ Model returned thinking mode response (no parts array). Treating as empty response.');
            throw new Error('Model in thinking mode - no text content available');
          }

          if (!rawResponseText) {
            console.error("Full API Response:", JSON.stringify(json, null, 2));
            throw new Error("Failed to extract text from Gemini API response. Response structure may have changed.");
          }
        } // End Gemini Handler

        // Clean and parse response
        const aiAnalysisData = extractJson(rawResponseText);
        if (!aiAnalysisData) {
          console.error('Failed to parse AI response as JSON. Raw snippet (first 500 chars):', String(rawResponseText).slice(0, 500));
          if (attempt < maxRetries) {
            const jitter = Math.floor(Math.random() * 500);
            const delay = retryDelayBase * Math.pow(2, attempt - 1) + jitter;
            console.log(`Parse error on attempt ${attempt}, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            // try next model candidate
            break;
          }
        }

        // Add metadata
        const processingTime = Date.now() - startTime;
        aiAnalysisData.processingTime = processingTime;
        aiAnalysisData.aiModel = model;
        aiAnalysisData.processedAt = new Date().toISOString();

        // --- ROBUST FALLBACK FOR SKILLS ---
        if (!aiAnalysisData.atsAnalysis) {
          aiAnalysisData.atsAnalysis = {};
        }

        // If AI returned no skills or empty list, use regex extraction
        if (!aiAnalysisData.atsAnalysis.presentKeywords || aiAnalysisData.atsAnalysis.presentKeywords.length === 0) {
          console.log('⚠️ AI returned no skills. Using regex fallback extraction.');
          aiAnalysisData.atsAnalysis.presentKeywords = extractSkillsFallback(safeText);
        }
        // ----------------------------------

        // --- BACKWARD COMPATIBILITY LAYER (For Old Frontend) ---
        if (aiAnalysisData.overallScore !== undefined && !aiAnalysisData.atsScore) {
          aiAnalysisData.atsScore = {
            score: aiAnalysisData.overallScore,
            level: aiAnalysisData.overallScore > 80 ? "Excellent" : aiAnalysisData.overallScore > 60 ? "Good" : "Poor",
            explanation: aiAnalysisData.summary || "Analysis complete."
          };
        }
        if (aiAnalysisData.recruiterImpression && !aiAnalysisData.readabilityScore) {
          aiAnalysisData.readabilityScore = {
            score: aiAnalysisData.sectionScores?.formatting ? aiAnalysisData.sectionScores.formatting * 10 : 70,
            level: "Moderate",
            explanation: aiAnalysisData.recruiterImpression.verdict || "Readable"
          };
        }
        if (aiAnalysisData.sectionScores && !aiAnalysisData.formatScore) {
          aiAnalysisData.formatScore = {
            score: aiAnalysisData.sectionScores.formatting * 10,
            level: aiAnalysisData.sectionScores.formatting > 8 ? "Excellent" : "Average",
            explanation: "Based on section analysis"
          };
        }
        if (aiAnalysisData.actionPlan && !aiAnalysisData.quickFixes) {
          aiAnalysisData.quickFixes = [
            ...(aiAnalysisData.actionPlan.high || []),
            ...(aiAnalysisData.actionPlan.medium || [])
          ].slice(0, 5);
        }
        if (aiAnalysisData.atsAnalysis && !aiAnalysisData.skillKeywordGaps) {
          aiAnalysisData.skillKeywordGaps = {
            skills_present: aiAnalysisData.atsAnalysis.presentKeywords || [],
            critical_missing: aiAnalysisData.atsAnalysis.missingKeywords || []
          };
        }
        // -------------------------------------------------------

        console.log(`Campus placement AI analysis completed successfully in ${processingTime}ms`);
        return aiAnalysisData;

      } catch (error) {
        console.error(`Error on attempt ${attempt}:`, error.message);

        if (attempt < maxRetries) {
          const jitter = Math.floor(Math.random() * 2000);
          const delay = retryDelayBase * Math.pow(2, attempt - 1) + jitter;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.log(`[AI] Attempts exhausted for model ${model}`);
          break;
        }
      }
    } // end attempts loop
  } // end model candidates loop

  // If we're here, all models failed; return fallback
  console.log('All models and retry attempts failed, returning fallback analysis...');
  const fb = generateCampusPlacementFallback(safeText, targetJobRole);
  fb.warning = 'All models failed (retries exhausted). Using fallback.';
  fb.fallbackReason = 'all_models_failed';
  return fb;
}

// Fallback analysis for when AI is unavailable
function generateCampusPlacementFallback(resumeText, targetJobRole) {
  console.log('Generating fallback analysis...');

  const hasProjects = /project|built|developed|created|designed/.test(resumeText.toLowerCase());
  const campusSkills = ['java', 'python', 'javascript', 'react', 'html', 'css', 'sql', 'mysql', 'mongodb', 'node', 'express', 'spring', 'android', 'flutter'];
  const foundSkills = campusSkills.filter(skill => resumeText.toLowerCase().includes(skill));
  const score = hasProjects && foundSkills.length > 0 ? 60 : 35;

  return {
    overallScore: score,
    summary: `Basic scan (AI Offline): Found ${foundSkills.length} skills. ${hasProjects ? 'Projects detected.' : 'No projects detected.'} Enable AI for full analysis.`,
    sectionScores: {
      education: 5,
      skills: foundSkills.length > 3 ? 7 : 3,
      projects: hasProjects ? 6 : 2,
      experience: 4,
      formatting: 5
    },
    redFlags: [
      "AI Service Unavailable - Cannot detect critical red flags",
      foundSkills.length === 0 ? "No technical skills detected" : null,
      !hasProjects ? "No projects section detected" : null
    ].filter(Boolean),
    recruiterImpression: {
      verdict: score > 50 ? "Neutral" : "Negative",
      skimTime: "N/A (AI Offline)",
      topObservation: "AI service is currently offline. Basic keyword scan only."
    },
    actionPlan: {
      high: [
        "Check internet connection and retry for AI analysis",
        "Ensure resume is readable PDF"
      ],
      medium: [
        "Add more technical keywords",
        "Quantify project achievements"
      ],
      low: [
        "Check formatting consistency"
      ]
    },
    atsAnalysis: {
      missingKeywords: ["AI", "Offline", "Retry"],
      keywordMatchScore: score
    },
    grammarSpelling: ["AI offline - manual review needed"],

    // Legacy fields for backward compatibility
    atsScore: {
      score: score,
      level: score > 50 ? "Fair" : "Poor",
      explanation: "AI offline. Basic keyword scan only."
    },
    recruiterInsights: {
      overview: "AI offline.",
      keyStrengths: foundSkills,
      concerningAreas: ["AI offline"],
      recommendations: ["Retry analysis"]
    },
    skillKeywordGaps: {
      skills_present: foundSkills,
      critical_missing: ["AI needed"]
    },

    processingTime: 100,
    aiModel: "fallback",
    processedAt: new Date().toISOString(),
    isServerUnavailable: true
  };
}

// Lightweight health check for Gemini connectivity
async function geminiHealth() {
  if (String(process.env.AI_MODE).toLowerCase() === 'mock' || String(process.env.AI_DISABLED) === '1') {
    return { ok: true, mocked: true, reason: 'AI_MODE=mock' };
  }
  const apiKey = process.env.GEMINI_API_KEY;
  const model = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').replace(/^models\//, '');
  if (!apiKey) {
    return { ok: false, reason: 'missing_api_key' };
  }
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: 'test' }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 10 }
    };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      timeout: 10000
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, status: res.status, body: text.substring(0, 200) };
    }
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { parsed = { raw: text.substring(0, 100) }; }
    const reply = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || 'OK';
    return { ok: true, status: res.status, reply };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// List available models for this API key/project
async function listModels() {
  if (String(process.env.AI_MODE).toLowerCase() === 'mock' || String(process.env.AI_DISABLED) === '1') {
    return { ok: true, mocked: true, models: [] };
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, reason: 'missing_api_key' };
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url, { timeout: 10000 });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, body: text.substring(0, 200) };
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { parsed = { raw: text.substring(0, 100) }; }
    const names = (parsed.models || []).map(m => m.name || m).slice(0, 20);
    return { ok: true, status: res.status, models: names };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Utility: robustly extract JSON block even if model wrapped it in prose/code fences
function extractJson(text) {
  if (!text) return null;
  let t = text.trim();

  // Remove markdown code blocks if present
  t = t.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

  // Try direct parse first
  try { return JSON.parse(t); } catch (_) { /* continue to extraction */ }

  // Extract JSON from text
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');

  if (first !== -1 && last !== -1 && last > first) {
    let slice = t.slice(first, last + 1);

    // Cleanup known problematic characters
    try { return JSON.parse(slice); } catch (err) {
      // Fix trailing commas
      try {
        const cleaned = slice.replace(/,\s*(\}|\])/g, '$1');
        return JSON.parse(cleaned);
      } catch (e) {
        console.error('JSON parse error after repairs:', e.message);
      }
    }
  }
  return null;
}

module.exports = {
  processWithAI,
  geminiHealth,
  listModels
};