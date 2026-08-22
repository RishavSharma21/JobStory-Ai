# JobStory AI

JobStory AI is a resume analysis platform designed for campus placements and technical job roles. It audits resumes against job descriptions using Google Gemini, providing mathematical ATS scoring, phrasing corrections, keyword gap analysis, and cover letter generation.

- **Live Demo**: [job-story-ai.vercel.app](https://job-story-ai.vercel.app/)
- **Backend API**: [jobstory-ai.onrender.com](https://jobstory-ai.onrender.com/)

---

## Features

- **ATS Resume Scoring**: Detailed 0–100 overall ATS evaluation with section breakdowns (Education, Skills, Projects, Experience, Formatting).
- **Line-by-Line Phrasing Audit**: Highlights weak phrasing, passive voice, typos, and pronoun usage with active voice rewrites.
- **Quick Fixes**: Actionable recommendations with metric-driven examples tailored to the target role.
- **Skill Gap Analysis**: Compares technical skills found in the resume against missing industry-standard skills.
- **Recruiter Impression**: Simulates a 6-second recruiter skim with top observations and red flags.
- **Cover Letter Generation**: Customizable cover letters based on the resume and target job role.

---

## Architecture

JobStory AI follows a client-server architecture:

```
JobStory-Ai/
├── backend/            # Express.js REST API
│   ├── controllers/    # Request handlers (AI, Resume, Auth)
│   ├── middleware/     # JWT authentication & Multer upload
│   ├── models/         # MongoDB Mongoose schemas
│   ├── routes/         # API endpoints (/api/auth, /api/resume, /api/ai)
│   └── services/       # PDF text extraction & Gemini prompt pipeline
└── frontend/           # React 18 SPA
    ├── src/components/ # UI components & audit dashboards
    ├── src/pages/      # Route pages (Home, Analyze, History)
    └── src/utils/      # API client & PDF report generation
```

---

## Tech Stack

- **Frontend**: React 18, React Router, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose
- **AI Models**: Google Gemini API (`gemini-3.6-flash`)
- **Authentication**: JWT, Google OAuth 2.0
- **File Processing**: `pdf-parse`, `multer`

---

## Local Development Setup

### Prerequisites

- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Google Gemini API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RishavSharma21/JobStory-Ai.git
   cd JobStory-Ai
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file inside `backend/`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-3.6-flash
   JWT_SECRET=your_jwt_secret
   ```

   Run the backend:
   ```bash
   npm start
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env` file inside `frontend/`:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

   Run the frontend:
   ```bash
   npm start
   ```

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Authenticate user
- `POST /api/auth/google-access-token` — Google OAuth sign-in
- `GET /api/auth/user` — Get authenticated user details

### Resume Analysis (`/api/resume`)
- `POST /api/resume/upload` — Upload PDF resume & extract text
- `POST /api/resume/:id/analyze` — Run AI analysis on resume
- `GET /api/resume` — List user's past analyses
- `GET /api/resume/:id` — Fetch specific analysis
- `DELETE /api/resume/:id` — Delete analysis record

### AI Utilities (`/api/ai`)
- `POST /api/ai/cover-letter` — Generate tailored cover letter
- `POST /api/ai/interview-questions` — Generate role-specific interview questions

---

## License

MIT License.
