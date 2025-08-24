import React, { useState } from "react";

const Home = ({ onResumeUpload, setJobRole }) => {
  const [jobRoleInput, setJobRoleInput] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);

  const handleSubmit = () => {
    if (jobRoleInput.trim() && isUploaded) {
      setJobRole(jobRoleInput);
    }
  };

  const handleFileUpload = (file) => {
    onResumeUpload(file);
    setIsUploaded(true);
  };

  const quickJobs = [
    "Software Engineer",
    "Sales Manager",
    "Nurse",
    "School Teacher",
    "Journalist",
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">✨ AI-Powered Interview Prep</div>

          {/* Headline */}
          <h1 className="hero-title">
            Turn Your Resume Into{" "}
            <span className="text-blue-500">Winning Answers</span> 📈
          </h1>

          {/* Subheadline */}
          <p className="hero-description">
            Nervous about interviews? <br />
            Our AI turns your resume into clear, confident answers — so you always know what to say.
          </p>

          {/* DeepSeek-inspired minimalist section */}
          <div className="deepseek-section">
            <div className="deepseek-card">
              {/* Input + Upload */}
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

                {/* Upload Button */}
                <div className="upload-group">
                  <div className="upload-btn">
                    <svg
                      className="upload-icon"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                    >
                      <path
                        fill="currentColor"
                        d="M19.35 10.04C18.67 6.59 
                        15.64 4 12 4 
                        9.11 4 6.6 5.64 5.35 8.04 
                        2.34 8.36 0 10.91 0 14
                        c0 3.31 2.69 6 6 6h13
                        c2.76 0 5-2.24 5-5
                        0-2.64-2.05-4.78-4.65-4.96z
                        M14 13v4h-4v-4H7l5-5 5 5h-3z"
                      />
                    </svg>
                    <span>{isUploaded ? "Resume Uploaded" : "Upload Resume"}</span>
                    <input
                      type="file"
                      onChange={(e) =>
                        e.target.files[0] && handleFileUpload(e.target.files[0])
                      }
                      accept=".pdf,.doc,.docx"
                      className="file-input"
                    />
                  </div>
                </div>
              </div>

              {/* Suggestions */}
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

              {/* Generate Button */}
              <button
                onClick={handleSubmit}
                className="deepseek-generate-btn"
                disabled={!jobRoleInput || !isUploaded}
              >
                Generate My Interview Answers{" "}
                <svg
                  className="arrow-icon"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                >
                  <path
                    fill="currentColor"
                    d="M12 4l-1.41 1.41L16.17 11H4v2h12.17
                    l-5.58 5.59L12 20l8-8z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Scroll Cue */}
          <div className="scroll-cue">↓ See how it works</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Your AI-Powered Interview Coach</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-header">
                <h3>Smart Resume Insights</h3>
              </div>
              <p>
                AI highlights your strengths and achievements recruiters care about — helping you stand out.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <h3>Tailored Interview Answers</h3>
              </div>
              <p>
                Get job-specific answers based on your experience. We use the STAR method to keep them short, clear, and impactful.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <h3>Role-Specific Preparation</h3>
              </div>
              <p>
                Every job is different. Get likely questions, sample answers, and tips — customized for your target role.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Get Interview-Ready in 4 Easy Steps</h2>

          <div className="steps-horizontal">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Your Resume</h3>
              <p>Upload your resume and let AI analyze your profile in seconds.</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Select Your Target Role</h3>
              <p>Tell us the role you want — we’ll personalize your preparation.</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Get AI-Crafted Answers</h3>
              <p>Receive ready-to-use answers and insights tailored to your resume.</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">4</div>
              <h3>Walk In with Confidence</h3>
              <p>Be prepared, sound authentic, and impress every recruiter.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
