// src/pages/History.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./History.css";

const History = () => {
  const [resumeHistory, setResumeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();
  const menuRefs = useRef({}); // keep refs to each row's actions area

  // Mock load (unchanged behavior)
  useEffect(() => {
    const t = setTimeout(() => {
      const mockData = [
        { id: 1, title: "john-doe-resume.pdf", jobRole: "Software Engineer", date: "2024-01-15", suggestions: 5, questions: 12, score: 88 },
        { id: 2, title: "sarah-chen-cv.pdf", jobRole: "Product Manager", date: "2024-02-20", suggestions: 3, questions: 8, score: 92 },
        { id: 3, title: "alex-martinez-resume.docx", jobRole: "Data Scientist", date: "2024-03-10", suggestions: 7, questions: 15, score: 85 },
        { id: 4, title: "emily-wilson-portfolio.pdf", jobRole: "UX Designer", date: "2024-03-15", suggestions: 2, questions: 6, score: 94 },
      ];
      setResumeHistory(mockData);
      setLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleResumeClick = (resumeId) => {
    navigate("/analyze", { state: { resumeId } });
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setResumeHistory((prev) => prev.filter((r) => r.id !== id));
    setActiveMenu(null);
  };

  const handleShare = (e, id) => {
    e.stopPropagation();
    // simple share: copy link to clipboard
    const link = `${window.location.origin}/analyze?resumeId=${id}`;
    navigator.clipboard?.writeText(link).then(
      () => console.log("Copied share link:", link),
      () => console.log("Share link:", link)
    );
    setActiveMenu(null);
  };

  // Close the open menu on outside click
  useEffect(() => {
    const onDocClick = (ev) => {
      if (activeMenu == null) return;
      const node = menuRefs.current[activeMenu];
      if (node && !node.contains(ev.target)) setActiveMenu(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [activeMenu]);

  // Icons (same visual style as your earlier file)
  const FileIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    </svg>
  );
  const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
    </svg>
  );
  const ShareIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z" />
    </svg>
  );
  const DotsIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading your resume history</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <h1 className="history-title">Resume History</h1>
          <p className="history-subtitle">
            {resumeHistory.length} resumes analyzed
          </p>
        </div>

        {resumeHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No resumes analyzed yet</h3>
            <p>Upload your first resume to get started</p>
          </div>
        ) : (
          <div className="resume-list">
            {resumeHistory.map((resume) => (
              <div
                key={resume.id}
                className="resume-item"
                onClick={() => handleResumeClick(resume.id)}
              >
                {/* Left */}
                <div className="resume-main">
                  <div className="file-icon">
                    <FileIcon />
                  </div>
                  <div className="resume-details">
                    <h3 className="resume-name">{resume.title}</h3>
                    <div className="resume-info">
                      <span className="job-title">{resume.jobRole}</span>
                      <span className="separator">•</span>
                      <span className="date">{formatDate(resume.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right (existing classes so your CSS works) */}
                <div className="resume-meta">
                  <div className="meta-item">
                    <span className="meta-text">
                      {resume.suggestions} suggestions
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-text">
                      {resume.questions} questions
                    </span>
                  </div>
                  <div className="score">{resume.score}%</div>
                </div>

                {/* 3 dots — always visible, aligned right */}
                <div
                  className="resume-actions"
                  ref={(el) => (menuRefs.current[resume.id] = el)}
                >
                  <button
                    className="menu-button"
                    aria-haspopup="menu"
                    aria-expanded={activeMenu === resume.id}
                    onClick={(e) => toggleMenu(e, resume.id)}
                    title="More options"
                  >
                    <DotsIcon />
                  </button>

                  {activeMenu === resume.id && (
                    <div className="menu-dropdown" role="menu">
                      <div
                        className="menu-item"
                        role="menuitem"
                        onClick={(e) => handleShare(e, resume.id)}
                      >
                        <ShareIcon />
                        <span>Share</span>
                      </div>
                      <div
                        className="menu-item delete"
                        role="menuitem"
                        onClick={(e) => handleDelete(e, resume.id)}
                      >
                        <DeleteIcon />
                        <span>Delete</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
