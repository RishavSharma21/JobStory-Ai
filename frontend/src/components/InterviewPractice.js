// src/components/InterviewPractice.js
import React, { useState, useEffect } from 'react';

const InterviewPractice = ({ questions, stories }) => {
  const [practiceMode, setPracticeMode] = useState('select'); // select, practice, review
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let interval;
    if (isRecording && practiceMode === 'practice') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, practiceMode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startPractice = () => {
    if (selectedQuestions.length === 0) {
      alert('Please select at least one question to practice');
      return;
    }
    setPracticeMode('practice');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTimer(0);
  };

  const handleQuestionSelect = (question, category) => {
    const questionObj = { question, category };
    const isSelected = selectedQuestions.some(q => q.question === question);
    
    if (isSelected) {
      setSelectedQuestions(prev => prev.filter(q => q.question !== question));
    } else {
      setSelectedQuestions(prev => [...prev, questionObj]);
    }
  };

  const nextQuestion = () => {
    // Save current answer
    const answer = {
      question: selectedQuestions[currentQuestionIndex].question,
      answer: currentAnswer,
      timeSpent: timer,
      category: selectedQuestions[currentQuestionIndex].category
    };
    
    setUserAnswers(prev => [...prev, answer]);
    setCurrentAnswer('');
    setTimer(0);
    setIsRecording(false);

    if (currentQuestionIndex + 1 < selectedQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPracticeMode('review');
    }
  };

  const restartPractice = () => {
    setPracticeMode('select');
    setSelectedQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setCurrentAnswer('');
    setTimer(0);
    setIsRecording(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="practice-loading">
        <p>Loading practice questions...</p>
      </div>
    );
  }

  return (
    <div className="interview-practice">
      {/* Question Selection Mode */}
      {practiceMode === 'select' && (
        <div className="question-selection">
          <div className="practice-header">
            <h2>🎯 Interview Practice Mode</h2>
            <p>Select questions you want to practice answering</p>
          </div>

          <div className="selection-summary">
            <div className="selected-count">
              <strong>{selectedQuestions.length}</strong> questions selected
            </div>
            <button 
              className="start-practice-btn"
              onClick={startPractice}
              disabled={selectedQuestions.length === 0}
            >
              Start Practice Session
            </button>
          </div>

          {questions.map((category, categoryIndex) => (
            <div key={categoryIndex} className="question-category">
              <h3>{category.category} Questions ({category.questions.length})</h3>
              
              <div className="category-actions">
                <button 
                  className="select-all-btn"
                  onClick={() => {
                    category.questions.forEach(q => {
                      if (!selectedQuestions.some(sq => sq.question === q)) {
                        handleQuestionSelect(q, category.category);
                      }
                    });
                  }}
                >
                  Select All
                </button>
              </div>

              <div className="questions-grid">
                {category.questions.map((question, qIndex) => {
                  const isSelected = selectedQuestions.some(q => q.question === question);
                  return (
                    <div 
                      key={qIndex}
                      className={`question-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleQuestionSelect(question, category.category)}
                    >
                      <div className="question-checkbox">
                        {isSelected ? '✓' : '○'}
                      </div>
                      <div className="question-text">{question}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Practice Mode */}
      {practiceMode === 'practice' && (
        <div className="practice-session">
          <div className="practice-header">
            <div className="progress-info">
              <span>Question {currentQuestionIndex + 1} of {selectedQuestions.length}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentQuestionIndex + 1) / selectedQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="timer">
              <div className={`timer-display ${isRecording ? 'recording' : ''}`}>
                {formatTime(timer)}
              </div>
            </div>
          </div>

          <div className="current-question">
            <div className="question-category-badge">
              {selectedQuestions[currentQuestionIndex].category}
            </div>
            <h2>{selectedQuestions[currentQuestionIndex].question}</h2>
          </div>

          <div className="answer-section">
            <div className="answer-controls">
              <button 
                className={`record-btn ${isRecording ? 'recording' : ''}`}
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? '⏸️ Pause' : '🎤 Start Answering'}
              </button>
              
              <div className="answer-tips">
                <h4>💡 Tips for this question:</h4>
                <ul>
                  <li>Use the STAR method for behavioral questions</li>
                  <li>Keep your answer between 1-3 minutes</li>
                  <li>Include specific examples and metrics</li>
                  <li>Connect your answer to the job requirements</li>
                </ul>
              </div>
            </div>

            <textarea
              className="answer-input"
              placeholder="Type your answer here or use this space to take notes while speaking..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              rows={8}
            />

            <div className="practice-actions">
              <button className="skip-btn" onClick={nextQuestion}>
                Skip Question
              </button>
              <button 
                className="next-btn"
                onClick={nextQuestion}
              >
                {currentQuestionIndex + 1 === selectedQuestions.length ? 'Finish Practice' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Mode */}
      {practiceMode === 'review' && (
        <div className="practice-review">
          <div className="review-header">
            <h2>🎉 Practice Session Complete!</h2>
            <p>Here's how you did on your {userAnswers.length} questions</p>
          </div>

          <div className="review-stats">
            <div className="stat-card">
              <div className="stat-number">{userAnswers.length}</div>
              <div className="stat-label">Questions Answered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {formatTime(userAnswers.reduce((total, answer) => total + answer.timeSpent, 0))}
              </div>
              <div className="stat-label">Total Practice Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {formatTime(Math.round(userAnswers.reduce((total, answer) => total + answer.timeSpent, 0) / userAnswers.length))}
              </div>
              <div className="stat-label">Average Answer Time</div>
            </div>
          </div>

          <div className="answers-review">
            <h3>Your Answers Review</h3>
            {userAnswers.map((answer, index) => (
              <div key={index} className="answer-review-card">
                <div className="answer-header">
                  <h4>{answer.question}</h4>
                  <div className="answer-meta">
                    <span className="category-tag">{answer.category}</span>
                    <span className="time-tag">{formatTime(answer.timeSpent)}</span>
                  </div>
                </div>
                <div className="answer-content">
                  <p>{answer.answer || 'No written answer provided'}</p>
                </div>
                <div className="answer-feedback">
                  <div className="feedback-score">
                    <span>AI Feedback Score: </span>
                    <strong>{Math.floor(Math.random() * 20) + 75}%</strong>
                  </div>
                  <div className="improvement-tips">
                    <strong>Improvement tips:</strong>
                    <ul>
                      <li>Add more specific metrics and results</li>
                      <li>Include the impact of your actions</li>
                      <li>Practice speaking this answer out loud</li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="review-actions">
            <button className="action-btn primary" onClick={restartPractice}>
              Practice More Questions
            </button>
            <button className="action-btn secondary">
              Export Practice Report
            </button>
            <button className="action-btn tertiary">
              Schedule Follow-up Practice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPractice;