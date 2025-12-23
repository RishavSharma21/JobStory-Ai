# 💾 Team Member 4: Database & Data Management

**Responsibility**: Database design, schema management, data models, queries, and data persistence

---

## 📋 What You Built

### Database Setup:
1. **MongoDB Connection** (`backend/server.js`)
   - Mongoose ODM connection
   - Connection pooling
   - Error handling

2. **Data Models**:
   - `models/Resume.js` - Resume documents
   - `models/User.js` - User accounts
   - Relationships and indexing

3. **Database Operations**:
   - CRUD operations (Create, Read, Update, Delete)
   - Query optimization
   - Data validation

4. **Data Flow**:
   - Save uploaded resumes
   - Store AI analysis results
   - Manage user history
   - Support search and filtering

---

## 🎯 Evaluation Questions for You

### **Question 1: MongoDB vs SQL - Why MongoDB?**
**Teacher asks**: "Why did you choose MongoDB instead of MySQL or PostgreSQL?"

**Your Answer**:
```javascript
// MongoDB (No-SQL) - What we use
// Flexible schema
db.resumes.insertOne({
  _id: ObjectId(),
  fileName: "resume.pdf",
  resumeText: "...",
  aiAnalysis: {
    atsScore: 75,
    missingSkills: ["Docker", "AWS"],
    story: "..."
  },
  createdAt: Date.now()
});

// MySQL (SQL) - Would need multiple tables
CREATE TABLE resumes (
  id INT PRIMARY KEY,
  fileName VARCHAR(255),
  resumeText TEXT
);

CREATE TABLE ai_analysis (
  id INT PRIMARY KEY,
  resume_id INT FOREIGN KEY,
  atsScore INT,
  // More fields...
);
```

**Advantages of MongoDB**:
| Aspect | MongoDB | MySQL |
|--------|---------|-------|
| **Flexibility** | No schema | Fixed schema |
| **Complex Data** | Nested objects (JSON) | Multiple joins |
| **Development** | Rapid iteration | Schema migration needed |
| **Scaling** | Horizontal easy | Vertical harder |
| **Resume Data** | Perfect fit | Needs normalization |

**Why for this project**:
- ✅ Resume + AI analysis = nested complex data
- ✅ Schema can evolve (new AI fields)
- ✅ JSON-like structure = natural for AI output
- ✅ Rapid development (no migrations)
- ✅ Easy horizontal scaling

---

### **Question 2: Mongoose ODM**
**Teacher asks**: "What's Mongoose? Why not use MongoDB driver directly?"

**Your Answer**:
```javascript
// With Mongoose
const resumeSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  resumeText: String,
  atsScore: {
    type: Number,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Resume = mongoose.model('Resume', resumeSchema);

// Create
const resume = new Resume({fileName: "myresume.pdf"});
await resume.save();

// vs Native driver (more verbose)
const client = new MongoClient(uri);
const collection = client.db('resumedb').collection('resumes');
await collection.insertOne({fileName: "myresume.pdf"});
```

**Mongoose Benefits**:
- **Schema Validation**: Enforce data structure
- **Middleware Hooks**: Pre/post processing (`pre('save')`)
- **Methods**: Add custom methods to models
- **Relationships**: Handle references between collections
- **Cleaner API**: More Node.js developer-friendly
- **Type Safety**: Better IDE support

---

### **Question 3: MongoDB Schema Design**
**Teacher asks**: "Show me your Resume schema. What fields do you have and why?"

**Your Answer**:
```javascript
// models/Resume.js
const resumeSchema = new mongoose.Schema({
  // User association
  userId: {
    type: String,
    required: true,
    index: true  // Speed up queries by user
  },
  
  // File information
  fileName: {
    type: String,
    required: true
  },
  fileType: String,
  fileSize: Number,
  originalFileName: String,
  
  // Resume content
  resumeText: {
    type: String,
    required: true
  },
  
  // Job context
  jobRole: {
    type: String,
    default: 'Software Developer'
  },
  
  // AI Analysis result
  aiAnalysis: {
    atsScore: Number,
    level: String,
    missingKeywords: [String],
    presentSkills: [String],
    grammarErrors: [{
      section: String,
      error: String,
      correction: String
    }],
    story: String,
    quickFixes: [String]
  },
  
  // Metadata
  processingStatus: {
    type: String,
    enum: ['pending', 'text_extracted', 'analyzed', 'failed'],
    default: 'pending'
  },
  errorMessage: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for performance
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ fileName: 'text' }); // Full-text search
```

