// src/pages/Contact.js - Professional Contact Page
import React, { useState } from 'react';
import { MdCheckCircle, MdError, MdLocationOn, MdPhone, MdEmail } from 'react-icons/md';
import { FaLinkedin, FaTwitter, FaGithub, FaInstagram } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    // Simulate API call
    setTimeout(() => {
      setStatus({
        type: 'success',
        message: 'Thank you for reaching out! We\'ll get back to you within 24 hours.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="contact-page">
      {/* Background Particles to align with Home page */}
      <div className="particles-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="contact-main-container">

        {/* Header Section */}
        <div className="contact-header-section">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Please fill out the form below or reach out directly using our contact.</p>
        </div>

        <div className="contact-content-grid">
          {/* Left Side: Contact Info & Socials */}
          <div className="contact-info-side">
            <div className="info-group">
              <div className="info-item">
                <div className="icon-box">
                  <MdLocationOn />
                </div>
                <div className="info-text">
                  <h3>Address</h3>
                  <p>Punjab, India, 140401</p>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-box">
                  <MdPhone />
                </div>
                <div className="info-text">
                  <h3>+91 333-888-999</h3>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-box">
                  <MdEmail />
                </div>
                <div className="info-text">
                  <h3>jobstory@gmail.com</h3>
                </div>
              </div>
            </div>

            <div className="social-row">
              <a href="#" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="#" target="_blank" rel="noopener noreferrer"><FaInstagram style={{ fontSize: '1.2em' }} /></a>
            </div>
          </div>

          {/* Right Side: The Elevated Form Card */}
          <div className="contact-form-card">
            {status.type === 'success' ? (
              <div className="success-view">
                <div className="success-icon-large">
                  <MdCheckCircle />
                </div>
                <h3>Message Sent!</h3>
                <p>{status.message}</p>
                <button
                  onClick={() => setStatus({ type: '', message: '' })}
                  className="submit-btn"
                  style={{ marginTop: '20px' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Anushka Sharma"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="anushka@gmail.com"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    rows="4"
                    autoComplete="off"
                    required
                  />
                </div>

                {status.message && status.type === 'error' && (
                  <div className={`status-message ${status.type}`}>
                    {status.message}
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
