import React from 'react';
import '../WinampGlass.css';

const CleanGlassDemo = () => {
  return (
    <div style={{ padding: '2rem', background: '#121212', minHeight: '100vh' }}>
      <h1 style={{ color: '#f5f5f5', marginBottom: '2rem', textAlign: 'center' }}>
        Clean Glass UI Demo
      </h1>
      
      <div className="elegant-glass" style={{ padding: '2rem', margin: '2rem 0' }}>
        <h3 style={{ color: '#f5f5f5', marginBottom: '1rem' }}>Elegant Glass Card</h3>
        <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>
          Clean frosted glass effect with subtle highlights and professional feel
        </p>
        <button className="glass-button">
          Try Glass Button
        </button>
      </div>
      
      <div className="elegant-glass" style={{ padding: '2rem', margin: '2rem 0' }}>
        <h3 style={{ color: '#f5f5f5', marginBottom: '1rem' }}>Input Fields</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <input 
            className="glass-input" 
            placeholder="Enter your email"
            type="email"
          />
          <input 
            className="glass-input" 
            placeholder="Your message"
            type="text"
          />
          <button className="glass-button">
            Send Message
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '2rem 0' }}>
        <div className="elegant-glass floating" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: '#f5f5f5' }}>Floating Card</h4>
          <p style={{ color: '#ccc', fontSize: '0.9rem' }}>Subtle animation</p>
        </div>
        <div className="elegant-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: '#f5f5f5' }}>Static Card</h4>
          <p style={{ color: '#ccc', fontSize: '0.9rem' }}>No animation</p>
        </div>
        <div className="elegant-glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ color: '#f5f5f5' }}>Clean Design</h4>
          <p style={{ color: '#ccc', fontSize: '0.9rem' }}>Professional look</p>
        </div>
      </div>
    </div>
  );
};

export default CleanGlassDemo;