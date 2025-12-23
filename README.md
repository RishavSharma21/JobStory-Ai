# JobStory AI

JobStory AI is a professional platform designed to assist IT students and professionals in optimizing their resumes for campus placements. The system provides real-time ATS scoring and deep resume analysis using artificial intelligence.

## Key Features

- ATS Audit Score: Detailed evaluation of resume formatting and keyword optimization.
- Job Description Match: Comparison of resumes against specific job requirements for improved targeting.
- AI Analysis: In-depth feedback on resume quality and areas for improvement.
- Analysis History: Persistent tracking and management of all previous resume evaluations.
- Secure Authentication: User accounts integrated with Google OAuth for data privacy.
- Professional UI: Modern and accessible interface optimized for performance.

## Technology Stack

- Frontend: React, React Router, React Icons, CSS3.
- Backend: Node.js, Express.js, MongoDB.
- AI Engine: Google Gemini AI.
- Authentication: JWT and Google Auth.

## Getting Started

### 1. Installation

    git clone https://github.com/RishavSharma21/JobStory-Ai.git
    cd JobStory-Ai

### 2. Configuration

Create a .env file in the backend directory with the following variables:

    PORT=5000
    MONGODB_URI=your_mongodb_uri
    GEMINI_API_KEY=your_gemini_key
    GOOGLE_CLIENT_ID=your_google_id
    JWT_SECRET=your_secret_key

### 3. Execution

Start Backend:

    cd backend
    npm install
    node server.js

Start Frontend:

    cd frontend
    npm install
    npm start


---
Made with ❤️ by Team Innovators
