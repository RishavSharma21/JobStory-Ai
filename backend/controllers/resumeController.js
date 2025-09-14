// resumeController.js - Updated for simplified text extraction and AI processing

const Resume = require('../models/Resume');
// --- UPDATED IMPORT: Import the correct function from the renamed file ---
// Assuming pdfParser.js is in ../services/ and exports extractTextFromFile
const { extractTextFromFile } = require('../services/pdfParser');
// --- If you decide to keep the parseResumeFile name in pdfParser.js, use this instead:
// const { parseResumeFile } = require('../services/pdfParser');
// --- END OF UPDATED IMPORT ---
// Remove or comment out the old import and processWithAI if not used in upload step
// const { parsePdfFile, extractStructuredData } = require('../services/pdfParser');
// const { processWithAI } = require('../services/aiService'); // Keep if used in analyzeResume

// Upload and parse resume (simplified for text extraction only)
async function uploadResume(req, res) {
  try {
    console.log('Received resume upload request');

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a PDF file to upload'
      });
    }

    // Validate file type (PDF only)
    // Note: pdfParser.js will also validate this
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only PDF files are supported'
      });
    }

    // Validate file size (10MB limit)
    // Note: pdfParser.js will also validate this
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 10MB'
      });
    }

    // --- UPDATED: Use extractTextFromFile from the new pdfParser.js ---
    console.log('Extracting and cleaning text from uploaded file...');
    let extractionResult = {};
    try {
        // Call the function which does the robust text extraction and cleaning
        extractionResult = await extractTextFromFile(req.file);
        // If pdfParser.js exports parseResumeFile instead, use:
        // extractionResult = await parseResumeFile(req.file);
    } catch (extractionError) {
         console.error('Error during text extraction/cleaning:', extractionError);
         return res.status(400).json({
             error: 'Text processing failed',
             message: extractionError.message || 'Could not process the PDF file.'
         });
    }

    // Get the cleaned text (or rawText if you prefer to send that to AI)
    // Based on the pdfParser.js code provided, cleanedText is likely what you want
    const extractedText = extractionResult.cleanedText || extractionResult.rawText || '';

    // Basic validation (pdfParser.js also does this, but double-checking is fine)
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        error: 'Text extraction failed',
        message: 'Could not extract readable text from the PDF. Please ensure the PDF contains selectable text.'
      });
    }
    // --- END OF UPDATED EXTRACTION ---

    // --- REMOVED: Old structuring logic ---
    // The following lines are removed because structuring is now done by AI
    // console.log('Extracting structured data...');
    // const structuredData = extractStructuredData(extractedText);
    // --- END OF REMOVED LOGIC ---

    // Get target job role from request (optional for initial storage)
    const targetJobRole = req.body.jobRole || 'Not specified';

    // Create resume document - storing the extracted text for AI processing later
    const resumeData = {
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      // Store the cleaned text extracted by the parser, ready for AI
      extractedText: extractedText,

      // Initialize fields that will be populated by AI later
      personalInfo: {},
      summary: '',
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      projects: [],
      languages: [],
      achievements: [],

      targetJobRole: targetJobRole,
      processingStatus: 'text_extracted' // Indicate text extraction is complete
    };

    console.log('Resume text extracted and data prepared, saving to database...');

    // Save to database
    const resume = new Resume(resumeData);
    await resume.save();

    console.log('Resume saved successfully with ID:', resume._id);

    // Return success response
    res.json({
      success: true,
      message: 'Resume uploaded and text extracted successfully. Ready for AI analysis.',
      resumeId: resume._id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      // formattedFileSize: resume.formattedFileSize, // Ensure this field exists in your model or is a virtual
      processingStatus: resume.processingStatus,
      // Provide the next step for the user/frontend
      nextStep: `Use POST /api/resume/${resume._id}/analyze-with-ai to get AI-powered insights`
    });

  } catch (error) {
    console.error('Error in uploadResume:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Analyze resume with AI (this function can stay largely the same, assuming it fetches text from DB)
// You might need to create a new endpoint/route for this if it doesn't exist or needs modification
async function analyzeResume(req, res) {
  try {
    console.log('Received resume analysis request (for existing logic)');

    // Get resume ID from request parameters
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid resume ID format'
      });
    }

    // Get job role from request body
    const jobRole = req.body.jobRole || 'Not specified';

    console.log('Analyzing resume ID:', id, 'for job role:', jobRole);

    // Find resume in database
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found',
        message: 'The specified resume could not be found in the database'
      });
    }

    // Check if resume text was properly extracted
    if (!resume.extractedText || resume.extractedText.trim().length === 0) {
      return res.status(400).json({
        error: 'Resume text not available',
        message: 'Text needs to be extracted first. Please re-upload the resume.'
      });
    }

    // --- Placeholder for AI Integration ---
    // Here you would integrate your call to the AI service (Groq/Gemini)
    // using resume.extractedText as the input.
    // For example:
    // const aiService = require('../services/aiService'); // Import your AI service
    // const aiResults = await aiService.analyzeResumeText(resume.extractedText, jobRole);
    //
    // Then update the resume document with aiResults
    // resume.personalInfo = aiResults.personalInfo;
    // resume.summary = aiResults.summary;
    // ... etc.
    // resume.aiAnalysis = aiResults; // Optionally store full AI response
    // resume.processingStatus = 'ai_analyzed';
    // resume.analyzedAt = new Date();
    // await resume.save();
    //
    // res.json({
    //   success: true,
    //   message: 'Resume analyzed successfully with AI',
    //   resumeId: resume._id,
    //   analysis: aiResults
    // });
    // --- End of AI Integration Placeholder ---

    // If you are keeping the old processWithAI for now, it should still work
    // as long as it reads resume.extractedText. However, you might want to
    // update it or replace it with the new AI service call.
    // const { processWithAI } = require('../services/aiService');
    // const aiResults = await processWithAI(resume, jobRole); // Ensure this function uses resume.extractedText

    // For now, let's assume processWithAI exists and is updated, or you replace the block above.
    // If you remove processWithAI, remove this block and uncomment the placeholder above.
    const { processWithAI } = require('../services/aiService'); // Make sure this path is correct
    // Update processing status
    resume.processingStatus = 'processing_ai'; // Indicate AI processing started
    // resume.targetJobRole = jobRole; // Update job role if provided (already done above)
    await resume.save();

    const aiResults = await processWithAI(resume, jobRole);

    // Update resume with AI analysis
    // Assuming processWithAI returns the structured data directly
    // Adjust based on the actual structure of aiResults
    Object.assign(resume, {
      personalInfo: aiResults.personalInfo || {},
      summary: aiResults.summary || '',
      skills: Array.isArray(aiResults.skills) ? aiResults.skills : [],
      experience: Array.isArray(aiResults.experience) ? aiResults.experience : [],
      education: Array.isArray(aiResults.education) ? aiResults.education : [],
      certifications: Array.isArray(aiResults.certifications) ? aiResults.certifications : [],
      projects: Array.isArray(aiResults.projects) ? aiResults.projects : [],
      languages: Array.isArray(aiResults.languages) ? aiResults.languages : [],
      achievements: Array.isArray(aiResults.achievements) ? aiResults.achievements : [],
      // Store specific AI analysis results if processWithAI provides them separately
      aiAnalysis: aiResults.aiAnalysis || aiResults, // Adjust based on processWithAI output
      analyzedAt: new Date(),
      processingStatus: 'completed'
    });
    await resume.save();

    console.log('Resume analysis completed successfully');

    // Return comprehensive analysis results
    // Adjust the response structure based on what aiResults contains
    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      resumeId: resume._id,
      fileName: resume.fileName,
      targetJobRole: resume.targetJobRole,
      processingStatus: resume.processingStatus,
      analysis: aiResults, // This should now contain the AI's structured output
      analyzedAt: resume.analyzedAt
    });

  } catch (error) {
    console.error('Error in analyzeResume:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Get resume by ID (improved)
// This function should work as is, retrieving the saved data (text + AI results if processed)
async function getResume(req, res) {
  try {
    console.log('Getting resume details for ID:', req.params.id);

    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid resume ID format'
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found',
        message: 'The specified resume could not be found'
      });
    }

    // Return comprehensive resume data
    res.json({
      success: true,
      message: 'Resume retrieved successfully',
      resume: {
        resumeId: resume._id,
        fileName: resume.fileName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        formattedFileSize: resume.formattedFileSize,
        targetJobRole: resume.targetJobRole,
        processingStatus: resume.processingStatus,
        uploadedAt: resume.uploadedAt,
        analyzedAt: resume.analyzedAt,
        lastUpdated: resume.lastUpdated,

        // Extracted text (useful for debugging or re-processing)
        extractedText: resume.extractedText,

        // Structured data (populated by AI later)
        personalInfo: resume.personalInfo,
        summary: resume.summary,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        certifications: resume.certifications,
        projects: resume.projects,
        languages: resume.languages,
        achievements: resume.achievements,

        // AI analysis (if available)
        aiAnalysis: resume.aiAnalysis,

        // Processing info
        isFullyProcessed: resume.isFullyProcessed,
        processingErrors: resume.processingErrors
      }
    });

  } catch (error) {
    console.error('Error in getResume:', error);
    res.status(500).json({
      error: 'Retrieval failed',
      message: error.message
    });
  }
}

