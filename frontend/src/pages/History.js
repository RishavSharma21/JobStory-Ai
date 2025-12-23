// src/pages/History.js - Enhanced History Page with Premium Light Theme
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdAdd, MdDelete, MdDescription, MdWork, MdMoreVert, MdDownload, MdHistory, MdSort, MdCalendarToday } from 'react-icons/md';
import './History.css';
import { getAllResumes, getResume, deleteResume, API_BASE_URL } from '../utils/api';
import { generateCompleteReport } from '../utils/pdfDownload';

// ... imports ...

const History = ({ historyItems, onViewItem, onDeleteItem }) => {
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
  const [loadingItemId, setLoadingItemId] = useState(null); // Track item loading state
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

  // 1. Process & Memoize History Items (Deduplication Sorting)
  const processedItems = React.useMemo(() => {
    // A. Backend Items
    const backendMapped = backendResumes
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
      }));

    // B. Create Signatures for Deduplication
    const backendSignatures = new Set(
      backendMapped.map(item => {
        const name = (item.resumeName || '').trim().toLowerCase();
        const role = (item.resumeData?.targetJobRole || '').trim().toLowerCase();
        const dateStr = item.date ? new Date(item.date).toDateString() : '';
        return `${name}|${role}|${dateStr}`; // stricter signature including date
      })
    );

    // C. Filter Local Items
    const localFiltered = historyItems.filter(item => {
      const name = (item.resumeName || item.fileName || item.resumeData?.fileName || '').trim().toLowerCase();
      const role = (item.resumeData?.targetJobRole || item.targetJobRole || '').trim().toLowerCase();
      const dateStr = item.date ? new Date(item.date).toDateString() : '';
      const signature = `${name}|${role}|${dateStr}`;
      return !backendSignatures.has(signature);
    });

    // D. Combine & Sort
    const all = [...localFiltered, ...backendMapped].filter(item => !deletedItemIds.includes(item.id));

    // Deduplicate by ID just in case
    const unique = all.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    );

    // Filter by Search
    const searchLower = (searchTerm || '').toLowerCase();
    const filtered = unique.filter(item => {
      if (!searchLower) return true;
      const name = (item.resumeName || '').toLowerCase();
      const role = (item.resumeData?.targetJobRole || '').toLowerCase();
      return name.includes(searchLower) || role.includes(searchLower);
    });

    // Sort
    let sorted = [...filtered];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => (a.resumeName || '').localeCompare(b.resumeName || ''));
    }

    return sorted;
  }, [historyItems, backendResumes, searchTerm, sortBy, deletedItemIds]);

  // Check if user has ANY history (before search filter)
  const hasAnyHistory = React.useMemo(() => {
    const backendMapped = backendResumes
      .filter(resume => resume.atsScore || (resume.analysis && Object.keys(resume.analysis).length > 0) || resume.analyzedAt);
    const all = [...historyItems, ...backendMapped].filter(item => !deletedItemIds.includes(item.id));
    return all.length > 0;
  }, [historyItems, backendResumes, deletedItemIds]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewItem = async (item) => {
    if (item.fromBackend) {
      try {
        setLoadingItemId(item.id);
        const response = await getResume(item.id);

        if (response.success && response.resume) {
          // Construct a full item object similar to local history but with fresh backend data
          const fullItem = {
            ...item,
            resumeData: {
              ...response.resume,
              // Map backend fields to what frontend expects
              analysis: response.resume.aiAnalysis // ensure analysis is accessible
            },
            analysis: response.resume.aiAnalysis,
            story: response.resume.achievements?.join('\n') || '' // restore story/achievements if applicable
          };

          onViewItem(fullItem);
          navigate('/generate', { state: { historicalData: fullItem } });
        } else {
          console.error('Failed to load full resume details');
          // Fallback: try navigating with what we have (might show incomplete data)
          onViewItem(item);
          navigate('/generate', { state: { historicalData: item } });
        }
      } catch (error) {
        console.error('Error fetching resume details:', error);
        alert('Could not load analysis details. Check your connection.');
      } finally {
        setLoadingItemId(null);
      }
    } else {
      // Local items already have full data
      onViewItem(item);
      navigate('/generate', { state: { historicalData: item } });
    }
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
      // Optimistically update local state to reflect deletion immediately
      setDeletedItemIds(prev => [...prev, itemToDelete]);

      try {
        const itemToRemove = processedItems.find(item => item.id === itemToDelete);

        // Critical Fix: Also remove from backendResumes state so it doesn't reappear on re-render/refresh
        if (itemToRemove?.fromBackend) {
          setBackendResumes(prev => prev.filter(r => (r.resumeId || r._id) !== itemToDelete));

          // Use authenticated delete helper
          await deleteResume(itemToDelete);

          // SUPER CRITICAL FIX: Also delete the "shadow" copy in localStorage if it exists.
          // The local copy might have a different ID but same signature (Name + Role + Date).
          if (itemToRemove) {
            const name = (itemToRemove.resumeName || '').trim().toLowerCase();
            const role = (itemToRemove.resumeData?.targetJobRole || '').trim().toLowerCase();
            // Filter out any local item that matches this signature (Name + Role)
            // IGNORING DATE to ensure we catch shadow copies created at different times
            const shadowItem = historyItems.find(localItem => {
              const lName = (localItem.resumeName || localItem.fileName || localItem.resumeData?.fileName || '').trim().toLowerCase();
              const lRole = (localItem.resumeData?.targetJobRole || localItem.targetJobRole || '').trim().toLowerCase();
              return (lName === name) && (lRole === role);
            });

            // If we found a shadow item, ask parent (App.js) to delete it correctly
            if (shadowItem && onDeleteItem) {
              console.log('Deleting shadow copy:', shadowItem.id);
              onDeleteItem(shadowItem.id);
            }
          }

        } else {
          // Standard local item deletion logic - delegate to Parent (App.js)
          if (onDeleteItem) {
            onDeleteItem(itemToDelete);
          }
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
      const achievements = item.story || '';

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

  if (!hasAnyHistory) {
    return (
      <div className="history-page">
        <div className="history-container">
          <div className="empty-state">
            <div className="empty-illustration">
              <MdHistory className="empty-icon" />
              <div className="empty-particles">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <h2>Your Journey Starts Here</h2>
            <p>No analyses yet. Upload your first resume and let AI help you land your dream job!</p>
            <button className="btn-primary-enhanced" onClick={() => navigate('/')}>
              <MdAdd style={{ fontSize: '20px' }} />
              <span>Analyze Your First Resume</span>
              <div className="btn-glow"></div>
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
          <div className="header-content">
            <h1>Analysis History</h1>
            <p className="subtitle">
              <span className="stat-badge">
                <MdHistory style={{ fontSize: '14px' }} />
                {processedItems.length} {processedItems.length === 1 ? 'Analysis' : 'Analyses'}
              </span>
              <span className="stat-text">Your personalized career insights</span>
            </p>
          </div>
          <button className="btn-primary-enhanced" onClick={() => navigate('/')}>
            <MdAdd style={{ fontSize: '20px' }} />
            <span>Analyze New Resume</span>
            <div className="btn-glow"></div>
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
          {currentItems.map((item, index) => (
            <div
              key={item.id}
              className={`history-card ${exitingItems.includes(item.id) ? 'exiting' : ''} ${loadingItemId === item.id ? 'loading' : ''}`}
              onClick={() => !loadingItemId && handleViewItem(item)}
              style={{
                zIndex: menuOpenId === item.id ? 10 : 1,
                cursor: loadingItemId ? 'wait' : 'pointer',
                opacity: (loadingItemId && loadingItemId !== item.id) ? 0.7 : 1, // Dim other items
                /* Staggered Animation Delay for Smooth Entry */
                animation: `slideUpFade 0.5s ease backwards ${index * 0.08}s`
              }}
            >
              {/* Date Badge - Top Left */}
              <div className="card-date-badge">
                <MdCalendarToday style={{ fontSize: '12px', marginRight: '4px' }} />
                <span>{item.date ? formatDate(item.date) : 'No date'}</span>
              </div>

              {/* Resume Name */}
              <div className="card-name">
                <h3>{item.resumeName || 'Untitled Resume'}</h3>
              </div>

              {/* Job Role - Centered */}
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
        {processedItems.length > itemsPerPage && (
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

        {processedItems.length === 0 && searchTerm && (
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