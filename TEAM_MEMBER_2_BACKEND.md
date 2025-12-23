# 🔧 Team Member 2: Backend Developer (Node.js/Express)

**Responsibility**: Building API endpoints, server logic, request handling, and middleware

---

## 📋 What You Built

### Server Setup:
1. **Main Server** (`backend/server.js`)
   - Express app initialization
   - CORS configuration
   - MongoDB connection
   - Route mounting
   - Error handling

### API Routes & Controllers:

2. **Resume Routes** (`backend/routes/resume.js`)
   - `POST /api/resume/upload` - Upload resume
   - `GET /api/resume` - Get all resumes
   - `GET /api/resume/:id` - Get specific resume
   - `POST /api/resume/:id/analyze` - Analyze resume
   - `DELETE /api/resume/:id` - Delete resume

3. **AI Routes** (`backend/routes/ai.js`)
   - `POST /api/ai/analyze` - AI analysis endpoint
   - `POST /api/ai/generate-story` - Story generation

4. **Middleware** (`backend/middleware/upload.js`)
   - File upload handling with Multer
   - File validation (type, size)
   - Error handling for uploads

5. **Controllers**:
   - `controllers/resumeController.js` - Resume business logic
   - `controllers/aiController.js` - AI analysis logic
   - `controllers/questionController.js` - Question handling

---

## 🎯 Evaluation Questions for You

### **Question 1: Express Server Setup**
**Teacher asks**: "Explain your server.js file. What does each middleware do?"

**Your Answer Should Include**:
```javascript
const app = express();

// Middleware stack
app.use(cors()); // Allow frontend to communicate
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({extended: true})); // Parse form data

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/ai', aiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Explain**:
- **CORS**: Enables cross-origin requests (frontend on port 3000, backend on 5000)
- **express.json()**: Automatically parses incoming JSON to `req.body`
- **express.urlencoded()**: Parses form data
- **Routes**: Mount route handlers at specific paths
- **Error handling**: Try-catch for graceful degradation

---

### **Question 2: What is CORS? Why do you need it?**
**Teacher asks**: "Your frontend runs on port 3000 and backend on 5000. Without CORS, what happens?"

**Your Answer**:
```javascript
app.use(cors());
// OR with specific config
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));
```

**Explain**:
- **Without CORS**: Browser blocks requests (Same-Origin Policy)
- **CORS** (Cross-Origin Resource Sharing): Allows different domains/ports to communicate
- **Headers**: Backend sends `Access-Control-Allow-Origin` header
- **Production**: Restrict to specific frontend URL instead of `*`

---

### **Question 3: Environment Variables**
**Teacher asks**: "Why do you use .env file? What goes in there and why?"

**Your Answer**:
```env
# .env file
PORT=5000
GEMINI_API_KEY=your_api_key_here
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
NODE_ENV=development
GEMINI_MODEL=gemini-1.5-flash
```

**Code usage**:
```javascript
const PORT = process.env.PORT || 5000;
const apiKey = process.env.GEMINI_API_KEY;
```

**Explain**:
- **Sensitive Data**: Never hardcode API keys
- **Environment-Specific**: Different configs for dev/prod
- **Security**: Keys not committed to GitHub
- **Flexibility**: Easy to change without code changes
- **Access**: Via `process.env.VARIABLE_NAME`

---

### **Question 4: Express Routes & Routing**
**Teacher asks**: "Show me your resume routes. What HTTP methods are used and why?"

**Your Answer**:
```javascript
// GET - Read data
router.get('/', getAllResumes); // Get all
router.get('/:id', getResume); // Get one

// POST - Create/Submit data
router.post('/upload', upload.single('resume'), uploadResume);
router.post('/:id/analyze', analyzeResume);

// DELETE - Remove data
router.delete('/:id', deleteResume);
```

**HTTP Methods Explanation**:
| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve data | `/api/resume/:id` |
| POST | Submit/create data | `/api/resume/upload` |
| PUT | Update entire resource | `/api/resume/:id` |
| DELETE | Remove data | `/api/resume/:id` |
| PATCH | Partial update | `/api/resume/:id` |

---

### **Question 5: Multer - File Upload Handling**
**Teacher asks**: "How do you handle PDF file uploads? Walk me through the process."

**Your Answer**:
```javascript
// middleware/upload.js
const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  }
});

