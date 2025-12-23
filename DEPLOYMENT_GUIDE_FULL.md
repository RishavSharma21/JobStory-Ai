# 🚀 Zero-to-Live Deployment Guide for JobStory AI

This guide will take you from running locally to having a live website to share with your teachers and friends. We will use **Render** for the (Backend) and **Vercel** for the (Frontend).

---

## ✅ Phase 1: Prepare Your Code (GitHub)

1.  **Push your code to GitHub**:
    *   Make sure your project `StoryPitch-Ai` is uploaded to a GitHub repository.
    *   Ensure there are two main folders in the root: `frontend` and `backend`.

---

## 🛠 Phase 2: Deploy Backend (Render)

1.  **Sign Up/Login**: Go to [render.com](https://render.com) and log in with GitHub.
2.  **Create Service**: Click **"New +"** → **"Web Service"**.
3.  **Connect Repo**: Select your `StoryPitch-Ai` repository.
4.  **Configure Settings**:
    *   **Name**: `jobstory-backend` (or similar).
    *   **Region**: Singapore or nearest to you.
    *   **Branch**: `main` (or master).
    *   **Root Directory**: `backend` (⚠️ Important!).
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm install`.
    *   **Start Command**: `node server.js`.
    *   **Instance Type**: Free (if available).
5.  **Environment Variables** (Scroll down to "Environment Settings"):
    *   Add the following keys and values:
        *   `GEMINI_API_KEY`: *(Paste your AI Key)*
        *   `MONGODB_URI`: *(Paste your MongoDB Atlas Connection String)* - **Crucial**: If you were using local mongodb (`mongodb://localhost...`), you MUST creates a free MongoDB Atlas cluster and get the connection string (starts with `mongodb+srv://...`). Local DB won't work on the cloud.
        *   `JWT_SECRET`: `any_long_random_secret_string`
        *   `GOOGLE_CLIENT_ID`: `958189206560-nuarhptk9ja3vo5qv9p5ags7m8cmouse.apps.googleusercontent.com`
6.  **Deploy**: Click **"Create Web Service"**.
7.  **Wait**: It will take a few minutes. Once "Live", copy the **backend URL** (e.g., `https://jobstory-backend.onrender.com`).

---

## 🎨 Phase 3: Deploy Frontend (Vercel)

1.  **Sign Up/Login**: Go to [vercel.com](https://vercel.com) and log in with GitHub.
2.  **Add Project**: Click **"Add New..."** → **"Project"**.
3.  **Import Repo**: Import `StoryPitch-Ai`.
4.  **Configure Project**:
    *   **Framework Preset**: Create React App.
    *   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    *   Add:
        *   `REACT_APP_API_URL`: *(Paste the Render Backend URL you copied in Phase 2)*
        *   `REACT_APP_GOOGLE_CLIENT_ID`: `958189206560-nuarhptk9ja3vo5qv9p5ags7m8cmouse.apps.googleusercontent.com`
6.  **Deploy**: Click **"Deploy"**.
7.  **Wait**: Vercel is fast. In ~1 min, you'll see confetti! 🎊
8.  **Get Link**: Your site is live (e.g., `https://jobstory-ai.vercel.app`).

---

## 🌍 Phase 4: Final Google Auth Fix

Because your site is now on a new domain (not localhost), Google Login will block it safely.

1.  Go to **Google Cloud Console** > **Credentials**.
2.  Edit your **OAuth 2.0 Client ID**.
3.  Under **Authorized JavaScript origins**, ADD your new Vercel URL:
    *   `https://your-project-name.vercel.app` (No trailing slash).
4.  Save.
5.  **Wait 5 mins**.

---

## 🎉 Done!
Your project is now fully deployed and readable by anyone!
