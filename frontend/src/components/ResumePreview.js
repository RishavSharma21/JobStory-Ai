// src/components/ResumePreview.js
import React from 'react';

const ResumePreview = ({ resume }) => {
  if (!resume) {
    return (
      <div className="resume-preview-empty">
        <p>No resume uploaded yet</p>
      </div>
    );
  }

  const { parsedContent } = resume;

  return (
    <div className="resume-preview">
      <div className="resume-header">
        <h3>📄 Resume Overview</h3>
        <div className="resume-info">
          <small>File: {resume.fileName}</small>
          <small>Uploaded: {new Date(resume.uploadDate).toLocaleDateString()}</small>
        </div>
      </div>

      <div className="resume-content">
        {/* Personal Info */}
        <div className="resume-section">
          <h4>Personal Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <strong>Name:</strong> {parsedContent.name}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {parsedContent.email}
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="resume-section">
          <h4>Experience</h4>
          <div className="experience-list">
            {parsedContent.experience?.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="exp-bullet">•</div>
                <span>{exp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="resume-section">
          <h4>Skills</h4>
          <div className="skills-container">
            {parsedContent.skills?.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="resume-section">
          <h4>Education</h4>
          <div className="education-info">
            {parsedContent.education}
          </div>
        </div>

        {/* AI Analysis Score */}
        <div className="resume-section">
          <h4>AI Analysis</h4>
          <div className="analysis-score">
            <div className="score-item">
              <span className="score-label">ATS Compatibility</span>
              <div className="score-bar">
                <div className="score-fill" style={{width: '85%'}}></div>
              </div>
              <span className="score-value">85%</span>
            </div>
            
            <div className="score-item">
              <span className="score-label">Story Potential</span>
              <div className="score-bar">
                <div className="score-fill" style={{width: '92%'}}></div>
              </div>
              <span className="score-value">92%</span>
            </div>
            
            <div className="score-item">
              <span className="score-label">Interview Readiness</span>
              <div className="score-bar">
                <div className="score-fill" style={{width: '78%'}}></div>
              </div>
              <span className="score-value">78%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="resume-actions">
        <button className="action-btn primary">Re-upload Resume</button>
        <button className="action-btn secondary">Download Analysis</button>
      </div>
    </div>
  );
};

export default ResumePreview;