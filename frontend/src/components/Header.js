// src/components/Header.js
import { NavLink } from 'react-router-dom';
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const Header = ({ user, onLogout, onLoginClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // User state is now managed by parent
  const [dropdownView, setDropdownView] = useState("main");
  const [theme, setTheme] = useState("night");

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleClickLogout = () => {
    // Show confirmation modal
    setShowLogoutConfirm(true);
    setIsDropdownOpen(false);
  };

  const confirmLogout = () => {
    if (onLogout) onLogout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleLoginSignup = () => {
    if (onLoginClick) onLoginClick();
    setIsDropdownOpen(false);
  };

  // Navigation handlers
  const navigateTo = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) {
      setTimeout(() => {
        setDropdownView("main");
      }, 300);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`${theme}-theme`);
    console.log(`Theme changed to: ${theme}`);
  }, [theme]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section - Now clickable to go home */}
        <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 5C5 3.89543 5.89543 3 7 3H12H17C18.1046 3 19 3.89543 19 5V12V19C19 20.1046 18.1046 21 17 21H12H7C5.89543 21 5 20.1046 5 19V12V5Z" fill="#10b981" opacity="1" />
              <path d="M8 8H16V10H8V8Z" fill="#ffffff" />
              <path d="M8 12H16V14H8V12Z" fill="#ffffff" />
              <path d="M8 16H13V18H8V16Z" fill="#ffffff" />
              <path d="M15 16C15 16.5523 15.4477 17 16 17C16.5523 17 17 16.5523 17 16C17 15.4477 16.5523 15 16 15C15.4477 15 15 15.4477 15 16Z" fill="#ffffff" />
            </svg>
          </div>
          <h1 className="logo">JobStory<span>Ai</span></h1>
        </div>

        {/* Profile Section */}
        <div className="profile-section" ref={dropdownRef}>
          <div className="profile-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className="profile-avatar">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBjknSFU0Y8zCyo-MNCROWd0CRhyrK4TIuY8evOwljxdA4ymnEVy0pEmdddozbuXUPc7Y&usqp=CAU"
                alt="Profile"
                className="avatar-image"
              />
            </div>
            <span className="profile-text">{user ? user.name : "Guest"}</span>
          </div>

          <div className={`profile-dropdown ${isDropdownOpen ? "show" : ""} ${!user ? "logged-out" : ""}`}>
            {dropdownView === "main" ? (
              <>
                <div className="dropdown-header">
                  {user ? `Welcome, ${user.name}` : "Welcome Guest"}
                </div>
                <ul className="dropdown-menu">
                  {user && (
                    <>
                      <li className="dropdown-item">
                        <NavLink
                          to="/"
                          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                          end
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="dropdown-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="7" height="7"></rect>
                              <rect x="14" y="3" width="7" height="7"></rect>
                              <rect x="14" y="14" width="7" height="7"></rect>
                              <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                          </div>
                          <span>Home</span>
                        </NavLink>
                      </li>

                      <li className="dropdown-item">
                        <NavLink
                          to="/history"
                          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="dropdown-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                          </div>
                          <span>My History</span>
                        </NavLink>
                      </li>
                    </>
                  )}

                  {/* --- Minimal change below: wrap in div.nav-link for consistent layout --- */}
                  <li className="dropdown-item" style={{ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }}>
                    <div className="nav-link">
                      <div className="dropdown-icon">
                        {/* Lock Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                      <span>Theme</span>
                    </div>
                  </li>

                  <li className="dropdown-item">
                    <NavLink
                      to="/contact"
                      className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="dropdown-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                        </svg>
                      </div>
                      <span>Contact Us</span>
                    </NavLink>
                  </li>

                  {user ? (
                    <li className="dropdown-item">
                      <div className="nav-link" onClick={handleClickLogout}>
                        <div className="dropdown-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                        </div>
                        <span>Log Out</span>
                      </div>
                    </li>
                  ) : (
                    <li className="dropdown-item">
                      <div className="nav-link" onClick={handleLoginSignup}>
                        <div className="dropdown-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                          </svg>
                        </div>
                        <span>Sign Up / Log In</span>
                      </div>
                    </li>
                  )}
                  {/* --- End minimal change --- */}
                </ul>
              </>
            ) : (
              <div className="theme-menu">
                <div className="theme-menu-header">
                  <div className="back-arrow" onClick={() => setDropdownView("main")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </div>
                  <span>Theme</span>
                </div>
                <div className="theme-options">
                  <div className={`theme-option ${theme === 'day' ? 'active' : ''}`} onClick={() => setTheme('day')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    <span>Day</span>
                  </div>
                  <div className={`theme-option ${theme === 'night' ? 'active' : ''}`} onClick={() => setTheme('night')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    <span>Night</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Sign Out?</h3>
            <p>Are you sure you want to sign out of your account?</p>
            <div className="logout-actions">
              <button className="cancel-btn" onClick={cancelLogout}>Cancel</button>
              <button className="confirm-btn" onClick={confirmLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
