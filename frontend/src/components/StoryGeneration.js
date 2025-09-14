import React, { useState } from 'react';
import './StoryGeneration.css';

const StoryGeneration = ({ resumeData, onSaveToHistory, onBack }) => {
  // Extract job role and resume name from resumeData
  const jobRole = resumeData?.targetJobRole || "Not specified";
  const resumeName = resumeData?.fileName || "resume.pdf";
  const fileSize = resumeData?.fileSize ? `${(resumeData.fileSize / 1024).toFixed(1)} KB` : "Unknown";

  // Use real analysis data from resumeData instead of mock data
  const analysisData = resumeData?.analysis || {
    atsScore: {
      score: 78,
      level: "Good Match",
      explanation: "Your resume aligns well with the job requirements but could benefit from more specific keywords and quantified results."
    },
    recruiterInsights: "Candidate appears to be a solid backend developer with good API experience and project ownership. However, lacks quantifiable achievements and limited cloud exposure.",
    strengths: [
      {
        title: "Technical Skills",
        items: [
          "Strong programming foundation",
          "Multiple technology experience",
          "Problem-solving capability"
        ]
      },
      {
        title: "Project Experience",
        items: [
          "Led development projects",
          "Improved system performance",
          "Team collaboration experience"
        ]
      }
    ],
    growthAreas: [
      {
        title: "Quantifiable Achievements",
        items: [
          "Add specific metrics to accomplishments",
          "Include measurable business impact"
        ]
      },
      {
        title: "Industry Keywords",
        items: [
          "Include more role-specific terminology",
          "Add relevant technical skills for Software Engineer"
        ]
      }
    ]
  };

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
                    <div className="score-number">[{analysisData.atsScore.score}]</div>
                    <div className="score-details">
                      <div className="match-level">{analysisData.atsScore.level}</div>
                      <div className="score-percent">{analysisData.atsScore.score}/100</div>
                    </div>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${analysisData.atsScore.score}%` }}></div>
                  </div>
                  <p className="score-explanation">{analysisData.atsScore.explanation}</p>
                </div>
              </div>

              {/* Recruiter Insights Card */}
              <div className="analysis-card insights-card">
                <h2>RECRUITER'S FIRST IMPRESSION</h2>
                <div className="insights-content">
                  <blockquote className="recruiter-quote">
                    "{analysisData.recruiterInsights}"
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
                    {analysisData.strengths.map((strength, index) => (
                      <div key={index} className="strength-column">
                        <h4>{strength.title}</h4>
                        <ul className="strength-items">
                          {strength.items.map((item, itemIndex) => (
                            <li key={itemIndex}>▪ {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth Areas */}
                <div className="assessment-column">
                  <h3>GROWTH AREAS</h3>
                  <div className="growth-grid">
                    {analysisData.growthAreas.map((area, index) => (
                      <div key={index} className="growth-column">
                        <h4>{area.title}</h4>
                        <ul className="growth-items">
                          {area.items.map((item, itemIndex) => (
                            <li key={itemIndex}>▪ {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
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