**Schema Design Decisions**:
- **userId**: Track which user owns the resume
- **fileSize**: Enforce quota limits
- **processingStatus**: Track analysis state
- **aiAnalysis**: Nested object for complex data
- **timestamps**: Know when created/updated
- **Indexes**: Speed up common queries

---

### **Question 4: MongoDB CRUD Operations**
**Teacher asks**: "Walk me through the CRUD operations for Resume model."

**Your Answer**:

#### **CREATE - Insert resume**
```javascript
async function uploadResume(userId, fileData, resumeText) {
  const resume = new Resume({
    userId: userId,
    fileName: fileData.originalname,
    fileSize: fileData.size,
    resumeText: resumeText,
    processingStatus: 'text_extracted'
  });
  
  await resume.save(); // INSERT into database
  return resume;
}
```

#### **READ - Get resumes**
```javascript
// Get all resumes for user
async function getUserResumes(userId) {
  const resumes = await Resume.find({ userId: userId })
    .sort({ createdAt: -1 }) // Newest first
    .limit(20);
  return resumes;
}

// Get specific resume
async function getResumeById(resumeId) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new Error('Resume not found');
  return resume;
}

// Search resumes
async function searchResumes(userId, keyword) {
  return await Resume.find(
    { 
      userId: userId,
      $text: { $search: keyword } // Full-text search
    }
  );
}
```

#### **UPDATE - Modify resume**
```javascript
async function updateAnalysis(resumeId, analysisData) {
  const resume = await Resume.findByIdAndUpdate(
    resumeId,
    {
      aiAnalysis: analysisData,
      processingStatus: 'analyzed',
      updatedAt: new Date()
    },
    { new: true } // Return updated document
  );
  return resume;
}
```

#### **DELETE - Remove resume**
```javascript
async function deleteResume(resumeId) {
  const result = await Resume.findByIdAndDelete(resumeId);
  if (!result) throw new Error('Resume not found');
  return result;
}
```

---

### **Question 5: Database Queries & Indexes**
**Teacher asks**: "You have indexes on userId and createdAt. Why and how do they help?"

**Your Answer**:
```javascript
// Index definition
resumeSchema.index({ userId: 1, createdAt: -1 });
// 1 = ascending, -1 = descending

// Query that benefits from index
const userResumes = await Resume.find({ userId: userId })
  .sort({ createdAt: -1 })
  .limit(10);
// MongoDB scans index → very fast
```

**Without Index**:
```
Query: Find all resumes for userId = "123"
MongoDB scans ALL documents in collection ❌ Slow
Time: O(n) - Linear with collection size
```

**With Index**:
```
Query: Find all resumes for userId = "123"
MongoDB looks up B-tree index → finds matching documents ✅ Fast
Time: O(log n) - Logarithmic
```

**Performance Comparison**:
- 1,000 documents: 100x faster
- 1,000,000 documents: 10,000x faster

**Types of Indexes**:
```javascript
// Single field
resumeSchema.index({ userId: 1 });

// Compound (multiple fields)
resumeSchema.index({ userId: 1, createdAt: -1 });

// Full-text search
resumeSchema.index({ resumeText: 'text', fileName: 'text' });

// Unique (no duplicates)
resumeSchema.index({ email: 1 }, { unique: true });

// TTL (expire after time)
resumeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
```

---

### **Question 6: Data Validation**
**Teacher asks**: "How do you ensure data quality? Show me validation."

