// src/App.js
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import History from "./pages/History";
import Analyze from "./pages/analyze"; // ✅ Import Analyze

function App() {
  const [userResume, setUserResume] = useState(null);
  const [jobRole, setJobRole] = useState("");

  const handleResumeUpload = (resumeData) => {
    setUserResume(resumeData);
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
              />
            }
          />
          <Route path="/history" element={<History />} />
          <Route
            path="/analyze"
            element={<Analyze resume={userResume} jobRole={jobRole} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
