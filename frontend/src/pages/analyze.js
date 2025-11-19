import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { analyzeResume } from '../utils/api';
import './Analyze.css';

const Analyze = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resumeData, jobRole } = location.state || {};
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  // 5 Core Features Tabs
  const tabs = ['ATS Score', 'Grammar & Spelling', 'Recruiter Insights', 'Quick Fixes', 'Skill Gaps'];
  const [activeTab, setActiveTab] = useState('ATS Score');

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

  // Extract analysis data
  const analysis = analysisResult?.analysis || {};
  const atsScore = analysis.atsScore || {};
  const recruiterInsights = analysis.recruiterInsights || {};
  const grammarSpelling = recruiterInsights.redFlags || [];
  const quickFixes = analysis.growthAreas || [];
  const skillGaps = analysis.keywordAnalysis || {};

  return (
    <div className="analyze-page">
      <div className="analyze-header">
        <div className="analyze-title">🎯 Resume Analysis</div>
        <div className="actions">
          {!analysisResult && (
            <button className="primary-btn" onClick={handleAnalyze}>
              🚀 Analyze Resume
            </button>
          )}
          <button className="secondary-btn" onClick={() => navigate('/')}>
            ← Back
          </button>
        </div>
      </div>

      <div className="meta-row">
        <div className="meta-chip">🎯 Role: {jobRole || 'Not specified'}</div>
        <div className="meta-chip">📄 {resumeData.fileName || 'resume.pdf'}</div>
        <div className="meta-chip">
          📊 {typeof resumeData.fileSize === 'number' 
            ? `${(resumeData.fileSize / 1024).toFixed(1)} KB` 
            : '—'}
        </div>
      </div>

      {isAnalyzing && (
        <div className="card loading-card">
          <div style={{textAlign: 'center', padding: '40px'}}>
            <div style={{fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite'}}>⚙️</div>
            <div style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#c7d2fe'}}>Analyzing Your Resume</div>
            <div style={{fontSize: '14px', color: '#94a3b8'}}>AI is processing your resume with Gemini...</div>
            <div style={{marginTop: '20px', height: '4px', background: 'rgba(129,140,248,0.2)', borderRadius: '2px', overflow: 'hidden'}}>
              <div style={{height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', animation: 'loading 2s ease-in-out infinite', width: '60%'}}></div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{color: '#ff4444'}}>
          ❌ {error}
        </div>
      )}

      {analysisResult && (
        <>
          <div className="tabbar">
            {tabs.map(t => (
              <button 
                key={t} 
                className={`tab-btn ${activeTab === t ? 'active' : ''}`} 
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Feature 1: ATS SCORE & COMPATIBILITY */}
          {activeTab === 'ATS Score' && (
            <div className="two-col">
              <div className="card">
                <div className="kpi">
                  <div>📊 ATS Score</div>
                  <div style={{fontSize: '48px', fontWeight: 'bold'}}>
                    {atsScore.score || 0}/100
                  </div>
                </div>
                <div className="progress">
                  <div style={{
                    width: `${atsScore.score || 0}%`,
                    background: atsScore.score >= 70 ? '#4caf50' : atsScore.score >= 50 ? '#ff9800' : '#f44336'
                  }} />
                </div>
                <div style={{marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '8px'}}>
                  <strong>{atsScore.level || 'N/A'}</strong>
                  <div className="small" style={{marginTop: '8px'}}>
                    {atsScore.explanation || 'No explanation available'}
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{fontWeight: 600, marginBottom: 12}}>📈 Match Percentage</div>
                <div className="kpi">
                  <div>{analysis.jobMatching?.matchPercentage || atsScore.score || 0}%</div>
                </div>
                <div className="progress">
                  <div style={{width: `${analysis.jobMatching?.matchPercentage || atsScore.score || 0}%`}} />
                </div>
                <div className="small" style={{marginTop: 12}}>
                  {analysis.overallSummary || 'Complete analysis to see match details'}
                </div>
              </div>
            </div>
          )}

          {/* Feature 2: GRAMMAR, SPELLING & LANGUAGE */}
          {activeTab === 'Grammar & Spelling' && (
            <div className="card">
              <div style={{fontWeight: 600, marginBottom: 16}}>
                ✍️ Grammar & Spelling Issues
              </div>
              {grammarSpelling.length > 0 ? (
                <div className="list">
                  {grammarSpelling.map((issue, i) => (
                    <div className="list-item" key={i} style={{
                      padding: '12px',
                      background: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      ⚠️ {issue}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{padding: '20px', textAlign: 'center', color: '#4caf50'}}>
                  ✅ No major grammar or spelling issues detected!
                </div>
              )}
            </div>
          )}

          {/* Feature 3: RECRUITER INSIGHTS */}
          {activeTab === 'Recruiter Insights' && (
            <div className="two-col">
              <div className="card">
                <div style={{fontWeight: 600, marginBottom: 12}}>
                  👁️ Recruiter Overview
                </div>
                <div style={{
                  padding: '16px',
                  background: '#e3f2fd',
                  borderRadius: '8px',
                  borderLeft: '4px solid #2196f3'
                }}>
                  {recruiterInsights.overview || 'No overview available'}
                </div>
              </div>

              <div className="card">
                <div style={{fontWeight: 600, marginBottom: 12}}>
                  💪 Key Strengths
                </div>
                {recruiterInsights.keyStrengths && recruiterInsights.keyStrengths.length > 0 ? (
                  <div className="list">
                    {recruiterInsights.keyStrengths.map((strength, i) => (
                      <div className="list-item" key={i} style={{
                        padding: '10px',
                        background: '#e8f5e9',
                        borderRadius: '6px',
                        marginBottom: '6px'
                      }}>
                        ✅ {strength}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="small">No strengths identified yet</div>
                )}
              </div>

              <div className="card" style={{gridColumn: '1 / -1'}}>
                <div style={{fontWeight: 600, marginBottom: 12}}>
                  📝 Recommendations
                </div>
                {recruiterInsights.recommendations && recruiterInsights.recommendations.length > 0 ? (
                  <div className="list">
                    {recruiterInsights.recommendations.map((rec, i) => (
                      <div className="list-item" key={i} style={{
                        padding: '12px',
                        background: '#fff9c4',
                        borderRadius: '6px',
                        marginBottom: '8px'
                      }}>
                        💡 {rec}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="small">No recommendations available</div>
                )}
              </div>
            </div>
          )}

          {/* Feature 4: QUICK FIXES - DO THIS NOW */}
          {activeTab === 'Quick Fixes' && (
            <div className="card">
              <div style={{fontWeight: 600, marginBottom: 16}}>
                🔧 Quick Fixes - Do This Now
              </div>
              {quickFixes.length > 0 ? (
                <div className="list">
                  {quickFixes.map((fix, i) => (
                    <div className="list-item" key={i} style={{
                      padding: '14px',
                      background: '#ffebee',
                      border: '2px solid #f44336',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      fontWeight: 500
                    }}>
                      🚨 {fix}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{padding: '20px', textAlign: 'center', color: '#4caf50'}}>
                  ✅ No immediate fixes required!
                </div>
              )}
            </div>
          )}

          {/* Feature 5: SKILL & KEYWORD GAPS */}
          {activeTab === 'Skill Gaps' && (
            <div className="two-col">
              <div className="card">
                <div style={{fontWeight: 600, marginBottom: 12}}>
                  ✅ Skills Present
                </div>
                {skillGaps.presentKeywords && skillGaps.presentKeywords.length > 0 ? (
                  <div className="actions" style={{gap: '8px', flexWrap: 'wrap'}}>
                    {skillGaps.presentKeywords.map((skill, i) => (
                      <span key={i} className="badge" style={{
                        background: '#4caf50',
                        color: 'white',
                        padding: '6px 12px'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="small">No skills detected</div>
                )}
              </div>

              <div className="card">
                <div style={{fontWeight: 600, marginBottom: 12, color: '#f44336'}}>
                  ❌ Critical Missing Skills
                </div>
                {skillGaps.missingKeywords && skillGaps.missingKeywords.length > 0 ? (
                  <div className="list">
                    {skillGaps.missingKeywords.map((skill, i) => (
                      <div className="list-item" key={i} style={{
                        padding: '10px',
                        background: '#ffcdd2',
                        borderRadius: '6px',
                        marginBottom: '6px'
                      }}>
                        ⚠️ {skill}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="small">No critical gaps identified</div>
                )}
              </div>
            </div>
          )}

          <div style={{marginTop: 24, textAlign: 'center'}}>
            <button 
              onClick={() => navigate('/generate', { 
                state: { resumeData: analysisResult, jobRole } 
              })}
              className="primary-btn"
              style={{padding: '14px 32px', fontSize: '16px'}}
            >
              🚀 Generate Interview Stories
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Analyze;