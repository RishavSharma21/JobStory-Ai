// services/aiService.js - PRECISE & TOKEN-EFFICIENT Campus Placement Resume Analysis
const fetch = require('node-fetch');

// ====== OPTIMIZED PROMPT - CONCISE OUTPUT ======
function buildCampusPlacementPrompt(resumeText, targetJobRole) {
    return `You are a CONCISE ATS analyzer. Analyze this resume for ${targetJobRole || 'Software Developer'} role.

⚠️ CRITICAL RULES - KEEP IT SHORT:
- Use 1-2 SHORT sentences max for explanations
- NO long paragraphs - bullet points only
- Be DIRECT and SPECIFIC
- Only include REAL issues you can see

Return ONLY valid JSON:

{
  "atsScore": {
    "score": <NUMBER 0-100>,
    "level": "Poor|Fair|Good|Excellent",
    "explanation": "<ONE short sentence - max 15 words>"
  },
  "grammarSpelling": [
    "<Format: 'Section: error → fix'. Example: 'Education: Excepted → Expected'. Empty [] if clean. MAX 3 items>"
  ],
  "atsImprovement": {
    "missingKeywords": [
      "<Top 3-5 MISSING tech skills. Just keywords, no explanations. Example: 'Docker', 'Kubernetes', 'CI/CD'. Empty [] if good>"
    ],
    "quickFixes": [
      "<Top 3-5 SHORT fixes. Format: 'Location: before → after'. Keep 'after' under 20 words. Example: 'Bullet 2: Built app → Built e-commerce app handling 10K users with 99% uptime'>"
    ],
    "formatWarnings": [
      "<ONLY critical format issues. One sentence each. MAX 2 items. Empty [] if clean>"
    ],
    "estimatedImprovement": {
      "currentScore": <same as atsScore>,
      "potentialScore": <currentScore + realistic boost>,
      "impact": "Low|Medium|High"
    }
  },
  "quickFixes": [
    "<Top 3-5 SHORT action items. MAX 10 words each. Example: '1. Education: Fix Excepted → Expected', '2. Add Docker, Kubernetes to skills', '3. Bullet 3: Add metrics (reduced time 40%)'>"
  ],
  "skillKeywordGaps": {
    "skills_present": [<List found skills - just names, no descriptions. Example: "React", "Node.js", "Python">],
    "critical_missing": [<Top 2-3 MISSING critical skills with ONE word reason. Example: "Docker (required)", "Testing (standard)". Empty [] if 8+ skills present>]
  }
}

🎯 KEEP IT CONCISE:
- Each suggestion: 5-20 words MAX
- No lengthy explanations
- Direct, actionable advice only
- Remove fluff and filler words

Resume Text:
${resumeText}`;
}


// Utility: extract JSON block even if model wrapped it in prose/code fences
function extractJson(text) {
  if (!text) return null;
  
  // Strip common code fences and markdown formatting
  let t = text.trim()
    .replace(/^```json\s*|\s*```$/g, '')
    .replace(/^```\s*|\s*```$/g, '')
    .trim();
  
  // Try direct parse first
  try { return JSON.parse(t); } catch (_) { /* try fallback */ }
  
  // Extract JSON from surrounding text
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    let slice = t.slice(first, last + 1);
    
    // Fix common JSON issues
    slice = slice
      .replace(/,\s*(\}|\])/g, '$1')  // Remove trailing commas
      .replace(/\n/g, ' ')             // Remove newlines that break parsing
      .replace(/\s+/g, ' ');           // Normalize whitespace
    
    try { return JSON.parse(slice); } catch (e) { 
      console.error('JSON parse error after cleanup:', e.message);
    }
  }
  
  return null;
}