**Your Answer**:
```javascript
const resumeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true, // Must be provided
    minlength: 1,
    maxlength: 100
  },
  
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    match: /\.pdf$/i  // Must end with .pdf
  },
  
  fileSize: {
    type: Number,
    required: true,
    validate: {
      validator: (val) => val <= 10 * 1024 * 1024, // Max 10MB
      message: 'File size must be less than 10MB'
    }
  },
  
  atsScore: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  
  processingStatus: {
    type: String,
    enum: ['pending', 'text_extracted', 'analyzed', 'failed'],
    default: 'pending'
  }
});

// Custom validation
resumeSchema.pre('save', function(next) {
  // Before saving, check if resumeText exists
  if (!this.resumeText || this.resumeText.trim().length === 0) {
    next(new Error('Resume text cannot be empty'));
  } else {
    next();
  }
});
```

**Validation Types**:
- **Type**: `type: String`
- **Required**: `required: true`
- **Length**: `minlength`, `maxlength`
- **Enum**: `enum: ['value1', 'value2']`
- **Range**: `min`, `max`
- **Regex**: `match: /pattern/`
- **Custom**: `validate: { validator, message }`

---

### **Question 7: Database Transactions**
**Teacher asks**: "What if resume upload succeeds but analysis fails? How do you handle it?"

**Your Answer**:
```javascript
async function uploadAndAnalyzeResume(userId, file) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Save resume
    const resume = new Resume({
      userId: userId,
      fileName: file.originalname,
      processingStatus: 'pending'
    });
    await resume.save({ session });
    
    // 2. Analyze with AI
    const analysis = await aiService.analyze(resume.resumeText);
    
    // 3. Update resume with analysis
    resume.aiAnalysis = analysis;
    resume.processingStatus = 'analyzed';
    await resume.save({ session });
    
    // 4. All good - commit
    await session.commitTransaction();
    return resume;
    
  } catch (error) {
    // Something failed - rollback everything
    await session.abortTransaction();
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    session.endSession();
  }
}
```

**Without Transaction** (Bad):
```
Resume saved ✓
AI analysis fails ✗
Database has partial data ❌ Inconsistent
```

**With Transaction** (Good):
```
Resume saved ✓
AI analysis fails ✗
All changes rolled back ✓ Consistent
```

---

### **Question 8: Aggregation Pipeline**
**Teacher asks**: "How would you get top 10 resumes by ATS score?"

**Your Answer**:
```javascript
async function getTopResumesByScore(userId, limit = 10) {
  const topResumes = await Resume.aggregate([
    // Stage 1: Match user's resumes
    { $match: { userId: userId } },
    
    // Stage 2: Sort by ATS score descending
    { $sort: { 'aiAnalysis.atsScore': -1 } },
    
    // Stage 3: Limit results
    { $limit: limit },
    
    // Stage 4: Project only needed fields
    { $project: {
      fileName: 1,
      'aiAnalysis.atsScore': 1,
      'aiAnalysis.level': 1,
      createdAt: 1
    }}
  ]);
  
  return topResumes;
}

// Complex aggregation with grouping
async function getAverageScoreByRole(userId) {
  return await Resume.aggregate([
    { $match: { userId: userId } },
    
    // Group by job role
    { $group: {
      _id: '$jobRole',
      avgScore: { $avg: '$aiAnalysis.atsScore' },
      count: { $sum: 1 },
      maxScore: { $max: '$aiAnalysis.atsScore' }
    }},
    
    // Sort by average score
    { $sort: { avgScore: -1 } }
  ]);
}
```

**Aggregation Stages**:
- `$match`: Filter documents
- `$project`: Select fields
- `$group`: Group and aggregate
- `$sort`: Sort results
- `$limit`: Limit count
- `$skip`: Skip documents
- `$lookup`: Join collections
- `$unwind`: Flatten arrays

---

### **Question 9: Pagination**
**Teacher asks**: "How do you implement pagination for the History page?"

**Your Answer**:
```javascript
async function getResumesWithPagination(userId, page = 1, pageSize = 10) {
  // Calculate skip
  const skip = (page - 1) * pageSize;
  
  // Get total count
  const total = await Resume.countDocuments({ userId });
  
  // Get paginated results
  const resumes = await Resume.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);
  
  return {
    data: resumes,
    pagination: {
      currentPage: page,
      pageSize: pageSize,
      totalCount: total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total
    }
  };
}

// Frontend API response
{
  "success": true,
  "resumes": [
    { "_id": "...", "fileName": "resume1.pdf", ... },
    { "_id": "...", "fileName": "resume2.pdf", ... }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalCount": 45,
    "totalPages": 5,
    "hasMore": true
  }
}
```