// In route
router.post('/upload', upload.single('resume'), (req, res) => {
  const file = req.file;
  // Process file
});
```

**Process Flow**:
1. Frontend sends FormData with PDF file
2. Multer intercepts the request
3. Validates file (type, size)
4. Saves to `uploads/` folder (temp)
5. Adds `req.file` object with filename, size, path
6. Controller processes the file
7. Extract text from PDF
8. Save to database

---

### **Question 6: Error Handling in Routes**
**Teacher asks**: "What happens when someone uploads a non-PDF file? Show error handling."

**Your Answer**:
```javascript
router.post('/upload', 
  upload.single('resume'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No file provided' 
        });
      }
      
      const resume = await uploadResume(req.file);
      res.json({ success: true, resume });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        error: 'Upload failed',
        message: error.message 
      });
    }
  }
);
```

**Error Handling Strategy**:
- **Validation**: Check if file exists
- **Try-catch**: Wrap async operations
- **Status codes**: 400 (bad request), 500 (server error)
- **User-friendly messages**: Don't expose internal errors
- **Logging**: Log errors for debugging

---

### **Question 7: Async/Await & Promises**
**Teacher asks**: "Your controller uses async/await. Explain why not use callbacks."

**Your Answer**:
```javascript
// Async/Await (cleaner, modern)
async function uploadResume(req, res) {
  try {
    const resumeText = await extractTextFromPDF(req.file);
    const saved = await Resume.create({
      fileName: req.file.originalname,
      resumeText: resumeText
    });
    res.json({ success: true, resume: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// vs Callbacks (callback hell)
function uploadResume(req, res) {
  extractTextFromPDF(req.file, function(err, text) {
    if (err) return res.status(500).json({ error: err });
    
    Resume.create({...}, function(err, saved) {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true, resume: saved });
    });
  });
}
```

**Benefits of Async/Await**:
- Cleaner, more readable code
- Error handling with try-catch
- Sequential flow
- Avoid callback hell (pyramid of doom)

---

### **Question 8: MongoDB Connection**
**Teacher asks**: "How do you connect to MongoDB? What if connection fails?"

**Your Answer**:
```javascript
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Connection failed:', err.message);
    // Continue in mock mode
  });
```

**Connection Details**:
- **Mongoose**: ODM (Object Document Mapper) for MongoDB
- **URI Format**: `mongodb://localhost:27017/database-name`
- **Promise-based**: Returns promise, not callback
- **Graceful Degradation**: Server continues even if DB fails
- **Connection Pool**: Manages multiple connections
- **Reconnection**: Automatic retry on disconnection

---

### **Question 9: Creating API Endpoints**
**Teacher asks**: "Show me how you create a new API endpoint. What's the structure?"

**Your Answer**:
```javascript
// 1. Define route
router.post('/api/resume/:id/analyze', async (req, res) => {
  // 2. Validate input
  if (!req.params.id) {
    return res.status(400).json({ error: 'ID required' });
  }
  
  try {
    // 3. Get data from database
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // 4. Process data
    const analysis = await analyzeWithAI(resume.text);
    
    // 5. Save results
    resume.aiAnalysis = analysis;
    await resume.save();
    
    // 6. Send response
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Endpoint Structure**:
1. **Route**: HTTP method + path
2. **Validation**: Check required data
3. **Database Query**: Fetch data
4. **Business Logic**: Process data
5. **Persistence**: Save to database
6. **Response**: Send success/error

---

### **Question 10: HTTP Status Codes**
**Teacher asks**: "What status codes do you use? Explain each."

**Your Answer**:
```javascript
res.status(200).json(data);        // 200 OK - Success
res.status(201).json(data);        // 201 Created - New resource
res.status(400).json({error: ''}); // 400 Bad Request - Invalid input
res.status(404).json({error: ''}); // 404 Not Found - Resource missing
res.status(500).json({error: ''}); // 500 Server Error - Internal error
```

**Status Code Categories**:
| Range | Meaning | Examples |
|-------|---------|----------|
| 2xx | Success | 200 OK, 201 Created |
| 3xx | Redirect | 301 Moved, 302 Found |
| 4xx | Client Error | 400 Bad Request, 404 Not Found |
| 5xx | Server Error | 500 Internal Error |

---

### **Question 11: Request/Response Cycle**
**Teacher asks**: "Walk me through what happens when frontend uploads a resume."

**Your Answer**:
```
1. FRONTEND sends:
   POST /api/resume/upload
   Headers: Content-Type: multipart/form-data
   Body: {file: PDF, jobRole: "Software Developer"}

2. BACKEND receives:
   req.method = 'POST'
   req.file = {filename, size, path, originalname}
   req.body = {jobRole: "..."}

3. BACKEND processes:
   Multer validates file ✓
   extract PDF text ✓
   Call Gemini AI API ✓
   Save to MongoDB ✓

4. BACKEND responds:
   res.json({
     success: true,
     resumeId: "123abc",
     fileName: "resume.pdf",
     atsScore: 75,
     analysis: {...}
   })

