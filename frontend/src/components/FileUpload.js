import { FaCheckCircle, FaCloudUploadAlt, FaLock, FaMagic } from 'react-icons/fa';
// src/components/FileUpload.js
import React, { useState, useRef } from 'react';
import { uploadResume } from '../utils/api';

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

    // Validate file size (10MB limit to match backend)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadedFile(file);

    try {
      // Use the real API call instead of mock data
      console.log('🚀 REAL API CALL - Using live backend service (v2.0)');
      const response = await uploadResume(file);
      
      console.log('Upload response:', response);
      
      // Pass the real API response to parent component
      onResumeUpload(response);
      setUploading(false);

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
      setUploadedFile(null);
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
            <div className="success-icon"><FaCheckCircle /></div>
            <p>Successfully uploaded: {uploadedFile.name}</p>
            <small>Click to upload a different file</small>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon"><FaCloudUploadAlt /></div>
            <p><strong>Click to upload</strong> or drag and drop</p>
            <small>PDF or DOCX files only (Max 5MB)</small>
          </div>
        )}
      </div>
      
      <div className="upload-info">
  <p><span className="info-icon"><FaMagic /></span> Your resume will be analyzed using AI to create compelling interview stories</p>
        <p><span className="info-icon"><FaLock /></span> Your data is secure and will never be shared</p>
      </div>
    </div>
  );
};

export default FileUpload;