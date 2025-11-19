import React, { useState, useEffect } from 'react';
import './AIAnalysisLoader.css';

const AIAnalysisLoader = ({ isVisible = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    '📄 Parsing Resume',
    '🔍 Analyzing Content', 
    '⚡ Checking ATS Score',
    '✨ Generating Insights'
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const increment = prev < 30 ? Math.floor(Math.random() * 8) + 3 :
                         prev < 60 ? Math.floor(Math.random() * 5) + 2 :
                         prev < 85 ? Math.floor(Math.random() * 3) + 1 :
                         Math.random() > 0.7 ? 1 : 0;
        return Math.min(prev + increment, 95);
      });
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible, steps.length]);

  if (!isVisible) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <h2>{steps[currentStep]}</h2>
        <p>Powered by Gemini AI</p>
        <div className="loader-progress">
          <div className="loader-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="loader-percentage">{Math.round(progress)}%</div>
        
        <div className="step-indicators">
          {steps.map((_, idx) => (
            <div key={idx} className={`step-dot ${idx === currentStep ? 'active' : idx < currentStep ? 'completed' : ''}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisLoader;
