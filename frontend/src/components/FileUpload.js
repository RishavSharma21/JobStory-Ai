// src/components/FileUpload.js
import React, { useState, useRef } from 'react';

const FileUpload = ({ onResumeUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadedFile(file);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('resume', file);

      // For now, we'll simulate the upload process
      // Later you'll connect this to your backend API
      setTimeout(() => {
        const mockResumeData = {
          fileName: file.name,
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          // This will be replaced with actual parsed resume data
          parsedContent: {
            name: "Sample User",
            email: "user@example.com",
            experience: ["Sample experience 1", "Sample experience 2"],
            skills: ["JavaScript", "React", "Node.js"],
            education: "Bachelor's in Computer Science"
          }
        };
        
        onResumeUpload(mockResumeData);
        setUploading(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="file-upload-section">
      <h3>Upload Your Resume</h3>
      
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          accept=".pdf,.doc,.docx"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <p>Uploading and analyzing your resume...</p>
          </div>
        ) : uploadedFile ? (
          <div className="upload-success">
            <div className="success-icon">✅</div>
            <p>Successfully uploaded: {uploadedFile.name}</p>
            <small>Click to upload a different file</small>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📤</div>
            <p><strong>Click to upload</strong> or drag and drop</p>
            <small>PDF or DOCX files only (Max 5MB)</small>
          </div>
        )}
      </div>
      
      <div className="upload-info">
        <p>✨ Your resume will be analyzed using AI to create compelling interview stories</p>
        <p>🔒 Your data is secure and will never be shared</p>
      </div>
    </div>
  );
};

export default FileUpload;