5. FRONTEND handles:
   .then(data => setResume(data))
   .catch(err => showError(err))
```

---

### **Question 12: Request Body & Parameters**
**Teacher asks**: "What's the difference between req.body, req.params, and req.query?"

**Your Answer**:
```javascript
// 1. req.params - URL path parameters
// GET /api/resume/:id
// URL: /api/resume/123
router.get('/:id', (req, res) => {
  console.log(req.params.id); // "123"
});

// 2. req.query - URL query string
// GET /api/resume?sortBy=newest&limit=10
app.get('/api/resume', (req, res) => {
  console.log(req.query.sortBy); // "newest"
  console.log(req.query.limit);  // "10"
});

// 3. req.body - Request body (POST, PUT)
// POST /api/resume/analyze
// Body: {jobRole: "Developer", experience: "2 years"}
app.post('/api/resume/analyze', (req, res) => {
  console.log(req.body.jobRole);   // "Developer"
  console.log(req.body.experience); // "2 years"
});
```

---

### **Question 13: API Response Format**
**Teacher asks**: "How do you structure your API responses? Show me examples."

**Your Answer**:
```javascript
// Success response
{
  "success": true,
  "data": {
    "resumeId": "123",
    "fileName": "resume.pdf",
    "atsScore": 75
  }
}

// Error response
{
  "success": false,
  "error": "Resume not found",
  "code": "NOT_FOUND",
  "status": 404
}

// List response with pagination
{
  "success": true,
  "resumes": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "pageSize": 10
  }
}
```

**Response Best Practices**:
- Consistent format (success flag)
- Clear error messages
- Pagination for lists
- Metadata (timestamps, counts)
- HTTP status codes match response

---

### **Question 14: API Testing**
**Teacher asks**: "How do you test your APIs? Show me how to test the upload endpoint."

**Your Answer**:
```javascript
// Using Postman or curl
curl -X POST http://localhost:5000/api/resume/upload \
  -F "resume=@resume.pdf" \
  -F "jobRole=Software Developer"

// Or with Node.js
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('resume', fs.createReadStream('resume.pdf'));
form.append('jobRole', 'Software Developer');

fetch('http://localhost:5000/api/resume/upload', {
  method: 'POST',
  body: form
});
```

**Testing Approach**:
- Manual testing with Postman
- Test happy path (valid input)
- Test error cases (invalid file, missing data)
- Check status codes
- Verify database updates

---

### **Question 15: Scaling the Backend**
**Teacher asks**: "If you had 10,000 users uploading resumes daily, what would break?"

**Your Answer**:
**Potential Issues**:
1. **API Rate Limiting**: Too many requests to Gemini API
2. **Database Performance**: Slow queries on large datasets
3. **File Storage**: Limited disk space for PDF files
4. **Memory**: Server runs out of RAM

**Solutions**:
```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});
app.use(limiter);

// Add database indexing
resumeSchema.index({ userId: 1, createdAt: -1 });

// Use message queues for AI processing
// Store files in cloud (AWS S3) instead of local disk
// Add caching (Redis) for frequently accessed data
```

---

## 📊 Key Files You Own

| File | Lines | Purpose |
|------|-------|---------|
| `backend/server.js` | ~80 | Server setup |
| `backend/routes/resume.js` | ~150 | Resume endpoints |
| `backend/routes/ai.js` | ~100 | AI endpoints |
| `backend/middleware/upload.js` | ~50 | File upload handling |
| `backend/controllers/resumeController.js` | ~200 | Resume logic |
| `backend/controllers/aiController.js` | ~150 | AI logic |
| `backend/services/pdfParser.js` | ~100 | PDF extraction |
| `backend/models/Resume.js` | ~80 | Resume schema |
| `backend/models/User.js` | ~60 | User schema |

---

## 🎓 What You Learned

✅ Express.js fundamentals  
✅ Routing and middleware  
✅ Async/await and promises  
✅ File upload handling (Multer)  
✅ HTTP methods and status codes  
✅ CORS and security  
✅ Environment variables  
✅ Error handling patterns  
✅ API design principles  
✅ Database connection (MongoDB)  

---

## 💡 Tips for Your Evaluation

1. **Know your routes**: Be ready to explain all endpoints
2. **Security**: Discuss API key management, validation
3. **Performance**: Talk about rate limiting, caching
4. **Testing**: Show how you tested endpoints
5. **Future improvements**:
   - Add authentication (JWT)
   - Implement caching (Redis)
   - Add request logging/monitoring
   - Database indexing optimization
   - API versioning (/v1/api/)

Good luck! 🚀
