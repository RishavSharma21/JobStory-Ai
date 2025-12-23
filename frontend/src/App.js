// src/App.js - Enhanced Integration
import React, { useState, useEffect } from "react";
import { FaDesktop } from "react-icons/fa";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import History from "./pages/History";

import Contact from "./pages/Contact";
import StoryGeneration from "./components/StoryGeneration";
import AuthModal from "./components/AuthModal";

function App() {
  const [userResume, setUserResume] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [historyItems, setHistoryItems] = useState([]);
  const [currentGenerationData, setCurrentGenerationData] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Invalid user data', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Load history based on the specific user (Fix for data mixing)
  useEffect(() => {
    // 1. Determine the correct key for THIS specific user
    // Backend sends 'id', MongoDB uses '_id'. We check both, then fallback to email.
    const identifier = user ? (user._id || user.id || user.email) : null;
    const historyKey = identifier ? `storyHistory_${identifier}` : 'storyHistory_guest';

    // 2. Fetch data ONLY from that specific key
    const savedHistory = localStorage.getItem(historyKey);

    // 3. Update state strictly
    if (savedHistory) {
      try {
        setHistoryItems(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
        setHistoryItems([]);
      }
    } else {
      // CRITICAL: If no history exists for THIS user, show EMPTY list.
      // Do NOT keep the previous state (which might belong to the old user).
      setHistoryItems([]);
    }
  }, [user]); // This dependency ensures it runs IMMEDIATELY when user logs in/out

  // Load in-progress session (role, JD, uploaded resume) on app start
  // CHANGED: Use sessionStorage instead of localStorage so it clears on browser restart
  useEffect(() => {
    const savedSession = sessionStorage.getItem('sessionState');
    if (!savedSession) return;
    try {
      const { userResume: savedResume, jobRole: savedRole, jobDescription: savedJD } = JSON.parse(savedSession);
      if (savedResume) setUserResume(savedResume);
      if (savedRole) setJobRole(savedRole);
      if (savedJD) setJobDescription(savedJD);
    } catch (error) {
      console.error('Error loading session state:', error);
    }
  }, []);

  // Load current generation data from localStorage on app start (for refresh persistence)
  useEffect(() => {
    const savedGenerationData = sessionStorage.getItem('currentGenerationData');
    if (savedGenerationData) {
      try {
        setCurrentGenerationData(JSON.parse(savedGenerationData));
      } catch (error) {
        console.error('Error loading generation data:', error);
      }
    }
  }, []);

  const handleResumeUpload = (resumeData) => {
    console.log('Resume uploaded:', resumeData);
    setUserResume(resumeData);
  };

  // Persist in-progress session whenever key fields change
  // CHANGED: Use sessionStorage instead of localStorage
  useEffect(() => {
    const sessionState = {
      userResume,
      jobRole,
      jobDescription,
    };

    try {
      sessionStorage.setItem('sessionState', JSON.stringify(sessionState));
    } catch (error) {
      console.error('Error saving session state:', error);
    }
  }, [userResume, jobRole, jobDescription]);

  // Fixed function to handle story generation with REAL AI analysis data
  const handleGenerateStory = (resumeData, jobRole) => {
    console.log('🎯 App.js - Generating story for:', resumeData, jobRole);
    console.log('🎯 App.js - Real analysis data received:', resumeData?.analysis);

    // PRESERVE the real AI analysis data instead of creating mock data
    const generationData = {
      ...resumeData, // Keep all the real data from API response
      targetJobRole: jobRole,
      uploadedAt: new Date().toISOString(),
      // Keep the real analysis data that came from the AI service
      analysis: resumeData.analysis || resumeData.aiAnalysis,
      // Keep other real properties
      fileName: resumeData.fileName || resumeData.name || 'Resume',
      resumeId: resumeData.resumeId,
      fileSize: resumeData.fileSize,
      extractedText: resumeData.extractedText
    };

    console.log('🎯 App.js - Setting generation data:', generationData);
    setCurrentGenerationData(generationData);

    // Save to sessionStorage for refresh persistence (clears on close)
    try {
      sessionStorage.setItem('currentGenerationData', JSON.stringify(generationData));
    } catch (error) {
      console.error('Error saving generation data:', error);
    }
  };

  // Enhanced function to save comprehensive history
  const handleSaveToHistory = (historyItem) => {
    const enhancedHistoryItem = {
      ...historyItem,
      id: Date.now(),
      date: new Date().toISOString(),
      version: "1.0", // For future updates/versions
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: Date.now() // Simple session tracking
      }
    };

    const updatedHistory = [enhancedHistoryItem, ...historyItems];
    setHistoryItems(updatedHistory);

    try {
      // Backend sends 'id', MongoDB uses '_id'. We check both, then fallback to email.
      const identifier = user ? (user._id || user.id || user.email) : null;
      const historyKey = identifier ? `storyHistory_${identifier}` : 'storyHistory_guest';

      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      console.log('Enhanced story data saved to history successfully for user:', identifier || 'guest');
    } catch (error) {
      console.error('Error saving to history:', error);
      // Handle storage quota exceeded
      if (error.name === 'QuotaExceededError') {
        const identifier = user ? (user._id || user.id || user.email) : null;
        const historyKey = identifier ? `storyHistory_${identifier}` : 'storyHistory_guest';
        // Remove oldest items and try again
        const trimmedHistory = updatedHistory.slice(0, 10); // Keep only 10 most recent
        localStorage.setItem(historyKey, JSON.stringify(trimmedHistory));
        setHistoryItems(trimmedHistory);
      }
    }
  };

  // Function to handle viewing from history
  const handleViewFromHistory = (historyItem) => {
    // Robustly construct the data object for StoryGeneration
    // Ensure 'analysis' is merged into the object if it exists separately
    let dataToSet = historyItem.resumeData || {};

    // If resumeData doesn't have the analysis but historyItem does (e.g. from local history or our manually constructed backend item), merge it.
    if (!dataToSet.analysis && !dataToSet.aiAnalysis && historyItem.analysis) {
      dataToSet = { ...dataToSet, analysis: historyItem.analysis };
    }

    // Also ensure story/achievements are carried over if present
    if (historyItem.story && !dataToSet.story) {
      dataToSet.story = historyItem.story;
    }

    // Set the state
    setCurrentGenerationData(dataToSet);

    return historyItem;
  };

  // Centralized delete handler to ensure consistent state and localStorage keys
  const handleDeleteHistoryItem = (itemId) => {
    // 1. Update State
    const updatedHistory = historyItems.filter(item => item.id !== itemId);
    setHistoryItems(updatedHistory);

    // 2. Update LocalStorage using the CORRECT key
    try {
      const identifier = user ? (user._id || user.id || user.email) : null;
      const historyKey = identifier ? `storyHistory_${identifier}` : 'storyHistory_guest';
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Failed to sync deletion to local storage', err);
    }
  };

  return (
    <div className="App">
      {/* Mobile Warning Overlay */}
      <div className="mobile-warning-overlay">
        <div className="mobile-warning-content">
          <div className="icon-wrapper">
            <FaDesktop className="mobile-warning-icon" />
          </div>
          <h2 className="mobile-warning-title">
            Use Laptop for Best Experience
          </h2>
          <p className="mobile-warning-text">
            Resume toh laptop mein hi hai,<br />
            toh site bhi wahin use karo na 😉
          </p>
          <p className="mobile-warning-footer">
            Mobile experience coming soon.
          </p>
        </div>
      </div>

      <Header
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthModal(true)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(userData) => {
          setUser(userData);
          // showAuthModal will be closed by onClose since it's probably triggered inside AuthModal
        }}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onResumeUpload={handleResumeUpload}
                setJobRole={setJobRole}
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                onGenerateStory={handleGenerateStory}
                onSaveToHistory={handleSaveToHistory}
                userResume={userResume}
                jobRole={jobRole}
                user={user}
                onUserLogin={setUser}
                openAuthModal={() => setShowAuthModal(true)}
              />
            }
          />

          <Route
            path="/history"
            element={
              <History
                historyItems={historyItems}
                onViewItem={handleViewFromHistory}
                onDeleteItem={handleDeleteHistoryItem}
              />
            }
          />



          <Route
            path="/contact"
            element={<Contact user={user} />}
          />

          {/* Enhanced Story Generation Route */}
          <Route
            path="/generate"
            element={
              <StoryGeneration
                resumeData={currentGenerationData}
                onSaveToHistory={handleSaveToHistory}
                onBack={() => window.history.back()}
              />
            }
          />

          {/* Route for viewing historical story generation */}
          <Route
            path="/generate/:historyId"
            element={
              <StoryGeneration
                resumeData={currentGenerationData}
                onSaveToHistory={handleSaveToHistory}
                onBack={() => window.history.back()}
                isHistoricalView={true}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;