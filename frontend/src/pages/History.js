// src/pages/History.js - Enhanced History Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const History = ({ historyItems, onViewItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  // Filter and sort history items
  const filteredAndSortedItems = historyItems
    .filter(item => {
      const matchesSearch = item.resumeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.story.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.resumeData?.targetJobRole || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'story') return matchesSearch && item.story;
      if (filterBy === 'analysis') return matchesSearch && item.analysis;
      if (filterBy === 'questions') return matchesSearch && item.questions;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'name') return a.resumeName.localeCompare(b.resumeName);
      return 0;
    });

  const handleViewItem = (item) => {
    // Set the current generation data and navigate to the story generation page
    onViewItem(item);
    navigate('/generate', { state: { historicalData: item } });
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedItems = historyItems.filter(item => item.id !== itemId);
      localStorage.setItem('storyHistory', JSON.stringify(updatedItems));
      window.location.reload(); // Simple refresh - in production, use proper state management
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStoryTypeIcon = (storyType) => {
    const icons = {
      'elevator-pitch': '🚀',
      'detailed-intro': '📖',
      'technical-overview': '⚙️',
      'career-journey': '🛤️'
    };
    return icons[storyType] || '📝';
  };

  const getStyleColor = (style) => {
    const colors = {
      professional: '#3b82f6',
      creative: '#8b5cf6',
      casual: '#10b981',
      technical: '#f59e0b'
    };
    return colors[style] || '#6b7280';
  };

  if (!historyItems || historyItems.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2fe, #e8eaf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📚</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
            No History Yet
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
            Your generated stories, resume analyses, and interview questions will appear here once you start creating content.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Create Your First Story
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f2fe, #e8eaf6)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                📚 Your Story History
              </h1>
              <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
                {filteredAndSortedItems.length} of {historyItems.length} items
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ✨ Create New Story
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by resume name, job role, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }}>
                🔍
              </div>
            </div>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Content</option>
              <option value="story">Stories Only</option>
              <option value="analysis">With Analysis</option>
              <option value="questions">With Questions</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">By Name</option>
            </select>
          </div>
        </div>

        {/* History Items Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onClick={() => handleViewItem(item)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Item Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 4px 0'
                  }}>
                    📄 {item.resumeName}
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: 0
                  }}>
                    {formatDate(item.date)}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontSize: '16px',
                    padding: '4px'
                  }}
                  title="Delete this item"
                >
                  🗑️
                </button>
              </div>

              {/* Content Preview */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>
                    {getStoryTypeIcon(item.storyType)}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    {item.resumeData?.targetJobRole || 'Target Role'}
                  </span>
                </div>

                <p style={{
                  fontSize: '14px',
                  color: '#4b5563',
                  lineHeight: '1.5',
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.story}
                </p>
              </div>

              {/* Content Tags */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '16px'
              }}>
                {item.style && (
                  <span style={{
                    background: getStyleColor(item.style) + '20',
                    color: getStyleColor(item.style),
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {item.style}
                  </span>
                )}
                
                {item.analysis && (
                  <span style={{
                    background: '#dcfce7',
                    color: '#166534',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    Analysis
                  </span>
                )}
                
                {item.questions && (
                  <span style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {item.questions.reduce((sum, cat) => sum + cat.questions.length, 0)} Questions
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewItem(item);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(item.story);
                  }}
                  style={{
                    padding: '8px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📋
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedItems.length === 0 && searchTerm && (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              No Results Found
            </h3>
            <p style={{ color: '#64748b' }}>
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;