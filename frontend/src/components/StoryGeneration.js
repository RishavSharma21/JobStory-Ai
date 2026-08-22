import React, { useMemo, useRef, useState, useEffect } from 'react';
import { MdSecurity, MdSpellcheck, MdFormatListBulleted, MdReportProblem, MdBuild, MdDownload, MdRefresh, MdDescription, MdAutoAwesome, MdPerson, MdCode, MdLightbulb, MdRocket, MdLock, MdInfoOutline, MdClose, MdHelpOutline, MdWarning, MdContentCopy, MdCheck, MdExpandMore, MdExpandLess } from 'react-icons/md';


import './StoryGeneration.css';
import './LoadingAndAccessibility.css';
import { generateCompleteReport } from '../utils/pdfDownload';
import { generateCoverLetter, generateInterviewQuestions } from '../utils/api';
import { FaSpinner } from 'react-icons/fa';

// Pre-mapped standard technical skills explanation & projects for rich tooltips
const skillDetails = {
  react: {
    why: "Crucial for building highly interactive, component-driven user interfaces in modern web applications.",
    project: "Refactor a dashboard using React Context/Redux and optimize performance with React.memo."
  },
  nodejs: {
    why: "The industry standard for building highly scalable, asynchronous backend RESTful APIs.",
    project: "Create a secure Express backend server with JWT auth and rate-limiting middleware."
  },
  python: {
    why: "Extremely versatile language used for backend automation, web scraping, data pipelines, and AI models.",
    project: "Write an automated script that scrapes job listings and triggers automated parsing routines."
  },
  sql: {
    why: "Essential for robust relational data architecture, complex querying, and server indexing optimizations.",
    project: "Design a database schema for an e-commerce platform and optimize query search speeds."
  },
  mongodb: {
    why: "Leading NoSQL database ideal for high-speed indexing, flexible document schemas, and rapid scaling.",
    project: "Build a document storage model that saves nested user settings with dynamic configurations."
  },
  typescript: {
    why: "Prevents runtime bugs by introducing strict type definitions, streamlining collaboration on complex bases.",
    project: "Convert a standard JavaScript utility library to TypeScript with full typing coverage."
  },
  aws: {
    why: "Standard cloud provider required for scalable application deployment, secure hosting, and pipelines.",
    project: "Deploy your application utilizing AWS S3 for storage and ECS/EC2 instances for compute."
  },
  docker: {
    why: "Guarantees runtime consistency across local developer machines and cloud deployment instances.",
    project: "Containerize your local client/server application using multi-stage Dockerfiles and compose."
  },
  git: {
    why: "Universal standard for code versioning, team code review workflows, and clean code integration.",
    project: "Set up a clean GitHub workflow with pull request templates and semantic release tagging."
  },
  kubernetes: {
    why: "Crucial for automating orchestration, auto-scaling, and high availability of container clusters.",
    project: "Draft a Kubernetes pod deployment manifest with health checks and load balanced services."
  },
  redux: {
    why: "Enables predictable global state management across nested frontend components and workflows.",
    project: "Implement global state using Redux Toolkit to sync real-time user selections."
  },
  graphql: {
    why: "Optimizes client bandwidth by allowing precise data queries, preventing microservice over-fetching.",
    project: "Build a unified GraphQL schema gateway stitching SQL database and external API services."
  },
  javascript: {
    why: "The native programming language of the web, powering frontend logic and asynchronous processes.",
    project: "Build an interactive dynamic dashboard using ES6 module architecture and vanilla DOM API."
  },
  css: {
    why: "Required for pixel-perfect, accessible, and responsive user experiences matching layout targets.",
    project: "Design a fully responsive, semantic CSS layout featuring CSS variables and grid systems."
  },
  html: {
    why: "The foundation of web content. Critical for SEO discovery, browser structures, and accessibility standards.",
    project: "Structure a web portal using semantic HTML5 tags satisfying WCAG 2.1 accessibility criteria."
  }
};

const getSkillInfo = (skillName, jobRole) => {
  const key = skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (skillDetails[key]) {
    return skillDetails[key];
  }
  return {
    why: `Frequently requested for ${jobRole} roles to align with modern industry standards and clean code architectures.`,
    project: `Build a mini sandbox repository showcasing a clean modular implementation of ${skillName}.`
  };
};

