import React, { useMemo, useRef, useState, useEffect } from 'react';
// Using Material Design icon set for a consistent visual language
import { MdSecurity, MdSpellcheck, MdFormatListBulleted, MdReportProblem, MdBuild, MdDownload, MdRefresh, MdDescription, MdAutoAwesome, MdPerson, MdCode, MdEditNote, MdLightbulb, MdRocket, MdLock, MdInfoOutline, MdClose, MdHelpOutline, MdWarning } from 'react-icons/md';
import './StoryGeneration.css';
import { generateCompleteReport } from '../utils/pdfDownload';

const StoryGeneration = ({ resumeData, onSaveToHistory, onBack }) => {
  // Debug: Log the resumeData to see what we're getting
  console.log('🔍 StoryGeneration resumeData:', resumeData);
  console.log('🔍 Analysis data:', resumeData?.analysis);
  console.log('🔍 Full object keys:', resumeData ? Object.keys(resumeData) : 'No resumeData');

  // Safety check - if no resumeData, show loading state
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

  // Bullet rewriter (local)
  const [weakBullet, setWeakBullet] = useState('Worked on frontend');
  const rewrites = useMemo(() => ([
    'Developed and shipped 12+ responsive React components, improving LCP by 32%.',
    'Implemented code-splitting and lazy loading, reducing bundle size by 28%.',
    'Built reusable UI patterns and documentation, accelerating feature delivery by 20%.'
  ]), []);

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
    const hasFinite = Number.isFinite(displayData?.atsScore?.score);
    // NEW: Check for overallScore (new format) or atsScore.score (old format)
    const rawScore = displayData?.overallScore ?? (hasFinite ? displayData.atsScore.score : 75);
    const base = isAIUnavailable ? 75 : rawScore;

    // NEW: Extract Keyword Match Score with Fallback Calculation
    let kScore = displayData?.atsAnalysis?.keywordMatchScore;
    if (typeof kScore !== 'number') {
      // Fallback: Calculate from arrays if explicit score is missing
      // Use the already computed presentSkills and missingKeywords arrays which handle data location fallbacks
      const present = presentSkills.length || 0;
      const missing = missingKeywords.length || 0;
      const total = present + missing;
      // If we have data, calculate percentage. If no data, default to 0.
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
    const score = Math.max(0, Math.min(100, Math.round(base - penalty)));
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
      : `Base ${base} adjusted by ${risks} ATS layout risk(s) (−${penalty}).`;
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
  const redFlagsRef = useRef(null);
  const sectionScoresRef = useRef(null);

  const [activeSection, setActiveSection] = useState('scores');

  // Scroll Spy Logic with IntersectionObserver
  useEffect(() => {
    // Lock variable to prevent observer from fighting manual clicks
    const sections = [
      { ref: sectionScoresRef, id: 'scores' },
      { ref: grammarCardRef, id: 'grammar' },
      { ref: fixesRef, id: 'fixes' },
      { ref: skillsRef, id: 'skills' },
      { ref: redFlagsRef, id: 'redflags' }
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

          <nav className="nav-menu">
            <button className={`nav-btn ${activeSection === 'scores' ? 'active' : ''}`} onClick={() => scrollTo(sectionScoresRef, 'scores')}><MdFormatListBulleted /> Score Breakdown</button>
            <button className={`nav-btn ${activeSection === 'grammar' ? 'active' : ''}`} onClick={() => scrollTo(grammarCardRef, 'grammar')}><MdSpellcheck /> Grammar & Spelling</button>
            <button className={`nav-btn ${activeSection === 'fixes' ? 'active' : ''}`} onClick={() => scrollTo(fixesRef, 'fixes')}><MdBuild /> Quick Fixes</button>
            <button className={`nav-btn ${activeSection === 'skills' ? 'active' : ''}`} onClick={() => scrollTo(skillsRef, 'skills')}><MdDescription /> Skill Gaps</button>
            <button className={`nav-btn ${activeSection === 'redflags' ? 'active' : ''}`} onClick={() => scrollTo(redFlagsRef, 'redflags')}><MdLightbulb /> Recruiter Impression</button>
            {/* Main Action - Updated to open Modal */}
            <button className="btn-download" onClick={handleDownloadClick}>
              <MdDownload size={20} />
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                  {Object.entries(sectionScores).map(([key, val]) => {
                    const sectionTooltips = {
                      education: "Evaluates degree relevance, institution prestige, and clarity.",
                      skills: "Checks for hard/soft skill balance and keyword matching.",
                      projects: "Assesses complexity, tech stack, and impact of projects.",
                      experience: "Analyzes career progression, action verbs, and measurable results.",
                      formatting: "Reviews layout consistency, fonts, and ATS readability."
                    };

                    return (
                      <div key={key} style={{ background: '#ffffff', padding: '20px 16px', border: '1px solid transparent', borderRadius: '14px', textAlign: 'center', transition: 'all 0.3s ease', boxShadow: val >= 8 ? '0 8px 16px -4px rgba(16, 185, 129, 0.12)' : val >= 5 ? '0 8px 16px -4px rgba(245, 158, 11, 0.12)' : '0 8px 16px -4px rgba(239, 68, 68, 0.12)' }}>
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

            {/* 2) GRAMMAR & SPELLING (Clean List) */}
            <div ref={grammarCardRef} id="grammar" className="analysis-card" style={{ scrollMarginTop: '100px' }}>
              <h2><MdSpellcheck /> GRAMMAR & SPELLING</h2>
              <div className="score-explanation" style={{ marginBottom: 12, color: 'var(--text-muted)' }}>Critical errors that hurt your credibility:</div>
              {mistakeIssues.length > 0 ? (
                <ul className="growth-items">
                  {mistakeIssues.map((issue, i) => (
                    <li key={i} style={{
                      color: 'var(--text-main)',
                      borderLeft: '4px solid var(--status-poor)',
                      background: '#ffffff',
                      marginBottom: '12px',
                      padding: '16px 20px',
                      borderRadius: '0 12px 12px 0',
                      border: '1px solid transparent',
                      borderLeftWidth: '4px',
                      boxShadow: '0 4px 12px -2px rgba(239, 68, 68, 0.08)',
                      lineHeight: '1.6'
                    }}>
                      <strong style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.95rem', marginRight: '6px' }}>Correction Needed:</strong> {issue.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg-panel-hover)', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <div>No critical grammar issues detected.</div>
                </div>
              )}
            </div>

            {/* 3) QUICK FIXES (Replaces Action Plan) */}
            <div ref={fixesRef} id="fixes" className="analysis-card" style={{ scrollMarginTop: '100px' }}>
              <h2><MdBuild /> QUICK FIXES</h2>
              <div className="score-explanation" style={{ marginBottom: 12 }}>Immediate improvements you can make:</div>

              {quickFixesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No quick fixes generated. Please re-analyze the resume.
                </div>
              ) : (
                <ul className="strength-items">
                  {quickFixesList.map((fix, idx) => {
                    // Helper to highlight keywords like "IMMEDIATE REMOVAL", "CRITICAL", etc.
                    const highlightKeywords = (text) => {
                      const keywords = ['IMMEDIATE REMOVAL', 'IMMEDIATELY', 'CRITICAL', 'RED FLAG', 'WARNING', 'REMOVE', 'DELETE', 'ADD', 'INCLUDE'];
                      const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');

                      const parts = text.split(regex);
                      return parts.map((part, i) => {
                        if (keywords.some(k => k.toLowerCase() === part.toLowerCase())) {
                          return <span key={i} style={{ color: '#fbbf24', fontWeight: '700' }}>{part}</span>;
                        }
                        return part;
                      });
                    };

                    // Ensure we have a category. If missing, try to infer or default to 'ACTION'.
                    let displayFix = fix;
                    let colonIndex = fix.indexOf(':');

                    // If no colon found, or it's too far into the sentence (likely not a category), force a category
                    if (colonIndex === -1 || colonIndex > 25) {
                      const upperFix = fix.toUpperCase();
                      let inferredCategory = 'ACTION';

                      // Smart inference based on content keywords
                      if (upperFix.includes('EDUCATION') || upperFix.includes('COLLEGE') || upperFix.includes('DEGREE') || upperFix.includes('GPA')) {
                        inferredCategory = 'EDUCATION';
                      } else if (upperFix.includes('SKILL') || upperFix.includes('TECHNOLOG') || upperFix.includes('LANGUAGE') || upperFix.includes('TOOL') || upperFix.includes('GIT') || upperFix.includes('SQL')) {
                        inferredCategory = 'SKILLS';
                      } else if (upperFix.includes('PROJECT')) {
                        inferredCategory = 'PROJECTS';
                      } else if (upperFix.includes('SUMMARY') || upperFix.includes('OBJECTIVE') || upperFix.includes('PROFILE')) {
                        inferredCategory = 'SUMMARY';
                      } else if (upperFix.includes('EXPERIENCE') || upperFix.includes('WORK') || upperFix.includes('INTERNSHIP') || upperFix.includes('JOB')) {
                        inferredCategory = 'EXPERIENCE';
                      } else if (upperFix.includes('FORMAT') || upperFix.includes('LAYOUT') || upperFix.includes('FONT')) {
                        inferredCategory = 'FORMATTING';
                      } else {
                        // Fallback to verb check if no context found
                        const firstWord = fix.split(' ')[0].toUpperCase();
                        if (['DELETE', 'REMOVE', 'ADD', 'FIX', 'CORRECT', 'CLARIFY', 'QUANTIFY'].includes(firstWord)) {
                          inferredCategory = firstWord;
                        }
                      }

                      displayFix = `${inferredCategory}: ${fix}`;
                      colonIndex = displayFix.indexOf(':');
                    }

                    const category = displayFix.substring(0, colonIndex);
                    const content = displayFix.substring(colonIndex + 1);

                    return (
                      <li key={idx} style={{ borderLeft: '4px solid var(--accent-primary)', borderRadius: '0 8px 8px 0', background: '#ffffff', padding: '12px 16px', marginBottom: '8px', border: '1px solid transparent', borderLeftWidth: '4px', boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.08)' }}>
                        <strong style={{ color: 'var(--accent-primary)', marginRight: '8px' }}>→</strong>
                        <span>
                          <strong style={{ color: 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '6px' }}>
                            {category}:
                          </strong>
                          {content}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* 4) Skill & Keyword Gap Analysis */}
            <div ref={skillsRef} id="skills" className="analysis-card" style={{ scrollMarginTop: '100px' }}>
              <h2><MdDescription /> SKILL & KEYWORD GAPS</h2>
              <div className="score-explanation" style={{ marginBottom: 12, color: 'var(--text-muted)' }}>Boost your visibility with these key terms.</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 12 }}>
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid transparent', boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.12)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>✓ Strong Skills</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5' }}>{presentSkills.length > 0 ? presentSkills.join(', ') : 'No skills detected'}</div>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid transparent', boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.12)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>→ Missing Skills</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5' }}>{missingKeywords.length > 0 ? missingKeywords.join(', ') : 'All key skills present'}</div>
                  {missingKeywords.length > 0 && (
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      * Frequently required for {jobRole} roles
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5) ATS Score Improvement (Legacy/Recruiter View) */}
            {/* 5) Recruiter Impression (was ATS Improvement) */}
            <div ref={redFlagsRef} id="redflags" className="analysis-card" style={{ scrollMarginTop: '100px' }}>
              <h2><MdLightbulb /> RECRUITER IMPRESSION</h2>
              <div className="score-explanation" style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>How a human recruiter sees your resume</div>

              <div className="recruiter-grid">
                <div className="recruiter-card">
                  <div className="recruiter-label">
                    Est. Skim Time
                    <div className="tooltip-container" style={{ marginLeft: '6px', display: 'inline-flex', alignItems: 'center' }}>
                      {/* Info icon with tooltip */}
                      <MdHelpOutline className="info-icon-fixed" />
                      <span className="tooltip-text">Estimated time a recruiter spends scanning your resume (Target: 6-10s).</span>
                    </div>
                  </div>
                  <div className="recruiter-value">{recruiterImpression.skimTime || 'N/A'}</div>
                </div>
                <div className="recruiter-card">
                  <div className="recruiter-label">First Impression</div>
                  <div className={`recruiter-value status-${(recruiterImpression.verdict || 'neutral').toLowerCase()}`}>
                    {recruiterImpression.verdict || 'Neutral'}
                  </div>
                </div>
              </div>

              {analysisData?.atsImprovement?.estimatedImprovement ? (
                <>
                  {/* Score Comparison - Clean & Professional */}
                  <div className="score-comparison">
                    <div className="score-block">
                      <div className="score-label-small">Current</div>
                      <div className="score-big">{analysisData.atsImprovement.estimatedImprovement.currentScore}</div>
                    </div>

                    <div className="score-divider">
                      <div className="divider-icon"><MdRocket /></div>
                    </div>

                    <div className="score-block">
                      <div className="score-label-small highlight">Potential</div>
                      <div className="score-big highlight">{analysisData.atsImprovement.estimatedImprovement.potentialScore}</div>
                    </div>
                  </div>

                  {/* Improvement List - Clean Cards */}
                  <div className="improvement-list">
                    {missingKeywords.length > 0 && (
                      <div className="improvement-card">
                        <div className="improvement-icon"><MdDescription /></div>
                        <div className="improvement-content">
                          <div className="improvement-title">Missing Keywords</div>
                          <div className="improvement-desc">
                            Add <span className="text-highlight">{missingKeywords.slice(0, 2).join(', ')}</span> and {missingKeywords.length - 2} others to match the job description.
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="improvement-card">
                      <div className="improvement-icon warn"><MdFormatListBulleted /></div>
                      <div className="improvement-content">
                        <div className="improvement-title">Formatting Issues</div>
                        <div className="improvement-desc">
                          Fix <span className="text-highlight">{analysisData?.formatIssues?.issues?.length || 3} layout problems</span> that might confuse ATS parsers.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium Button - Professional Outline */}
                  <button className="btn-premium">
                    <MdLock className="premium-icon" />
                    <span>Unlock Full Improvement Plan</span>
                  </button>
                </>
              ) : null}
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
              {/* SECONDARY SCORE: JD MATCH SCORE */}
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