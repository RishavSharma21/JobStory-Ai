import React, { useState, useEffect, useMemo } from 'react';
import './AIAnalysisLoader.css';

const AIAnalysisLoader = ({ isVisible = true }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    'Reading resume...',
    'Analyzing content...',
    'Generating insights...',
    'Finalizing report...'
  ];

  useEffect(() => {
    if (!isVisible) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 12;
      });
    }, 800);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isVisible, steps.length]);

  const sparkles = useMemo(() => {
    const count = 14;
    return Array.from({ length: count }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${(Math.random() * 1.8).toFixed(2)}s`,
      duration: `${(3.8 + Math.random() * 2.8).toFixed(2)}s`,
      size: `${(5 + Math.random() * 5).toFixed(0)}px`,
    }));
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="simple-loader-overlay">
      <div className="simple-loader-content">
        {/* Sparkles Animation */}
        <div className="ai-sparkles" aria-hidden="true">
          {sparkles.map((s, i) => (
            <span
              key={i}
              className="sparkle"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                animationDelay: s.delay,
                animationDuration: s.duration,
              }}
            />
          ))}
        </div>

        {/* Processing Prism Sweep */}
        <div className="prism-bar" aria-hidden="true">
          <div className="prism-sweep"></div>
        </div>
        
        {/* Progress Indicator */}
        <div className="simple-progress-container">
          <div className="simple-progress-bar">
            <div 
              className="simple-progress-fill" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="progress-text">{Math.floor(Math.min(progress, 100))}%</div>
        </div>
        
        {/* Current Step */}
        <div className="current-step">
          {steps[currentStep]}
        </div>
        
        {/* Sub Message */}
        <div className="sub-message-simple">
          Please wait while our AI analyzes your resume
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisLoader;