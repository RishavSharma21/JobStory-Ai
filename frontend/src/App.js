// src/App.js
import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
// You will need to create and import your LoginPage as well
// import LoginPage from './pages/LoginPage'; 

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userResume, setUserResume] = useState(null);
  const [jobRole, setJobRole] = useState('');

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const handleResumeUpload = (resumeData) => {
    setUserResume(resumeData);
    setCurrentPage('dashboard');
  };

  return (
    <div className="App">
      {/* The navigateTo function is passed as a prop */}
      <Header currentPage={currentPage} navigateTo={navigateTo} />
      
      {/* ADD THIS WRAPPER AROUND YOUR PAGE CONTENT */}
      <main className="main-content">
        {currentPage === 'home' && (
          <Home 
            onResumeUpload={handleResumeUpload}
            setJobRole={setJobRole}
          />
        )}
        
        {currentPage === 'dashboard' && (
          <Dashboard 
            resume={userResume}
            jobRole={jobRole}
            setJobRole={setJobRole}
          />
        )}

        {/* You would add your new login page here */}
        {/* {currentPage === 'login' && <LoginPage />} */}
      </main>
    </div>
  );
}

export default App;