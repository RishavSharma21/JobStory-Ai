// services/aiService.js - Realistic resume analysis service
const fetch = require('node-fetch');

// Function to build the realistic analysis prompt
function buildRealisticPrompt(resumeText, targetJobRole) {
    return `
You are an experienced hiring manager and ATS expert. Analyze this resume with complete honesty and provide factual, realistic feedback. No false praise, no sugar-coating - just genuine professional assessment.

Target Job Role: ${targetJobRole}

Resume Text:
${resumeText}

Provide analysis in JSON format with realistic, fact-based insights:

{
  "personalInfo": {
    "name": "Extract full name",
    "email": "Extract email address", 
    "phone": "Extract phone number"
  },
  "summary": "Write a factual 2-3 sentence summary of their actual background and experience level",
  "skills": ["List only skills explicitly mentioned or clearly demonstrated in the resume"],
  "experience": [
    {
      "company": "Company name",
      "role": "Job title",
      "dates": "Employment period",
      "description": "Factual summary of responsibilities and achievements mentioned"
    }
  ],
  "education": [
    {
      "institution": "School/College name", 
      "degree": "Degree or program",
      "dates": "Time period",
      "description": "Relevant details mentioned in resume"
    }
  ],
  "atsScore": {
    "score": 0-100,
    "level": "Poor/Fair/Good/Excellent",
    "explanation": "1-2 lines explaining the score based on keyword density, formatting, quantified achievements, and industry relevance. Be factual about what's missing or present."
  },
  "recruiterInsights": {
    "overview": "Write what a recruiter would actually think seeing this resume for the first time. Be honest about experience level, career stage, and initial impression. Example: 'This candidate appears to be early in their career with 2 years of backend development experience. Resume shows consistent employment and relevant technical skills, though lacks senior-level achievements or leadership experience. Would likely be considered for junior to mid-level positions.'",
    "keyStrengths": [
      "Based on resume evidence, identify 2-3 genuine strengths with specific examples. Format like: 'Demonstrates consistent technical growth - progressed from junior developer to handling API development and database management within 2 years'",
      "Focus on what they can actually prove, not what sounds good"
    ],
    "concerningAreas": [
      "Honest assessment of gaps or weak areas. Example: 'Limited quantifiable achievements - most responsibilities listed without measurable impact or results'",
      "No leadership or mentoring experience mentioned for mid-level role aspirations",
      "Be direct but professional about actual gaps"
    ],
    "recommendations": [
      "Specific, actionable advice based on what's actually missing. Example: 'Add specific metrics to achievements (e.g., improved performance by X%, reduced load time by X seconds)'",
      "Include any team collaboration or code review experience if applicable to target role"
    ]
  },
  "jobMatching": {
    "targetRole": "${targetJobRole}",
    "matchPercentage": 0-100,
    "matchingSkills": ["Skills that genuinely align with target role based on resume"],
    "missingSkills": ["Critical skills for target role not evidenced in resume"],
    "recommendations": "Honest assessment of readiness for target role. Example: 'Currently suitable for junior-level positions in this field. To reach mid-level roles, need to demonstrate: leadership experience, system design skills, and quantifiable business impact. Realistic timeline: 1-2 years with focused skill development.'"
  },
  "keywordAnalysis": {
    "presentKeywords": ["Industry keywords actually found in resume"],
    "missingKeywords": ["Important keywords for ATS optimization in target role"],
    "keywordDensity": 0-100
  },
  "interviewPreparation": {
    "strengthsToEmphasize": [
      "Tell them how to present their actual strengths in interviews. Example: 'When discussing your API development experience, structure it as: Situation - I worked on a team building REST APIs for e-commerce. Task - I was responsible for user authentication endpoints. Action - I implemented JWT tokens and integrated with existing database. Result - Successfully deployed secure authentication used by 1000+ users daily.'"
    ],
    "storyFormats": [
      "Provide STAR method templates for their actual experiences",
      "Show how to quantify their real achievements for interview answers"
    ],
    "potentialQuestions": [
      "Based on their experience level, what questions they should prepare for",
      "How to address gaps or limited experience honestly"
    ]
  },
  "overallAssessment": "Provide a realistic 4-5 sentence assessment. Start with their current market position, actual strengths based on resume evidence, honest evaluation of competitiveness for target role, and realistic next steps. Example: 'This candidate shows solid foundational skills for early-career backend development roles. Their consistent employment and technical progression indicate reliability and learning ability. However, for competitive mid-level positions, they need stronger evidence of business impact and system ownership. Current resume positions them well for junior roles at growing companies or entry-level positions at larger organizations. Focus on quantifying achievements and gaining broader technical exposure over the next 12-18 months.'"
}

CRITICAL INSTRUCTIONS:
- Base ALL feedback on actual resume content only
- No motivational fluff or false encouragement
- Be honest about experience level and market competitiveness
- Provide realistic timelines and expectations
- Focus on what employers actually look for
- Give actionable interview advice based on their real background
- Use candidate's actual name when available
- If information is missing from resume, clearly state it's not provided
- Respond ONLY with valid JSON, no extra text`;
}

// Main AI processing function
async function processWithAI(resumeDocument, targetJobRole = 'Not specified') {
    console.log(`Starting realistic AI processing for: ${resumeDocument.fileName}`);
    const startTime = Date.now();

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables. Please add it to your .env file.');
    }

    // Get resume text (support both old and new extractor formats)
    const resumeText = resumeDocument.cleanedText || resumeDocument.extractedText;
    if (!resumeText || resumeText.trim().length === 0) {
        throw new Error('No text found in the resume document.');
    }

    try {
        console.log('Sending realistic analysis prompt to Gemini API...');

        // Build the prompt with actual values
        const prompt = buildRealisticPrompt(resumeText, targetJobRole);

        const model = "gemini-1.5-flash-latest";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.1, // Lower temperature for more factual responses
                maxOutputTokens: 4000,
                topP: 0.9,
                topK: 40
            }
        };

        const apiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error(`Gemini API Error (${apiResponse.status}):`, errorText);
            throw new Error(`Gemini API error (${apiResponse.status}): ${errorText}`);
        }

        const json = await apiResponse.json();
        const rawResponseText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawResponseText) {
            console.error("Full API Response:", JSON.stringify(json, null, 2));
            throw new Error("Failed to extract text from Gemini API response. Response structure may have changed.");
        }

        // Clean and parse response
        let jsonString = rawResponseText.trim();
        jsonString = jsonString.replace(/^```json\s*|\s*```$/g, '');

        let aiAnalysisData;
        try {
            aiAnalysisData = JSON.parse(jsonString);
            console.log("Successfully parsed realistic AI response.");
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:");
            console.error("Raw response:", rawResponseText);
            throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
        }

        // Add metadata
        const processingTime = Date.now() - startTime;
        aiAnalysisData.processingTime = processingTime;
        aiAnalysisData.aiModel = model;
        aiAnalysisData.processedAt = new Date().toISOString();

        console.log(`Realistic AI processing completed successfully in ${processingTime}ms`);
        return aiAnalysisData;

    } catch (error) {
        console.error('Error during realistic AI processing:', error);
        throw new Error(`AI processing failed: ${error.message}`);
    }
}

module.exports = {
    processWithAI
};