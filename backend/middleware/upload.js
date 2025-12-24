// upload.js - This handles file uploads

const multer = require('multer');

// Configure multer storage
const storage = multer.memoryStorage(); // Store files in memory (RAM)

// File filter - only allow PDF files
const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    // Additional check for file extension
    if (file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true); // Accept file
    } else {
      cb(new Error('File must have .pdf extension'), false);
    }
  } else {
    cb(new Error('Only PDF files are supported. Please upload a resume in PDF format.'), false);
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