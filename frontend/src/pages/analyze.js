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
      <h1>🎓 Campus Placement Analysis</h1>
      
      <div className="resume-info">
        <p><strong>🎯 Target Role:</strong> {jobRole || "Not specified"}</p>
        <p><strong>📄 Resume:</strong> {resumeData.fileName}</p>
        <p><strong>📊 File Size:</strong> {(resumeData.fileSize / 1024).toFixed(1)} KB</p>
      </div>
      
      {!analysisResult && !isAnalyzing && (
        <div className="analysis-prompt">
          <button onClick={handleAnalyze} className="analyze-button">
            🚀 Analyze Resume for Campus Placement
          </button>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="analyzing-status">
          <p>🤖 Analyzing your resume for campus placement readiness...</p>
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
          <h2>🎯 Campus Placement Analysis Complete</h2>
          
          <div className="campus-readiness-score">
            <h3>📊 Campus Readiness Score</h3>
            <p><strong>Score:</strong> {analysisResult.analysis?.campusReadinessScore?.score || analysisResult.analysis?.atsScore?.score || 0}/100</p>
            <p><strong>Level:</strong> {analysisResult.analysis?.campusReadinessScore?.level || analysisResult.analysis?.atsScore?.level || 'N/A'}</p>
            <p>{analysisResult.analysis?.campusReadinessScore?.explanation || analysisResult.analysis?.atsScore?.explanation || 'No explanation available'}</p>
          </div>
          
          <div className="recruiter-insights">
            <h3>👨‍💼 Placement Coordinator Insights</h3>
            <p>{analysisResult.analysis?.recruiterInsights?.overview || 'No insights available'}</p>
          </div>
          
          <div className="technical-strengths">
            <h3>💻 Technical Strengths</h3>
            {analysisResult.analysis?.recruiterInsights?.technicalStrengths?.map((strength, index) => (
              <div key={index}>
                <p>• {strength}</p>
              </div>
            )) || analysisResult.analysis?.recruiterInsights?.keyStrengths?.map((strength, index) => (
              <div key={index}>
                <p>• {strength}</p>
              </div>
            )) || <p>No technical strengths data available</p>}
          </div>
          
          <div className="academic-highlights">
            <h3>🎓 Academic Highlights</h3>
            {analysisResult.analysis?.recruiterInsights?.academicHighlights?.map((highlight, index) => (
              <div key={index}>
                <p>• {highlight}</p>
              </div>
            )) || <p>No academic highlights available</p>}
          </div>
          
          <div className="improvement-areas">
            <h3>🔧 Areas for Improvement</h3>
            {analysisResult.analysis?.recruiterInsights?.areasForImprovement?.map((area, index) => (
              <div key={index}>
                <p>• {area}</p>
              </div>
            )) || analysisResult.analysis?.recruiterInsights?.concerningAreas?.map((area, index) => (
              <div key={index}>
                <p>• {area}</p>
              </div>
            )) || <p>No improvement areas data available</p>}
          </div>

          <div className="placement-advice">
            <h3>💡 Placement Preparation Advice</h3>
            {analysisResult.analysis?.recruiterInsights?.placementAdvice?.map((advice, index) => (
              <div key={index}>
                <p>• {advice}</p>
              </div>
            )) || analysisResult.analysis?.recruiterInsights?.recommendations?.map((rec, index) => (
              <div key={index}>
                <p>• {rec}</p>
              </div>
            )) || <p>No placement advice available</p>}
          </div>

          <div className="company-matching">
            <h3>🏢 Company Fit Analysis</h3>
            <p><strong>Suitability Score:</strong> {analysisResult.analysis?.companyMatching?.suitability || analysisResult.analysis?.jobMatching?.matchPercentage || 0}%</p>
            <p><strong>Target Role:</strong> {analysisResult.analysis?.companyMatching?.targetRole || analysisResult.analysis?.jobMatching?.targetRole || jobRole}</p>
            <p>{analysisResult.analysis?.companyMatching?.recommendations || analysisResult.analysis?.jobMatching?.recommendations || 'No company matching analysis available'}</p>
            
            {analysisResult.analysis?.companyMatching?.bestFitCompanies && (
              <div className="best-fit-companies">
                <p><strong>🎯 Best Fit Companies:</strong></p>
                {analysisResult.analysis.companyMatching.bestFitCompanies.map((company, index) => (
                  <p key={index}>• {company}</p>
                ))}
              </div>
            )}
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
            🚀 Generate Campus Interview Stories
          </button>
        </div>
      )}
    </div>
  );
};

export default Analyze;