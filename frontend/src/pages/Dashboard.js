// // src/pages/Dashboard.js
// import React, { useState, useEffect } from 'react';
// import ResumePreview from '../components/ResumePreview';
// import StoryGeneration from '../components/StoryGeneration';
// import InterviewPractice from '../components/InterviewPractice';

// const Dashboard = ({ resume, jobRole, setJobRole }) => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [generatedStories, setGeneratedStories] = useState(null);
//   const [interviewQuestions, setInterviewQuestions] = useState([]);

//   useEffect(() => {
//     // Generate stories when component mounts or when jobRole changes
//     if (resume && jobRole) {
//       generateStories();
//       generateInterviewQuestions();
//     }
//   }, [resume, jobRole]);

//   const generateStories = async () => {
//     // This will later connect to your AI backend
//     const mockStories = {
//       tellMeAboutYourself: `I'm a passionate ${jobRole} with experience in building scalable applications. Throughout my career, I've successfully delivered projects that have improved user experience and business outcomes. My experience includes working with modern technologies and collaborating with cross-functional teams to solve complex problems.`,
//       experiences: [
//         {
//           title: "Led Development Team",
//           story: "During my previous role, I led a team of 5 developers to build a new feature that increased user engagement by 40%. Using the STAR method: I faced the Situation of declining user activity, my Task was to design an engaging solution, my Action involved implementing modern UI/UX practices, and the Result was a significant boost in user metrics.",
//           impact: "40% increase in user engagement"
//         },
//         {
//           title: "Optimized Application Performance",
//           story: "I identified performance bottlenecks in our main application that were causing slow loading times. I took the initiative to refactor the codebase, implement caching strategies, and optimize database queries, resulting in 60% faster load times.",
//           impact: "60% improvement in load times"
//         }
//       ],
//       projects: [
//         {
//           name: "E-commerce Platform",
//           story: "I built a full-stack e-commerce platform using React and Node.js. The challenging aspect was implementing secure payment processing and real-time inventory management. I overcame this by integrating Stripe API and implementing WebSocket connections for live updates.",
//           technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
//           github: "github.com/user/ecommerce-project"
//         }
//       ],
//       skills: [
//         {
//           category: "Frontend",
//           skills: ["React", "JavaScript", "HTML/CSS"],
//           story: "I've been working with React for over 3 years, building responsive and interactive user interfaces. My experience includes state management with Redux, component optimization, and creating reusable UI libraries."
//         },
//         {
//           category: "Backend",
//           skills: ["Node.js", "Express", "MongoDB"],
//           story: "I've developed numerous REST APIs using Node.js and Express, with a focus on security, scalability, and performance. My database experience includes both SQL and NoSQL databases, with particular expertise in MongoDB."
//         }
//       ]
//     };

//     setGeneratedStories(mockStories);
//   };

//   const generateInterviewQuestions = async () => {
//     // This will later connect to your AI backend for role-specific questions
//     const mockQuestions = [
//       {
//         category: "General",
//         questions: [
//           "Tell me about yourself",
//           "Why do you want to work here?",
//           "What are your biggest strengths?",
//           "What's your biggest weakness?"
//         ]
//       },
//       {
//         category: "Technical",
//         questions: [
//           `What's your experience with React development?`,
//           `How do you handle state management in large applications?`,
//           `Describe a challenging bug you've fixed recently`,
//           `How do you ensure code quality in your projects?`
//         ]
//       },
//       {
//         category: "Behavioral",
//         questions: [
//           "Describe a time when you had to learn a new technology quickly",
//           "Tell me about a conflict with a team member and how you resolved it",
//           "Give me an example of when you had to meet a tight deadline",
//           "Describe a project you're particularly proud of"
//         ]
//       }
//     ];

//     setInterviewQuestions(mockQuestions);
//   };

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: '📋' },
//     { id: 'stories', label: 'My Stories', icon: '📖' },
//     { id: 'questions', label: 'Interview Q&A', icon: '❓' },
//     { id: 'practice', label: 'Practice Mode', icon: '🎯' }
//   ];

//   return (
//     <div className="dashboard">
//       <div className="dashboard-header">
//         <div className="dashboard-title">
//           <h1>Your Interview Dashboard</h1>
//           <p>Role: <strong>{jobRole || 'Not specified'}</strong></p>
//         </div>
        
