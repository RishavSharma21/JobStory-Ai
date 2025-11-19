// src/pages/History.js - Enhanced History Page with Dark Theme
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdFolder, MdSearch, MdAdd, MdDelete, MdDescription, MdWork, MdVisibility, MdCheckCircle, MdHelpOutline, MdHistory } from 'react-icons/md';
import './History.css';
import { getAllResumes } from '../utils/api';

const History = ({ historyItems, onViewItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [backendResumes, setBackendResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sortMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortMenu]);

  // Fetch resumes from backend
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const response = await getAllResumes();
        if (response.success && response.resumes) {
          setBackendResumes(response.resumes);
        }
      } catch (error) {
        console.error('Failed to fetch resumes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  // Merge localStorage history with backend resumes
  const allItems = [
    ...historyItems,
    ...backendResumes.map(resume => ({
      id: resume.resumeId || resume._id,
      resumeName: resume.personalInfo?.name || resume.fileName || 'Unknown',
      date: resume.uploadedAt || resume.analyzedAt || new Date().toISOString(),
      story: '',
      resumeData: {
        targetJobRole: resume.targetJobRole || 'Not Specified',
        fileName: resume.fileName
      },
      analysis: resume.atsScore ? {
        atsScore: { score: resume.atsScore }
      } : null,
      fromBackend: true
    }))
  ];

  // Remove duplicates (prefer backend data)
  const uniqueItems = allItems.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  );

  // Filter and sort history items
  const filteredAndSortedItems = uniqueItems
    .filter(item => {
      const resumeName = (item.resumeName || '').toString().toLowerCase();
      const story = (item.story || '').toString().toLowerCase();
      const jobRole = (item.resumeData?.targetJobRole || '').toString().toLowerCase();
      const searchLower = (searchTerm || '').toLowerCase();
      
      return resumeName.includes(searchLower) ||
             story.includes(searchLower) ||
             jobRole.includes(searchLower);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date || 0) - new Date(a.date || 0);
      if (sortBy === 'oldest') return new Date(a.date || 0) - new Date(b.date || 0);
      if (sortBy === 'name') return (a.resumeName || '').localeCompare(b.resumeName || '');
      return 0;
    });

  const handleViewItem = (item) => {
    onViewItem(item);
    navigate('/generate', { state: { historicalData: item } });
  };

  const handleDeleteItem = async (itemId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume analysis? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Remove from localStorage
      const updatedLocalItems = historyItems.filter(item => item.id !== itemId && !item.fromBackend);
      localStorage.setItem('storyHistory', JSON.stringify(updatedLocalItems));
      
      // If from backend, call delete API
      const itemToDelete = allItems.find(item => item.id === itemId);
      if (itemToDelete?.fromBackend) {
        // Delete from backend
        const response = await fetch(`http://localhost:5000/api/resume/${itemId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete from server');
        }
      }
      
      // Refresh the page to reload data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p style={{color: '#94a3b8', marginTop: '16px'}}>Loading your resume history...</p>
        </div>
      </div>
    );
  }

  if (!uniqueItems || uniqueItems.length === 0) {
    return (
      <div className="history-page">
        <div className="empty-state">
          <MdFolder className="empty-icon" style={{fontSize: '72px', color: '#818cf8'}} />
          <h2>No History Yet</h2>
          <p>Your resume analyses will appear here after you analyze your first resume.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            <MdAdd style={{verticalAlign: 'middle', marginRight: '6px'}} /> Analyze Your First Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">
        {/* Header */}
        <div className="history-header">
          <div>
            <h1><MdHistory style={{display: 'inline-block', marginRight: '10px', verticalAlign: 'middle'}} /> Analysis History</h1>
            <p className="subtitle">Your journey to landing the perfect IT role • {filteredAndSortedItems.length} of {uniqueItems.length} analyses saved</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/')}>
            <MdAdd style={{fontSize: '16px'}} /> Analyze Another Resume
          </button>
        </div>

        {/* Search and Sort */}
        <div className="controls">
          <div className="search-box">
            <MdSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search your resumes, roles, or stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Custom Sort Dropdown */}
          <div className="sort-dropdown" ref={sortMenuRef}>
            <button 
              className="sort-btn"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <span>{sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'By Name'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M0 0L6 8L12 0Z" fill="rgba(255,255,255,0.5)" />
              </svg>
            </button>
            
            {showSortMenu && (
              <div className="sort-menu">
                <button 
                  className={`sort-option ${sortBy === 'newest' ? 'active' : ''}`}
                  onClick={() => { setSortBy('newest'); setShowSortMenu(false); }}
                >
                  Newest
                </button>
                <button 
                  className={`sort-option ${sortBy === 'oldest' ? 'active' : ''}`}
                  onClick={() => { setSortBy('oldest'); setShowSortMenu(false); }}
                >
                  Oldest
                </button>
                <button 
                  className={`sort-option ${sortBy === 'name' ? 'active' : ''}`}
                  onClick={() => { setSortBy('name'); setShowSortMenu(false); }}
                >
                  By Name
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History Items Grid */}
        <div className="history-grid">
          {filteredAndSortedItems.map((item) => (
            <div key={item.id} className="history-card" onClick={() => handleViewItem(item)}>
              <div className="card-header">
                <div>
                  <h3>{item.resumeName || 'Untitled'}</h3>
                  <p className="date">Analyzed on {item.date ? formatDate(item.date) : 'No date'}</p>
                </div>
              </div>

              <div className="card-body">
                <div className="job-role">
                  <MdWork className="role-icon" />
                  <span>{item.resumeData?.targetJobRole || 'Not specified'}</span>
                </div>
              </div>

              <div className="card-body">
                {item.analysis?.atsScore ? (
                  <div className="ats-score">
                    <span className="score-label">ATS Score</span>
                    <span className="score-value" style={{
                      color: item.analysis.atsScore.score >= 75 ? '#22c55e' : 
                             item.analysis.atsScore.score >= 50 ? '#fbbf24' : '#ef4444'
                    }}>
                      {item.analysis.atsScore.score}%
                    </span>
                  </div>
                ) : (
                  <div style={{color: 'rgba(255,255,255,0.3)', fontSize: '13px'}}>—</div>
                )}
              </div>

              <div className="card-footer">
                <button className="view-btn" onClick={(e) => { e.stopPropagation(); handleViewItem(item); }}>
                  <MdVisibility style={{fontSize: '14px'}} /> View
                </button>
                <button 
                  className="delete-btn" 
                  onClick={(e) => handleDeleteItem(item.id, e)} 
                  title="Delete this analysis"
                  aria-label="Delete"
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedItems.length === 0 && searchTerm && (
          <div className="empty-state">
            <MdSearch className="empty-icon" />
            <h3>No Results Found</h3>
            <p>Try a different search term or browse all your analyses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;