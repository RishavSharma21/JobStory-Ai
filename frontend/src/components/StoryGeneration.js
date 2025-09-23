import React, { useState } from 'react';
import './StoryGeneration.css';

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
  const fileSize = resumeData?.fileSize ? `${(resumeData.fileSize / 1024).toFixed(1)} KB` : "Unknown";

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

  const handleDownload = () => {
    console.log('Download report');
  };

  const handleSave = () => {
    if (onSaveToHistory) {
      const historyItem = {
        resumeData: resumeData,
        analysisData: analysisData,
        jobRole: jobRole,
        resumeName: resumeName,
        timestamp: new Date().toISOString()
      };
      onSaveToHistory(historyItem);
    }
    console.log('Save analysis');
  };

  const handleNewAnalysis = () => {
    if (onBack) {
      onBack();
    }
    console.log('Start new analysis');
  };

  return (
    <div className="analysis-page">
      {/* Header with job info */}
      <header className="page-header">
        <div className="header-content">
          <h1 className="page-title">Resume Analysis Report</h1>
          <div className="job-info">
            <span className="job-role">{jobRole}</span>
            <span className="separator"> • </span>
            <span className="resume-name">{resumeName}</span>
          </div>
        </div>
      </header>

      {/* AI Service Status Banner */}
      {isAIUnavailable && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '12px 16px',
          margin: '16px 24px',
          color: '#92400e',
          textAlign: 'center'
        }}>
          <strong>⚠️ AI Service Temporarily Unavailable</strong>
          <br />
          The AI analysis service is experiencing high demand. Showing basic analysis below.
          Please try again in a few minutes for full AI-powered insights.
        </div>
      )}

      {/* Single Main Container */}
      <div className="main-container">
        <div className="page-content">
          {/* Main Analysis Section */}
          <div className="main-analysis">
            {/* Two Column Layout */}
            <div className="analysis-grid">
              {/* ATS Score Card */}
              <div className="analysis-card ats-card">
                <h2>ATS SCORE</h2>
                <div className="score-section">
                  <div className="score-display">
                    <div className="score-number">[{displayData.atsScore.score}]</div>
                    <div className="score-details">
                      <div className="match-level">{displayData.atsScore.level}</div>
                      <div className="score-percent">{displayData.atsScore.score}/100</div>
                    </div>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${displayData.atsScore.score}%` }}></div>
                  </div>
                  <p className="score-explanation">{displayData.atsScore.explanation}</p>
                </div>
              </div>

              {/* Recruiter Insights Card */}
              <div className="analysis-card insights-card">
                <h2>RECRUITER'S FIRST IMPRESSION</h2>
                <div className="insights-content">
                  <blockquote className="recruiter-quote">
                    "{displayData.recruiterInsights.overview}"
                  </blockquote>
                  <div className="quote-attribution">— Hiring Manager Perspective</div>
                </div>
              </div>
            </div>

            {/* Key Strengths & Growth Areas Section */}
            <div className="analysis-card professional-assessment">
              <h2>PROFESSIONAL ASSESSMENT</h2>
              <div className="assessment-grid">
                {/* Key Strengths */}
                <div className="assessment-column">
                  <h3>KEY STRENGTHS</h3>
                  <div className="strengths-grid">
                    <div className="strength-column">
                      <h4>Recruiter Highlights</h4>
                      <ul className="strength-items">
                        {displayData.recruiterInsights.keyStrengths.map((strength, index) => (
                          <li key={index}>▪ {strength}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Growth Areas */}
                <div className="assessment-column">
                  <h3>GROWTH AREAS</h3>
                  <div className="growth-grid">
                    <div className="growth-column">
                      <h4>Areas for Improvement</h4>
                      <ul className="growth-items">
                        {displayData.recruiterInsights.concerningAreas.map((area, index) => (
                          <li key={index}>▪ {area}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="growth-column">
                      <h4>Recommendations</h4>
                      <ul className="growth-items">
                        {displayData.recruiterInsights.recommendations.map((rec, index) => (
                          <li key={index}>▪ {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Features */}
            <div className="analysis-card features-card">
              <h2>UPCOMING FEATURES</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <h3>Interview Questions</h3>
                  <p>STAR method examples</p>
                  <div className="coming-soon">[Soon]</div>
                </div>
                <div className="feature-item">
                  <h3>Red Flag Addressing</h3>
                  <p>Handle concerns professionally</p>
                  <div className="coming-soon">[Soon]</div>
                </div>
                <div className="feature-item">
                  <h3>Success Strategies</h3>
                  <p>Personalized tips</p>
                  <div className="coming-soon">[Soon]</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleDownload}>
              Download Detailed Report
            </button>
            <button className="btn btn-secondary" onClick={handleSave}>
              Save Analysis
            </button>
            <button className="btn btn-tertiary" onClick={handleNewAnalysis}>
              Analyze New Resume
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="page-footer">
        <div className="footer-content">
          © 2024 ResumeCraft AI • Privacy Policy • Terms of Service
        </div>
      </footer>
    </div>
  );
};

export default StoryGeneration;