// Get all resumes (improved)
// This function should work as is
async function getAllResumes(req, res) {
  try {
    console.log('Getting all resumes');

    // Get query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const jobRole = req.query.jobRole;

    // Build filter query
    const filter = {};
    if (status) filter.processingStatus = status;
    if (jobRole) filter.targetJobRole = new RegExp(jobRole, 'i');

    // Get total count for pagination
    const totalCount = await Resume.countDocuments(filter);

    // Get resumes with pagination
    const resumes = await Resume.find(filter)
      .sort({ uploadedAt: -1 }) // Sort by newest first
      .skip((page - 1) * limit)
      .limit(limit)
      .select('fileName targetJobRole uploadedAt analyzedAt processingStatus personalInfo aiAnalysis.atsScore');

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      message: 'Resumes retrieved successfully',
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      resumes: resumes.map(resume => ({
        resumeId: resume._id,
        fileName: resume.fileName,
        targetJobRole: resume.targetJobRole,
        uploadedAt: resume.uploadedAt,
        analyzedAt: resume.analyzedAt,
        processingStatus: resume.processingStatus,
        personalInfo: resume.personalInfo,
        atsScore: resume.aiAnalysis?.atsScore?.score || null, // Adjust path if aiAnalysis structure differs
        isFullyProcessed: resume.isFullyProcessed // Adjust if this is a method or field
      }))
    });

  } catch (error) {
    console.error('Error in getAllResumes:', error);
    res.status(500).json({
      error: 'Retrieval failed',
      message: error.message
    });
  }
}

