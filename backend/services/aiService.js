// services/aiService.js - Campus placement resume analysis service
const fetch = require('node-fetch');

// Function to build the campus placement analysis prompt
function buildCampusPlacementPrompt(resumeText, targetJobRole) {
    return `
You are an experienced campus placement coordinator and recruiter who has been placing IT students for years. You've worked with companies like TCS, Infosys, Wipro, Accenture, and know exactly what they look for in fresh graduates.

You understand the unique challenges of evaluating fresher resumes - limited professional experience, academic projects as main showcase, and the need to assess potential over proven track record.

Be honest but encouraging. Talk like you're mentoring a student you actually care about. Give practical, actionable advice that will help them succeed in campus placements.

Target Job Role: ${targetJobRole}

Resume Text:
${resumeText}

Analyze this fresher resume for campus placement readiness. Give your honest assessment in JSON format:

{
  "personalInfo": {
    "name": "Extract full name",
    "email": "Extract email address", 
    "phone": "Extract phone number"
  },
  "summary": "First impression for campus placement context. Example: 'This is a final year student with decent academic background. Projects show good technical foundation, especially in web development. CGPA is solid. Would definitely consider for technical interviews - has the basics to build upon.'",
  "skills": ["List only skills explicitly mentioned or clearly demonstrated through projects"],
  "academics": [
    {
      "institution": "College/University name",
      "degree": "Degree program",
      "cgpa": "CGPA/Percentage if mentioned",
      "year": "Current year or graduation year",
      "relevantCoursework": "CS fundamentals that matter for placements"
    }
  ],
  "projects": [
    {
      "title": "Project name",
      "technologies": "Tech stack used",
      "description": "What they built and how complex it was",
      "placementValue": "Why this project matters for campus placements"
    }
  ],
  "internships": [
    {
      "company": "Company name if any",
      "role": "Intern role",
      "duration": "Time period",
      "impact": "What real value they added during internship"
    }
  ],
  "campusReadinessScore": {
    "score": 0-100,
    "level": "Needs Work/Ready/Strong Candidate/Top Tier",
    "explanation": "Honest assessment of their campus placement readiness. Example: 'Score: 78/100. Strong technical foundation with good projects. Academic performance is solid. Main gap is lack of system design thinking and no open source contributions. But definitely ready for most campus drives.'"
  },
  "recruiterInsights": {
    "overview": "Real assessment for campus context. Example: 'This student has put in effort - multiple projects, decent grades, shows consistency. Not exceptional but definitely hireable. Would fit well in a graduate trainee program where they can learn on the job.'",
    "technicalStrengths": [
      "What technical skills actually stand out? Example: 'Good grasp of full-stack development - both frontend and backend projects show depth, not just tutorials.'",
      "Highlight genuine technical competence"
    ],
    "academicHighlights": [
      "Academic achievements that matter for placements",
      "CGPA, relevant coursework, academic projects"
    ],
    "areasForImprovement": [
      "What gaps might hurt them in campus placements? Example: 'No Data Structures & Algorithms practice visible. For companies like TCS and Infosys, they'll need to show coding problem-solving skills.'",
      "Focus on placement-relevant gaps"
    ],
    "placementAdvice": [
      "Specific advice for campus drives. Example: 'Before placement season, build one more project with a database and deployment. Practice basic DSA problems. Learn to explain your projects clearly in 2 minutes.'",
      "Actionable steps for placement preparation"
    ]
  },
  "companyMatching": {
    "targetRole": "${targetJobRole}",
    "suitability": 0-100,
    "bestFitCompanies": ["Companies where they'd likely succeed"],
    "companiesNeedingPrep": ["Companies requiring additional preparation"],
    "recommendations": "Honest assessment of company fit. Example: 'Strong match for service companies like TCS, Infosys - they value academic performance and willingness to learn. For product companies, need to strengthen DSA and system design fundamentals.'"
  },
  "technicalReadiness": {
    "codingSkills": "Assessment of programming ability based on projects",
    "frameworkKnowledge": "Understanding of frameworks and libraries",
    "databaseConcepts": "Database design and usage skills",
    "deploymentExperience": "Real-world deployment and hosting experience",
    "gapsToAddress": ["Critical technical gaps before placement season"]
  },
  "interviewPreparation": {
    "technicalStories": [
      "How to present their projects compellingly. Example: 'When they ask about your e-commerce project, don't just list features. Say: I built this to solve real inventory management for my friend's shop. Learned how database normalization prevents data inconsistency the hard way when I had to fix duplicate orders.'"
    ],
    "hrQuestionPrep": [
      "Campus-specific HR questions they should prepare for",
      "Why this company? Why software development? Career goals?"
    ],
    "commonChallenges": [
      "What typically trips up students in placement interviews",
      "How to handle questions about limited experience"
    ]
  },
  "marketPosition": {
    "currentStanding": "Where they rank among campus placement candidates",
    "competitiveAdvantage": "What makes them stand out from other students",
    "salaryExpectations": "Realistic salary range for campus placements",
    "careerTrajectory": "Expected career growth path from this starting point"
  },
  "placementStrategy": {
    "priorityCompanies": "Which companies to target first based on their profile",
    "preparationTimeline": "What to focus on in remaining time before placements",
    "skillDevelopment": "Skills to develop for better placement prospects",
    "portfolioGaps": "What's missing from their showcase portfolio"
  },
  "finalAssessment": "Honest but encouraging conclusion. Example: 'You're in a good position for campus placements. Your projects show you can code and solve problems, your academics are solid, and you seem genuinely interested in technology. Focus on DSA practice and be ready to tell compelling stories about your projects. Most companies will see your potential and want to train you. You've got this!'"
}

WRITE FOR CAMPUS PLACEMENT CONTEXT:
- Focus on potential over experience
- Understand they're students, not industry veterans
- Give practical advice for the next 2-3 months
- Consider academic projects as valuable experience
- Address common fresher anxieties and concerns
- Be encouraging but realistic about skill gaps
- Think about what campus recruiters actually look for
- Remember they're competing with other students, not industry professionals
- Respond ONLY with valid JSON, no extra text`;
}