// Main AI processing function with retry logic and model fallbacks
async function processWithAI(resumeDocument, targetJobRole = 'Not specified') {
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
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Returning fallback campus placement analysis.');
    const resumeText = resumeDocument.cleanedText || resumeDocument.extractedText;
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error('No text found in the resume document.');
    }
    const fallback = generateCampusPlacementFallback(resumeText, targetJobRole);
    fallback.warning = 'AI key missing: using fallback analysis. Set GEMINI_API_KEY in backend/.env to enable real AI.';
    fallback.fallbackReason = 'missing_api_key';
    return fallback;
  }

    // Get resume text (support both old and new extractor formats)
    const resumeText = resumeDocument.cleanedText || resumeDocument.extractedText;
    if (!resumeText || resumeText.trim().length === 0) {
        throw new Error('No text found in the resume document.');
    }

  // Retry logic & model fallbacks
  const maxRetries = 5;
  const retryDelayBase = 2000;  // Start with 2 seconds
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const fallbackModels = (process.env.GEMINI_MODEL_FALLBACKS || 'gemini-2.5-pro-preview-03-25,gemini-2.5-flash-preview-05-20')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const modelCandidates = [primaryModel, ...fallbackModels];

  // Reduce payload risk: trim very long resumes (server-side safeguard)
  const MAX_CHARS = 12000;
  const safeText = resumeText.length > MAX_CHARS ? resumeText.slice(0, MAX_CHARS) + '\n...[truncated]' : resumeText;

  for (const model of modelCandidates) {
    console.log(`[AI] Trying model: ${model}`);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
      console.log(`Attempt ${attempt}/${maxRetries}: Sending campus placement analysis prompt to Gemini API...`);

            // Build the campus placement prompt with actual values
      const prompt = buildCampusPlacementPrompt(safeText, targetJobRole);
      console.log(`[AI] Using Gemini model: ${model}`);
      
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
      maxOutputTokens: 2048,
      topP: 0.95,
      topK: 40,
      responseMimeType: 'application/json'
                },
                safetySettings: [
                  {category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE'},
                  {category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE'},
                  {category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE'},
                  {category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE'}
                ]
            };

      const apiResponse = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                timeout: 20000 // 20 second timeout for faster response
            });

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error(`Gemini API Error (${apiResponse.status}):`, errorText.substring(0, 100));
                
                // Check if it's a temporary error that we should retry
                if (apiResponse.status === 503 || apiResponse.status === 429 || apiResponse.status === 500) {
                    console.error(`Retryable error (${apiResponse.status}) - Attempt ${attempt}/${maxRetries}`);
                    
          if (attempt < maxRetries) {
            // For 429 (rate limit), use larger exponential backoff
            const baseDelay = apiResponse.status === 429 ? 3000 : retryDelayBase;
            const jitter = Math.floor(Math.random() * 2000);
            const delay = baseDelay * Math.pow(2, attempt - 1) + jitter;
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
                        continue; // Try again
                    } else {
                        // Last attempt failed, return fallback data
                        console.log('All retry attempts exhausted, returning fallback analysis...');
            const fb = generateCampusPlacementFallback(resumeText, targetJobRole);
            fb.warning = `Gemini API error ${apiResponse.status}. All retries exhausted.`;
            fb.fallbackReason = `api_error_${apiResponse.status}_exhausted`;
            return fb;
                    }
                } else {
                    // Non-retryable error
                    console.error(`Non-retryable Gemini API error (${apiResponse.status})`);
          const fb = generateCampusPlacementFallback(resumeText, targetJobRole);
          fb.warning = `Non-retryable Gemini API error ${apiResponse.status}. Using fallback.`;
          fb.fallbackReason = `api_error_${apiResponse.status}`;
          return fb;
                }
            }

            const json = await apiResponse.json();
            
            // Try multiple extraction paths
            let rawResponseText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
            
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

    return {
        atsScore: {
            score: hasProjects && foundSkills.length > 0 ? 60 : 35,
            level: hasProjects && foundSkills.length > 0 ? "Fair" : "Poor",
            explanation: `Basic scan: ${hasProjects ? 'Projects visible' : 'Need projects'}. ${foundSkills.length} skills found. AI offline - enable for full analysis.`
        },
        grammarSpelling: ["AI offline - manual review needed"],
        recruiterInsights: {
            overview: `Basic scan only (AI offline): ${foundSkills.length > 0 ? 'Some skills present' : 'Skills unclear'}. ${hasProjects ? 'Has projects' : 'Need projects'}. Enable AI for brutal honest feedback.`,
            keyStrengths: foundSkills.length > 0 ? [`Found: ${foundSkills.join(', ')}`] : ["Need AI analysis"],
            recommendations: ["Enable AI for detailed feedback", "Add clear contact info", "Add metrics to projects"]
        },
        quickFixes: [
            "AI offline - can't detect specific issues",
            "Check spelling manually",
            "Add project metrics"
        ],
        skillKeywordGaps: {
            skills_present: foundSkills,
            critical_missing: ["AI needed for gap analysis"]
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

module.exports = {
  processWithAI,
  geminiHealth,
  listModels
};