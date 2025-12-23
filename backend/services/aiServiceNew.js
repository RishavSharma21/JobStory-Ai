// services/aiService.js - PRECISE & TOKEN-EFFICIENT Campus Placement Resume Analysis
const fetch = require('node-fetch');

// ====== SIMPLIFIED PROMPT - LESS TEXT, MORE RELIABLE ======
function buildCampusPlacementPrompt(resumeText, targetJobRole) {
    return `Analyze this resume for a ${targetJobRole || 'general'} role. Return ONLY valid JSON. Keep explanations concise (max 15 words).

Resume:
${resumeText}

Required JSON Structure:
{
  "atsScore": {"score": 0-100, "level": "Poor/Fair/Good/Excellent", "explanation": "brief reason"},
  "readabilityScore": {"score": 0-100, "level": "Hard/Moderate/Easy", "explanation": "brief reason"},
  "formatScore": {"score": 0-100, "level": "Poor/Weak/Average/Good", "explanation": "brief reason"},
  "mistakes": [{"type": "Spelling/Grammar", "text": "error found"}],
  "redFlags": ["issue 1", "issue 2"],
  "recruiterInsights": {
    "overview": "1 sentence summary",
    "keyStrengths": ["strength 1", "strength 2"],
    "recommendations": ["fix 1", "fix 2"]
  },
  "mistakes_by_category": {"spelling_grammar_count": 0, "formatting_inconsistencies": 0, "weak_verbs_count": 0},
  "quickFixes": ["fix 1", "fix 2"],
  "skillKeywordGaps": {"skills_present": ["skill1"], "critical_missing": ["gap1"]}
}`;
}

// Utility: extract JSON block even if model wrapped it in prose/code fences
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
    
    // Try parsing the slice
    try { return JSON.parse(slice); } catch (err) {
      console.log(`JSON parse error after cleanup: ${err.message}`);
      
      // Attempt to repair truncated JSON
      // This is a simple heuristic repair
      try {
        // If it looks like it was cut off, try to close it
        // This is very basic and might not work for complex nested structures
        // but it helps with simple truncations
        const repaired = slice + '"}'; // Try closing a string and the object
        return JSON.parse(repaired);
      } catch (e) {
         try {
            const repaired2 = slice + '}'; // Try just closing the object
            return JSON.parse(repaired2);
         } catch (e2) {
             // Give up
         }
      }
    }
  }
  return null;
}

// Main AI processing function with retry logic and model fallbacks
async function processWithAI(resumeDocument, targetJobRole = 'Not specified') {
    console.log(`Starting campus placement AI analysis for: ${resumeDocument.fileName}`);
    const startTime = Date.now();

  if (String(process.env.AI_MODE).toLowerCase() === 'mock' || String(process.env.AI_DISABLED) === '1') {
    const resumeText = resumeDocument.cleanedText || resumeDocument.extractedText || '';
    const mock = generateCampusPlacementFallback(resumeText, targetJobRole);
    mock.warning = 'AI_MODE=mock: mock analysis only.';
    mock.fallbackReason = 'mock_mode';
    mock.isServerUnavailable = false;
    mock.aiModel = 'mock-generator';
    return mock;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. Using fallback.');
    const resumeText = resumeDocument.cleanedText || resumeDocument.extractedText;
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error('No text found in resume.');
    }
    const fallback = generateCampusPlacementFallback(resumeText, targetJobRole);
    fallback.warning = 'AI key missing: fallback analysis only.';
    fallback.fallbackReason = 'missing_api_key';
    return fallback;
  }

    const resumeText = resumeDocument.cleanedText || resumeDocument.extractedText;
    if (!resumeText || resumeText.trim().length === 0) {
        throw new Error('No text found in resume.');
    }

  const maxRetries = 3;
  const retryDelayBase = 1000;
  // Prioritize stable 1.5-flash to avoid 429s and truncation
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const fallbackModels = ['gemini-2.5-flash', 'gemini-1.5-pro'];
  const modelCandidates = [primaryModel, ...fallbackModels];

  const MAX_CHARS = 18000;
  const safeText = resumeText.length > MAX_CHARS ? resumeText.slice(0, MAX_CHARS) + '\n...[truncated]' : resumeText;

  for (const model of modelCandidates) {
    console.log(`[AI] Trying model: ${model}`);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
      console.log(`Attempt ${attempt}/${maxRetries}: Sending to Gemini...`);

            const prompt = buildCampusPlacementPrompt(safeText, targetJobRole);
      console.log(`[AI] Using model: ${model}`);
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 4000,
                    topP: 0.95,
                    topK: 40,
                    responseMimeType: "application/json"
                }
            };

      const apiResponse = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                timeout: 30000
            });

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error(`Gemini API Error (${apiResponse.status}) for ${model}:`, errorText);
                
                // CRITICAL FIX: If Rate Limited (429), DO NOT RETRY this model. Switch to next model immediately.
                if (apiResponse.status === 429) {
                    console.warn(`[AI] Quota exceeded for ${model}. Switching to next model immediately.`);
                    break; // Break inner retry loop, move to next model
                }

                if (apiResponse.status === 503 || apiResponse.status === 500) {
                    if (attempt < maxRetries) {
                        const delay = retryDelayBase * attempt;
                        console.log(`Server error, retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }
                
                // For other errors or exhausted retries, break to next model
                break; 
            }

            const json = await apiResponse.json();
            const rawResponseText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!rawResponseText) {
                console.error("API Response:", JSON.stringify(json, null, 2));
                throw new Error("Failed to extract text from API response.");
            }

            const aiAnalysisData = extractJson(rawResponseText);
            if (!aiAnalysisData) {
              console.error('Failed to parse AI response as JSON.');
              if (attempt < maxRetries) {
                const jitter = Math.floor(Math.random() * 500);
                const delay = retryDelayBase * Math.pow(2, attempt - 1) + jitter;
                console.log(`Parse error, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              } else {
                break;
              }
            }

            const processingTime = Date.now() - startTime;
            aiAnalysisData.processingTime = processingTime;
            aiAnalysisData.aiModel = model;
            aiAnalysisData.processedAt = new Date().toISOString();

            console.log(`Analysis completed in ${processingTime}ms`);
            return aiAnalysisData;

        } catch (error) {
            console.error(`Error attempt ${attempt}:`, error.message);
            
      if (attempt < maxRetries) {
        const jitter = Math.floor(Math.random() * 500);
        const delay = retryDelayBase * Math.pow(2, attempt - 1) + jitter;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              console.log(`[AI] Attempts exhausted for model ${model}`);
              break;
            }
        }
      }
    }

    console.log('All models failed, using fallback...');
    const fb = generateCampusPlacementFallback(safeText, targetJobRole);
    fb.warning = 'All models failed. Fallback used.';
    fb.fallbackReason = 'all_models_failed';
    return fb;
}