// Main AI processing function with retry logic
async function processWithAI(resumeDocument, targetJobRole = 'Not specified') {
    console.log(`Starting campus placement AI analysis for: ${resumeDocument.fileName}`);
    const startTime = Date.now();

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

    // Retry logic for API calls
  const maxRetries = 4; // More retries to ride out transient rate limits
  const retryDelayBase = 1000; // Base delay in ms for exponential backoff

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries}: Sending campus placement analysis prompt to Gemini API...`);

            // Build the campus placement prompt with actual values
            const prompt = buildCampusPlacementPrompt(resumeText, targetJobRole);

            const model = "gemini-1.5-flash-latest";
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
          temperature: 0.3, // Slightly higher for more natural language
          maxOutputTokens: 1200, // Lower to reduce quota usage and 429s
                    topP: 0.9,
                    topK: 40
                }
            };

      const apiResponse = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                timeout: 30000 // 30 second timeout for complex analysis
            });

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error(`Gemini API Error (${apiResponse.status}):`, errorText);
                
                // Check if it's a temporary error that we should retry
                if (apiResponse.status === 503 || apiResponse.status === 429 || apiResponse.status === 500) {
                    console.error(`Gemini API Error (${apiResponse.status}) - Attempt ${attempt}:`, errorText);
                    
          if (attempt < maxRetries) {
            const jitter = Math.floor(Math.random() * 500);
            const delay = retryDelayBase * Math.pow(2, attempt - 1) + jitter;
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
                        continue; // Try again
                    } else {
                        // Last attempt failed, return fallback data
                        console.log('All retry attempts failed, returning fallback analysis...');
            const fb = generateCampusPlacementFallback(resumeText, targetJobRole);
            fb.warning = `Gemini API error ${apiResponse.status}. Using fallback.`;
            fb.fallbackReason = `api_error_${apiResponse.status}`;
            return fb;
                    }
                } else {
                    // Non-retryable error
                    console.error(`Non-retryable Gemini API error (${apiResponse.status}): ${errorText}`);
          const fb = generateCampusPlacementFallback(resumeText, targetJobRole);
          fb.warning = `Non-retryable Gemini API error ${apiResponse.status}. Using fallback.`;
          fb.fallbackReason = `api_error_${apiResponse.status}`;
          return fb;
                }
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
                console.log("Successfully parsed campus placement AI response.");
            } catch (parseError) {
                console.error("Failed to parse AI response as JSON:");
                console.error("Raw response:", rawResponseText);
                
        if (attempt < maxRetries) {
          const jitter = Math.floor(Math.random() * 500);
          const delay = retryDelayBase * Math.pow(2, attempt - 1) + jitter;
          console.log(`Parse error on attempt ${attempt}, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                } else {
                    console.log('Parse failed on all attempts, returning fallback analysis...');
          const fb = generateCampusPlacementFallback(resumeText, targetJobRole);
          fb.warning = 'AI response parse failure. Using fallback.';
          fb.fallbackReason = 'parse_error';
          return fb;
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
        const jitter = Math.floor(Math.random() * 500);
        const delay = retryDelayBase * Math.pow(2, attempt - 1) + jitter;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.log('All attempts failed, returning fallback analysis...');
        const fb = generateCampusPlacementFallback(resumeText, targetJobRole);
        fb.warning = `Unhandled error: ${error.message}. Using fallback.`;
        fb.fallbackReason = 'unhandled_error';
        return fb;
            }
        }
    }
}

