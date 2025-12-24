// src/components/Header.js
import { NavLink } from 'react-router-dom';
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import md5 from "../utils/md5";

const Header = ({ user, onLogout, onLoginClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // User state is now managed by parent

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



  // Helper to format name: First Name Only + Title Case (e.g. "RISHAV KUMAR" -> "Rishav")
  const getFormattedName = (fullName) => {
    if (!fullName) return "Guest";
    const firstName = fullName.split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  // Helper to get initials avatar URL
  const getInitialsUrl = (name) => {
    if (!name) return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBjknSFU0Y8zCyo-MNCROWd0CRhyrK4TIuY8evOwljxdA4ymnEVy0pEmdddozbuXUPc7Y&usqp=CAU";
    // Check for spaces to decide between 1 or 2 chars
    const hasSpace = name.trim().indexOf(' ') !== -1;
    const lengthParam = hasSpace ? 2 : 1;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&bold=true&length=${lengthParam}`;
  };

  // Determine initial image source
  const getInitialImageSrc = () => {
    if (!user) return getInitialsUrl("");

    // 1. Google Photo (Highest priority)
    if (user.picture) return user.picture;

    // 2. Gravatar (If email exists)
    if (user.email) {
      try {
        const emailHash = md5(user.email.trim().toLowerCase());
        // Use '404' as default so we can catch the error if not found and fallback to initials
        return `https://www.gravatar.com/avatar/${emailHash}?d=404`;
      } catch (e) {
        console.warn('MD5 generation failed', e);
      }
    }

    // 3. Fallback to Initials
    return getInitialsUrl(user.name);
  };

  const [imageSrc, setImageSrc] = useState(getInitialImageSrc());

  // Update image when user changes
  useEffect(() => {
    if (user) {
      setImageSrc(getInitialImageSrc());
    } else {
      setImageSrc(getInitialsUrl(""));
    }
  }, [user]);

  const handleImageError = () => {
    // If current image fails (Google or Gravatar), fallback to Initials
    if (user && user.name) {
      const fallbackUrl = getInitialsUrl(user.name);
      // Only set if different to avoid infinite loops
      if (imageSrc !== fallbackUrl) {
        setImageSrc(fallbackUrl);
      }
    }
  };

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
              <path d="M15 16C15 16.5523 15.4477 17 16 17C16.5523 17 16 16.5523 17 16C17 15.4477 16.5523 15 16 15C15.4477 15 16 15.4477 15 16Z" fill="#ffffff" />
            </svg>
          </div>
          <h1 className="logo">JobStory<span>Ai</span></h1>
        </div>

        {/* Profile Section */}
        <div className="profile-section" ref={dropdownRef}>
          <div className="profile-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className="profile-avatar">
              <img
                src={imageSrc}
                alt="Profile"
                className="avatar-image"
                onError={handleImageError}
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="profile-text">{user ? getFormattedName(user.name) : "Guest"}</span>
          </div>

          <div className={`profile-dropdown ${isDropdownOpen ? "show" : ""} ${!user ? "logged-out" : ""}`}>
            <>
              <div className="dropdown-header">
                {user ? `Welcome, ${getFormattedName(user.name)}` : "Welcome Guest"}
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
              </ul>
            </>
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
