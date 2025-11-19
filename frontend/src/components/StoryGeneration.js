import React, { useMemo, useRef, useState } from 'react';
// Using Material Design icon set for a consistent visual language
import { MdSecurity, MdSpellcheck, MdFormatListBulleted, MdReportProblem, MdBuild, MdDownload, MdRefresh, MdDescription, MdAutoAwesome, MdPerson, MdCode, MdEditNote, MdLightbulb, MdRocket } from 'react-icons/md';
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
  const fileSize = typeof resumeData?.fileSize === 'number' ? `${(resumeData.fileSize / 1024).toFixed(1)} KB` : "Unknown";

  // Use real analysis data from resumeData instead of mock data
  const analysisData = resumeData?.analysis || resumeData?.aiAnalysis || {};
  console.log('🔍 Extracted analysisData:', analysisData);
  
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
    console.log('🔍 Creating safe display data from:', analysisData);
    
    // If we have no analysis data at all, use all fallbacks
    if (!analysisData || Object.keys(analysisData).length === 0) {
      console.log('🔍 No analysis data, using all fallbacks');
      return fallbackData;
    }

    // Build safe data structure piece by piece
    const safeData = {
      atsScore: {
        score: (analysisData.atsScore && typeof analysisData.atsScore.score === 'number') 
          ? analysisData.atsScore.score 
          : fallbackData.atsScore.score,
        level: (analysisData.atsScore && analysisData.atsScore.level) 
          ? analysisData.atsScore.level 
          : fallbackData.atsScore.level,
        explanation: (analysisData.atsScore && analysisData.atsScore.explanation) 
          ? analysisData.atsScore.explanation 
          : fallbackData.atsScore.explanation
      },
      recruiterInsights: {
        overview: (analysisData.recruiterInsights && analysisData.recruiterInsights.overview) 
          ? analysisData.recruiterInsights.overview 
          : fallbackData.recruiterInsights.overview,
        keyStrengths: (analysisData.recruiterInsights && Array.isArray(analysisData.recruiterInsights.keyStrengths)) 
          ? analysisData.recruiterInsights.keyStrengths 
          : fallbackData.recruiterInsights.keyStrengths,
        concerningAreas: (analysisData.recruiterInsights && Array.isArray(analysisData.recruiterInsights.concerningAreas)) 
          ? analysisData.recruiterInsights.concerningAreas 
          : fallbackData.recruiterInsights.concerningAreas,
        recommendations: (analysisData.recruiterInsights && Array.isArray(analysisData.recruiterInsights.recommendations)) 
          ? analysisData.recruiterInsights.recommendations 
          : fallbackData.recruiterInsights.recommendations
      },
      jobMatching: {
        matchPercentage: (analysisData.jobMatching && typeof analysisData.jobMatching.matchPercentage === 'number') 
          ? analysisData.jobMatching.matchPercentage 
          : fallbackData.jobMatching.matchPercentage,
        recommendations: (analysisData.jobMatching && analysisData.jobMatching.recommendations) 
          ? analysisData.jobMatching.recommendations 
          : fallbackData.jobMatching.recommendations
      },
      overallAssessment: (analysisData.overallAssessment && typeof analysisData.overallAssessment === 'string') 
        ? analysisData.overallAssessment 
        : "Analysis in progress..."
    };

    console.log('🔍 Created safe display data:', safeData);
    return safeData;
  };

  const displayData = createSafeDisplayData();

  // ===== Feature mocks & lightweight computations (client-side, zero API) =====
  const text = (resumeData?.extractedText || '').trim();
  const wordCount = useMemo(() => (text ? text.split(/\s+/).length : 0), [text]);
  const estPages = useMemo(() => (wordCount ? (wordCount / 600).toFixed(1) : '0.0'), [wordCount]);

  // Simple readability estimate (proxy to Flesch): longer words/lines => harder
  const readability = useMemo(() => {
    if (!text) return 52;
    const words = text.split(/\s+/);
    const avgLen = words.reduce((a,w)=>a+(w.length||0),0)/(words.length||1);
    const score = Math.max(0, Math.min(100, Math.round(110 - avgLen*10)));
    return score; // 0-100 (higher easier)
  }, [text]);

  // Passive ratio not shown separately after UI changes

  // Skills present/missing from REAL AI data
  const presentSkills = Array.isArray(analysisData?.keywordAnalysis?.presentKeywords) 
    ? analysisData.keywordAnalysis.presentKeywords 
    : [];
  const missingKeywords = Array.isArray(analysisData?.keywordAnalysis?.missingKeywords)
    ? analysisData.keywordAnalysis.missingKeywords
    : [];

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

  // Format score from REAL AI ATS score
  const formatScore = displayData?.atsScore?.score || 0;

  // Red flags from REAL AI data
  const redFlags = grammarSpelling.length > 0 ? grammarSpelling : ['No critical issues detected'];

  // Bullet rewriter (local)
  const [weakBullet, setWeakBullet] = useState('Worked on frontend');
  const rewrites = useMemo(() => ([
    'Developed and shipped 12+ responsive React components, improving LCP by 32%.',
    'Implemented code-splitting and lazy loading, reducing bundle size by 28%.',
    'Built reusable UI patterns and documentation, accelerating feature delivery by 20%.'
  ]), []);

  // Achievement suggestions from REAL AI quick fixes
  const achievements = Array.isArray(analysisData?.growthAreas)
    ? analysisData.growthAreas
    : (Array.isArray(analysisData?.strengths) ? analysisData.strengths : ['No recommendations available']);

  // ATS Compatibility Checker (heuristics)
  const atsCompatibility = useMemo(() => {
    const lower = text.toLowerCase();
    const lines = text.split(/\n+/);
    const scannable = text.length > 50; // selectable text present
    const tablesDetected = /\||\t/.test(text);
    const iconsDetected = /(icon|svg|png|jpg|jpeg)/i.test(text);
    const shortLines = lines.filter(l => l.trim().length > 0 && l.trim().length <= 25).length;
    const columnsSuspected = lines.length > 120 && shortLines/Math.max(1, lines.length) > 0.55; // crude signal
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
    const base = isAIUnavailable ? 75 : (hasFinite ? displayData.atsScore.score : 75);
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
    return { score, level, explanation };
  }, [displayData, atsCompatibility, isAIUnavailable, wordCount]);

  const chipClass = (ok, warn=false) => ok ? 'chip good' : (warn ? 'chip warn' : 'chip bad');

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

  const handleDownload = async () => {
    try {
      generateCompleteReport(analysisData, jobRole, resumeName, achievements);
      console.log('✅ Complete analysis report downloaded successfully');
    } catch (error) {
      console.error('❌ Error generating report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const handleNewAnalysis = () => {
    if (onBack) {
      onBack();
    }
    console.log('Start new analysis');
  };

  // Refs for quick navigation
  const atsRef = useRef(null);
  const mistakesRef = useRef(null);
  const grammarRef = useRef(null);
  const fixesRef = useRef(null);
  const skillsRef = useRef(null);

  const scrollTo = (ref, highlight = true) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (highlight) {
        // Remove any existing highlight first
        ref.current.classList.remove('flash-highlight');
        // Force reflow to trigger animation restart
        void ref.current.offsetWidth;
        ref.current.classList.add('flash-highlight');
        setTimeout(() => ref.current && ref.current.classList.remove('flash-highlight'), 1500);
      }
    }
  };

  return (
    <div className="analysis-page">
      {/* Header with job info */}
      <header className="page-header">
        <div className="header-content">
          {/* <h5 className="page-title gradient-text">Smart Resume INSIGHTS</h5> */}
          
          <div className="job-info pill-row">
            <br/>
           
            <span className="pill primary">{jobRole}</span>
            <span className="pill muted">{resumeName}</span>
            
          </div>
        </div>
      </header>

      {/* Removed legacy horizontal quick navigation chips for cleaner layout (side nav retained) */}

      {/* AI Service Status Banner */}
      {/* AI service banner intentionally removed as requested */}

      {/* Single Main Container within a sticky holder to preserve top gap */}
      <div className="container-sticky">
        <div className="main-container">
          <div className="page-content">
          {/* Page Shell: left overview/nav | center content | right quick fixes */}
          <div className="page-shell">
            <aside className="left-rail">
              <div className="rail-card">
                <div className="rail-title">Overview</div>
                <div className="rail-kpis">
                  <div className="rail-kpi" style={{background: atsCombined.score >= 75 ? 'rgba(34,197,94,0.1)' : atsCombined.score >= 50 ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${atsCombined.score >= 75 ? 'rgba(34,197,94,0.25)' : atsCombined.score >= 50 ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'}`}}>
                    <span className="rail-kpi-label">ATS Score</span>
                    <span className="rail-kpi-value" style={{color: atsCombined.score >= 75 ? '#22c55e' : atsCombined.score >= 50 ? '#fbbf24' : '#ef4444'}}>{atsCombined.score}</span>
                  </div>
                  <div className="rail-kpi" style={{background: atsIssuesCount === 0 ? 'rgba(34,197,94,0.1)' : atsIssuesCount <= 2 ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${atsIssuesCount === 0 ? 'rgba(34,197,94,0.25)' : atsIssuesCount <= 2 ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'}`}}>
                    <span className="rail-kpi-label">Issues Found</span>
                    <span className="rail-kpi-value" style={{color: atsIssuesCount === 0 ? '#22c55e' : atsIssuesCount <= 2 ? '#fbbf24' : '#ef4444'}}>{atsIssuesCount}</span>
                  </div>
                  <div className="rail-kpi" style={{background: readability === 'Easy' ? 'rgba(34,197,94,0.1)' : readability === 'Moderate' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${readability === 'Easy' ? 'rgba(34,197,94,0.25)' : readability === 'Moderate' ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'}`}}>
                    <span className="rail-kpi-label">Readability</span>
                    <span className="rail-kpi-value" style={{color: readability === 'Easy' ? '#22c55e' : readability === 'Moderate' ? '#fbbf24' : '#f59e0b'}}>{readability}</span>
                  </div>
                </div>
                <div className="progress-container" style={{marginTop:8}}>
                  <div className="progress-bar" style={{ width: `${atsCombined.score}%`, background: atsCombined.score >= 75 ? 'linear-gradient(90deg, #22c55e, #10b981)' : atsCombined.score >= 50 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #ef4444, #dc2626)' }}></div>
                </div>
              </div>
              <nav className="side-nav">
                <button className="side-link" onClick={()=>scrollTo(atsRef)}><MdSecurity /> ATS Score</button>
                <button className="side-link" onClick={()=>scrollTo(mistakesRef)}><MdSpellcheck /> Grammar & Spelling</button>
                <button className="side-link" onClick={()=>scrollTo(grammarRef)}><MdLightbulb /> ATS Improvement</button>
                <button className="side-link" onClick={()=>scrollTo(fixesRef)}><MdBuild /> Quick Fixes</button>
                <button className="side-link" onClick={()=>scrollTo(skillsRef)}><MdDescription /> Skill Gaps</button>
                <div className="coming-soon-section">
                  <div className="coming-soon-label">Coming Soon</div>
                  <button className="side-link coming-soon-link"><MdFormatListBulleted /> Job Description Match</button>
                  <button className="side-link coming-soon-link"><MdAutoAwesome /> Bullet Point Analyzer</button>
                </div>
              </nav>
            </aside>

            <main className="content-rail">
              <div className="main-analysis">
            {/* 1) ATS Score + Full ATS Compatibility Check */}
            <div ref={atsRef} id="ats" className="analysis-card ats-card">
              <h2><MdSecurity /> ATS SCORE & COMPATIBILITY</h2>
              <div className="kpi-grid" style={{marginBottom:12}}>
                <div className="kpi-card">
                  <div className="kpi-title">ATS Score</div>
                  <div className="kpi-value">{atsCombined.score}/100 <span style={{fontSize:12, opacity:0.7}}>({atsCombined.level})</span></div>
                  <div className="progress-container" style={{marginTop:8}}>
                    <div className="progress-bar" style={{ width: `${atsCombined.score}%` }}></div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Readability Score</div>
                  <div className="kpi-value">{readability}/100</div>
                  <div className="progress-container" style={{marginTop:8}}>
                    <div className="progress-bar" style={{ width: `${readability}%` }}></div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Format Score</div>
                  <div className="kpi-value">{formatScore}/100</div>
                  <div className="progress-container" style={{marginTop:8}}>
                    <div className="progress-bar" style={{ width: `${formatScore}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="chip-row" style={{marginBottom:12}}>
                <span className={chipClass(atsCompatibility.scannable)}>Selectable Text</span>
                <span className={chipClass(!atsCompatibility.tablesDetected, true)}>No Tables</span>
                <span className={chipClass(!atsCompatibility.iconsDetected, true)}>No Icons</span>
                <span className={chipClass(!atsCompatibility.columnsSuspected, true)}>Single Column</span>
                <span className={chipClass(!atsCompatibility.headerFooter, true)}>No Header/Footer</span>
                <span className={chipClass(!atsCompatibility.lowContrast, true)}>Readable Contrast</span>
                <span className={chipClass(!atsCompatibility.fancyFonts, true)}>ATS-safe Fonts</span>
              </div>
              <div className="score-explanation" style={{marginBottom:6}}>{atsCombined.explanation}</div>
              <div className="score-explanation" style={{opacity:0.85}}>Tip: Prefer simple single-column layout, avoid tables/icons, keep text selectable.</div>
            </div>

            {/* 2) Grammar + Spelling + Weak Language Detector */}
            <div ref={mistakesRef} id="grammar" className="analysis-card">
              <h2><MdSpellcheck /> GRAMMAR, SPELLING & LANGUAGE</h2>
              <div className="score-explanation" style={{marginBottom:12}}>Issues found in your resume:</div>
              {mistakeIssues.length > 0 ? (
                <>
                  <ul className="growth-items">
                    {mistakeIssues.slice(0, 5).map((m, i) => (
                      <li key={i}><strong>{m.type}:</strong> {m.text}</li>
                    ))}
                  </ul>
                  <div className="score-explanation" style={{marginTop:12, fontSize:'0.9rem'}}>💡 Tip: Weak verbs like "helped" and "worked" hurt your resume. Use strong action verbs instead.</div>
                </>
              ) : (
                <div style={{padding:'16px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'10px', textAlign:'center'}}>
                  <div style={{fontSize:'2rem', marginBottom:'8px'}}>✓</div>
                  <div style={{color:'#22c55e', fontSize:'1rem', fontWeight:'600', marginBottom:'4px'}}>No Grammar or Spelling Errors Found!</div>
                  <div style={{color:'#86efac', fontSize:'0.85rem'}}>Your resume is grammatically clean and ready to go.</div>
                </div>
              )}
            </div>

            {/* 3) ATS Score Improvement Guide - Coming Soon */}
            <div ref={grammarRef} id="ats-improvement" className="analysis-card">
              <h2><MdLightbulb /> BOOST YOUR ATS SCORE</h2>
              
              {/* Coming Soon Message */}
              <div style={{background:'linear-gradient(135deg, rgba(30,41,59,0.6), rgba(30,41,59,0.4))', border:'2px solid rgba(129,140,248,0.25)', borderRadius:'16px', padding:'40px 32px', textAlign:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.25)'}}>
                <MdRocket style={{fontSize:'3rem', color:'#818cf8', marginBottom:'16px'}} />
                <div style={{fontSize:'1.5rem', fontWeight:'700', color:'#818cf8', marginBottom:'12px'}}>Coming Soon</div>
                <div style={{fontSize:'0.95rem', color:'#94a3b8', lineHeight:'1.6'}}>Advanced ATS improvement features with personalized recommendations<br/>and step-by-step guidance will be available soon.</div>
              </div>
              
              {analysisData?.atsImprovement?.estimatedImprovement && false ? (
                <>
                  <div style={{background:'linear-gradient(135deg, rgba(30,41,59,0.6), rgba(30,41,59,0.4))', border:'2px solid rgba(129,140,248,0.25)', borderRadius:'16px', padding:'28px 32px', marginBottom:'24px', boxShadow:'0 8px 24px rgba(0,0,0,0.25)', display:'none'}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-around', gap:'24px'}}>
                      <div style={{textAlign:'center', flex:'1'}}>
                        <div style={{fontSize:'0.7rem', color:'#94a3b8', marginBottom:'8px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px'}}>Current Score</div>
                        <div style={{fontSize:'3rem', fontWeight:'900', color:'#f59e0b', lineHeight:'1', textShadow:'0 2px 8px rgba(245,158,11,0.3)'}}>
                          {analysisData.atsImprovement.estimatedImprovement.currentScore}<span style={{fontSize:'1.8rem', color:'#fbbf24'}}>%</span>
                        </div>
                      </div>
                      <div style={{fontSize:'2.5rem', color:'#818cf8', fontWeight:'700', padding:'0 16px'}}>→</div>
                      <div style={{textAlign:'center', flex:'1'}}>
                        <div style={{fontSize:'0.7rem', color:'#94a3b8', marginBottom:'8px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px'}}>Target Score</div>
                        <div style={{fontSize:'3rem', fontWeight:'900', color:'#22c55e', lineHeight:'1', textShadow:'0 2px 8px rgba(34,197,94,0.3)'}}>
                          {analysisData.atsImprovement.estimatedImprovement.potentialScore}<span style={{fontSize:'1.8rem', color:'#4ade80'}}>%</span>
                        </div>
                      </div>
                      <div style={{background:'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))', border:'2px solid rgba(34,197,94,0.4)', borderRadius:'12px', padding:'16px 24px', flex:'0.8', textAlign:'center', boxShadow:'0 4px 12px rgba(34,197,94,0.15)'}}>
                        <div style={{fontSize:'0.7rem', color:'#86efac', marginBottom:'6px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.8px'}}>Boost</div>
                        <div style={{fontSize:'2rem', fontWeight:'900', color:'#22c55e', textShadow:'0 2px 6px rgba(34,197,94,0.25)'}}>+{analysisData.atsImprovement.estimatedImprovement.potentialScore - analysisData.atsImprovement.estimatedImprovement.currentScore}<span style={{fontSize:'1.3rem'}}>%</span></div>
                      </div>
                    </div>
                    <div style={{fontSize:'0.85rem', color:'#e0e7ff', background:'rgba(99,102,241,0.15)', padding:'12px 18px', borderRadius:'8px', marginTop:'20px', textAlign:'center', border:'1px solid rgba(129,140,248,0.2)'}}>
                      💡 Add the items below to increase your ATS score by <strong style={{color:'#22c55e', fontSize:'0.95rem'}}>{analysisData.atsImprovement.estimatedImprovement.potentialScore - analysisData.atsImprovement.estimatedImprovement.currentScore} points</strong>
                    </div>
                  </div>

                  {/* Specific Line-by-Line Suggestions */}
                  {analysisData?.atsImprovement?.quickFixes && analysisData.atsImprovement.quickFixes.length > 0 && (
                    <div style={{marginBottom:'20px'}}>
                      <div style={{fontSize:'1rem', fontWeight:'700', color:'#22c55e', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px'}}>
                        <span>✨</span> Copy-Paste These Improvements
                      </div>
                      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                        {analysisData.atsImprovement.quickFixes.map((fix, idx) => {
                          // Parse suggestion format: "Location: Change 'before' → 'after'"
                          const parts = fix.split('→');
                          const hasBefore = parts.length === 2;
                          const beforePart = hasBefore ? parts[0].trim() : fix;
                          const afterPart = hasBefore ? parts[1].trim() : '';
                          
                          return (
                            <div key={idx} style={{background:'rgba(34,197,94,0.08)', border:'1.5px solid rgba(34,197,94,0.25)', borderRadius:'10px', padding:'14px'}}>
                              <div style={{fontSize:'0.85rem', color:'#86efac', marginBottom:'8px', fontWeight:'600', display:'flex', alignItems:'center', gap:'6px'}}>
                                <span style={{background:'rgba(34,197,94,0.2)', borderRadius:'4px', padding:'2px 8px', fontSize:'0.75rem'}}>#{idx+1}</span>
                                {beforePart.split(':')[0]}
                              </div>
                              {hasBefore ? (
                                <>
                                  <div style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'6px', padding:'10px', marginBottom:'8px'}}>
                                    <div style={{fontSize:'0.7rem', color:'#fca5a5', marginBottom:'4px', fontWeight:'600'}}>❌ BEFORE (Remove this):</div>
                                    <div style={{fontSize:'0.88rem', color:'#fecaca', fontFamily:'monospace', lineHeight:'1.5'}}>{parts[0].includes(':') ? parts[0].split(':').slice(1).join(':').trim().replace(/["']/g, '') : parts[0].trim()}</div>
                                  </div>
                                  <div style={{background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'6px', padding:'10px'}}>
                                    <div style={{fontSize:'0.7rem', color:'#86efac', marginBottom:'4px', fontWeight:'600'}}>✅ AFTER (Add this line):</div>
                                    <div style={{fontSize:'0.88rem', color:'#bbf7d0', fontFamily:'monospace', lineHeight:'1.5', fontWeight:'500'}}>{afterPart.replace(/["']/g, '')}</div>
                                  </div>
                                </>
                              ) : (
                                <div style={{background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'6px', padding:'10px'}}>
                                  <div style={{fontSize:'0.7rem', color:'#86efac', marginBottom:'4px', fontWeight:'600'}}>✅ ADD THIS:</div>
                                  <div style={{fontSize:'0.88rem', color:'#bbf7d0', fontFamily:'monospace', lineHeight:'1.5', fontWeight:'500'}}>{fix.includes(':') ? fix.split(':').slice(1).join(':').trim() : fix}</div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Missing Keywords - Add to Skills Section */}
                  {analysisData?.atsImprovement?.missingKeywords && analysisData.atsImprovement.missingKeywords.length > 0 && (
                    <div style={{marginBottom:'18px'}}>
                      <div style={{fontSize:'0.95rem', fontWeight:'700', color:'#fbbf24', marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px'}}>
                        <span>🔑</span> Add These to Skills Section
                      </div>
                      <div style={{background:'rgba(251,191,36,0.08)', padding:'14px', borderRadius:'8px', border:'1px solid rgba(251,191,36,0.2)'}}>
                        <div style={{fontSize:'0.75rem', color:'#fcd34d', marginBottom:'8px'}}>Copy-paste this line to your Skills section:</div>
                        <div style={{background:'rgba(251,191,36,0.15)', borderRadius:'6px', padding:'10px', fontFamily:'monospace', fontSize:'0.9rem', color:'#fef3c7', fontWeight:'500'}}>
                          {analysisData.atsImprovement.missingKeywords.join(' • ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Format Warnings */}
                  {analysisData?.atsImprovement?.formatWarnings && analysisData.atsImprovement.formatWarnings.length > 0 && (
                    <div style={{marginBottom:'18px'}}>
                      <div style={{fontSize:'0.95rem', fontWeight:'700', color:'#ef4444', marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px'}}>
                        <span>🚫</span> Fix These Format Issues
                      </div>
                      <div style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'8px', padding:'12px'}}>
                        <ul className="strength-items" style={{marginBottom:0}}>
                          {analysisData.atsImprovement.formatWarnings.map((warning, idx) => (
                            <li key={idx} style={{color:'#fca5a5', fontSize:'0.85rem', fontWeight:'500'}}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* 4) Actionable Fix Suggestions */}
            <div ref={fixesRef} id="fixes" className="analysis-card">
              <h2><MdBuild /> QUICK FIXES - DO THIS NOW</h2>
              <div className="score-explanation" style={{marginBottom:12}}>Specific improvements you can make immediately:</div>
              <ul className="strength-items" style={{marginBottom:12}}>
                {achievements.map((fix, idx) => (
                  <li key={idx}><strong>✓</strong> {fix}</li>
                ))}
              </ul>
            </div>

            {/* 6) Skill & Keyword Gap Analysis */}
            <div ref={skillsRef} id="skills" className="analysis-card">
              <h2><MdDescription /> SKILL & KEYWORD GAPS</h2>
              <div className="score-explanation" style={{marginBottom:12}}>Compare your resume against job descriptions:</div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:10, marginBottom:12}}>
                <div style={{background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'10px', padding:'12px'}}>
                  <div style={{fontSize:'0.85rem', fontWeight:'600', color:'#22c55e', marginBottom:'8px'}}>✓ Strong Skills</div>
                  <div style={{fontSize:'0.9rem', color:'#cbd5e1'}}>{presentSkills.length > 0 ? presentSkills.join(', ') : 'No skills detected'}</div>
                </div>
                <div style={{background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'10px', padding:'12px'}}>
                  <div style={{fontSize:'0.85rem', fontWeight:'600', color:'#f59e0b', marginBottom:'8px'}}>⚠ Missing Hard Skills</div>
                  <div style={{fontSize:'0.9rem', color:'#cbd5e1'}}>{missingKeywords.length > 0 ? missingKeywords.join(', ') : 'All key skills present'}</div>
                </div>
              </div>
              <div className="score-explanation" style={{marginTop:12, fontSize:'0.9rem'}}>💡 Tip: Use "Coming Soon - Job Description Match" to automatically detect missing skills for any role.</div>
            </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={handleDownload}>
                  <MdDownload style={{marginRight: '6px'}} /> Download Report
                </button>
                <button className="btn btn-secondary" onClick={handleNewAnalysis}>
                  <MdRefresh style={{marginRight: '6px'}} /> Analyze New Resume
                </button>
              </div>
            </main>

            <aside className="right-rail">
              <div className="rail-card">
                <div className="rail-title">Priority Issues</div>
                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                  {mistakeIssues.length > 0 && (
                    <div style={{background:'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'12px', padding:'16px', cursor:'pointer', transition:'all 0.3s ease'}} onClick={()=>scrollTo(mistakesRef, true)}>
                      <div style={{display:'flex', gap:'10px', alignItems:'flex-start'}}>
                        <MdEditNote style={{color:'#fca5a5', fontSize:'1.4rem', flexShrink:0}} />
                        <div>
                          <div style={{fontSize:'0.7rem', fontWeight:'800', color:'#fca5a5', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px'}}>Spelling</div>
                          <div style={{fontSize:'1rem', color:'#cbd5e1', fontWeight:'500'}}>{mistakeIssues.length} issue{mistakeIssues.length > 1 ? 's' : ''} found</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {mistakeIssues.length > 0 && (
                    <div style={{background:'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'16px', cursor:'pointer', transition:'all 0.3s ease'}} onClick={()=>scrollTo(mistakesRef, true)}>
                      <div style={{display:'flex', gap:'10px', alignItems:'flex-start'}}>
                        <MdSpellcheck style={{color:'#fbbf24', fontSize:'1.4rem', flexShrink:0}} />
                        <div>
                          <div style={{fontSize:'0.7rem', fontWeight:'800', color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px'}}>Grammar</div>
                          <div style={{fontSize:'1rem', color:'#cbd5e1', fontWeight:'500'}}>{mistakeIssues.length} issue{mistakeIssues.length > 1 ? 's' : ''} found</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {(analysisData?.atsImprovement?.missingKeywords?.length > 0 || analysisData?.atsImprovement?.formatWarnings?.length > 0) && (
                    <div style={{background:'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(168,85,247,0.04) 100%)', border:'1px solid rgba(168,85,247,0.2)', borderRadius:'12px', padding:'16px', cursor:'pointer', transition:'all 0.3s ease'}} onClick={()=>scrollTo(grammarRef, true)}>
                      <div style={{display:'flex', gap:'10px', alignItems:'flex-start'}}>
                        <MdLightbulb style={{color:'#d8b4fe', fontSize:'1.4rem', flexShrink:0}} />
                        <div>
                          <div style={{fontSize:'0.7rem', fontWeight:'800', color:'#d8b4fe', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px'}}>ATS Improvement</div>
                          <div style={{fontSize:'1rem', color:'#cbd5e1', fontWeight:'500'}}>
                            {(analysisData?.atsImprovement?.missingKeywords?.length || 0) + (analysisData?.atsImprovement?.formatWarnings?.length || 0)} issue{((analysisData?.atsImprovement?.missingKeywords?.length || 0) + (analysisData?.atsImprovement?.formatWarnings?.length || 0)) > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {missingKeywords.length > 0 && (
                    <div style={{background:'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 100%)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'12px', padding:'16px', cursor:'pointer', transition:'all 0.3s ease'}} onClick={()=>scrollTo(skillsRef, true)}>
                      <div style={{display:'flex', gap:'10px', alignItems:'flex-start'}}>
                        <MdDescription style={{color:'#86efac', fontSize:'1.4rem', flexShrink:0}} />
                        <div>
                          <div style={{fontSize:'0.7rem', fontWeight:'800', color:'#86efac', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px'}}>Skill Gaps</div>
                          <div style={{fontSize:'1rem', color:'#cbd5e1', fontWeight:'500'}}>
                            {missingKeywords.length} missing skill{missingKeywords.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
          </div>
        </div>
      </div>

      {/* Footer removed as requested */}
    </div>
  );
};

export default StoryGeneration;