//         {!jobRole && (
//           <div className="job-role-prompt">
//             <input
//               type="text"
//               placeholder="Enter your target job role"
//               onChange={(e) => setJobRole(e.target.value)}
//               className="job-role-input-small"
//             />
//           </div>
//         )}
//       </div>

//       <div className="dashboard-tabs">
//         {tabs.map(tab => (
//           <button
//             key={tab.id}
//             className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
//             onClick={() => setActiveTab(tab.id)}
//           >
//             <span className="tab-icon">{tab.icon}</span>
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       <div className="dashboard-content">
//         {activeTab === 'overview' && (
//           <div className="overview-tab">
//             <div className="overview-grid">
//               <ResumePreview resume={resume} />
              
//               <div className="quick-stats">
//                 <h3>Quick Stats</h3>
//                 <div className="stat-item">
//                   <span className="stat-number">4</span>
//                   <span className="stat-label">Generated Stories</span>
//                 </div>
//                 <div className="stat-item">
//                   <span className="stat-number">12</span>
//                   <span className="stat-label">Practice Questions</span>
//                 </div>
//                 <div className="stat-item">
//                   <span className="stat-number">85%</span>
//                   <span className="stat-label">Readiness Score</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'stories' && (
//           <StoryGeneration 
//             stories={generatedStories}
//             jobRole={jobRole}
//             onRegenerateStories={generateStories}
//           />
//         )}

//         {activeTab === 'questions' && (
//           <div className="questions-tab">
//             <div className="questions-header">
//               <h2>Potential Interview Questions</h2>
//               <p>Based on your resume and the {jobRole} role</p>
//             </div>

//             {interviewQuestions.map((category, index) => (
//               <div key={index} className="question-category">
//                 <h3>{category.category} Questions</h3>
//                 <div className="questions-list">
//                   {category.questions.map((question, qIndex) => (
//                     <div key={qIndex} className="question-item">
//                       <div className="question-text">{question}</div>
//                       <button className="practice-btn">Practice Answer</button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {activeTab === 'practice' && (
//           <InterviewPractice 
//             questions={interviewQuestions}
//             stories={generatedStories}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import ResumePreview from '../components/ResumePreview';
import StoryGeneration from '../components/StoryGeneration';
import InterviewPractice from '../components/InterviewPractice';

