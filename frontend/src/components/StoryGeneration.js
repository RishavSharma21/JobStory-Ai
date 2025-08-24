// src/components/StoryGeneration.js
import React, { useState } from 'react';

const StoryGeneration = ({ stories, jobRole, onRegenerateStories }) => {
  const [activeStory, setActiveStory] = useState('tellMeAboutYourself');
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text, storyType) => {
    navigator.clipboard.writeText(text);
    setCopiedText(storyType);
    setTimeout(() => setCopiedText(''), 2000);
  };

  if (!stories) {
    return (
      <div className="stories-loading">
        <div className="loading-spinner"></div>
        <p>Generating your personalized interview stories...</p>
      </div>
    );
  }

  const storyTypes = [
    { id: 'tellMeAboutYourself', label: 'Tell Me About Yourself', icon: '👋' },
    { id: 'experiences', label: 'Experience Stories', icon: '💼' },
    { id: 'projects', label: 'Project Stories', icon: '🚀' },
    { id: 'skills', label: 'Skills Stories', icon: '⚡' }
  ];

  return (
    <div className="story-generation">
      <div className="stories-header">
        <div className="header-content">
          <h2>Your Interview Stories</h2>
          <p>AI-generated narratives tailored for <strong>{jobRole}</strong> interviews</p>
        </div>
        <button className="regenerate-btn" onClick={onRegenerateStories}>
          🔄 Regenerate All Stories
        </button>
      </div>

      <div className="stories-nav">
        {storyTypes.map(type => (
          <button
            key={type.id}
            className={`story-nav-btn ${activeStory === type.id ? 'active' : ''}`}
            onClick={() => setActiveStory(type.id)}
          >
            <span className="story-icon">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      <div className="stories-content">
        {/* Tell Me About Yourself */}
        {activeStory === 'tellMeAboutYourself' && (
          <div className="story-section">
            <div className="story-card main-story">
              <div className="story-header">
                <h3>👋 Tell Me About Yourself</h3>
                <button 
                  className={`copy-btn ${copiedText === 'tellMeAboutYourself' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(stories.tellMeAboutYourself, 'tellMeAboutYourself')}
                >
                  {copiedText === 'tellMeAboutYourself' ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div className="story-content">
                <p>{stories.tellMeAboutYourself}</p>
              </div>
              <div className="story-tips">
                <h4>💡 Pro Tips:</h4>
                <ul>
                  <li>Keep it under 2 minutes when speaking</li>
                  <li>Focus on present, past, and future</li>
                  <li>Connect your experience to the role</li>
                  <li>End with enthusiasm for the opportunity</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Experience Stories */}
        {activeStory === 'experiences' && (
          <div className="story-section">
            <div className="section-header">
              <h3>💼 Experience Stories</h3>
              <p>STAR method formatted stories from your work experience</p>
            </div>
            
            {stories.experiences.map((exp, index) => (
              <div key={index} className="story-card">
                <div className="story-header">
                  <h4>{exp.title}</h4>
                  <div className="story-actions">
                    <span className="impact-badge">{exp.impact}</span>
                    <button 
                      className={`copy-btn ${copiedText === `exp-${index}` ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(exp.story, `exp-${index}`)}
                    >
                      {copiedText === `exp-${index}` ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
                <div className="story-content">
                  <p>{exp.story}</p>
                </div>
                <div className="star-breakdown">
                  <div className="star-item">
                    <strong>S</strong>ituation: Context and background
                  </div>
                  <div className="star-item">
                    <strong>T</strong>ask: Your responsibility
                  </div>
                  <div className="star-item">
                    <strong>A</strong>ction: What you did
                  </div>
                  <div className="star-item">
                    <strong>R</strong>esult: The outcome and impact
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Project Stories */}
        {activeStory === 'projects' && (
          <div className="story-section">
            <div className="section-header">
              <h3>🚀 Project Stories</h3>
              <p>Compelling narratives about your key projects</p>
            </div>
            
            {stories.projects.map((project, index) => (
              <div key={index} className="story-card">
                <div className="story-header">
                  <h4>{project.name}</h4>
                  <button 
                    className={`copy-btn ${copiedText === `project-${index}` ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(project.story, `project-${index}`)}
                  >
                    {copiedText === `project-${index}` ? '✓' : '📋'}
                  </button>
                </div>
                <div className="story-content">
                  <p>{project.story}</p>
                </div>
                <div className="project-details">
                  <div className="tech-stack">
                    <strong>Technologies:</strong>
                    <div className="tech-tags">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                  {project.github && (
                    <div className="project-link">
                      <strong>GitHub:</strong> <a href={`https://${project.github}`} target="_blank" rel="noopener noreferrer">{project.github}</a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills Stories */}
        {activeStory === 'skills' && (
          <div className="story-section">
            <div className="section-header">
              <h3>⚡ Skills Stories</h3>
              <p>How to talk about your technical skills with context</p>
            </div>
            
            {stories.skills.map((skillGroup, index) => (
              <div key={index} className="story-card">
                <div className="story-header">
                  <h4>{skillGroup.category} Skills</h4>
                  <button 
                    className={`copy-btn ${copiedText === `skill-${index}` ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(skillGroup.story, `skill-${index}`)}
                  >
                    {copiedText === `skill-${index}` ? '✓' : '📋'}
                  </button>
                </div>
                <div className="skills-list">
                  {skillGroup.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="skill-badge">{skill}</span>
                  ))}
                </div>
                <div className="story-content">
                  <p>{skillGroup.story}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="stories-actions">
        <button className="action-btn primary">Practice These Stories</button>
        <button className="action-btn secondary">Export All Stories</button>
        <button className="action-btn tertiary">Generate More Stories</button>
      </div>
    </div>
  );
};

export default StoryGeneration;
                