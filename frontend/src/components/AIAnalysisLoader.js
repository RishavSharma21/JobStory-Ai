import React, { useState, useEffect } from 'react';
import { MdRocket } from 'react-icons/md';
import './AIAnalysisLoader.css';

const funnyLines = [
  "This one actually replies 🫠",
  "Don't worry, we won't ghost you like recruiters do 👻",
  "Unlike your ex, we'll actually finish what we started 🗿",
  "At least we respond… unlike that company you applied to 🥀",
  "Unlike her replies, we didn't need 3 business days 💀",
  "At least THIS will load… unlike her replies 😮‍💨",
];

const AIAnalysisLoader = ({ isVisible = false }) => {
  const [randomLine, setRandomLine] = useState("");

  useEffect(() => {
    if (isVisible) {
      // Shuffle and pick ONE line for this entire analysis session
      const randomIndex = Math.floor(Math.random() * funnyLines.length);
      setRandomLine(funnyLines[randomIndex]);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-content">

        {/* Rocket Animation */}
        <div className="rocket-loader">
          <div className="rocket-body">
            <MdRocket size={64} className="rocket-icon" />
            <div className="exhaust-flame"></div>
          </div>
          <ul className="rocket-clouds">
            <li></li><li></li><li></li><li></li>
          </ul>
        </div>


        {/* The Funny Line */}
        <p className="funny-line-text">"{randomLine}"</p>



      </div>
    </div>
  );
};

export default AIAnalysisLoader;
