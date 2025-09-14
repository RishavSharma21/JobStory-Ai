import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { analyzeResume } from '../utils/api';

const Analyze = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resumeData, jobRole } = location.state || {};
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resumeData) {
      navigate('/');
    }
  }, [resumeData, navigate]);

  const handleAnalyze = async () => {
    if (!resumeData || !resumeData.resumeId) {
      setError('No resume data found');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const result = await analyzeResume(resumeData.resumeId, jobRole);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!resumeData) {
    return (
      <div className="analyze-page">
        <h1>No resume data found</h1>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  return (
    <div className="analyze-page">
      <h1>Resume Analysis</h1>
      
      <div className="resume-info">
        <p><strong>Job Role:</strong> {jobRole || "Not specified"}</p>
        <p><strong>Resume:</strong> {resumeData.fileName}</p>
        <p><strong>File Size:</strong> {(resumeData.fileSize / 1024).toFixed(1)} KB</p>
      </div>
      
      {!analysisResult && !isAnalyzing && (
        <div className="analysis-prompt">
          <button onClick={handleAnalyze} className="analyze-button">
            Analyze Resume with AI
          </button>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="analyzing-status">
          <p>Analyzing your resume with AI...</p>
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {analysisResult && (
        <div className="analysis-results">
          <h2>Analysis Complete</h2>
          <div className="ats-score">
            <h3>ATS Compatibility Score</h3>
            <p><strong>Score:</strong> {analysisResult.analysis.atsScore.score}/100</p>
            <p><strong>Level:</strong> {analysisResult.analysis.atsScore.level}</p>
            <p>{analysisResult.analysis.atsScore.explanation}</p>
          </div>
          
          <div className="recruiter-insights">
            <h3>Recruiter Insights</h3>
            <p>{analysisResult.analysis.recruiterInsights}</p>
          </div>
          
          <div className="strengths">
            <h3>Key Strengths</h3>
            {analysisResult.analysis.strengths.map((strength, index) => (
              <div key={index}>
                <h4>{strength.title}</h4>
                <ul>
                  {strength.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="growth-areas">
            <h3>Growth Areas</h3>
            {analysisResult.analysis.growthAreas.map((area, index) => (
              <div key={index}>
                <h4>{area.title}</h4>
                <ul>
                  {area.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/generate', { 
              state: { 
                resumeData: analysisResult,
                jobRole: jobRole 
              } 
            })}
            className="generate-story-button"
          >
            Generate Interview Story
          </button>
        </div>
      )}
    </div>
  );
};

export default Analyze;