**Pagination Benefits**:
- ✅ Limit data transfer
- ✅ Faster page load
- ✅ Better UX
- ✅ Server resource efficiency

---

### **Question 10: Backup & Recovery**
**Teacher asks**: "How do you backup MongoDB data? What if database crashes?"

**Your Answer**:
```javascript
// Manual backup command
// mongodump --uri "mongodb://localhost:27017/resume-analyzer" --out ./backup

// Scheduled backup (using cron)
const cron = require('node-cron');

// Backup every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    const exec = require('child_process').exec;
    exec('mongodump --uri "..." --out ./backups/backup_$(date +%Y%m%d)', (err) => {
      if (err) console.error('Backup failed:', err);
      else console.log('Backup successful');
    });
  } catch (error) {
    console.error('Backup error:', error);
  }
});

// Restore from backup
// mongorestore --uri "mongodb://localhost:27017" ./backup/resume-analyzer
```

**Backup Strategy**:
- **Frequency**: Daily or per major transaction
- **Location**: Off-site (cloud storage)
- **Retention**: Keep 30 days of backups
- **Testing**: Test restore regularly
- **Automation**: Use cron jobs

**MongoDB Atlas** (Production):
- Automatic daily backups
- 35-day retention
- 1-hour RTO (Recovery Time Objective)
- Geo-redundant storage

---

### **Question 11: Relationships - References vs Embedding**
**Teacher asks**: "Should User and Resume be separate collections or embedded?"

**Your Answer**:

**Option 1: Embedding (What we do)**
```javascript
// Resume includes user info
{
  _id: ObjectId(),
  userId: "user123",
  fileName: "resume.pdf",
  createdAt: Date.now()
}

// Query: Fast - everything in one doc
const resume = await Resume.findById(id);
```

**Option 2: References**
```javascript
// Resume references User
{
  _id: ObjectId(),
  userId: ObjectId("user123"),  // Separate doc ref
  fileName: "resume.pdf"
}

// Query: Slower - need lookup
const resume = await Resume.findById(id).populate('userId');
```

**When to Use**:
| Scenario | Use |
|----------|-----|
| One resume per user | Embed |
| One user, many resumes | Reference |
| Frequent joins | Reference |
| Repeated data | Reference |
| Small nested data | Embed |
| Large nested data | Reference |

**Our Choice**:
- ✅ **Reference** (userId) - Supports multiple resumes per user
- ✅ **Embed** (aiAnalysis) - Complex nested data, accessed together

---

### **Question 12: Scaling Database**
**Teacher asks**: "If you had 1 million users with 10 resumes each, how would you scale?"

**Your Answer**:
```javascript
// 1. Sharding - Split data across servers
// Shard key: userId
{
  _id: ObjectId(),
  userId: "user123",  // Used for sharding
  resumeId: "resume456"
}

// Server 1: userId < "user500"
// Server 2: userId >= "user500"

// 2. Read replicas - Distribute read traffic
// Primary: Handle writes
// Secondary: Handle reads

// 3. Indexing strategy
resumeSchema.index({ userId: 1, createdAt: -1 }); // Hot path
resumeSchema.index({ processingStatus: 1 }); // Queries by status
resumeSchema.index({ 'aiAnalysis.atsScore': -1 }); // Sorting

// 4. Caching layer
const redis = require('redis');
const cache = redis.createClient();

async function getResume(id) {
  // Check cache first
  const cached = await cache.get(`resume:${id}`);
  if (cached) return JSON.parse(cached);
  
  // If not cached, query DB
  const resume = await Resume.findById(id);
  
  // Cache for 1 hour
  await cache.setex(`resume:${id}`, 3600, JSON.stringify(resume));
  
  return resume;
}
```

**Scaling Strategy**:
1. **Vertical**: More powerful server (easiest)
2. **Horizontal**: Sharding (split data)
3. **Caching**: Redis for frequent queries
4. **Indexing**: Optimize database queries
5. **Read Replicas**: Handle read-heavy workloads

