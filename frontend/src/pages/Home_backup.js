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
  FaBrain,
  FaChartLine,
  FaStar,
  FaUsers
} from 'react-icons/fa';

const Home = ({ onResumeUpload, setJobRole, onGenerateStory, userResume, jobRole }) => {
  const [jobRoleInput, setJobRoleInput] = useState("");
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

  // ✅ New function for story generation
  const handleGenerateStory = async () => {
    if (jobRoleInput.trim() && isUploaded && userResume) {
      setJobRole(jobRoleInput);
      setIsAnalyzing(true);

      try {
        // First, analyze the resume with AI if not already analyzed
        let analysisResult;
        
        if (userResume.resumeId && !userResume.analysis) {
          console.log('🤖 ANALYZING WITH REAL AI (v2.0) - Calling backend AI service...');
          analysisResult = await analyzeResume(userResume.resumeId, jobRoleInput);
          console.log('Analysis result:', analysisResult);
        } else {
          // Use existing analysis if available
          analysisResult = userResume;
        }

        // Use the real resume data with AI analysis
        const resumeDataForStory = {
          ...userResume,
          // Properly extract the analysis data from the API response
          analysis: analysisResult.analysis || analysisResult.aiAnalysis,
          targetJobRole: jobRoleInput,
        };

        console.log('Passing data to story generation:', resumeDataForStory);
        onGenerateStory(resumeDataForStory, jobRoleInput);
        navigate("/generate");
        
      } catch (error) {
        console.error('Error during AI analysis:', error);
        alert(`Failed to analyze resume: ${error.message}`);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      if (!isUploaded) {
        alert("Please upload a resume first!");
      } else if (!jobRoleInput.trim()) {
        alert("Please select or enter a job role!");
      }
    }
  };

  // ✅ Handle file upload and trim long names  
  const handleFileUpload = async (file) => {
    try {
      // Make the actual API call
      const resumeResponse = await uploadResume(file, jobRoleInput);
      
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
    "Full Stack Developer"
  ];

  return (
    <div className="home-page">
      {/* Beautiful AI Analysis Loader */}
      <AIAnalysisLoader isVisible={isAnalyzing} />
      
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">
            <FaGraduationCap className="badge-icon" />
            Campus Placement Success Platform
          </div>

          <h1 className="hero-title">
            Land Your Dream{" "}
            <span className="text-blue-500">IT Job</span> Through Campus Placements
            <div className="ai-pulse">
              <FaBrain className="ai-brain" />
            </div>
          </h1>

          <p className="hero-description">
            Powered by <strong>Advanced AI</strong> that understands campus placements. <br />
            Designed specifically for <em>IT students</em> preparing for TCS, Infosys, Wipro, Accenture, and top tech companies.
          </p>

          <div className="stats-row">
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Students Placed</span>
            </div>
            <div className="stat-item">
              <FaBuilding className="stat-icon" />
              <span className="stat-number">500+</span>
              <span className="stat-label">Partner Companies</span>
            </div>
            <div className="stat-item">
              <FaChartLine className="stat-icon" />
              <span className="stat-number">95%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>

          <div className="deepseek-section">
            <div className="deepseek-card">
              <div className="input-container">
                <div className="search-group">
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
                </div>

                {/* ✅ Resume Upload Button */}
                <div className="upload-group">
                  <div className="upload-btn">
                    <FaUpload className="upload-icon" />

                    {/* ✅ Show file name directly on button */}
                    <span className="file-label">
                      {fileName ? fileName : "Upload Resume"}
                    </span>

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
                  <FaBrain className="btn-icon" />
                  {isAnalyzing ? "AI is analyzing your resume..." : "Generate Interview Story"}
                </button>
              </div>
            </div>
          </div>

          <div className="scroll-cue">↓ See how it works</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Your Campus Placement Success Coach</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-header">
                <FaFileAlt className="feature-icon" />
                <h3>Fresher Resume Analysis</h3>
              </div>
              <p>
                AI evaluates your resume specifically for campus placements — highlighting academic projects, internships, and skills that IT companies want.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <FaBuilding className="feature-icon" />
                <h3>Company-Specific Prep</h3>
              </div>
              <p>
                Get job-specific answers based on your experience. We use the STAR method to keep them short, clear, and impactful.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <FaLaptopCode className="feature-icon" />
                <h3>Technical Round Stories</h3>
              </div>
              <p>
                Learn how to present your projects, coding skills, and technical knowledge in a way that impresses placement coordinators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Get Placement-Ready in 4 Easy Steps</h2>

          <div className="steps-horizontal">
            <div className="step">
              <div className="step-number">
                <FaUpload />
              </div>
              <h3>Upload Your Resume</h3>
              <p>Upload your resume and let AI analyze your academic profile for campus placements.</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">
                <FaBullseye />
              </div>
              <h3>Select Your Target Company</h3>
              <p>Choose from TCS, Infosys, Wipro, Accenture — we'll personalize your preparation.</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">
                <FaRocket />
              </div>
              <h3>Get Campus-Focused Content</h3>
              <p>Choose between technical answers or project stories — both tailored to fresher requirements.</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">
                <FaTrophy />
              </div>
              <h3>Ace Your Placement</h3>
              <p>Walk into placement interviews with confidence and land your dream IT job.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;