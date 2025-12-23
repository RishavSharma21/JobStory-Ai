const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Resume = require('./models/Resume');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const migrate = async () => {
    try {
        console.log('--- Starting History Migration ---');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-analyzer');
        console.log('Connected to MongoDB');

        // 1. Get all Users
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        // Create a map of Email -> UserID
        const emailMap = {};
        users.forEach(u => {
            if (u.email) emailMap[u.email.toLowerCase()] = u._id;
        });

        // 2. Get all Resumes without an owner
        const resumes = await Resume.find({ user: { $exists: false } });
        console.log(`Found ${resumes.length} orphaned resumes.`);

        let updatedCount = 0;

        for (const resume of resumes) {
            // Attempt to find an email in personalInfo or extractedText
            let candidateEmail = resume.personalInfo?.email;

            // Simple heuristic to extract email from text if missing (optional but helpful)
            if (!candidateEmail && resume.extractedText) {
                const emailMatch = resume.extractedText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                if (emailMatch) candidateEmail = emailMatch[0];
            }

            if (candidateEmail) {
                const normalizedEmail = candidateEmail.toLowerCase().trim();
                const ownerId = emailMap[normalizedEmail];

                if (ownerId) {
                    resume.user = ownerId;
                    await resume.save();
                    console.log(`Linked resume "${resume.fileName}" to user: ${normalizedEmail}`);
                    updatedCount++;
                } else {
                    // console.log(`No user found for email: ${normalizedEmail}`);
                }
            }
        }

        console.log(`Migration Complete. Successfully restored/linked ${updatedCount} resumes.`);
        process.exit(0);

    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
};

migrate();