const StoryGeneration = ({ resumeData, onSaveToHistory, onBack }) => {
  // extracting resume data
  if (!resumeData) {
    return (
      <div className="analysis-page">
        <div className="main-container">
          <div className="page-content">
            <h1>Loading analysis...</h1>
            <p>Please wait while we prepare your resume analysis.</p>
          </div>
        </div>
      </div>
    );
  }

// ===== HUMAN-CRAFTED MINIMALIST AUDIT ITEM RENDERER =====
const parseAuditItem = (str, type = 'grammar') => {
  if (!str) return null;
  let text = String(str).replace(/^Correction Needed:\s*/i, '').replace(/^→\s*/, '').trim();

  let category = type === 'grammar' ? 'GRAMMAR' : 'QUICK FIX';
  let location = '';
  let original = '';
  let suggested = '';
  let explanation = '';

  // Extract category prefix if colon exists
  const firstColon = text.indexOf(':');
  if (firstColon !== -1 && firstColon < 60) {
    const rawCat = text.substring(0, firstColon).trim();
    text = text.substring(firstColon + 1).trim();

    // Check if rawCat contains location e.g. "WEAK PASSIVE PHRASING IN JOBSTORY AI BULLET 1"
    const locMatch = rawCat.match(/(?:IN|FOR|AT)\s+([^:]+)/i);
    if (locMatch) {
      location = locMatch[1].trim();
      category = rawCat.replace(/(?:IN|FOR|AT)\s+[^:]+/i, '').trim() || (type === 'grammar' ? 'PHRASING' : 'IMPROVEMENT');
    } else {
      category = rawCat;
    }
  }

  if (text.includes(' -> ')) {
    const parts = text.split(' -> ');
    original = parts[0].trim();
    let rem = parts[1].trim();

    if (/replace with/i.test(rem)) {
      const rMatch = rem.match(/(.*?)\s*replace with\s*(.*)/i);
      if (rMatch) {
        explanation = rMatch[1].trim().replace(/^:\s*/, '');
        suggested = rMatch[2].trim().replace(/^:\s*/, '');
      } else {
        suggested = rem;
      }
    } else {
      suggested = rem;
    }
  } else if (/replace with/i.test(text)) {
    const rMatch = text.match(/(.*?)\s*replace with\s*(.*)/i);
    if (rMatch) {
      original = rMatch[1].trim();
      suggested = rMatch[2].trim().replace(/^:\s*/, '');
    } else {
      original = text;
    }
  } else if (text.toLowerCase().includes(' to ') && text.includes("'")) {
    const toMatch = text.match(/(.*?)\s*'([^']+)'\s*to\s*'([^']+)'/i);
    if (toMatch) {
      explanation = toMatch[1].trim();
      original = toMatch[2].trim();
      suggested = toMatch[3].trim();
    } else {
      original = text;
    }
  } else {
    original = text;
  }

  if (original.includes("'")) {
    const qMatch = original.match(/(.*?):?\s*'([^']+)'/);
    if (qMatch) {
      if (qMatch[1] && !explanation) explanation = qMatch[1].trim();
      original = qMatch[2].trim();
    }
  }
  if (suggested.includes("'")) {
    const qMatch2 = suggested.match(/(.*?):?\s*'([^']+)'/);
    if (qMatch2) {
      if (qMatch2[1] && !explanation) explanation = qMatch2[1].trim();
      suggested = qMatch2[2].trim();
    }
  }

  original = original.replace(/^['"]|['"]$/g, '').trim();
  suggested = suggested.replace(/^['"]|['"]$/g, '').trim();
  explanation = explanation.replace(/^:\s*/, '').trim();

  category = category.toUpperCase().trim();

  return { category, location, original, suggested, explanation };
};

const GrammarlyAuditCard = ({ item, idx, type = 'grammar' }) => {
  const [copied, setCopied] = useState(false);
  const parsed = parseAuditItem(item, type);
  if (!parsed) return null;

  const handleCopy = (textToCopy) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textToCopy = parsed.suggested || parsed.original;

  return (
    <div key={idx} className="pro-audit-item">
      {/* Top Meta Line */}
      <div className="pro-audit-top">
        <div className="pro-tag-group">
          <span className="pro-category-tag">{parsed.category}</span>
          {parsed.location && parsed.location !== parsed.category && (
            <span className="pro-location-tag">• {parsed.location}</span>
          )}
        </div>

        {textToCopy && (
          <button
            type="button"
            className={`icon-copy-btn ${copied ? 'copied' : ''}`}
            onClick={() => handleCopy(textToCopy)}
            title={copied ? "Copied!" : "Copy suggestion"}
            aria-label="Copy suggestion to clipboard"
          >
            {copied ? <MdCheck size={16} /> : <MdContentCopy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className="pro-audit-body">
        {parsed.original && parsed.suggested ? (
          <>
            <div className="pro-line original">
              <span className="pro-label">Original:</span>
              <span className="pro-text-old">{parsed.original}</span>
            </div>
            <div className="pro-line suggested">
              <span className="pro-label green">Suggested:</span>
              <span className="pro-text-new">{parsed.suggested}</span>
            </div>
          </>
        ) : (
          <div className="pro-line simple">
            <span className="pro-text-simple">{parsed.original || parsed.suggested}</span>
          </div>
        )}
      </div>

      {/* Recruiter Rationale Footer */}
      {parsed.explanation && (
        <div className="pro-audit-reason">
          <strong>Why:</strong> {parsed.explanation}
        </div>
      )}
    </div>
  );
};


// ===== EXPANDABLE AUDIT LIST COMPONENT (CONTROLLED STATE - PERSISTENT ON SCROLL) =====
const ExpandableAuditList = ({ items, type = 'grammar', initialLimit = 2, expanded, onToggle }) => {
  if (!items || items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, initialLimit);
  const hiddenCount = items.length - initialLimit;

  return (
    <div className="expandable-audit-wrapper">
      <div className="grammarly-cards-container">
        {visibleItems.map((item, i) => (
          <GrammarlyAuditCard
            key={i}
            item={typeof item === 'object' ? item.text : item}
            idx={i}
            type={type}
          />
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="linear-show-more-wrapper">
          <button
            type="button"
            className="linear-show-more-btn"
            onClick={onToggle}
          >
            <span>{expanded ? `Show Less` : `Show ${hiddenCount} More ${type === 'grammar' ? 'Issues' : 'Fixes'}`}</span>
            {expanded ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
          </button>
        </div>
      )}
    </div>
  );
};










  // Extract job role and resume name from resumeData
  const jobRole = resumeData?.targetJobRole || "Not specified";

  const resumeName = resumeData?.fileName || "resume.pdf";
  const fileUrl = resumeData?.fileUrl; // URL for resume preview
  const fileSize = typeof resumeData?.fileSize === 'number' ? `${(resumeData.fileSize / 1024).toFixed(1)} KB` : "Unknown";

  // Use real analysis data from resumeData instead of mock data
  const analysisData = resumeData?.analysis || resumeData?.aiAnalysis || {};

  // --- INDUSTRY READY DATA MAPPING (WITH POLYFILLS) ---
  // Map the new backend structure to the frontend variables, with fallbacks for legacy data
  const overallScore = analysisData.overallScore || analysisData.atsScore?.score || 0;

  // Polyfill Section Scores if missing
  let sectionScores = analysisData.sectionScores || {};
  if (Object.keys(sectionScores).length === 0 && overallScore > 0) {
    // Estimate section scores based on overall score
    const base = Math.round(overallScore / 10);
    sectionScores = {
      education: Math.min(10, base + 1),
      skills: Math.min(10, base),
      projects: Math.max(1, base - 1),
      experience: Math.max(1, base - 1),
      formatting: Math.min(10, base + 1)
    };
  }

  // Polyfill Red Flags if missing
  let redFlagsList = analysisData.redFlags || [];
  if (redFlagsList.length === 0) {
    if (analysisData.recruiterInsights?.concerningAreas?.length > 0) {
      redFlagsList = analysisData.recruiterInsights.concerningAreas;
    } else if (analysisData.grammarSpelling?.length > 0) {
      redFlagsList = ["Multiple grammar issues detected", "Proofreading required"];
    } else if (overallScore < 50) {
      redFlagsList = ["Low keyword match", "Weak impact descriptions"];
    }
  }

  // Polyfill Action Plan if missing
  let actionPlan = analysisData.actionPlan || {};
  if (!actionPlan.high && !actionPlan.medium) {
    const legacyFixes = analysisData.quickFixes || analysisData.recruiterInsights?.recommendations || [];

    if (legacyFixes.length > 0) {
      actionPlan = {
        high: legacyFixes.slice(0, 2),
        medium: legacyFixes.slice(2, 5),
        low: legacyFixes.slice(5)
      };
    }
  }

  // Polyfill Recruiter Impression
  let recruiterImpression = analysisData.recruiterImpression || {};
  if (!recruiterImpression.verdict) {
    recruiterImpression = {
      verdict: overallScore > 70 ? "Positive" : overallScore > 50 ? "Neutral" : "Negative",
      skimTime: "8-10 seconds",
      topObservation: analysisData.summary || "Standard resume format detected."
    };
  }

  // Fallback for older data structure
  const atsScoreValue = overallScore;
  const atsScoreLevel = analysisData.atsScore?.level || (overallScore > 70 ? "Good" : "Average");

  // Check if this is a fallback analysis due to AI service being unavailable
  const isAIUnavailable = analysisData.isServerUnavailable || false;

  // Provide comprehensive fallback data
  const fallbackData = {
    atsScore: {
      score: 0,
      level: "Analysis Pending",
      explanation: "Resume analysis is in progress. Please wait for the AI to complete the analysis."
    },
    recruiterInsights: {
      overview: "Analysis is being processed...",
      keyStrengths: ["Analysis in progress"],
      concerningAreas: ["Analysis in progress"],
      recommendations: ["Analysis in progress"]
    },
    jobMatching: {
      matchPercentage: 0,
      recommendations: "Analysis in progress..."
    }
  };

  // Create safe display data with comprehensive checks
  const createSafeDisplayData = () => {
    // If we have no analysis data at all, use all fallbacks
    if (!analysisData || Object.keys(analysisData).length === 0) {
      return fallbackData;
    }

    // Build safe data structure piece by piece
    const safeData = {
      atsScore: {
        score: overallScore,
        level: atsScoreLevel,
        explanation: analysisData.summary || analysisData.atsScore?.explanation || "Analysis complete."
      },
      recruiterInsights: {
        overview: recruiterImpression.verdict || analysisData.recruiterInsights?.overview || "Analysis complete.",
        keyStrengths: analysisData.recruiterInsights?.keyStrengths || [],
        concerningAreas: redFlagsList.length > 0 ? redFlagsList : (analysisData.recruiterInsights?.concerningAreas || []),
        recommendations: [
          ...(actionPlan.high || []),
          ...(actionPlan.medium || [])
        ]
      },
      jobMatching: {
        matchPercentage: overallScore,
        recommendations: "See action plan below."
      },
      overallAssessment: analysisData.summary || "Analysis complete."
    };

    return safeData;
  };

  const displayData = createSafeDisplayData();

  // ===== Feature mocks & lightweight computations (client-side, zero API) =====
  const text = (resumeData?.extractedText || '').trim();
  const wordCount = useMemo(() => (text ? text.split(/\s+/).length : 0), [text]);
  const estPages = useMemo(() => (wordCount ? (wordCount / 600).toFixed(1) : '0.0'), [wordCount]);

  // Readability score from AI (fallback to calculated estimate)
  const readability = useMemo(() => {
    const aiScore = analysisData?.readabilityScore?.score;
    if (aiScore !== undefined && aiScore !== null) return aiScore;

    // Fallback calculation
    if (!text) return 52;
    const words = text.split(/\s+/);
    const avgLen = words.reduce((a, w) => a + (w.length || 0), 0) / (words.length || 1);
    const score = Math.max(0, Math.min(100, Math.round(110 - avgLen * 10)));
    return score; // 0-100 (higher easier)
  }, [text, analysisData]);

  // Skills present/missing from REAL AI data
  const presentSkills = Array.isArray(analysisData?.atsAnalysis?.presentKeywords)
    ? analysisData.atsAnalysis.presentKeywords
    : (Array.isArray(analysisData?.keywordAnalysis?.presentKeywords)
      ? analysisData.keywordAnalysis.presentKeywords
      : (analysisData.skillKeywordGaps?.skills_present || []));

  const missingKeywords = Array.isArray(analysisData?.keywordAnalysis?.missingKeywords)
    ? analysisData.keywordAnalysis.missingKeywords
    : (analysisData.skillKeywordGaps?.critical_missing || []);

  // Grammar/Spelling issues from REAL AI data
  const grammarSpelling = Array.isArray(analysisData?.grammarSpelling)
    ? analysisData.grammarSpelling
    : [];

  const mistakeIssues = grammarSpelling.map((issue, idx) => ({
    type: 'Error',
    text: issue,
    suggestion: '',
    severity: 'high',
    location: 'Resume'
  }));

  // Format score from REAL AI (separate from ATS score)
  const formatScore = analysisData?.formatScore?.score || (sectionScores.formatting ? sectionScores.formatting * 10 : 0) || displayData?.atsScore?.score || 0;

  // Red flags from REAL AI data
  const redFlags = redFlagsList.length > 0 ? redFlagsList : (grammarSpelling.length > 0 ? grammarSpelling : ['No critical issues detected']);



  // Cover Letter Companion states
  const [coverLetterText, setCoverLetterText] = useState('');
  const [coverLetterTone, setCoverLetterTone] = useState('professional');
  const [coverLetterLength, setCoverLetterLength] = useState('medium');
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [clError, setClError] = useState('');

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCL(true);
    setClError('');
    try {
      const result = await generateCoverLetter(
        resumeData.resumeId || resumeData._id,
        jobRole,
        resumeData.extractedText || '',
        coverLetterTone,
        coverLetterLength
      );
      setCoverLetterText(result);
    } catch (err) {
      setClError('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGeneratingCL(false);
    }
  };



  // Quick Fixes - Prioritize old data format if available, else fallback to action plan
  const quickFixesList = Array.isArray(analysisData?.quickFixes) && analysisData.quickFixes.length > 0
    ? analysisData.quickFixes
    : [
      ...(actionPlan.high || []),
      ...(actionPlan.medium || []),
      ...(actionPlan.low || [])
    ];

  if (quickFixesList.length === 0 && Array.isArray(analysisData?.growthAreas)) {
    quickFixesList.push(...analysisData.growthAreas);
  }

  // Alias for report generation
  const achievements = quickFixesList;

  // ATS Compatibility Checker (heuristics)
  const atsCompatibility = useMemo(() => {
    const lower = text.toLowerCase();
    const lines = text.split(/\n+/);
    const scannable = text.length > 50; // selectable text present
    const tablesDetected = /\||\t/.test(text);
    const iconsDetected = /(icon|svg|png|jpg|jpeg)/i.test(text);
    const shortLines = lines.filter(l => l.trim().length > 0 && l.trim().length <= 25).length;
    const columnsSuspected = lines.length > 120 && shortLines / Math.max(1, lines.length) > 0.55; // crude signal
    const headerFooter = /(header|footer|page\s*\d)/i.test(lower);
    const lowContrast = false; // cannot detect from text
    const fancyFonts = false;  // cannot detect from text

    return {
      scannable,
      tablesDetected,
      iconsDetected,
      columnsSuspected,
      headerFooter,
      lowContrast,
      fancyFonts
    };
  }, [text]);

  // Combined ATS score (base from AI if available, adjusted by compatibility warnings)
  const atsCombined = useMemo(() => {
    // 1. Trust the score from the backend/database (it is the source of truth)
    const dbScore = analysisData?.atsScore?.score || analysisData?.overallScore;
    const hasDbScore = Number.isFinite(dbScore);

    // 2. Base score: Use DB score if valid, else fallback to 75 (if AI unavailable)
    const base = hasDbScore ? dbScore : (isAIUnavailable ? 75 : 0);

    // NEW: Extract Keyword Match Score with Fallback Calculation
    let kScore = displayData?.atsAnalysis?.keywordMatchScore;
    if (typeof kScore !== 'number') {
      // Fallback: Calculate from arrays if explicit score is missing
      const present = presentSkills.length || 0;
      const missing = missingKeywords.length || 0;
      const total = present + missing;
      kScore = total > 0 ? Math.round((present / total) * 100) : 0;
    }
    const keywordScore = kScore;
    const keywordLevel = keywordScore >= 85 ? 'Excellent' : keywordScore >= 70 ? 'Good' : keywordScore >= 50 ? 'Fair' : 'Poor';

    let penalty = 0;
    // Don't punish 'not scannable' when we have no extracted text (unknown state)
    if (wordCount > 0 && !atsCompatibility.scannable) penalty += 30;
    if (atsCompatibility.tablesDetected) penalty += 20;
    if (atsCompatibility.iconsDetected) penalty += 10;
    if (atsCompatibility.columnsSuspected) penalty += 12;
    if (atsCompatibility.headerFooter) penalty += 8;
    if (atsCompatibility.lowContrast) penalty += 6;
    if (atsCompatibility.fancyFonts) penalty += 5;

    // CHANGED: Do NOT apply penalties to the base score. The AI score is final.
    // We only use 'risks' for explanation purposes.
    const score = base;

    const level = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Poor';
    const risks = [
      (wordCount > 0 && !atsCompatibility.scannable),
      atsCompatibility.tablesDetected,
      atsCompatibility.iconsDetected,
      atsCompatibility.columnsSuspected,
      atsCompatibility.headerFooter,
      atsCompatibility.lowContrast,
      atsCompatibility.fancyFonts
    ].filter(Boolean).length;

    const explanation = penalty === 0
      ? 'No ATS layout risks detected.'
      : `Score based on AI analysis. ${risks} potential formatting risks detected separately.`;
    return { score, level, explanation, keywordScore, keywordLevel };
  }, [displayData, atsCompatibility, isAIUnavailable, wordCount, presentSkills, missingKeywords]);

  const chipClass = (ok, warn = false) => ok ? 'chip good' : (warn ? 'chip warn' : 'chip bad');

  const atsIssuesCount = useMemo(() => {
    let c = 0;
    if (!atsCompatibility.scannable) c++;
    if (atsCompatibility.tablesDetected) c++;
    if (atsCompatibility.iconsDetected) c++;
    if (atsCompatibility.columnsSuspected) c++;
    if (atsCompatibility.headerFooter) c++;
    if (atsCompatibility.lowContrast) c++;
    if (atsCompatibility.fancyFonts) c++;
    return c;
  }, [atsCompatibility]);

  // Score Animation Logic
  const [animatedAudit, setAnimatedAudit] = useState(0);
  const [animatedKeyword, setAnimatedKeyword] = useState(0);

  useEffect(() => {
    const animate = (target, setter) => {
      const duration = 2000; // 2 seconds
      const startTime = performance.now();

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quart
        const ease = 1 - Math.pow(1 - progress, 4);

        const current = Math.floor(ease * target);
        setter(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    };

    animate(atsCombined.score, setAnimatedAudit);
    animate(atsCombined.keywordScore, setAnimatedKeyword);

  }, [atsCombined.score, atsCombined.keywordScore]);

  const getLevel = (s) => s >= 85 ? 'Excellent' : s >= 70 ? 'Good' : s >= 50 ? 'Fair' : 'Poor';

  // Modal State
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const confirmDownload = () => {
    try {
      // consolidate all computed data to ensure report matches UI exactly
      const completeReportData = {
        ...analysisData,
        atsScore: {
          score: overallScore,
          level: atsScoreLevel,
          breakdown: sectionScores, // Use the locally computed section scores
          explanation: displayData?.atsScore?.explanation
        },
        recruiterInsights: recruiterImpression, // Use processed impression
        mistakes: mistakeIssues,
        atsImprovement: {
          ...analysisData.atsImprovement,
          missingKeywords: missingKeywords
        },
        // Explicitly pass JD Score
        jdScore: atsCombined.keywordScore,
        jdLevel: atsCombined.keywordLevel
      };

      console.log("Downloading Professional Report with:", completeReportData);
      generateCompleteReport(completeReportData, jobRole, resumeName, achievements);
      setShowDownloadModal(false);
    } catch (error) {
      console.error('❌ Error generating report:', error);
      alert('Failed to download report. Please try again.');
      setShowDownloadModal(false);
    }
  };

  const handleNewAnalysis = () => {
    if (onBack) {
      onBack();
    }
    console.log('Start new analysis');
  };

  const [showResume, setShowResume] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Smooth Transition Hack: Delay iframe load until animation finishes
  useEffect(() => {
    if (showResume) {
      setIframeLoaded(false);
      const timer = setTimeout(() => setIframeLoaded(true), 450); // Wait for CSS slide-up
      return () => clearTimeout(timer);
    }
  }, [showResume]);

  // Refs for quick navigation
  const atsRef = useRef(null);
  const grammarCardRef = useRef(null);
  const fixesRef = useRef(null);
  const skillsRef = useRef(null);
  const jdMatchRef = useRef(null);

  const sectionScoresRef = useRef(null);

  const coverLetterRef = useRef(null);

  const [activeSection, setActiveSection] = useState('scores');

  // Persistent expansion states (prevents auto-collapsing during scroll or re-renders)
  const [expandedGrammar, setExpandedGrammar] = useState(false);
  const [expandedFixes, setExpandedFixes] = useState(false);


  // Scroll Spy Logic with IntersectionObserver
  useEffect(() => {
    // Lock variable to prevent observer from fighting manual clicks
    const sections = [
      { ref: sectionScoresRef, id: 'scores' },
      { ref: grammarCardRef, id: 'grammar' },
      { ref: fixesRef, id: 'fixes' },
      { ref: skillsRef, id: 'skills' },
      { ref: coverLetterRef, id: 'coverletter' }
    ];

    const observerOptions = {
      root: null,
      rootMargin: '-45% 0px -45% 0px', // Precise "Center Line" tracking (only the middle 10% triggers)
      threshold: 0
    };

    const observerCallback = (entries) => {
      // If we are currently manual scrolling, ignore observer updates
      if (window.isManualScrolling) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const matchingSection = sections.find(s => s.ref.current === entry.target);
          if (matchingSection) {
            setActiveSection(matchingSection.id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (ref, id, highlight = true) => {
    // 1. Set active immediately
    setActiveSection(id);

    // 2. Set manual scroll lock to prevent observer override
    window.isManualScrolling = true;

    console.log(`Scrolling to: ${id}`, ref); // DEBUG LOG

    if (id === 'scores') {
      // Special case: First item should scroll to absolute top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (ref?.current) {
      // scrollIntoView with 'start' is more reliable than 'center' for navigation targets
      const yOffset = -100; // Account for fixed header
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });

      if (highlight) {
        ref.current.classList.remove('flash-highlight');
        void ref.current.offsetWidth;
        ref.current.classList.add('flash-highlight');
        setTimeout(() => ref.current && ref.current.classList.remove('flash-highlight'), 1500);
      }
    }

    // 3. Release lock after scroll settles (approx 1000ms)
    setTimeout(() => {
      window.isManualScrolling = false;
    }, 1000);
  };

  return (
    <div className="analysis-page">
      {/* Header with job info */}
      <header className="page-header">
        <div className="job-info">
          <span className="pill primary">{jobRole}</span>
          <div className="resume-name-badge">
            <MdDescription className="resume-icon" />
            <span className="resume-text">{resumeName}</span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`btn btn-secondary ${showResume ? 'active' : ''}`}
            onClick={() => fileUrl ? setShowResume(!showResume) : alert('Resume preview is only available for the current session.')}
            title={fileUrl ? (showResume ? "Hide resume preview" : "Show resume side-by-side") : "Preview not available"}
            style={!fileUrl ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {showResume ? <MdClose style={{ marginRight: '6px' }} /> : <MdDescription style={{ marginRight: '6px' }} />}
            {showResume ? "Hide Resume" : "View Resume"}
          </button>
          <button className="btn btn-secondary" onClick={handleNewAnalysis}>
            <MdRefresh style={{ marginRight: '6px' }} /> Analyze New
          </button>
        </div>
      </header>

      {/* Page Shell: left overview/nav | center content | right quick fixes */}
      <div className={`page-shell ${showResume ? 'split-view' : ''}`}>
        <aside className="left-rail">
          {/* PRIMARY SCORE: ATS AUDIT */}
          <div className={`score-circle-container sidebar-version ${getLevel(animatedAudit).toLowerCase()}`}>
            <div className="score-circle-wrapper">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray={`${animatedAudit}, 100`}
                  d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">{animatedAudit}</text>
              </svg>
            </div>
            <div className="score-text-content">
              <div className="score-level">{getLevel(animatedAudit).toUpperCase()}</div>
              <div className="score-badge">
                ATS AUDIT SCORE
                <div className="tooltip-container" style={{ marginLeft: '6px', display: 'inline-flex', alignItems: 'center' }}>
                  <MdHelpOutline className="info-icon-fixed" />
                  <span className="tooltip-text">Strict evaluation of your resume's quality, formatting, and impact based on industry standards. (0-100)</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="nav-menu" role="navigation" aria-label="Resume analysis sections">
            <button className={`nav-btn ${activeSection === 'scores' ? 'active' : ''}`} onClick={() => scrollTo(sectionScoresRef, 'scores')} aria-label="Navigate to Score Breakdown section" aria-current={activeSection === 'scores' ? 'page' : undefined}><MdFormatListBulleted aria-hidden="true" /> Score Breakdown</button>
            <button className={`nav-btn ${activeSection === 'grammar' ? 'active' : ''}`} onClick={() => scrollTo(grammarCardRef, 'grammar')} aria-label="Navigate to Grammar and Spelling section" aria-current={activeSection === 'grammar' ? 'page' : undefined}><MdSpellcheck aria-hidden="true" /> Grammar & Spelling</button>
            <button className={`nav-btn ${activeSection === 'fixes' ? 'active' : ''}`} onClick={() => scrollTo(fixesRef, 'fixes')} aria-label="Navigate to Quick Fixes section" aria-current={activeSection === 'fixes' ? 'page' : undefined}><MdBuild aria-hidden="true" /> Quick Fixes</button>
            <button className={`nav-btn ${activeSection === 'skills' ? 'active' : ''}`} onClick={() => scrollTo(skillsRef, 'skills')} aria-label="Navigate to Skill Gaps section" aria-current={activeSection === 'skills' ? 'page' : undefined}><MdDescription aria-hidden="true" /> Skill Gaps</button>


            <button className={`nav-btn ${activeSection === 'coverletter' ? 'active' : ''}`} onClick={() => scrollTo(coverLetterRef, 'coverletter')} aria-label="Navigate to Cover Letter Companion section" aria-current={activeSection === 'coverletter' ? 'page' : undefined}><MdDescription aria-hidden="true" /> Cover Letter</button>
            {/* Main Action - Updated to open Modal */}
            <button className="btn-download" onClick={handleDownloadClick} aria-label="Download complete resume analysis report as PDF">
              <MdDownload size={20} aria-hidden="true" />
              Download Report
            </button>

            <div className="sidebar-divider"></div>
          </nav>
        </aside>

        <main className="content-rail">
          <div className="main-analysis">

            {/* 1) SECTION SCORES (Simplified Grid) */}
            <div ref={sectionScoresRef} id="scores" className="analysis-card" style={{ scrollMarginTop: '100px' }}>
              <h2><MdFormatListBulleted /> SECTION-WISE BREAKDOWN</h2>
              <div className="score-explanation" style={{ marginBottom: 16, color: 'var(--text-muted)' }}>Detailed scoring per section (0-10):</div>
              {Object.keys(sectionScores).length > 0 ? (
                <div className="score-cards-mini" style={{ display: 'grid', gap: '16px' }}>
                  {Object.entries(sectionScores).map(([key, val]) => {
                    const sectionTooltips = {
                      education: "Evaluates degree relevance, institution prestige, and clarity.",
                      skills: "Checks for hard/soft skill balance and keyword matching.",
                      projects: "Assesses complexity, tech stack, and impact of projects.",
                      experience: "Analyzes career progression, action verbs, and measurable results.",
                      formatting: "Reviews layout consistency, fonts, and ATS readability."
                    };

                    return (
                      <div key={key} className="mini-score" style={{ gap: '4px', transition: 'all 0.3s ease', boxShadow: val >= 8 ? '0 8px 16px -4px rgba(16, 185, 129, 0.12)' : val >= 5 ? '0 8px 16px -4px rgba(245, 158, 11, 0.12)' : '0 8px 16px -4px rgba(239, 68, 68, 0.12)' }}>
                        <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '800', letterSpacing: '0.05em' }}>{key}</div>
                        <div style={{ fontSize: '2rem', fontWeight: '900', color: val >= 8 ? 'var(--status-good)' : val >= 5 ? 'var(--status-fair)' : 'var(--status-poor)', lineHeight: 1 }}>
                          {val}<span style={{ fontSize: '1rem', opacity: 0.6 }}>/10</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  No section scores available. Please re-analyze the resume.
                </div>
              )}
            </div>

            {/* 2) GRAMMAR & SPELLING AUDIT */}
            <div ref={grammarCardRef} id="grammar" className="analysis-card" style={{ scrollMarginTop: '100px' }}>
              <h2><MdSpellcheck /> GRAMMAR & SPELLING AUDIT</h2>
              <div className="score-explanation" style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
                Specific line-by-line phrasing, typo corrections, and recommended active rewrites:
              </div>
              {mistakeIssues.length > 0 ? (
                <ExpandableAuditList
                  items={mistakeIssues}
                  type="grammar"
                  initialLimit={2}
                  expanded={expandedGrammar}
                  onToggle={() => setExpandedGrammar(!expandedGrammar)}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0', color: '#065f46', fontWeight: '600' }}>
                  ✓ No critical grammar issues detected. Outstanding proofreading!
                </div>
              )}
            </div>

            {/* 3) HIGH-IMPACT QUICK FIXES */}
            <div ref={fixesRef} id="fixes" className="analysis-card" style={{ scrollMarginTop: '100px' }}>
              <h2><MdBuild /> HIGH-IMPACT QUICK FIXES</h2>
              <div className="score-explanation" style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
                Actionable bullet point rewrites and metric enhancements to maximize ATS score:
              </div>

              {quickFixesList.length > 0 ? (
                <ExpandableAuditList
                  items={quickFixesList}
                  type="fix"
                  initialLimit={2}
                  expanded={expandedFixes}
                  onToggle={() => setExpandedFixes(!expandedFixes)}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No quick fixes generated. Please re-analyze the resume.
                </div>
              )}
            </div>








            {/* 4) Skill & Keyword Gap Analysis */}
            <div ref={skillsRef} id="skills" className="analysis-card" style={{ scrollMarginTop: '100px' }}>
              <h2><MdDescription /> RECOMMENDED KEYWORDS TO ADD</h2>
              <div className="score-explanation" style={{ marginBottom: 14, color: 'var(--text-muted)' }}>
                Click any keyword to copy to clipboard and paste directly into your resume skills section:
              </div>

              {(() => {
                const presentNormalized = presentSkills.map(s => String(s).toLowerCase().trim());
                // Smart filter to prevent contradictions (e.g. MERN vs React)
                const uniqueMissing = missingKeywords.filter(skill => {
                  const sLow = String(skill).toLowerCase().trim();
                  return !presentNormalized.some(p => p.includes(sLow) || sLow.includes(p));
                });

                if (uniqueMissing.length === 0) {
                  return (
                    <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', color: '#065f46', fontWeight: '600', fontSize: '0.9rem' }}>
                      ✓ Your resume already includes all essential keywords for {jobRole}!
                    </div>
                  );
                }

                return (
                  <div className="compact-skills-wrapper">
                    <div className="compact-skills-cloud">
                      {uniqueMissing.map((skill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="compact-skill-btn"
                          onClick={(e) => {
                            navigator.clipboard.writeText(skill);
                            const btn = e.currentTarget;
                            const originalText = btn.innerText;
                            btn.innerText = `✓ Copied!`;
                            btn.classList.add('copied');
                            setTimeout(() => {
                              btn.innerText = originalText;
                              btn.classList.remove('copied');
                            }, 1800);
                          }}
                          title={`Click to copy ${skill}`}
                        >
                          <span className="plus-sign">+</span> {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>








            {/* 7) AI Cover Letter Companion */}
            <div ref={coverLetterRef} id="coverletter" className="analysis-card" style={{ scrollMarginTop: '100px' }}>
              <h2><MdDescription /> AI COVER LETTER COMPANION</h2>
              <p className="score-explanation" style={{ marginBottom: 16 }}>
                Generate a tailored, high-converting cover letter based on your resume and target role.
              </p>

              <div className="cl-controls" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Tone of Voice</label>
                  <div className="tone-chips" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['professional', 'creative', 'bold', 'modern'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCoverLetterTone(t)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          border: coverLetterTone === t ? '2px solid var(--accent-primary)' : '1px solid var(--border-highlight)',
                          background: coverLetterTone === t ? 'var(--accent-glow)' : '#ffffff',
                          color: coverLetterTone === t ? 'var(--accent-primary)' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Length</label>
                  <div className="segmented-length-control">
                    {[
                      { id: 'short', label: 'Short', desc: 'Email Note (2 paragraphs)' },
                      { id: 'medium', label: 'Medium', desc: 'Standard Letter (3-4 paragraphs)' },
                      { id: 'long', label: 'Long', desc: 'Executive (Full detailed)' }
                    ].map(l => (
                      <button
                        key={l.id}
                        type="button"
                        className={`segmented-length-btn ${coverLetterLength === l.id ? 'active' : ''}`}
                        onClick={() => setCoverLetterLength(l.id)}
                      >
                        <span className="length-title">{l.label}</span>
                        <span className="length-desc">{l.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>


                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateCoverLetter}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '600',
                    marginTop: '8px'
                  }}
                  disabled={isGeneratingCL}
                >
                  {isGeneratingCL ? (
                    <>
                      <FaSpinner className="spinner-icon" style={{ animation: 'spin 1s linear infinite' }} /> Generating...
                    </>
                  ) : (
                    <>
                      <MdAutoAwesome /> Generate Cover Letter
                    </>
                  )}
                </button>
              </div>

              {clError && <p style={{ color: 'var(--status-poor)', fontSize: '0.85rem', marginBottom: '12px' }}>{clError}</p>}

              {coverLetterText && (
                <div className="cover-letter-output" style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Generated Letter</label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(coverLetterText);
                        alert('Cover letter copied to clipboard!');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <MdRocket /> Copy Text
                    </button>
                  </div>
                  <textarea
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    style={{
                      width: '100%',
                      height: '350px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-highlight)',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      lineHeight: '1.6',
                      background: '#ffffff',
                      color: 'var(--text-main)',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>

          </div>

        </main>

        <aside className="right-rail">
          {showResume ? (
            <div className="resume-preview-container" key="resume">
              {fileUrl ? (
                iframeLoaded ? (
                  <iframe
                    src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="resume-iframe"
                    title="Resume Preview"
                  />
                ) : (
                  <div className="resume-loading-skeleton">
                    <MdDescription size={32} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Loading Document...</span>
                  </div>
                )
              ) : (
                <div className="empty-resume-state">
                  <MdDescription size={48} color="#64748b" />
                  <p>Resume preview unavailable</p>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-swap" key="scores">
              {/* SECONDARY SCORE: JD MATCH SCORE - Only show if JD was provided */}
              {resumeData?.hasJobDescription && (
                <div className={`score-circle-container sidebar-version ${getLevel(animatedKeyword).toLowerCase()}`} style={{
                  marginBottom: '20px',
                  background: '#ffffff',
                  border: '1px solid transparent',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: animatedKeyword >= 80 ? '0 8px 20px -4px rgba(16, 185, 129, 0.15)' : animatedKeyword >= 50 ? '0 8px 20px -4px rgba(245, 158, 11, 0.15)' : '0 8px 20px -4px rgba(239, 68, 68, 0.15)'
                }}>
                  <div className="score-circle-wrapper">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path className="circle"
                        strokeDasharray={`${animatedKeyword}, 100`}
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" className="percentage">{animatedKeyword}</text>
                    </svg>
                  </div>
                  <div className="score-text-content">
                    <div className="score-level">{getLevel(animatedKeyword).toUpperCase()}</div>
                    <div className="score-badge">
                      JD MATCH SCORE
                      <div className="tooltip-container" style={{ marginLeft: '6px', display: 'inline-flex', alignItems: 'center' }}>
                        <MdHelpOutline className="info-icon-fixed" />
                        <span className="tooltip-text">How well your resume matches the Job Description (JD) in terms of required skills and keywords. Higher score = better fit for the target role. (0-100)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rail-card">
                <div className="rail-title" style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '12px' }}>Priority Issues</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mistakeIssues.length > 0 && (
                    <div className="priority-card critical" onClick={() => scrollTo(grammarCardRef, true)}>
                      <div className="priority-icon">
                        <MdReportProblem />
                      </div>
                      <div className="priority-content">
                        <h4>Grammar & Spelling</h4>
                        <p className="issue-count">{mistakeIssues.length} Critical Issues</p>
                      </div>
                    </div>
                  )}

                  {missingKeywords.length > 0 && (
                    <div className="priority-card warning" onClick={() => scrollTo(skillsRef, true)}>
                      <div className="priority-icon">
                        <MdDescription />
                      </div>
                      <div className="priority-content">
                        <h4>Skill Gaps</h4>
                        <p className="issue-count">{missingKeywords.length} Missing Skills</p>
                      </div>
                    </div>
                  )}

                  {(analysisData?.atsImprovement?.missingKeywords?.length > 0 || analysisData?.atsImprovement?.formatWarnings?.length > 0) && (
                    <div className="priority-card info" onClick={() => scrollTo(redFlagsRef, true)}>
                      <div className="priority-icon" style={{ color: 'var(--accent-primary)', background: 'var(--accent-glow)' }}>
                        <MdLightbulb />
                      </div>
                      <div className="priority-content">
                        <h4>ATS Improvement</h4>
                        <p className="issue-count">
                          {(analysisData?.atsImprovement?.missingKeywords?.length || 0) + (analysisData?.atsImprovement?.formatWarnings?.length || 0)} Suggestions
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Footer removed as requested */}
      {/* Custom Professional Download Modal */}
      {showDownloadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon bubble-green">
                <MdDescription size={24} />
              </div>
              <h3>Download Analysis Report</h3>
              <button className="close-btn" onClick={() => setShowDownloadModal(false)}>
                <MdClose size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p>You are about to download the comprehensive PDF report for <strong>{resumeName}</strong>.</p>
              <div className="modal-preview-stats">
                <div className="stat-pill">
                  <span className="label">ATS Score</span>
                  <span className="val" style={{ color: '#10b981' }}>{overallScore}/100</span>
                </div>
                <div className="stat-pill">
                  <span className="label">Issues Found</span>
                  <span className="val" style={{ color: '#ef4444' }}>{mistakeIssues.length}</span>
                </div>
              </div>
              <p className="subtext">This report includes the ATS Score breakdown, recruiter impressions, keyword gaps, and a step-by-step improvement plan.</p>
            </div>

            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowDownloadModal(false)}>Cancel</button>
              <button className="btn-primary-modal" onClick={confirmDownload}>
                <MdDownload size={18} />
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StoryGeneration;
