// src/App.js - Enhanced Integration
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import History from "./pages/History";
import Analyze from "./pages/analyze";
import StoryGeneration from "./components/StoryGeneration";

function App() {
  const [userResume, setUserResume] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [historyItems, setHistoryItems] = useState([]);
  const [currentGenerationData, setCurrentGenerationData] = useState(null);

  // Load history from localStorage on app start
  useEffect(() => {
    const savedHistory = localStorage.getItem('storyHistory');
    if (savedHistory) {
      try {
        setHistoryItems(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  const handleResumeUpload = (resumeData) => {
    console.log('Resume uploaded:', resumeData);
    setUserResume(resumeData);
  };

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
      localStorage.setItem('storyHistory', JSON.stringify(updatedHistory));
      console.log('Enhanced story data saved to history successfully!');
    } catch (error) {
      console.error('Error saving to history:', error);
      // Handle storage quota exceeded
      if (error.name === 'QuotaExceededError') {
        // Remove oldest items and try again
        const trimmedHistory = updatedHistory.slice(0, 10); // Keep only 10 most recent
        localStorage.setItem('storyHistory', JSON.stringify(trimmedHistory));
        setHistoryItems(trimmedHistory);
      }
    }
  };

  // Function to handle viewing from history
  const handleViewFromHistory = (historyItem) => {
    setCurrentGenerationData(historyItem.resumeData);
    // Navigate to story generation page with historical data
    return historyItem;
  };

  return (
    <div className="App">
      <Header />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onResumeUpload={handleResumeUpload}
                setJobRole={setJobRole}
                onGenerateStory={handleGenerateStory}
                userResume={userResume}
                jobRole={jobRole}
              />
            }
          />
          
          <Route 
            path="/history" 
            element={
              <History 
                historyItems={historyItems} 
                onViewItem={handleViewFromHistory}
              />
            } 
          />
          
          <Route
            path="/analyze"
            element={<Analyze resume={userResume} jobRole={jobRole} />}
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