// New function: Get resume analysis summary
// This function should work as is, once AI analysis populates aiAnalysis
async function getResumeSummary(req, res) {
  try {
    const { id } = req.params;

    // Select fields needed for the summary, including potential AI results
    const resume = await Resume.findById(id)
      .select('fileName targetJobRole processingStatus aiAnalysis personalInfo analyzedAt isFullyProcessed');

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found'
      });
    }

    // Check if resume is fully processed (adjust check if isFullyProcessed is a method)
    // const isProcessed = typeof resume.isFullyProcessed === 'function' ? resume.isFullyProcessed() : resume.isFullyProcessed;
    // if (!isProcessed) {
    if (resume.processingStatus !== 'completed') { // Simpler check based on status
      return res.status(400).json({
        error: 'Resume not fully processed',
        message: 'AI analysis is not yet complete for this resume',
        processingStatus: resume.processingStatus
      });
    }

    // Ensure aiAnalysis exists
    if (!resume.aiAnalysis) {
       return res.status(400).json({
         error: 'AI analysis data missing',
         message: 'AI analysis was not found for this resume.'
       });
    }

    res.json({
      success: true,
      message: 'Resume summary retrieved successfully',
      summary: {
        resumeId: resume._id,
        fileName: resume.fileName,
        candidateName: resume.personalInfo?.name,
        targetJobRole: resume.targetJobRole,
        // Adjust paths below based on the actual structure returned by your AI service
        atsScore: resume.aiAnalysis.atsScore,
        overallSummary: resume.aiAnalysis.overallSummary,
        keyStrengths: resume.aiAnalysis.recruiterInsights?.keyStrengths || resume.aiAnalysis.strengths, // Adjust path
        topRecommendations: (resume.aiAnalysis.recruiterInsights?.recommendations || resume.aiAnalysis.growthAreas || []).slice(0, 3), // Adjust path
        analyzedAt: resume.analyzedAt
      }
    });

  } catch (error) {
    console.error('Error in getResumeSummary:', error);
    res.status(500).json({
      error: 'Summary retrieval failed',
      message: error.message
    });
  }
}

// Export all functions
module.exports = {
  uploadResume,
  analyzeResume,
  getResume,
  getAllResumes,
  getResumeSummary
};