// Fallback analysis function for campus placement when AI is unavailable
function generateCampusPlacementFallback(resumeText, targetJobRole) {
    console.log('Generating campus placement fallback analysis due to AI service unavailability...');
    
    // Basic text analysis for campus context
    const textLength = resumeText.length;
    const wordCount = resumeText.split(/\s+/).length;
    const hasContactInfo = /email|phone|@/.test(resumeText.toLowerCase());
    const hasProjects = /project|built|developed|created|designed/.test(resumeText.toLowerCase());
    const hasCGPA = /cgpa|gpa|percentage|marks/.test(resumeText.toLowerCase());
    
    // Campus placement relevant skills
    const campusSkills = ['java', 'python', 'javascript', 'react', 'html', 'css', 'sql', 'mysql', 'mongodb', 'node', 'express', 'spring', 'android', 'flutter'];
    const foundSkills = campusSkills.filter(skill => 
        resumeText.toLowerCase().includes(skill)
    );

    const fallbackAnalysis = {
        personalInfo: {
            name: hasContactInfo ? "Contact info found" : "Missing contact details",
            email: hasContactInfo ? "Email present" : "Add email address",
            phone: hasContactInfo ? "Phone present" : "Add phone number"
        },
        summary: `Quick scan while our AI is down: You've got a ${wordCount}-word resume that ${hasProjects ? 'shows some project work' : 'needs more project details'}. ${hasCGPA ? 'Academic info is there' : 'Academic performance details would help'}. Can't give proper campus placement analysis until our system is back.`,
        skills: foundSkills.length > 0 ? foundSkills : ["Can't properly scan technical skills - system down"],
        academics: [],
        projects: [],
        internships: [],
        campusReadinessScore: {
            score: hasProjects && foundSkills.length > 0 ? 60 : 35,
            level: hasProjects && foundSkills.length > 0 ? "Ready for Assessment" : "Needs Enhancement",
            explanation: `Basic scan: ${hasProjects ? 'Projects visible' : 'Need more projects'}, ${foundSkills.length} technical skills found. For proper campus readiness score, need full AI analysis.`
        },
        recruiterInsights: {
            overview: `Quick campus placement perspective while AI is offline: ${foundSkills.length > 0 ? 'Some relevant technical skills visible' : 'Technical skills need to be highlighted better'}. ${hasProjects ? 'Project experience shows initiative' : 'More hands-on projects needed'}. This is just a surface scan though.`,
            technicalStrengths: foundSkills.length > 0 ? [`Found these skills: ${foundSkills.join(', ')}`] : ["Need full system for technical assessment"],
            academicHighlights: hasCGPA ? ["Academic performance mentioned"] : ["Add academic achievements"],
            areasForImprovement: ["System down - can't identify specific gaps"],
            placementAdvice: ["Wait for full AI analysis", "Ensure contact info is clear", "Highlight your best projects"]
        },
        companyMatching: {
            targetRole: targetJobRole,
            suitability: foundSkills.length > 0 ? 50 : 25,
            bestFitCompanies: foundSkills.length > 2 ? ["Service companies might be interested"] : ["Need skills assessment first"],
            companiesNeedingPrep: ["Full analysis needed for company matching"],
            recommendations: "Can't properly assess company fit without full AI evaluation."
        },
        technicalReadiness: {
            codingSkills: hasProjects ? "Projects suggest some coding experience" : "Need to showcase coding abilities",
            frameworkKnowledge: foundSkills.includes('react') || foundSkills.includes('spring') ? "Some framework knowledge visible" : "Framework experience unclear",
            databaseConcepts: foundSkills.includes('sql') || foundSkills.includes('mysql') ? "Database skills indicated" : "Database knowledge needs highlighting",
            deploymentExperience: "Need full analysis for deployment assessment",
            gapsToAddress: ["Full AI required for gap analysis"]
        },
        interviewPreparation: {
            technicalStories: ["AI down - can't prep technical stories"],
            hrQuestionPrep: ["Standard campus questions: Why this company? Career goals?"],
            commonChallenges: ["Practice explaining projects clearly", "Prepare for technical questions"]
        },
        marketPosition: {
            currentStanding: "Need full AI analysis for market positioning",
            competitiveAdvantage: hasProjects ? "Project experience is positive" : "Need to build project portfolio",
            salaryExpectations: "3-5 LPA typical for campus placements",
            careerTrajectory: "Graduate trainee programs are good starting point"
        },
        placementStrategy: {
            priorityCompanies: "Service companies usually more open to freshers",
            preparationTimeline: "Focus on DSA practice and project explanation",
            skillDevelopment: "Full AI needed for personalized skill roadmap",
            portfolioGaps: "Need complete analysis for portfolio review"
        },
        finalAssessment: `While our AI is temporarily down, here's what I can see: ${foundSkills.length > 0 ? 'You have some relevant technical skills' : 'Technical skills need better highlighting'}, ${hasProjects ? 'project work shows hands-on experience' : 'more projects would strengthen your profile'}. For campus placements, you're on a decent track but need the full AI analysis to give you proper guidance. Come back in a few minutes for the complete assessment you deserve.`,
        processingTime: 100,
        aiModel: "campus-placement-fallback",
        processedAt: new Date().toISOString(),
        isServerUnavailable: true
    };

    return fallbackAnalysis;
}

module.exports = {
    processWithAI
};