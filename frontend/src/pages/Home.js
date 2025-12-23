import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AIAnalysisLoader from "../components/AIAnalysisLoader";
import { uploadResume, analyzeResume } from "../utils/api";
import {
  FaRocket,
  FaUpload,
  FaBullseye,
  FaTrophy,
  FaFileContract,
  FaCheck,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaSpinner,
  FaBolt,       // New
  FaBrain,      // New
  FaCheckCircle,// New
  FaHeart,       // New
  FaCode,
  FaLaptopCode,
  FaServer,
  FaLayerGroup,
  FaSave,
  FaArrowRight, // New
  FaArrowDown
} from "react-icons/fa";

const Home = ({ onResumeUpload, setJobRole, onGenerateStory, onSaveToHistory, userResume, jobRole, jobDescription, setJobDescription, user, onUserLogin, openAuthModal }) => {
  const [jobRoleInput, setJobRoleInput] = useState(jobRole || "");
  const [showJDModal, setShowJDModal] = useState(false);
  // Auth Modal State removed - now managed by parent
  const [isUploaded, setIsUploaded] = useState(!!userResume);
  const [fileName, setFileName] = useState(userResume?.fileName || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [ghostText, setGhostText] = useState("");



  const stepsData = [
    { icon: <FaUpload />, title: "1. Upload Resume", desc: "Upload your resume file (PDF/DOCX)." },
    { icon: <FaFileContract />, title: "2. Add Job Description", desc: "Paste the job description (optional, boosts accuracy)." },
    { icon: <FaBullseye />, title: "3. Select Target Role", desc: "Choose the IT role you want to target." },
    { icon: <FaRocket />, title: "4. Get AI Analysis", desc: "See your ATS Audit Score and JD Match Score." },
    { icon: <FaTrophy />, title: "5. Ace Interviews", desc: "Use AI feedback to improve and succeed!" }
  ];

  const masterJobRoles = [
    "Software Engineer", "Software Developer", "Web Developer", "Frontend Developer", "Backend Developer", "Fullstack Developer",
    "DevOps Engineer", "Data Scientist", "Product Manager", "UI/UX Designer",
    "QA Engineer", "System Administrator", "Cloud Architect", "Machine Learning Engineer",
    "Cybersecurity Analyst", "Mobile App Developer", "Game Developer", "Blockchain Developer",
    "Database Administrator", "Site Reliability Engineer", "Technical Writer", "Support Engineer",
    "Security Engineer"
  ];

  const handleJobRoleChange = (e) => {
    const userInput = e.target.value;
    setJobRoleInput(userInput);
    setJobRole(userInput);

    if (userInput.trim()) {
      // Find best match for Ghost Text
      const match = masterJobRoles.find((role) =>
        role.toLowerCase().startsWith(userInput.toLowerCase())
      );

      if (match) {
        // Construct ghost text: User's typed text + Remaining part of the match
        // This ensures casing perfectly overlaps (e.g., user "bac" -> ghost "bac" + "kend Dev...")
        const remainingChars = match.slice(userInput.length);
        setGhostText(userInput + remainingChars);
      } else {
        setGhostText("");
      }

      // Filter for dropdown (Optional, if we kept it)
      const filtered = masterJobRoles.filter((role) =>
        role.toLowerCase().includes(userInput.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setActiveIndex(-1);
    } else {
      setGhostText("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    // 1. Accept Ghost Text
    if ((e.key === "Tab" || e.key === "ArrowRight") && ghostText) {
      if (jobRoleInput.toLowerCase() !== ghostText.toLowerCase()) {
        e.preventDefault();
        setJobRoleInput(ghostText);
        setJobRole(ghostText);
        setGhostText("");
        setShowSuggestions(false);
        return;
      }
    }

    // 2. Dropdown Navigation (if visible)
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
        e.preventDefault();
        handleSuggestionClick(filteredSuggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (role) => {
    setJobRoleInput(role);
    setJobRole(role);
    setShowSuggestions(false);
  };

  useEffect(() => {
    setJobRoleInput(jobRole || "");
  }, [jobRole]);

  // Restore upload state when page refreshes and we have a saved resume
  useEffect(() => {
    if (userResume) {
      setIsUploaded(true);
      const name = userResume.fileName || "resume.pdf";
      const maxLength = 20;
      const trimmedName = name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
      setFileName(trimmedName);
    }
  }, [userResume]);

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

  // State to track if we are waiting for login to complete before analyzing
  const [isWaitingForAuth, setIsWaitingForAuth] = useState(false);

  // Resume analysis if user logs in while waiting
  useEffect(() => {
    if (user && isWaitingForAuth) {
      setIsWaitingForAuth(false);
      proceedWithAnalysis();
    }
  }, [user, isWaitingForAuth]);

  // ✅ Function for story generation with REAL AI analysis
  const handleGenerateStory = async () => {
    if (jobRoleInput.trim() && isUploaded && userResume) {

      // LAZY REGISTRATION CHECK
      if (!user) {
        setIsWaitingForAuth(true);
        if (openAuthModal) openAuthModal();
        return;
      }

      proceedWithAnalysis();
    }
  };

  const proceedWithAnalysis = async () => {
    setIsAnalyzing(true);

    // Real API call with job description
    try {
      const analysisResult = await analyzeResume(userResume.resumeId, jobRoleInput, jobDescription);

      // MERGE: Combine backend result with local userResume (which has the fileUrl)
      const combinedData = {
        ...userResume,      // Contains fileUrl, fileName, etc.
        ...analysisResult,  // Contains new analysis data
        // Ensure analysis object is correctly structured
        analysis: analysisResult.analysis || analysisResult.aiAnalysis || analysisResult
      };

      onGenerateStory(combinedData, jobRoleInput);

      // Save to history automatically with correct structure
      const historyItem = {
        resumeName: userResume.fileName || 'resume.pdf',
        fileName: userResume.fileName || 'resume.pdf',
        fileSize: userResume.fileSize,
        resumeData: {
          targetJobRole: jobRoleInput,
          fileName: userResume.fileName || 'resume.pdf'
        },
        analysis: {
          atsScore: {
            score: analysisResult?.analysis?.campusReadinessScore?.score ||
              analysisResult?.analysis?.atsScore?.score ||
              analysisResult?.atsScore?.score || 0
          },
          ...analysisResult?.analysis
        },
        date: new Date().toISOString()
      };
      onSaveToHistory(historyItem);

      navigate('/generate');
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      alert('AI analysis failed: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  }


  // ✅ Handle file upload and trim long names  
  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setFileName("Uploading...");
    try {
      console.log('📤 UPLOADING NEW RESUME:', file.name, 'Size:', file.size);
      // Make the actual API call
      const resumeResponse = await uploadResume(file, jobRoleInput);
      console.log('📥 UPLOAD RESPONSE:', resumeResponse);

      // Convert file to Base64 for persistence across refreshes
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result; // This is the Base64 string
        const enhancedResponse = { ...resumeResponse, fileUrl };

        // resumeResponse now contains the real API response
        onResumeUpload(enhancedResponse);
        if (jobRoleInput) {
          setJobRole(jobRoleInput);
        }
        setIsUploaded(true);

        // Get filename from the API response
        const fileName = resumeResponse.fileName || file.name || "resume.pdf";
        const maxLength = 20;
        const trimmedName =
          fileName.length > maxLength
            ? fileName.substring(0, maxLength) + "..."
            : fileName;
        setFileName(trimmedName);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setIsUploaded(false);
      setFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  const quickJobs = [
    { label: "Software Developer", icon: <FaCode /> },
    { label: "Backend Dev", icon: <FaServer /> },
    { label: "Fullstack Dev", icon: <FaLayerGroup /> },
  ];

  // --- Typewriter Effect Logic ---


  return (
    <div className="home-page">
      {/* Beautiful AI Analysis Loader */}
      <AIAnalysisLoader isVisible={isAnalyzing} />

      {/* Background Particles */}
      <div className="particles-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <section className="hero-section">
        <div className="hero-content">
          <div className="platform-badge">
            <FaRocket className="badge-icon" />
            Campus Placement Success Platform
          </div>

          <h1 className="hero-title">
            Make Your Resume{" "}
            <span className="text-blue-500">ATS-Ready</span> in seconds!
          </h1>

          <p className="hero-description">
            Get instant, AI-powered feedback to optimize your resume for ATS systems and impress recruiters.
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        setShowJDModal(false);
                      }
                    }}
                    className="jd-expanded-textarea"
                    autoFocus
                  />
                  <button
                    className="jd-done-btn icon-mode"
                    onClick={() => setShowJDModal(false)}
                  >
                    <FaArrowRight />
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

                      {/* Ghost Input (Shows suggestion in grey) */}
                      <input
                        type="text"
                        className="deepseek-input ghost-input"
                        value={ghostText}
                        readOnly
                        disabled
                      />

                      {/* Real Input (Transparent, on top) */}
                      <input
                        type="text"
                        placeholder="Target Role (e.g. SDE)"
                        value={jobRoleInput}
                        onChange={handleJobRoleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                          if (jobRoleInput.trim()) setShowSuggestions(true);
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                        className="deepseek-input real-input"
                        style={{ background: 'transparent', position: 'relative', zIndex: 10 }}
                      />
                      {jobRoleInput.trim() && <FaCheckCircle className="input-check-icon" />}

                      {/* Suggestions Dropdown */}
                      {showSuggestions && jobRoleInput.trim() && (
                        <ul className="suggestions-dropdown" style={{ display: 'none' }}>
                          {filteredSuggestions.length > 0 ? (
                            filteredSuggestions.map((suggestion, index) => (
                              <li
                                key={index}
                                onMouseDown={() => handleSuggestionClick(suggestion)}
                                className={`suggestion-item ${index === activeIndex ? "active" : ""}`}
                              >
                                {suggestion}
                              </li>
                            ))
                          ) : (
                            <li className="no-suggestions">No matches found</li>
                          )}
                        </ul>
                      )}

                    </div>

                    {/* Small JD button - LEFT */}
                    <button
                      className={`jd-small-btn ${jobDescription.trim() ? 'filled' : ''}`}
                      onClick={() => setShowJDModal(true)}
                    >
                      {!jobDescription.trim() && <FaFileContract className="jd-btn-icon" />}
                      <span className="jd-btn-label">
                        {jobDescription.trim() ? 'JD Pasted' : 'Paste JD (Opt.)'}
                      </span>
                    </button>

                    {/* Resume Upload Button - RIGHT */}
                    <div className="upload-group">
                      <div className={`upload-btn ${fileName ? 'filled' : ''} ${isUploading ? 'uploading' : ''}`}>
                        {isUploading ? (
                          <>
                            <FaSpinner className="upload-icon spinner-icon" />
                            <span className="file-label">Uploading...</span>
                          </>
                        ) : (
                          <>
                            {!fileName && <FaUpload className="upload-icon" />}

                            {/* ✅ Show file name when uploaded, otherwise show "Upload Resume" */}
                            <span className="file-label">
                              {fileName ? fileName : "Upload Resume"}
                            </span>

                            {fileName && <FaCheck className="upload-check-icon" />}
                          </>
                        )}

                        <input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                          accept=".pdf,.doc,.docx"
                          className="file-input"
                          disabled={isUploading}
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
                          className={`suggestion-chip ${jobRoleInput === job.label ? "active" : ""}`}
                          onClick={() => {
                            setJobRoleInput(job.label);
                            setJobRole(job.label);
                          }}
                        >
                          {job.icon}
                          {job.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ Generate Button Section */}
                  <div className="generate-buttons-container">
                    <button
                      onClick={handleGenerateStory}
                      className={`deepseek-generate-btn ${jobRoleInput && isUploaded ? 'ready' : ''}`}
                      disabled={!jobRoleInput || !isUploaded || isAnalyzing}
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
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
            See the steps <FaArrowDown style={{ verticalAlign: 'middle', marginLeft: '6px' }} />
          </div>
        </div>
      </section >


      {/* How It Works Section (Updated) */}
      < section id="how-it-works" className="how-it-works" >
        <div className="container">
          <h2 className="section-title">How It Works</h2>

          <div className="steps-horizontal updated-steps">
            {stepsData.map((step, index) => (
              <div
                key={index}
                className="step-wrapper"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="step uniform-step">
                  <div className="push-pin"></div>
                  <div className="step-number">
                    {step.icon}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer (Updated) */}
      < footer className="footer" >
        <div className="container">
          <div className="footer-content">
            <div className="footer-left">
              <h3>JobStory Ai</h3>
              <p>Empowering IT students for campus placement success.</p>
            </div>
            <div className="footer-right">
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Twitter" title="Twitter">
                  <FaTwitter />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn" title="LinkedIn">
                  <FaLinkedin />
                </a>
                <a href="#" className="social-link" aria-label="GitHub" title="GitHub">
                  <FaGithub />
                </a>
                <a href="mailto:jobstory.ai@gmail.com" className="social-link" aria-label="Email" title="Email">
                  <FaEnvelope />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer >
    </div >
  );
};

export default Home;