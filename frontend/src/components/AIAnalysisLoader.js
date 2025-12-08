import React, { useState, useEffect } from 'react';
import './AIAnalysisLoader.css';

const AIAnalysisLoader = ({ isVisible = false }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const funnyLines = [
    "Convincing AI you're not a robot...",
    "Ghosting your resume to make it mysterious...",
    "Teaching AI why you ghosted that internship...",
    "Making your resume look less desperate...",
    "Hiding those gap months from the matrix...",
    "Translating 'fresher' to 'potential legend'...",
    "Converting caffeine into qualifications...",
    "Explaining why you said 'pending' for everything...",
    "Turning 'I can learn' into 'I'm an expert'...",
    "Briefing AI about your Netflix learning spree...",
    "Making 'debugging my life' sound professional...",
    "Your resume is buffering like your WiFi...",
    "AI is judging your projects... positively 😏",
    "Compressing your personality into bullet points...",
    "Making 'YouTube tutorials' sound like research...",
    "Your resume just got ghosted by the recruiter...",
    "Waiting for a callback like waiting for your ex...",
    "Your GPA and your love life both need work...",
    "This resume is less organized than your relationship...",
    "If only finding a job was as easy as finding a GF...",
    "Your commit history is messier than your breakup...",
    "Portfolio's so empty, even your ex left it alone...",
    "Skills section longer than your attention span in love...",
    "Your resume is on read, not replied like your messages...",
    "This takes longer than waiting for a text back...",
    "AI's reading your resume like your GF reads messages... slowly...",
    "Your projects are more abandoned than your relationships...",
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentLineIndex(0);
      return;
    }

    const lineInterval = setInterval(() => {
      setCurrentLineIndex(prev => (prev + 1) % funnyLines.length);
    }, 2000);

    return () => clearInterval(lineInterval);
  }, [isVisible, funnyLines.length]);

  if (!isVisible) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <h2>Analyzing Your Resume</h2>
        <p className="funny-line">{funnyLines[currentLineIndex]}</p>
        <div className="loader-progress">
          <div className="loader-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisLoader;
