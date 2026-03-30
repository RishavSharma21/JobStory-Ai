# StoryPitch AI (JobStory AI)

> *"Your personal, AI-powered career coach—built to outsmart the ATS."*

Hi there! Welcome to **StoryPitch AI** (also known as JobStory AI). If you're reading this, you probably know how frustrating it is to apply for dozens of jobs only to be automatically rejected by an Applicant Tracking System (ATS). 

We built this project to fix exactly that. StoryPitch AI acts as a strict, industry-standard resume auditor. It uses advanced LLMs (Large Language Models) like Google Gemini and Groq to mathematically score, critique, and improve resumes targeting campus placements and professional IT roles.

---

## What Exactly Does It Do? (The "Why")
When a user uploads their resume, they aren't just getting generic advice. Our system reads the PDF, targets a specific Job Description (JD), and runs it through a **harsh, professional-grade grading algorithm**. 
It actively searches for:
- Quantifiable business impacts (Metrics & Numbers)
- Strong action verbs instead of weak buzzwords
- Absolute keyword alignment with the job description
- Formatting oversights and grammatical slips

If a resume is average, it gets an honest, average score. We then provide **actionable Quick Fixes** so the candidate knows exactly *what* to change to boost their score above the 80+ "Interview" threshold.

---

## How It Works (The Architecture)
We’ve split the project into two distinct parts: a beautiful, responsive **React Frontend** and a robust, secure **Node.js/Express Backend**.

### The User Journey
1. **Secure Login:** Users authenticate securely using Google OAuth or a standard Email/Password account.
2. **File Upload:** The user uploads their resume PDF. Our backend catches it via `multer` and uses `pdf-parse` to cleanly extract the raw text. 
3. **AI Analysis:** The raw text is bundled with a heavily engineered prompting algorithm and sent to our AI engines (Gemini/Groq). The AI returns a structured JSON evaluation.
4. **Data Persistence:** The results and user history are safely stored in **MongoDB**, so users can track their progress over time.

---

## API Routes & Structure
Here is a peek under the hood at our primary backend routes and what they are responsible for:

### Authentication (`/api/auth`)
- `POST /google-access-token` - Authenticates a user securely via Google OAuth.
- `POST /register` & `POST /login` - Standard email/password flow utilizing `bcryptjs` and `jsonwebtoken`.
- `GET /user` - Fetches the currently authenticated user's profile.

### Document Processing (`/api/resume`)
- `POST /upload` - Accepts multipart form data (the PDF), extracts the text, creates a database entry, and returns the document ID.
- `POST /:id/analyze` - The brain of the app. Takes the extracted text, aligns it with the Job Role/Description, and requests a strict ATS audit from the AI.
- `GET /` & `GET /:id` - Fetches the user's historical resume analyses.
- `DELETE /:id` - Securely deletes a past resume audit from the database.

### AI Engine (`/api/ai`)
- `GET /health` - Checks if our AI API keys are configured and the external models are actively responding.

---

## Tech Stack
- **Frontend Engine:** React.js, React Router
- **Styling:** CSS3 & TailwindCSS (for modern, glass-morphic, and dynamic UI touches)
- **Backend Architecture:** Node.js & Express.js
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Google Generative AI (Gemini) & Groq APIs
- **PDF Parsing:** `pdf-parse` & `multer`
- **Security:** JWT, Google Auth Library, `bcryptjs`

---
---

Made by Team Code Forge. Feel free to explore the code, test the AI, and optimize your resume!
