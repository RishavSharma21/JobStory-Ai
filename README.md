# JobStory AI 🚀

An **AI-powered resume analysis platform** designed for IT students and professionals to optimize their resumes for campus placements and job applications.

## 📋 Overview

JobStory AI provides intelligent resume analysis with:
- **ATS (Applicant Tracking System) Score Analysis** - See how well your resume matches job requirements
- **AI-Powered Story Generation** - Create compelling interview stories based on your resume
- **Resume History Tracking** - Keep track of all your analyzed resumes and scores
- **Job Role Targeting** - Customize analysis for specific IT job roles
- **Clean, Modern UI** - Dark theme minimalist design with professional styling

## ✨ Features

### Core Features
- 📄 **Resume Upload & Parsing** - Upload PDF resumes and extract text automatically
- 🤖 **AI Analysis** - Get detailed resume analysis using Google Gemini AI
- 📊 **ATS Score** - Receive a percentage score indicating resume optimization
- 💬 **Interview Story Generation** - AI generates personalized interview stories
- 📚 **History Management** - Save and revisit all past analyses
- 🔍 **Search & Filter** - Easily find saved resumes by name or role
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

### UI Enhancements
- Space Grotesk typography for headings
- Glass morphism effects
- Custom dropdown sorting
- Color-coded ATS scores (Green: 75%+, Yellow: 50-74%, Red: <50%)
- Loading states with smooth animations
- Professional dark theme (#121212 background)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router 7** - Client-side routing
- **React Icons** - Icon library
- **Axios** - HTTP client
- **CSS3** - Custom styling with glassmorphism effects
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (if configured)
- **Multer** - File upload handling
- **PDF Parser** - Resume text extraction
- **Google Gemini API** - AI analysis and story generation

## 📁 Project Structure

```
StoryPitch-Ai/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIAnalysisLoader.js
│   │   │   ├── StoryGeneration.js
│   │   │   ├── FileUpload.js
│   │   │   └── Header.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── History.js
│   │   │   ├── analyze.js
│   │   │   └── Analyze.css
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── pdfDownload.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── resumeController.js
│   │   └── questionController.js
│   ├── models/
│   │   ├── Resume.js
│   │   └── User.js
│   ├── routes/
│   │   ├── ai.js
│   │   └── resume.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── aiNormalizer.js
│   │   └── pdfParser.js
│   ├── middleware/
│   │   └── upload.js
│   ├── server.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/RishavSharma21/JobStory-Ai.git
cd JobStory-Ai
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file and add your configuration
# GEMINI_API_KEY=your_api_key_here
# MONGODB_URI=your_mongodb_uri (optional)
# PORT=5000

node server.js
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

The application will open at `http://localhost:3000`

## 📖 Usage

### Analyzing a Resume
1. Go to the **Home** page
2. Click "Upload Resume" and select a PDF file
3. Enter your target job role (e.g., "Software Developer", "Frontend Engineer")
4. Click "Generate Interview Story"
5. View your ATS score and AI-generated story

### Viewing History
1. Navigate to the **History** page
2. Browse all your previously analyzed resumes
3. Use the search bar to find specific resumes
4. Sort by "Newest", "Oldest", or "By Name"
5. Click "View" to revisit an analysis or "Delete" to remove it

## 🎨 Design Features

- **Minimalist Dark Theme** - Professional appearance with dark backgrounds
- **Space Grotesk Typography** - Modern, bold font for headings
- **Custom Components** - Dropdown selectors with smooth animations
- **Color System**:
  - Background: `#121212`
  - Primary Text: `#ffffff`
  - Accent: `#3b82f6` (Blue)
  - Success: `#22c55e` (Green)
  - Warning: `#fbbf24` (Yellow)
  - Error: `#ef4444` (Red)

## 🔧 Configuration

### Environment Variables (Backend)
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

### API Endpoints
- `GET /api/resume` - Get all resumes
- `POST /api/resume` - Upload and analyze resume
- `GET /api/resume/:id` - Get specific resume
- `DELETE /api/resume/:id` - Delete resume
- `POST /api/ai/analyze` - AI analysis
- `POST /api/ai/generate-story` - Generate interview story

## 📊 Features Breakdown

### ATS Score System
- Analyzes resume against job description
- Checks for keyword matches
- Evaluates formatting and structure
- Provides actionable insights

### AI Story Generation
- Creates personalized interview narratives
- Highlights key achievements
- Tailored to job role
- Professional language and tone

### Resume History
- Local storage with backend sync
- Search functionality
- Sort options
- Delete with confirmation
- View analysis details

## 🐛 Troubleshooting

**Issue**: Resume upload fails
- Check file size (max typically 10MB)
- Ensure file is a valid PDF
- Check backend server is running

**Issue**: API key errors
- Verify Gemini API key is correct
- Check `.env` file configuration
- Ensure API key has necessary permissions

**Issue**: Styling not loading
- Clear browser cache
- Restart frontend development server
- Check CSS file paths

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Rishav Sharma**
- GitHub: [@RishavSharma21](https://github.com/RishavSharma21)
- Project: [JobStory AI](https://github.com/RishavSharma21/JobStory-Ai)

## 📧 Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/RishavSharma21/JobStory-Ai/issues).

---

**Made with ❤️ for IT students and professionals**
