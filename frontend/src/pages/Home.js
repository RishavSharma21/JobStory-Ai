import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import AIAnalysisLoader from "../components/AIAnalysisLoader";
import { uploadResume, analyzeResume } from "../utils/api";
import { 
  FaGraduationCap, 
  FaRocket, 
  FaFileAlt, 
  FaBuilding, 
  FaLaptopCode, 
  FaUpload, 
  FaBullseye, 
  FaTrophy,
  FaMicrochip,
  FaChartLine,
  FaStar,
  FaUsers,
  FaFileContract,
  FaCheck
} from 'react-icons/fa';
import { FaArrowRight, FaArrowDown } from 'react-icons/fa';

const Home = ({ onResumeUpload, setJobRole, onGenerateStory, userResume, jobRole }) => {
  const [jobRoleInput, setJobRoleInput] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJDModal, setShowJDModal] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  // ✅ Function for interview answers navigation
  const handleSubmit = () => {
    if (jobRoleInput.trim() && isUploaded && userResume) {
      setJobRole(jobRoleInput);

      // Use the real resume data from API response instead of mock data
      const resumeDataForAnalysis = {
        ...userResume,
        targetJobRole: jobRoleInput,
      };

      navigate("/analyze", {
        state: {
          resumeData: resumeDataForAnalysis,
          jobRole: jobRoleInput,
        },
      });
    }
  };

  // ✅ Function for story generation with REAL AI analysis
  const handleGenerateStory = async () => {
    if (jobRoleInput.trim() && isUploaded && userResume) {
      setIsAnalyzing(true);
      
      try {
        // Fetch REAL AI analysis from backend
        console.log('🔥 Analyzing resume with AI:', userResume.resumeId);
        const analysisResult = await analyzeResume(userResume.resumeId, jobRoleInput, jobDescription);
        console.log('🔥 AI Analysis Result:', analysisResult);
        
        // Pass REAL analysis data to story generation page
        onGenerateStory(analysisResult, jobRoleInput);
        navigate('/generate');
      } catch (error) {
        console.error('❌ Analysis failed:', error);
        alert('AI analysis failed: ' + error.message);
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }
  };

  // ✅ Handle file upload and trim long names  
  const handleFileUpload = async (file) => {
    try {
      console.log('📤 UPLOADING NEW RESUME:', file.name, 'Size:', file.size);
      // Make the actual API call
      const resumeResponse = await uploadResume(file, jobRoleInput);
      console.log('📥 UPLOAD RESPONSE:', resumeResponse);
      
      // resumeResponse now contains the real API response
      onResumeUpload(resumeResponse);
      setIsUploaded(true);
      
      // Get filename from the API response
      const fileName = resumeResponse.fileName || file.name || "resume.pdf";
      const maxLength = 20;
      const trimmedName =
        fileName.length > maxLength
          ? fileName.substring(0, maxLength) + "..."
          : fileName;
      setFileName(trimmedName);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setIsUploaded(false);
      setFileName("");
    }
  };

  const quickJobs = [
    "Software Developer", 
    "Frontend Dev",
    "Backend Dev",
    "Fullstack Dev",
  ];

  return (
    <div className="home-page">
      {/* Beautiful AI Analysis Loader */}
      <AIAnalysisLoader isVisible={isAnalyzing} />
      
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">
            <FaRocket className="badge-icon" />
            Campus Placement Success Platform
          </div>

          <h1 className="hero-title">
            Land Your Dream{" "}
            <span className="text-blue-500">IT Job</span> Through Campus Placements
            
          </h1>

          <p className="hero-description">
            AI-powered resume analysis designed for IT students targeting campus placements.
          </p>

          <div className="deepseek-section">
            <div className="deepseek-card">
              {/* JD EXPANDED MODE - Takes full card */}
              {showJDModal ? (
                <div className="jd-full-card">
                  <div className="jd-expanded-header">
                    <h3>Add Job Description (Optional)</h3>
                    <button 
                      className="jd-close-btn"
                      onClick={() => setShowJDModal(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    placeholder="Paste the job description here - helps AI give better insights"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="jd-expanded-textarea"
                    autoFocus
                  />
                  <button 
                    className="jd-done-btn"
                    onClick={() => setShowJDModal(false)}
                  >
                    {jobDescription.trim() ? '✓ Apply JD' : '⊘ Skip for Now'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="input-container">
                    <div className={`search-group ${jobRoleInput.trim() ? 'filled' : ''}`}>
                      <svg
                        className="search-icon"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                      >
                        <path
                          fill="currentColor"
                          d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 
                          16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 
                          5.91 16 9.5 16c1.61 0 3.09-.59 
                          4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 
                          0C7.01 14 5 11.99 5 9.5S7.01 5 
                          9.5 5 14 7.01 14 9.5 
                          11.99 14 9.5 14z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="What role are you targeting?"
                        value={jobRoleInput}
                        onChange={(e) => setJobRoleInput(e.target.value)}
                        className="deepseek-input"
                      />
                      {jobRoleInput.trim() && <FaCheck className="input-check-icon" />}
                    </div>

                    {/* Small JD button - LEFT */}
                    <button 
                      className={`jd-small-btn ${jobDescription.trim() ? 'filled' : ''}`}
                      onClick={() => setShowJDModal(true)}
                    >
                      <FaFileContract className="jd-btn-icon" />
                      <span className="jd-btn-label">
                        {jobDescription.trim() ? 'JD Added' : 'Add JD'}
                      </span>
                      {jobDescription.trim() && <FaCheck className="jd-check-icon" />}
                    </button>

                    {/* Resume Upload Button - RIGHT */}
                    <div className="upload-group">
                      <div className={`upload-btn ${fileName ? 'filled' : ''}`}>
                        {!fileName && <FaUpload className="upload-icon" />}

                        {/* ✅ Show file name when uploaded, otherwise show "Upload Resume" */}
                        <span className="file-label">
                          {fileName ? fileName : "Upload Resume"}
                        </span>

                        {fileName && <FaCheck className="upload-check-icon" />}

                        <input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                          accept=".pdf,.doc,.docx"
                          className="file-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Suggestions */}
                  <div className="suggestions-row">
                    <span className="suggestion-label">Quick Picks: </span>
                    <div className="suggestion-chips">
                      {quickJobs.map((job, i) => (
                        <button
                          key={i}
                          className={`suggestion-chip ${
                            jobRoleInput === job ? "active" : ""
                          }`}
                          onClick={() => setJobRoleInput(job)}
                        >
                          {job}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ Generate Button Section */}
                  <div className="generate-buttons-container">
                    <button
                      onClick={handleGenerateStory}
                      className="deepseek-generate-btn"
                      disabled={!jobRoleInput || !isUploaded || isAnalyzing}
                    >
                      {isAnalyzing ? "AI is analyzing your resume..." : "Generate Interview Story"}
                      {!isAnalyzing && <FaRocket className="generate-icon right" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ✅ See How It Works - Moved outside the box */}
          <div 
            className="scroll-cue-outside"
            onClick={() => {
              const el = document.getElementById('how-it-works');
              (el || document.querySelector('.how-it-works'))?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
          >
            <u>See the steps</u> <FaArrowDown style={{ verticalAlign: 'middle' }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Students Choose Us</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-header">
                <FaFileAlt className="feature-icon" />
                <h3>Smart Resume Analysis</h3>
              </div>
              <p>
                AI analyzes your academic projects and skills for campus placements.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <FaBuilding className="feature-icon" />
                <h3>Company-Focused Prep</h3>
              </div>
              <p>
                Tailored preparation for TCS, Infosys, Wipro, and top IT companies.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <FaLaptopCode className="feature-icon" />
                <h3>Interview Stories</h3>
              </div>
              <p>
                Transform your projects into compelling interview answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
  <section id="how-it-works" className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>

          <div className="steps-horizontal">
            <div className="step">
              <div className="step-number">
                <FaUpload />
              </div>
              <h3>Upload Resume</h3>
              <p>Upload your resume for AI analysis.</p>
            </div>

            <div className="step-arrow"><FaArrowRight /></div>

            <div className="step">
              <div className="step-number">
                <FaBullseye />
              </div>
              <h3>Select Target Role</h3>
              <p>Choose your desired IT position.</p>
            </div>

            <div className="step-arrow"><FaArrowRight /></div>

            <div className="step">
              <div className="step-number">
                <FaRocket />
              </div>
              <h3>Get AI Insights</h3>
              <p>Receive placement-focused feedback.</p>
            </div>

            <div className="step-arrow"><FaArrowRight /></div>

            <div className="step">
              <div className="step-number">
                <FaTrophy />
              </div>
              <h3>Ace Interviews</h3>
              <p>Land your dream job with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-left">
              <h3>StoryPitch AI</h3>
              <p>Empowering IT students for campus placement success.</p>
            </div>
            
            <div className="footer-right">
              <div className="social-links">
                <a href="#" className="social-link">Twitter</a>
                <a href="#" className="social-link">LinkedIn</a>
                <a href="#" className="social-link">GitHub</a>
                <a href="#" className="social-link">Email</a>
              </div>
            </div>
          </div>
          
          
        </div>
      </footer>
    </div>
  );
};

export default Home;