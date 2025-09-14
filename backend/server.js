// server.js - This is the main file that starts your backend server

const express = require('express');  // Web framework for Node.js
const cors = require('cors');        // Allows frontend to communicate with backend
const mongoose = require('mongoose'); // Database connection tool
const dotenv = require('dotenv');    // Loads environment variables from .env file

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware - These are like filters that process requests before they reach your routes
app.use(cors());                           // Enable cross-origin requests
app.use(express.json());                   // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-analyzer')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes - These define what happens when someone visits different URLs
app.use('/api/resume', require('./routes/resume'));  // Handle /api/resume URLs
app.use('/api/ai', require('./routes/ai'));          // Handle /api/ai URLs

// Test route - Visit http://localhost:5000 to see if server is running
app.get('/', (req, res) => {
  res.json({ message: 'Resume Analyzer Backend API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test`);
});