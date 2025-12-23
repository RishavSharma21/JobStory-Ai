// models/Resume.js - Updated MongoDB model for text-extraction-first approach

const mongoose = require('mongoose');

// Define the schema for resume data
const resumeSchema = new mongoose.Schema({
  // Basic file information
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },

  // Owner of the resume
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for now to support guest/legacy data
  },

  // Raw extracted and cleaned text content (REQUIRED for new flow)
  extractedText: {
    type: String,
    required: true // Keep this required
  },

  // Personal Information (MADE OPTIONAL for new flow)
  personalInfo: {
    name: { type: String, default: '' }, // Changed from 'Not found' to ''
    title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },

  // Professional summary/objective (MADE OPTIONAL)
  summary: {
    type: String,
    default: ''
  },

  // Skills array (MADE OPTIONAL)
  skills: [{
    type: String
  }],

  // Education (MADE OPTIONAL)
  education: [{
    degree: String,
    institution: String,
    dates: String,
    score: String,
    description: String
  }],

  // Work Experience (MADE OPTIONAL)
  experience: [{
    company: String,
    role: String,
    dates: String,
    description: String
  }],

  // Additional sections (MADE OPTIONAL)
  certifications: [{
    type: String
  }],

  projects: [{
    title: String,
    description: String
  }],

  languages: [{
    type: String
  }],

  achievements: [{
    type: String
  }],

  // AI Analysis Results (will be populated by AI service later)
  // Keep this structure, but it will be empty initially
  // --- UPDATED SCHEMA FOR strengths & growthAreas ---
  aiAnalysis: {
    // ATS Score Analysis
    atsScore: {
      score: { type: Number, min: 0, max: 100 },
      level: { type: String, enum: ['Poor', 'Fair', 'Good', 'Excellent'] },
      explanation: String
    },

    // ATS Improvement Suggestions
    atsImprovement: {
      missingKeywords: [String],
      quickFixes: [String],
      formatWarnings: [String],
      estimatedImprovement: {
        currentScore: Number,
        potentialScore: Number,
        impact: String
      }
    },

    // Recruiter Insights
    recruiterInsights: {
      overview: String,
      keyStrengths: [String],
      redFlags: [String],
      recommendations: [String]
    },

    // Strengths Analysis - CHANGED to array of strings
    strengths: [String], // Array of strings (Simple list from AI)

    // Areas for Improvement - CHANGED to array of strings
    growthAreas: [String], // Array of strings (Simple list from AI)

    // Job Role Matching
    jobMatching: {
      targetRole: String,
      matchPercentage: Number,
      matchingSkills: [String],
      missingSkills: [String],
      recommendations: String
    },

    // Keyword Analysis
    keywordAnalysis: {
      presentKeywords: [String],
      missingKeywords: [String],
      keywordDensity: Number
    },

    // Overall Summary
    overallSummary: String,

    // AI Processing Metadata
    aiModel: String,
    processedAt: Date,
    processingTime: Number // in milliseconds
  },
  // --- END OF UPDATE ---

  // Target job information
  targetJobRole: {
    type: String,
    default: 'Not specified'
  },

  // Processing status (UPDATED ENUM)
  processingStatus: {
    type: String,
    // --- UPDATED ENUM ---
    // Added 'text_extracted' for the new flow stage
    enum: ['uploaded', 'text_extracted', 'processing', 'processing_ai', 'completed', 'failed'],
    default: 'uploaded'
  },

  // Error handling
  processingErrors: [{
    stage: String,
    error: String,
    timestamp: Date
  }],

  // Timestamps
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  analyzedAt: {
    type: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  // Add automatic timestamps
  timestamps: true
});

// Defensive coercion for atsScore.level to allowed enum values
function coerceAtsLevel(level, score) {
  const allowed = ['Poor', 'Fair', 'Good', 'Excellent'];
  if (!level && typeof score === 'number') {
    const s = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Fair';
    return 'Poor';
  }
  if (allowed.includes(level)) return level;
  const val = String(level || '').toLowerCase();
  if (val.includes('excellent') || val.includes('top tier') || val.includes('top-tier') || val.includes('outstanding')) return 'Excellent';
  if (val.includes('strong candidate') || val.includes('very good') || val.includes('ready')) return 'Good';
  if (val.includes('decent') || val.includes('average') || val.includes('ok') || val.includes('fair')) return 'Fair';
  if (val.includes('needs work') || val.includes('needs improvement') || val.includes('poor') || val.includes('weak')) return 'Poor';
  // Unknown/undefined: default conservatively based on score if valid, else 'Fair'
  if (typeof score === 'number') {
    const s = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Fair';
    return 'Poor';
  }
  return 'Fair';
}

// Add indexes for better query performance (keep these)
resumeSchema.index({ uploadedAt: -1 });
resumeSchema.index({ 'personalInfo.name': 1 });
resumeSchema.index({ targetJobRole: 1 });
resumeSchema.index({ processingStatus: 1 });

// Pre-save middleware to update lastUpdated (keep this)
resumeSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

// Pre-validate middleware to normalize ATS level before enum validation
resumeSchema.pre('validate', function (next) {
  if (this.aiAnalysis && this.aiAnalysis.atsScore) {
    const s = this.aiAnalysis.atsScore.score;
    const lvl = this.aiAnalysis.atsScore.level;
    this.aiAnalysis.atsScore.level = coerceAtsLevel(lvl, s);
  }
  next();
});

// Virtual for formatted file size (keep this)
resumeSchema.virtual('formattedFileSize').get(function () {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to check if resume is fully processed (keep this, adjust if needed)
resumeSchema.methods.isFullyProcessed = function () {
  // Consider fully processed when AI analysis is complete
  return this.processingStatus === 'completed' && this.aiAnalysis && this.analyzedAt;
  // Alternative check based only on status:
  // return this.processingStatus === 'completed';
};

// Static method to find resumes by job role (keep this)
resumeSchema.statics.findByJobRole = function (jobRole) {
  return this.find({ targetJobRole: new RegExp(jobRole, 'i') });
};

// Create and export the model
module.exports = mongoose.model('Resume', resumeSchema);
