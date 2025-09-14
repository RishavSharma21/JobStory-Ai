// upload.js - This handles file uploads

const multer = require('multer');

// Configure multer storage
const storage = multer.memoryStorage(); // Store files in memory (RAM)

// File filter - only allow certain file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/msword', // DOC
    'text/plain' // TXT
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.'), false);
  }
};

// Create upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;