// Fallback analysis for when AI is unavailable
function generateCampusPlacementFallback(resumeText, targetJobRole) {
    console.log('Generating fallback analysis...');
    
    const textLength = resumeText.length;
    const wordCount = resumeText.split(/\s+/).length;
    const hasContactInfo = /email|phone|@/.test(resumeText.toLowerCase());
    const hasProjects = /project|built|developed|created|designed/.test(resumeText.toLowerCase());
    const hasCGPA = /cgpa|gpa|percentage|marks/.test(resumeText.toLowerCase());
    
    const campusSkills = ['java', 'python', 'javascript', 'react', 'html', 'css', 'sql', 'mysql', 'mongodb', 'node', 'express', 'spring', 'android', 'flutter'];
    const foundSkills = campusSkills.filter(skill => resumeText.toLowerCase().includes(skill));

    return {
        atsScore: {
            score: hasProjects && foundSkills.length > 0 ? 60 : 35,
            level: hasProjects && foundSkills.length > 0 ? "Fair" : "Poor",
            explanation: `Quick scan: ${hasProjects ? 'Projects visible' : 'Need more projects'}. ${foundSkills.length} skills found. Full AI needed for precise analysis.`
        },
        mistakes: [],
        redFlags: [
            "Full analysis needed to identify specific resume issues"
        ],
        recruiterInsights: {
            overview: `Basic scan only (AI offline): ${foundSkills.length > 0 ? 'Some skills present' : 'Technical skills unclear'}. ${hasProjects ? 'Projects show initiative' : 'Need more projects'}. Waiting for full AI analysis.`,
            keyStrengths: foundSkills.length > 0 ? [`Found: ${foundSkills.join(', ')}`] : ["Unclear - need full analysis"],
            recommendations: ["Enable AI for detailed feedback", "Ensure clear contact info", "Highlight best projects"]
        },
        mistakes_by_category: {
            spelling_grammar_count: 0,
            formatting_inconsistencies: 0,
            weak_verbs_count: 0
        },
        quickFixes: [
            "System offline - full analysis unavailable",
            "Check spelling and formatting manually",
            "Add clear project descriptions"
        ],
        skillKeywordGaps: {
            skills_present: foundSkills,
            critical_missing: ["Full AI needed for gap analysis"]
        },
        processingTime: 100,
        aiModel: "fallback",
        processedAt: new Date().toISOString(),
        isServerUnavailable: true
    };
}

// Health check
async function geminiHealth() {
  if (String(process.env.AI_MODE).toLowerCase() === 'mock' || String(process.env.AI_DISABLED) === '1') {
    return { ok: true, mocked: true };
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, reason: 'missing_api_key' };
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: 'ping' }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8 }
    };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  processWithAI,
  geminiHealth
};
