// src/pages/History.js - Enhanced History Page with Premium Light Theme
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdAdd, MdDelete, MdDescription, MdWork, MdMoreVert, MdDownload, MdHistory, MdSort } from 'react-icons/md';
import './History.css';
import { getAllResumes, API_BASE_URL } from '../utils/api';
import { generateCompleteReport } from '../utils/pdfDownload';


const History = ({ historyItems, onViewItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [backendResumes, setBackendResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deletedItemIds, setDeletedItemIds] = useState([]);
  const [exitingItems, setExitingItems] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  // ... (keeping existing useEffects)


  const sortMenuRef = useRef(null);
  const menuRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }

      let isClickInsideMenu = false;
      Object.values(menuRefs.current).forEach(ref => {
        if (ref && ref.contains(event.target)) {
          isClickInsideMenu = true;
        }
      });

      if (!isClickInsideMenu && menuOpenId) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

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

  const allItems = [
    ...historyItems,
    ...backendResumes
      .filter(resume => resume.atsScore || (resume.analysis && Object.keys(resume.analysis).length > 0) || resume.analyzedAt)
      .map(resume => ({
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
        } : (resume.analysis || null),
        fromBackend: true
      }))
  ].filter(item => !deletedItemIds.includes(item.id));

  const uniqueItems = allItems.filter((item, index, self) =>
    index === self.findIndex(t => t.id === item.id)
  );

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewItem = (item) => {
    onViewItem(item);
    navigate('/generate', { state: { historicalData: item } });
  };

  /* Delete Modal Handlers */
  const handleDeleteClick = (itemId, e) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setItemToDelete(itemId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    // 1. Trigger Exit Animation
    setExitingItems(prev => [...prev, itemToDelete]);
    setDeleteModalOpen(false);

    // 2. Remove from DOM after animation
    setTimeout(async () => {
      setDeletedItemIds(prev => [...prev, itemToDelete]);

      try {
        const updatedLocalItems = historyItems.filter(item => item.id !== itemToDelete && !item.fromBackend);
        localStorage.setItem('storyHistory', JSON.stringify(updatedLocalItems));

        const itemToRemove = allItems.find(item => item.id === itemToDelete);
        if (itemToRemove?.fromBackend) {
          await fetch(`${API_BASE_URL}/api/resume/${itemToDelete}`, {
            method: 'DELETE'
          });
        }
      } catch (error) {
        console.error('Error deleting resume:', error);
        alert('Failed to delete resume. Sync error.');
      } finally {
        setItemToDelete(null);
      }
    }, 400);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };


  const handleDownloadReport = (item, e) => {
    e.stopPropagation();
    setMenuOpenId(null);
    try {
      const jobRole = item.resumeData?.targetJobRole || 'Not Specified';
      const resumeName = item.resumeName || 'Resume';
      const analysisData = item.analysis || {};
      const achievements = item.story || ''; // Assuming 'story' holds achievements or relevant content

      generateCompleteReport(analysisData, jobRole, resumeName, achievements);
      console.log('✅ Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="history-page">


        <div className="history-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your resume history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!uniqueItems || uniqueItems.length === 0) {
    return (
      <div className="history-page">


        <div className="history-container">
          <div className="empty-state">
            <MdHistory className="empty-icon" style={{ fontSize: '72px', color: '#cbd5e1' }} />
            <h2>No History Yet</h2>
            <p>Your resume analyses will appear here after you analyze your first resume.</p>
            <button className="btn-primary" onClick={() => navigate('/')} style={{ margin: '0 auto' }}>
              <MdAdd /> Analyze Your First Resume
            </button>
          </div>
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
            <h1>Analysis History</h1>
            <p className="subtitle">Your saved resume analyses • {filteredAndSortedItems.length} items</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/')}>
            <MdAdd style={{ fontSize: '18px' }} /> Analyze New Resume
          </button>
        </div>

        {/* Search and Sort */}
        <div className="controls">
          <div className="search-box">
            <MdSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by resume name, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>




          <div className="sort-dropdown" ref={sortMenuRef}>
            <button
              className="sort-btn"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <MdSort style={{ fontSize: '16px', color: '#10b981' }} />
              <span>{sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'By Name'}</span>
            </button>

            {showSortMenu && (
              <div className="sort-menu">
                <button className={`sort-option ${sortBy === 'newest' ? 'active' : ''}`} onClick={() => { setSortBy('newest'); setShowSortMenu(false); }}>Newest</button>
                <button className={`sort-option ${sortBy === 'oldest' ? 'active' : ''}`} onClick={() => { setSortBy('oldest'); setShowSortMenu(false); }}>Oldest</button>
                <button className={`sort-option ${sortBy === 'name' ? 'active' : ''}`} onClick={() => { setSortBy('name'); setShowSortMenu(false); }}>By Name</button>
              </div>
            )}
          </div>
        </div>

        {/* History Items Grid */}
        <div className="history-grid">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className={`history-card ${exitingItems.includes(item.id) ? 'exiting' : ''}`}
              onClick={() => handleViewItem(item)}
              style={{ zIndex: menuOpenId === item.id ? 10 : 1 }}
            >
              {/* Column 1: Name and Date */}
              <div className="card-header">
                <h3>{item.resumeName || 'Untitled Resume'}</h3>
                <p className="date">{item.date ? formatDate(item.date) : 'No date'}</p>
              </div>

              {/* Column 2: Job Role */}
              <div className="job-role">
                <div style={{ padding: '4px', background: '#f0fdf4', borderRadius: '6px', display: 'flex' }}>
                  <MdWork className="role-icon" />
                </div>
                <span>{item.resumeData?.targetJobRole || 'Target Role Not Specified'}</span>
              </div>

              {/* Column 3: ATS Score */}
              <div className="ats-score-circular">
                {item.analysis?.atsScore ? (
                  <>
                    <div
                      className="circular-progress"
                      style={{
                        background: `conic-gradient(
                          ${item.analysis.atsScore.score >= 75 ? '#10b981' :
                            item.analysis.atsScore.score >= 50 ? '#f59e0b' : '#ef4444'} ${item.analysis.atsScore.score * 3.6}deg,
                          #e2e8f0 0deg
                        )`
                      }}
                    >
                      <div className="circular-progress-inner">
                        <span className="circular-score">{item.analysis.atsScore.score}</span>
                      </div>
                    </div>
                    <div className="score-info">
                      <span className="score-label-circular">ATS Score</span>
                      <span className="score-status" style={{
                        color: item.analysis.atsScore.score >= 75 ? '#10b981' :
                          item.analysis.atsScore.score >= 50 ? '#f59e0b' : '#ef4444'
                      }}>
                        {item.analysis.atsScore.score >= 75 ? 'Excellent' :
                          item.analysis.atsScore.score >= 50 ? 'Good' : 'Needs Work'}
                      </span>
                    </div>
                  </>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Not Analyzed</span>
                )}
              </div>

              {/* Column 4: Menu */}
              <div className="card-footer">
                <div
                  className="menu-container"
                  ref={el => menuRefs.current[item.id] = el}
                >
                  <button
                    className="menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === item.id ? null : item.id);
                    }}
                  >
                    <MdMoreVert />
                  </button>

                  {menuOpenId === item.id && (
                    <div className="menu-dropdown">
                      <button className="menu-option" onClick={(e) => handleDownloadReport(item, e)}>
                        <MdDownload style={{ fontSize: '16px' }} /> Download Report
                      </button>
                      <button className="menu-option delete-option" onClick={(e) => handleDeleteClick(item.id, e)}>
                        <MdDelete style={{ fontSize: '16px' }} /> Delete Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {filteredAndSortedItems.length > itemsPerPage && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="pagination-btn"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {filteredAndSortedItems.length === 0 && searchTerm && (
          <div className="empty-state">
            <MdSearch className="empty-icon" />
            <h3>No Results Found</h3>
            <p>Try a different search term.</p>
          </div>
        )}
      </div>

      {/* Custom Delete Modal */}
      {
        deleteModalOpen && (
          <div className="delete-modal-overlay" onClick={cancelDelete}>
            <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon-wrapper">
                <MdDelete />
              </div>
              <h2>Delete Analysis?</h2>
              <p>Are you sure you want to delete this resume analysis? This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={cancelDelete}>Cancel</button>
                <button className="btn-delete-confirm" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default History;