const Dashboard = ({ resume, jobRole, setJobRole }) => {
  const [activeTab, setActiveTab] = useState('resume');
  const [generatedStories, setGeneratedStories] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeExplanations, setResumeExplanations] = useState(null);

  useEffect(() => {
    if (resume && jobRole) {
      generateStories();
      generateInterviewQuestions();
      generateResumeExplanations();
    }
  }, [resume, jobRole]);

  const generateResumeExplanations = async () => {
    // Mock explanations for each resume section - this will connect to AI later
    const mockExplanations = {
      summary: {
        content: "I'm a passionate software developer with 5 years of experience...",
        explanation: "This opening statement should be your elevator pitch. It summarizes your professional identity, years of experience, and key value proposition. Keep it concise but impactful."
      },
      experience: [
        {
          company: "Tech Corp",
          role: "Senior Developer",
          content: "Led development of user dashboard, increasing engagement by 40%",
          explanation: "When discussing this role, emphasize leadership skills and quantifiable results. The 40% increase shows measurable impact, which interviewers love to hear.",
          talkingPoints: [
            "Leadership experience with development teams",
            "Focus on user experience and engagement metrics",
            "Ability to deliver measurable business impact"
          ]
        }
      ],
      skills: {
        technical: ["React", "Node.js", "Python"],
        explanation: "Group your skills by category and be prepared to give specific examples of projects where you used each technology. Don't just list them - tell stories about how you applied them.",
        talkingPoints: [
          "Provide concrete examples for each skill",
          "Mention recent projects or achievements",
          "Discuss how you stay updated with new technologies"
        ]
      },
      projects: [
        {
          name: "E-commerce Platform",
          explanation: "Personal projects show initiative and passion. Explain the problem you solved, technologies you chose, and what you learned from the experience."
        }
      ]
    };

    setResumeExplanations(mockExplanations);
  };

  const generateStories = async () => {
    setIsGenerating(true);
    
    // Mock stories - will connect to AI backend later
    const mockStories = {
      tellMeAboutYourself: {
        content: `I'm a passionate ${jobRole} with 5 years of experience building scalable web applications. I thrive on solving complex problems and have successfully led teams to deliver projects that improved user experience by 40% and reduced system load times by 60%. What excites me most about this role is the opportunity to bring my expertise in React and Node.js to help your team build innovative solutions that make a real impact.`,
        lastGenerated: new Date().toISOString()
      },
      experiences: [
        {
          id: 'exp_1',
          title: "Led Development Team",
          situation: "Our user engagement was declining, and the product team needed a solution fast.",
          task: "I was tasked with leading a team of 5 developers to build a new dashboard feature.",
          action: "I implemented agile methodologies, conducted user research, and designed an intuitive interface using React and modern UX principles.",
          result: "We delivered the feature 2 weeks ahead of schedule, resulting in a 40% increase in user engagement and 25% reduction in support tickets.",
          impact: "40% increase in user engagement",
          lastGenerated: new Date().toISOString()
        },
        {
          id: 'exp_2',
          title: "Performance Optimization Project",
          situation: "Our main application was experiencing slow load times, causing user frustration.",
          task: "I needed to identify and resolve performance bottlenecks across the entire system.",
          action: "I conducted a thorough performance audit, implemented lazy loading, optimized database queries, and added Redis caching.",
          result: "Achieved a 60% improvement in load times and 30% reduction in server costs.",
          impact: "60% improvement in load times",
          lastGenerated: new Date().toISOString()
        }
      ],
      projects: [
        {
          id: 'proj_1',
          name: "E-commerce Platform",
          story: "I built this full-stack e-commerce platform to solve the problem of small businesses needing affordable online presence. The biggest challenge was implementing secure payment processing and real-time inventory management. I overcame this by integrating Stripe API and implementing WebSocket connections for live updates.",
          technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
          github: "github.com/user/ecommerce-project",
          lastGenerated: new Date().toISOString()
        }
      ],
      skills: [
        {
          id: 'skill_1',
          category: "Frontend Development",
          skills: ["React", "JavaScript", "TypeScript"],
          story: "I've been working with React for over 3 years, building responsive and interactive user interfaces. My most significant project involved rebuilding our entire frontend architecture, which resulted in 40% faster load times and improved user satisfaction scores.",
          lastGenerated: new Date().toISOString()
        }
      ]
    };

    // Simulate API call delay
    setTimeout(() => {
      setGeneratedStories(mockStories);
      setIsGenerating(false);
    }, 1500);
  };

  const regenerateSpecificStory = async (storyType, storyId = null) => {
    setIsGenerating(true);
    
    // Mock regeneration logic - will connect to AI backend
    const updatedStories = { ...generatedStories };
    
    if (storyType === 'tellMeAboutYourself') {
      updatedStories.tellMeAboutYourself = {
        content: `As a ${jobRole}, I bring a unique combination of technical expertise and leadership experience. Over the past 5 years, I've specialized in building scalable applications that directly impact business outcomes. My approach focuses on understanding user needs first, then delivering solutions that exceed expectations. I'm particularly proud of leading projects that have consistently delivered 40%+ improvements in key metrics.`,
        lastGenerated: new Date().toISOString()
      };
    } else if (storyType === 'experience' && storyId) {
      const expIndex = updatedStories.experiences.findIndex(exp => exp.id === storyId);
      if (expIndex !== -1) {
        updatedStories.experiences[expIndex] = {
          ...updatedStories.experiences[expIndex],
          action: "I took a data-driven approach, analyzing user behavior patterns and implementing A/B tests to validate our solutions before full deployment.",
          lastGenerated: new Date().toISOString()
        };
      }
    }

    setTimeout(() => {
      setGeneratedStories(updatedStories);
      setIsGenerating(false);
    }, 1000);
  };

  const generateInterviewQuestions = async () => {
    const mockQuestions = [
      {
        category: "Opening Questions",
        questions: [
          { id: 'q1', text: "Tell me about yourself", difficulty: "Easy", isPrepared: true },
          { id: 'q2', text: "Why are you interested in this role?", difficulty: "Easy", isPrepared: false },
          { id: 'q3', text: "What do you know about our company?", difficulty: "Medium", isPrepared: false }
        ]
      },
      {
        category: "Technical Questions",
        questions: [
          { id: 'q4', text: "Describe your experience with React and state management", difficulty: "Medium", isPrepared: true },
          { id: 'q5', text: "How do you handle performance optimization?", difficulty: "Hard", isPrepared: true },
          { id: 'q6', text: "Walk me through your development workflow", difficulty: "Medium", isPrepared: false }
        ]
      },
      {
        category: "Behavioral Questions",
        questions: [
          { id: 'q7', text: "Tell me about a time you faced a challenging deadline", difficulty: "Medium", isPrepared: true },
          { id: 'q8', text: "Describe a conflict with a team member and how you resolved it", difficulty: "Hard", isPrepared: false },
          { id: 'q9', text: "Give an example of when you had to learn something new quickly", difficulty: "Medium", isPrepared: false }
        ]
      }
    ];

    setInterviewQuestions(mockQuestions);
  };

  const tabs = [
    { id: 'resume', label: 'Resume Analysis', icon: '📄' },
    { id: 'narratives', label: 'Interview Narratives', icon: '📖' },
    { id: 'questions', label: 'Practice Questions', icon: '❓' },
    { id: 'mock', label: 'Mock Interview', icon: '🎯' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="dashboard-title">
            <h1>Interview Preparation Dashboard</h1>
            <div className="role-info">
              <span className="role-label">Preparing for:</span>
              <span className="role-name">{jobRole || 'Not specified'}</span>
              {jobRole && (
                <button className="change-role-btn" onClick={() => setJobRole('')}>
                  Change Role
                </button>
              )}
            </div>
          </div>
          
          <div className="preparation-score">
            <div className="score-circle">
              <span className="score-number">87%</span>
              <span className="score-label">Ready</span>
            </div>
          </div>
        </div>

        {!jobRole && (
          <div className="job-role-banner">
            <p>⚠️ Please specify your target role to get personalized content</p>
            <input
              type="text"
              placeholder="Enter your target job role"
              onChange={(e) => setJobRole(e.target.value)}
              className="job-role-input-banner"
            />
          </div>
        )}
      </div>

      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {activeTab === 'resume' && (
          <div className="resume-tab">
            <div className="resume-layout">
              <div className="resume-display">
                <div className="section-header">
                  <h2>Your Resume</h2>
                  <div className="resume-actions">
                    <button className="action-btn secondary">Download</button>
                    <button className="action-btn primary">Upload New</button>
                  </div>
                </div>
                <ResumePreview resume={resume} />
              </div>
              
              <div className="resume-explanations">
                <div className="section-header">
                  <h2>Interview Guide</h2>
                  <p>How to present each section effectively</p>
                </div>
                
                {resumeExplanations && (
                  <div className="explanation-sections">
                    {/* Summary Section */}
                    <div className="explanation-item">
                      <h3>Professional Summary</h3>
                      <div className="explanation-content">
                        <div className="what-to-say">
                          <h4>What to say:</h4>
                          <p>{resumeExplanations.summary.explanation}</p>
                        </div>
                        <div className="talking-points">
                          <h4>Key talking points:</h4>
                          <ul>
                            <li>Your professional identity and years of experience</li>
                            <li>Core competencies relevant to the role</li>
                            <li>One major achievement or value proposition</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Experience Section */}
                    {resumeExplanations.experience?.map((exp, index) => (
                      <div key={index} className="explanation-item">
                        <h3>{exp.role} at {exp.company}</h3>
                        <div className="explanation-content">
                          <div className="what-to-say">
                            <h4>How to present this role:</h4>
                            <p>{exp.explanation}</p>
                          </div>
                          <div className="talking-points">
                            <h4>Talking points:</h4>
                            <ul>
                              {exp.talkingPoints.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Skills Section */}
                    <div className="explanation-item">
                      <h3>Technical Skills</h3>
                      <div className="explanation-content">
                        <div className="what-to-say">
                          <h4>How to discuss your skills:</h4>
                          <p>{resumeExplanations.skills.explanation}</p>
                        </div>
                        <div className="talking-points">
                          <h4>Remember to:</h4>
                          <ul>
                            {resumeExplanations.skills.talkingPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'narratives' && (
          <div className="narratives-tab">
            <div className="narratives-header">
              <h2>Your Interview Narratives</h2>
              <p>Compelling stories crafted from your experience</p>
              <button 
                className="regenerate-all-btn"
                onClick={generateStories}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Regenerate All Stories'}
              </button>
            </div>

            {generatedStories && (
              <div className="narratives-content">
                {/* Tell Me About Yourself */}
                <div className="narrative-section">
                  <div className="narrative-header">
                    <h3>"Tell me about yourself"</h3>
                    <button 
                      className="regenerate-btn"
                      onClick={() => regenerateSpecificStory('tellMeAboutYourself')}
                      disabled={isGenerating}
                    >
                      {isGenerating ? '...' : '🔄 Regenerate'}
                    </button>
                  </div>
                  <div className="narrative-content">
                    <p>{generatedStories.tellMeAboutYourself?.content}</p>
                    <div className="narrative-meta">
                      <span>Last updated: {new Date(generatedStories.tellMeAboutYourself?.lastGenerated).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Experience Stories */}
                <div className="narrative-section">
                  <h3>Experience Stories</h3>
                  {generatedStories.experiences?.map((exp, index) => (
                    <div key={exp.id} className="story-card">
                      <div className="story-header">
                        <h4>{exp.title}</h4>
                        <div className="story-actions">
                          <span className="impact-badge">{exp.impact}</span>
                          <button 
                            className="regenerate-btn small"
                            onClick={() => regenerateSpecificStory('experience', exp.id)}
                            disabled={isGenerating}
                          >
                            🔄
                          </button>
                        </div>
                      </div>
                      <div className="star-method">
                        <div className="star-item">
                          <strong>Situation:</strong> {exp.situation}
                        </div>
                        <div className="star-item">
                          <strong>Task:</strong> {exp.task}
                        </div>
                        <div className="star-item">
                          <strong>Action:</strong> {exp.action}
                        </div>
                        <div className="star-item">
                          <strong>Result:</strong> {exp.result}
                        </div>
                      </div>
                      <div className="story-meta">
                        <span>Last updated: {new Date(exp.lastGenerated).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Project Stories */}
                <div className="narrative-section">
                  <h3>Project Highlights</h3>
                  {generatedStories.projects?.map((project, index) => (
                    <div key={project.id} className="story-card">
                      <div className="story-header">
                        <h4>{project.name}</h4>
                        <button 
                          className="regenerate-btn small"
                          onClick={() => regenerateSpecificStory('project', project.id)}
                          disabled={isGenerating}
                        >
                          🔄
                        </button>
                      </div>
                      <p>{project.story}</p>
                      <div className="tech-stack">
                        {project.technologies.map(tech => (
                          <span key={tech} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="questions-tab">
            <div className="questions-header">
              <h2>Practice Questions</h2>
              <p>Common questions for {jobRole} positions</p>
              <div className="questions-stats">
                <span className="stat">
                  <strong>12</strong> questions prepared
                </span>
                <span className="stat">
                  <strong>8</strong> need practice
                </span>
              </div>
            </div>

            {interviewQuestions.map((category, index) => (
              <div key={index} className="question-category">
                <h3>{category.category}</h3>
                <div className="questions-list">
                  {category.questions.map((question, qIndex) => (
                    <div key={question.id} className="question-item">
                      <div className="question-content">
                        <div className="question-text">{question.text}</div>
                        <div className="question-meta">
                          <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
                            {question.difficulty}
                          </span>
                          <span className={`status ${question.isPrepared ? 'prepared' : 'needs-practice'}`}>
                            {question.isPrepared ? '✓ Ready' : '⚠️ Practice needed'}
                          </span>
                        </div>
                      </div>
                      <div className="question-actions">
                        <button className="practice-btn">Practice</button>
                        <button className="view-answer-btn">View Answer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mock' && (
          <InterviewPractice 
            questions={interviewQuestions}
            stories={generatedStories}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;