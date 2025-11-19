// services/aiService.js - PRECISE & TOKEN-EFFICIENT Campus Placement Resume Analysis
const fetch = require('node-fetch');

// ====== NEW PROMPT - 7 CORE FEATURES ONLY ======
function buildCampusPlacementPrompt(resumeText, targetJobRole) {
    return `You are a senior campus recruiter analyzing a fresher resume for EXACT resume issues.
CRITICAL: Return ONLY JSON. Be PRECISE - analyze ONLY what's in resume. Match format exactly.

Target Role: ${targetJobRole || 'Not specified'}
Resume:
${resumeText}

===RETURN THIS JSON ONLY===

{
  "atsScore": {
    "score": <0-100: layout & ATS compatibility assessment>,
    "level": "Poor|Fair|Good|Excellent",
    "explanation": "<2 sentences with EXACT issues found. Example: 'Tables detected - ATS cannot parse (−15). No margins (−5). Score: 80/100.' OR 'Clean format, single column, no ATS risks. Score: 95/100.'"
  },
  "mistakes": [
    {
      "type": "Spelling|Grammar|Formatting",
      "text": "<EXACT typo/error from resume. Example: 'Responsibilites→Responsibilities' OR 'Extra space before colon: Skills :' OR 'Inconsistent bullet point formatting'"
    }
  ],
  "redFlags": [
    "<CONCRETE issue observed. Example: 'No metrics in bullets - replaced 'Managed' with 'Managed X orders' to show impact' OR 'Job description reads as duties, not achievements - missing action verbs' OR 'Unexplained 6-month gap in timeline' OR 'Only 1-2 skills listed despite 2 year internship'"
  ],
  "recruiterInsights": {
    "overview": "<2-3 sentences, honest fresher assessment. Example: 'Decent fresher - has projects, 8.2 CGPA, shows learning. Main issue: vague bullet points, no numbers. Quick bullet rewrite = strong profile.' OR 'Weak fresher - 6.1 CGPA below cutoff, 1 small project, no internship. Better for tier-2 unless significant changes made.'",
    "keyStrengths": [
      "<SPECIFIC strength found. Example: 'Full-stack MERN + GitHub link + deployed - shows real capability beyond tutorials (most freshers lack this)' OR '8.5+ CGPA with relevant courses supports tier-1 targets' OR 'Internship with 2-year duration shows commitment'"
    ],
    "recommendations": [
      "<EXACT change needed. Example: 'Change bullet from 'Worked on login feature' to 'Implemented secure JWT-based login, reduced unauthorized access attempts by 90%' OR 'Add deployed links to projects OR 'Replace 'Assisted with UI' with 'Led UI redesign, improved page speed from 3.2s to 1.1s'"
    ]
  },
  "mistakes_by_category": {
    "spelling_grammar_count": <number>,
    "formatting_inconsistencies": <number>,
    "weak_verbs_count": <number>
  },
  "quickFixes": [
    "<Immediate action. Example: 'Fix Responsibilites typo on line 2' OR 'Add GPA: 8.5/10 to education' OR 'Remove unclear objectives section' OR 'Add date ranges MM/YY-MM/YY for all roles' OR 'Fix bullet formatting - inconsistent dashes'"
  ],
  "skillKeywordGaps": {
    "skills_present": [<extract exact skills mentioned>],
    "critical_missing": [
      "<SPECIFIC gap for target role. For 'Frontend Dev': 'Testing (Jest/Vitest) - critical but missing' OR 'API consumption (REST/GraphQL) - not mentioned' OR For 'Backend': 'Database design (schema, normalization) - no evidence' OR For 'Campus/Service': 'DSA (problem solving practice) - no mention OR GitHub portfolio - no link'"
    ]
  }
}

===ANALYSIS RULES===
1. PRECISE NOT GENERIC: If resume says 'Responsibilites', mention THAT typo, not 'spelling errors'.
2. EXACT ISSUES: 'Weak bullets' is bad. 'Changed Managed to Led + added metric' is good.
3. EXTRACT EXACTLY: Don't infer. If skills not mentioned, don't add.
4. TARGET-SPECIFIC GAPS:
   - Frontend: React hooks? Testing? Deployment links?
   - Backend: API design? Database normalization? Scalability?
   - Campus/Service: DSA practice? Problem solving? Communication?
5. CAMPUS CONTEXT: Freshers = learning expected. Judge on: Projects + Grades + Communication + DSA readiness.
6. HONEST NOT FLUFFY: "No communication skills shown" if no clubs/tutoring/leadership visible. NOT generic praise.
7. SPECIFIC STRENGTH: "Deployed 3 projects to Vercel (most freshers don't)" beats "Good projects".`;
}

// Utility: extract JSON block even if model wrapped it in prose/code fences
function extractJson(text) {
  if (!text) return null;
  let t = text.trim().replace(/^```json\s*|\s*```$/g, '');
  try { return JSON.parse(t); } catch (_) { /* try fallback */ }
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const slice = t.slice(first, last + 1);
    try { return JSON.parse(slice); } catch (_) { /* fall through */ }
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
  const retryDelayBase = 800;
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const fallbackModels = (process.env.GEMINI_MODEL_FALLBACKS || 'gemini-flash-latest,gemini-2.0-flash')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
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
      temperature: 0.1,
      maxOutputTokens: 1500,
      topP: 0.9,
      topK: 40,
      response_mime_type: 'application/json'
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
                console.error(`Gemini API Error (${apiResponse.status}):`, errorText);
                
                if (apiResponse.status === 503 || apiResponse.status === 429 || apiResponse.status === 500) {
          if (attempt < maxRetries) {
            const jitter = Math.floor(Math.random() * 500);
            const delay = retryDelayBase * Math.pow(2, attempt - 1) + jitter;
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    } else {
                        console.log('All retry attempts failed, using fallback...');
            const fb = generateCampusPlacementFallback(resumeText, targetJobRole);
            fb.warning = `Gemini error ${apiResponse.status}. Fallback used.`;
            fb.fallbackReason = `api_error_${apiResponse.status}`;
            return fb;
                    }
                } else {
                    console.error(`Non-retryable error (${apiResponse.status})`);
          const fb = generateCampusPlacementFallback(resumeText, targetJobRole);
          fb.warning = `Gemini error ${apiResponse.status}. Fallback used.`;
          fb.fallbackReason = `api_error_${apiResponse.status}`;
          return fb;
                }
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
