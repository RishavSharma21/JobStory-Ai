// // src/components/Header.js
// import React, { useState, useEffect, useRef } from 'react';
// import '../App.css';

// const Header = () => {
//   // State to manage whether the dropdown is open or closed
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
//   // Ref to detect clicks outside the dropdown
//   const dropdownRef = useRef(null);

//   // This effect adds an event listener to close the dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     // Add listener when the component mounts
//     document.addEventListener("mousedown", handleClickOutside);
//     // Cleanup the listener when the component unmounts
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [dropdownRef]);

//   return (
//     <header className="header">
//       <div className="header-container">
//         <div className="logo">
//           <div className="logo-icon">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//               <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" 
//                     fill="white" opacity="0.9"/>
//             </svg>
//           </div>
//           <span className="logo-text">StoryBuilder</span>
//         </div>
        
//         <div className="profile-section" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
//           <div className="profile-avatar">
//             <img 
//               src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
//               alt="Profile" 
//               className="avatar-image"
//             />
//           </div>
//           <span className="profile-text">My Profile</span>

//           {/* --- Dropdown Menu --- */}
//           {isDropdownOpen && (
//             <div className="profile-dropdown" ref={dropdownRef}>
//               <div className="dropdown-header">
//                 Rishav Sharma
//               </div>
//               <ul className="dropdown-menu">
//                 <li className="dropdown-item">
//                   <div className="dropdown-icon">
//                     {/* Contact Us Icon (Paper Plane) */}
//                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
//                   </div>
//                   <span>Contact us</span>
//                 </li>
//                 <li className="dropdown-item">
//                   <div className="dropdown-icon">
//                     {/* Log Out Icon */}
//                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
//                   </div>
//                   <span>Log out</span>
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;


// src/components/Header.js
import React, { useState, useEffect, useRef } from "react";
import "../App.css";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  const [dropdownView, setDropdownView] = useState("main"); 
  const [theme, setTheme] = useState("night");

  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
    }
    // To see the logged-in menu, uncomment the line below
    setUser({ name: "Guest" }); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsDropdownOpen(false);
  };

  const handleLoginSignup = () => {
    window.location.href = "/login";
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
        {/* Logo Section */}
        <div className="logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 5C5 3.89543 5.89543 3 7 3H12H17C18.1046 3 19 3.89543 19 5V12V19C19 20.1046 18.1046 21 17 21H12H7C5.89543 21 5 20.1046 5 19V12V5Z" fill="white" opacity="0.9"/>
              <path d="M8 8H16V10H8V8Z" fill="#3b82f6"/>
              <path d="M8 12H16V14H8V12Z" fill="#3b82f6"/>
              <path d="M8 16H13V18H8V16Z" fill="#3b82f6"/>
              <path d="M15 16C15 16.5523 15.4477 17 16 17C16.5523 17 17 16.5523 17 16C17 15.4477 16.5523 15 16 15C15.4477 15 15 15.4477 15 16Z" fill="#3b82f6"/>
            </svg>
          </div>
          <h1 className="logo">Story<span>Builder</span></h1>
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
                      {/* --- MODIFIED: Changed "My Account" to "Dashboard" --- */}
                      <li className="dropdown-item" onClick={() => alert("Dashboard Page")}>
                        <div className="dropdown-icon">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                          </svg>
                        </div>
                        <span>Dashboard</span>
                      </li>
                      <li className="dropdown-item" onClick={() => alert("Story History Page")}>
                        <div className="dropdown-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                          </svg>
                        </div>
                        <span>Story History</span>
                      </li>
                    </>
                  )}

                  {/* --- MODIFIED: New and improved Theme Icon --- */}
                  <li className="dropdown-item" onClick={() => setDropdownView("theme")}>
                    <div className="dropdown-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                      </svg>
                    </div>
                    <span>Theme</span>
                  </li>

                  <li className="dropdown-item" onClick={() => alert("Contact Us Page")}>
                    <div className="dropdown-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                      </svg>
                    </div>
                    <span>Contact Us</span>
                  </li>

                  {user ? (
                    <li className="dropdown-item" onClick={handleLogout}>
                      <div className="dropdown-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                      </div>
                      <span>Log Out</span>
                    </li>
                  ) : (
                    <li className="dropdown-item" onClick={handleLoginSignup}>
                      <div className="dropdown-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                      </div>
                      <span>Sign Up / Log In</span>
                    </li>
                  )}
                </ul>
              </>
            ) : (
             // --- This is the theme selection view, no changes needed here ---
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
    </header>
  );
};

export default Header;