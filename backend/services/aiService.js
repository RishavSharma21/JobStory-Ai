// services/aiService.js - PRECISE & TOKEN-EFFICIENT Campus Placement Resume Analysis
const fetch = require('node-fetch');

// ====== OPTIMIZED PROMPT - INDUSTRY READY (TIER 1) ======
function buildCampusPlacementPrompt(resumeText, targetJobRole, jobDescription = '') {
  const jobDescriptionSection = jobDescription ? `
TARGET JOB DESCRIPTION:
${jobDescription}

` : '';

  return `You are an elite, enterprise-grade Senior Technical Recruiter and ATS Audit Engine (equivalent to Jobscan, TopResume, and ResumeWorded). Your job is to thoroughly analyze the candidate's resume and return deeply specific, non-generic, highly actionable feedback.

TARGET ROLE: ${targetJobRole || 'Software Engineer / Technology Professional'}
${jobDescriptionSection}

--------------------------------------------------
RESUME CONTENT TO AUDIT:
${resumeText}
--------------------------------------------------

CRITICAL REQUIREMENTS FOR YOUR RESPONSE:
1. DO NOT give generic advice (e.g. "Add more details" or "Fix formatting"). Give SPECIFIC, EXPLICIT, LINE-BY-LINE feedback with exact quotes and concrete rewrite examples.
2. For Grammar & Spelling: Search the resume text thoroughly for typos, weak passive phrasing, first-person pronouns ("I", "me", "my", "our"), or missing punctuation. Return an array of specific, quoted line-by-line corrections. If no spelling errors exist, cite specific weak passive phrases and provide their high-impact active rewrite.
3. For Quick Fixes: Provide 5 to 7 high-priority bullet point improvements. Each quick fix MUST be formatted as: "CATEGORY: [Action Needed] -> [Concrete Example Rewrite using hard metrics or industry terminology]".
4. For Section Scores: Scientifically calculate individual scores (0-10) for Education, Skills, Projects, Experience, and Formatting based on ATS standards.
5. For ATS Keyword Analysis: Extract exact technical skills present in the resume vs critical missing industry keywords required for ${targetJobRole || 'the target role'}.
6. For Recruiter Insights & Red Flags: Give an authoritative 6-second recruiter skim verdict, listing major strengths, concerning red flags, and key positioning advice.

RETURN YOUR ANALYSIS STRICTLY IN THIS VALID JSON FORMAT (DO NOT ADD MARKDOWN FENCES OR EXTRA PROSE):

{
  "atsScore": {
    "score": <Calculated Number 0-100>,
    "level": "<'Poor' (<50) | 'Fair' (50-69) | 'Good' (70-84) | 'Excellent' (85+)>",
    "explanation": "<2-3 sentence rigorous summary explaining exactly why the resume received this score>"
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
    "<String: CATEGORY: Found weak phrasing or typo in 'Original text' -> Replace with: 'Polished active voice rewrite'>",
    "<String: CATEGORY: Pronoun or typo in 'Original text' -> Replace with: 'Polished active voice rewrite'>"
  ],
  "quickFixes": [
    "<String: CATEGORY: Identified issue in 'Current bullet text' -> Replace with: 'High-impact rewritten bullet with metrics and technical tools'>",
    "<String: CATEGORY: Missing section or metric in 'Current state' -> Replace with: 'Concrete recommended action'>"
  ],

  "recruiterImpression": {
    "verdict": "<'Positive' | 'Neutral' | 'Negative'>",
    "skimTime": "<e.g. '6 seconds'>",
    "topObservation": "<Detailed observation highlighting the candidate's core differentiator or biggest vulnerability>"
  },
  "recruiterInsights": {
    "overview": "<Professional recruiter evaluation of candidate readiness>",
    "keyStrengths": [
      "<Specific candidate strength 1>",
      "<Specific candidate strength 2>",
      "<Specific candidate strength 3>"
    ],
    "concerningAreas": [
      "<Specific vulnerability or red flag 1>",
      "<Specific vulnerability or red flag 2>"
    ],
    "recommendations": [
      "<Strategic career & positioning recommendation 1>",
      "<Strategic career & positioning recommendation 2>"
    ]
  },
  "atsAnalysis": {
    "presentKeywords": ["<String: Technical skill found in resume 1>", "<String: Skill 2>", "<String: Skill 3>"],
    "missingKeywords": ["<String: Critical missing industry skill 1>", "<String: Missing skill 2>", "<String: Missing skill 3>"],
    "missingRequiredKeywords": ["<String: Essential tool/framework missing for target role 1>", "<String: Essential tool 2>"],
    "keywordMatchScore": <Calculated Number 0-100>
  },
  "jobMatching": {
    "targetRole": "${targetJobRole || 'Software Engineer'}",
    "matchPercentage": <Number 0-100>,
    "matchingSkills": ["<Matched skill 1>", "<Matched skill 2>"],
    "missingSkills": ["<Missing required skill 1>", "<Missing required skill 2>"],
    "recommendation": "<Direct advice on how to align resume closer to job description requirements>"
  },
  "strengths": [
    "<High-value candidate strength 1>",
    "<High-value candidate strength 2>",
    "<High-value candidate strength 3>"
  ],
  "growthAreas": [
    "<Specific area for growth 1>",
    "<Specific area for growth 2>"
  ],
  "redFlags": [
    "<Flag 1>",
    "<Flag 2>"
  ]
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
  const maxRetries = 2;
  const retryDelayBase = 800;

  // CRITICAL FIX: Use ultra-fast validated gemini-flash-lite-latest (708ms) as primary
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
  const fallbackModels = ['gemini-flash-latest', 'gemini-3.6-flash'];
  const modelCandidates = [primaryModel, ...fallbackModels];



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
            console.error(`Groq API Error (${response.status}):`, err.substring(0, 150));
            // Immediate switch to next model on 404, 400, 429
            break;
          }

          const json = await response.json();
          rawResponseText = json.choices[0]?.message?.content || '';
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
              temperature: 0.1,
              maxOutputTokens: 8192,
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
            console.error(`Gemini API Error (${apiResponse.status}):`, errorText.substring(0, 120));

            // CRITICAL FIX: If Rate Limited (429), High Demand (503), or Not Found (404), switch to next model candidate immediately!
            if (apiResponse.status === 429 || apiResponse.status === 503 || apiResponse.status === 404) {
              console.warn(`[AI] Model ${model} returned status ${apiResponse.status}. Switching to next model immediately.`);
              break;
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

  // Extract JSON from text (handles both objects {} and arrays [])
  const firstCurly = t.indexOf('{');
  const firstSquare = t.indexOf('[');

  let first = -1;
  let last = -1;

  if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
    first = firstCurly;
    last = t.lastIndexOf('}');
  } else if (firstSquare !== -1) {
    first = firstSquare;
    last = t.lastIndexOf(']');
  }

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



// AI Cover Letter Generator service
async function generateCoverLetterText(resumeText, targetJobRole = 'Software Engineer', jobDescription = '', tone = 'professional', length = 'medium') {
  console.log(`Starting AI Cover Letter generation for: "${targetJobRole}" (Tone: ${tone}, Length: ${length})`);

  if (String(process.env.AI_MODE).toLowerCase() === 'mock' || String(process.env.AI_DISABLED) === '1') {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${targetJobRole} position at your company. With a solid background in software engineering, technical innovation, and delivering scalable customer-facing applications, I am confident in my ability to contribute meaningfully to your team.

Throughout my career, I have focused on designing robust systems, optimizing client rendering performance, and collaborating across multidisciplinary teams to ship reliable software. My technical skills align perfectly with the requirements of the ${targetJobRole} role, and I am excited about the opportunity to bring my experience to your organization.

Thank you for your time and consideration. I look forward to discussing how my skills and background meet your needs.

Sincerely,
[Your Name]`;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!apiKey && !groqKey) {
    console.warn('AI Key missing for cover letter generation, returning default response.');
    return getFallbackCoverLetter(targetJobRole);
  }

  const modelCandidates = [
    process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash-latest'
  ];
  if (groqKey) {
    modelCandidates.unshift('groq/llama-3.3-70b-versatile');
    modelCandidates.push('groq/llama-3.1-8b-instant');
  }

  // Establish instructions based on tone & length
  let toneInstruction = "professional, balanced, and direct";
  if (tone === 'creative') toneInstruction = "innovative, warm, and storytelling-focused";
  if (tone === 'bold') toneInstruction = "confident, high-impact, disruptive, and highly assertive";
  if (tone === 'modern') toneInstruction = "sleek, clean, contemporary, and highly polished";

  let lengthInstruction = "around 250 words, forming a standard 3-4 paragraph letter";
  if (length === 'short') lengthInstruction = "around 120-150 words, forming a highly concise 2-paragraph pitch";
  if (length === 'long') lengthInstruction = "around 400 words, forming a comprehensive 4-paragraph cover letter describing key details";

  const prompt = `You are a world-class professional resume and cover letter writer.
Generate a compelling, customized cover letter for a candidate applying to a target job role.

TARGET ROLE: ${targetJobRole}
TONE: ${toneInstruction}
LENGTH: ${lengthInstruction}
CANDIDATE RESUME HIGHLIGHTS (EXTRACTED TEXT):
"""
${resumeText.slice(0, 8000)}
"""

${jobDescription ? `TARGET JOB DESCRIPTION:\n"""\n${jobDescription.slice(0, 3000)}\n"""\n` : ''}

INSTRUCTIONS:
1. Craft a highly engaging, custom-tailored cover letter based on the provided resume highlights and target job description (if provided).
2. Align the tone strictly to: ${toneInstruction}.
3. Align the word count and structure to: ${lengthInstruction}.
4. Return ONLY the clean plaintext cover letter content.`;

  for (const model of modelCandidates) {
    try {
      if (model.startsWith('groq/')) {
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
            temperature: 0.5
          })
        });
        if (response.ok) {
          const json = await response.json();
          const text = json.choices[0]?.message?.content || '';
          if (text) return text.trim();
        }
      } else {
        const cleanModel = model.replace(/^models\//, '');
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
        const requestBody = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 1200 }
        };
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          timeout: 20000
        });
        if (res.ok) {
          const json = await res.json();
          const rawResponseText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (rawResponseText) return rawResponseText.trim();
        }
      }
    } catch (err) {
      console.warn(`Cover letter generation warning for model ${model}:`, err.message);
    }
  }

  return getFallbackCoverLetter(targetJobRole);
}

function getFallbackCoverLetter(targetJobRole) {
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${targetJobRole} position at your company. With a solid background in software engineering, technical innovation, and delivering scalable customer-facing applications, I am confident in my ability to contribute meaningfully to your team.

Throughout my career, I have focused on designing robust systems, optimizing application performance, and collaborating across multidisciplinary teams to ship reliable software. My technical skills align perfectly with the requirements of the ${targetJobRole} role, and I am excited about the opportunity to bring my experience to your organization.

Thank you for your time and consideration. I look forward to discussing how my skills and background meet your needs.

Sincerely,
[Your Name]`;
}

module.exports = {
  processWithAI,
  geminiHealth,
  listModels,
  generateCoverLetterText
};