---

### **Question 13: Data Privacy & GDPR**
**Teacher asks**: "A user wants their data deleted. How do you handle it?"

**Your Answer**:
```javascript
async function deleteUserData(userId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Delete all resumes for user
    await Resume.deleteMany({ userId: userId }, { session });
    
    // 2. Delete user account
    await User.findByIdAndDelete(userId, { session });
    
    // 3. Clear caches
    await redis.del(`user:${userId}:*`);
    
    // 4. Log deletion
    console.log(`User ${userId} data deleted at ${new Date()}`);
    
    // 5. Commit transaction
    await session.commitTransaction();
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

**Privacy Compliance**:
- ✅ **Right to be forgotten**: Delete all user data
- ✅ **Data minimization**: Store only necessary data
- ✅ **Encryption**: Encrypt sensitive fields
- ✅ **Audit logs**: Track who accessed what
- ✅ **Purpose limitation**: Use data only for stated purpose

---

### **Question 14: Monitoring & Logging**
**Teacher asks**: "How do you monitor database performance?"

**Your Answer**:
```javascript
// 1. Query monitoring
Resume.find({ userId: userId }).explain('executionStats')
// Shows: docs scanned, time, index used

// 2. Slow query log
// MongoDB logs queries taking > 100ms

// 3. Connection monitoring
mongoose.connection.on('connected', () => {
  console.log('DB connected');
});

mongoose.connection.on('disconnected', () => {
  console.log('DB disconnected');
});

// 4. Error logging
Resume.find({}).then(
  docs => console.log('Query successful'),
  err => console.error('Query failed:', err)
);

// 5. Performance metrics
const start = Date.now();
const resumes = await Resume.find({});
const time = Date.now() - start;
console.log(`Query took ${time}ms, returned ${resumes.length} docs`);
```

**Monitoring Tools**:
- MongoDB Atlas UI: Real-time metrics
- New Relic: Application monitoring
- Datadog: Infrastructure monitoring
- CloudWatch: AWS monitoring

---

### **Question 15: Future Database Improvements**
**Teacher asks**: "What would you improve in database design?"

**Your Answer**:
1. **Full-text Search**: Better search with rankings
   ```javascript
   resumeSchema.index({ 
     resumeText: 'text', 
     fileName: 'text' 
   });
   ```

2. **Audit Logging**: Track all modifications
   ```javascript
   resumeSchema.pre('save', function(next) {
     this.updatedAt = new Date();
     AuditLog.create({ resumeId: this._id, action: 'update' });
     next();
   });
   ```

3. **Data Encryption**: Encrypt sensitive fields
   ```javascript
   resumeSchema.plugin(mongooseEncryption, {
     secret: process.env.ENCRYPTION_KEY,
     encryptedFields: ['resumeText']
   });
   ```

4. **Soft Deletes**: Archive instead of deleting
   ```javascript
   deletedAt: { type: Date, default: null },
   // Query: Resume.find({ deletedAt: null })
   ```

5. **Document Versioning**: Keep history
   ```javascript
   Resume.findByIdAndUpdate(id, update, { new: true }).version()
   ```

---

## 📊 Key Files You Own

| File | Purpose |
|------|---------|
| `backend/models/Resume.js` | Resume schema |
| `backend/models/User.js` | User schema |
| `backend/server.js` | DB connection |

---

## 🎓 What You Learned

✅ NoSQL database design  
✅ MongoDB & Mongoose  
✅ Schema design & validation  
✅ Indexing for performance  
✅ CRUD operations  
✅ Aggregation pipelines  
✅ Transactions & ACID  
✅ Scaling strategies  
✅ Data privacy & security  

---

## 💡 Tips for Your Evaluation

1. **Know your schema**: Be ready to explain each field
2. **Performance**: Discuss indexes and query optimization
3. **Data integrity**: Talk about validation and transactions
4. **Scalability**: Explain how you'd handle growth
5. **Metrics**: Know your query times and collection sizes
6. **Future improvements**:
   - Implement soft deletes
   - Add audit logging
   - Optimize indexes based on real queries
   - Implement Redis caching
   - Data compression

Good luck! 🚀
