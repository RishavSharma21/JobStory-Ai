const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const auth = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST api/auth/google
// @desc    Google Login/Register
// @access  Public
router.post('/google', async (req, res) => {
    const { token } = req.body; // Logic expects the credential (id_token) from frontend

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, sub, picture } = ticket.getPayload(); // sub is google's unique user id

        let user = await User.findOne({ email });

        if (user) {
            // User exists, log them in
            // Update googleId and picture if changed/missing
            let updated = false;
            if (!user.googleId) { user.googleId = sub; updated = true; }
            if (picture && user.picture !== picture) { user.picture = picture; updated = true; }
            if (updated) await user.save();
        } else {
            // Create a new user
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = new User({
                name,
                email,
                password: randomPassword,
                googleId: sub,
                picture
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(randomPassword, salt);

            await user.save();
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: 360000 },
            (err, jwtToken) => {
                if (err) throw err;
                res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, picture: user.picture } });
            }
        );

    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(401).json({ msg: 'Google Sign-In failed', error: err.message });
    }
});

// @route   POST api/auth/google-access-token
// @desc    Google Login with Access Token
// @access  Public
router.post('/google-access-token', async (req, res) => {
    const { accessToken } = req.body;

    try {
        // Verify token by calling Google UserInfo
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userInfoRes.ok) {
            throw new Error('Invalid Access Token');
        }

        const data = await userInfoRes.json();
        const { name, email, sub, picture } = data; // sub is google's id

        let user = await User.findOne({ email });

        if (user) {
            let updated = false;
            if (!user.googleId) { user.googleId = sub; updated = true; }
            if (picture && user.picture !== picture) { user.picture = picture; updated = true; }
            if (updated) await user.save();
        } else {
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            user = new User({
                name,
                email,
                password: randomPassword,
                googleId: sub,
                picture
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(randomPassword, salt);
            await user.save();
        }

        const payload = { user: { id: user.id } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: 360000 },
            (err, jwtToken) => {
                if (err) throw err;
                res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, picture: user.picture } });
            }
        );

    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(401).json({ msg: 'Google Sign-In failed', error: err.message });
    }
});


// @route   POST api/auth/register
// @desc    Register user and get token
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ msg: 'Please provide name, email, and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );
    } catch (err) {
        console.error('Register Error:', err.message);
        res.status(500).send('Server error during registration');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter both email/username and password' });
    }

    const rawInput = email.trim();
    const normalizedEmail = rawInput.toLowerCase();

    try {
        const isDemoAttempt = (
            normalizedEmail === 'demo' || 
            normalizedEmail === 'demo@storypitch.ai' || 
            normalizedEmail === 'demo@example.com'
        ) && password === 'demo2026';

        // Build search conditions to support 'demo', 'demo@storypitch.ai', or standard email
        let query;
        if (normalizedEmail === 'demo' || normalizedEmail === 'demo@storypitch.ai') {
            query = { $or: [{ email: 'demo@storypitch.ai' }, { email: 'demo' }, { name: 'Demo User' }] };
        } else {
            query = { $or: [{ email: normalizedEmail }, { email: rawInput }] };
        }

        let user = await User.findOne(query);

        // Auto-create/repair demo user dynamically if demo login is requested
        if (!user && isDemoAttempt) {
            try {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('demo2026', salt);
                user = new User({
                    name: 'Demo User',
                    email: 'demo@storypitch.ai',
                    password: hashedPassword
                });
                await user.save();
            } catch (createErr) {
                console.warn('Dynamic demo creation warning:', createErr.message);
                // In-memory fallback object if database save fails
                user = { id: 'demo-user-id-12345', name: 'Demo User', email: 'demo@storypitch.ai' };
            }
        }

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        let isMatch = false;
        if (isDemoAttempt) {
            isMatch = true; // Guaranteed match for demo credentials
        } else if (user.password) {
            isMatch = await bcrypt.compare(password, user.password);
        }

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const userId = user.id || user._id || 'demo-user-id-12345';
        const userName = user.name || 'Demo User';
        const userEmail = user.email || 'demo@storypitch.ai';
        const userPicture = user.picture || null;

        const payload = {
            user: {
                id: userId
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: userId, name: userName, email: userEmail, picture: userPicture } });
            }
        );
    } catch (err) {
        console.error('Login Error:', err.message);
        // Fallback for demo login even on server exception
        if ((normalizedEmail === 'demo' || normalizedEmail === 'demo@storypitch.ai') && password === 'demo2026') {
            const fallbackToken = jwt.sign(
                { user: { id: 'demo-fallback-id' } },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: 360000 }
            );
            return res.json({
                token: fallbackToken,
                user: { id: 'demo-fallback-id', name: 'Demo User', email: 'demo@storypitch.ai' }
            });
        }
        res.status(500).json({ msg: 'Server error during login' });
    }
});


const Resume = require('../models/Resume');

// Helper sample resume for seeding demo history
const createSampleResumeForDemo = async (userId) => {
    try {
        const sampleResume = new Resume({
            user: userId,
            fileName: 'Alex_Johnson_Senior_FullStack_Engineer.pdf',
            fileType: 'application/pdf',
            fileSize: 245760,
            extractedText: 'Alex Johnson\nSenior Full Stack Engineer\nEmail: alex.johnson@example.com\nSkills: React, Node.js, Express, MongoDB, JavaScript, TypeScript, REST APIs, System Design, Microservices, Docker, AWS...\nExperience: Senior Software Engineer at TechCorp (2021-Present)...',
            targetJobRole: 'Senior Full Stack Engineer',
            processingStatus: 'completed',
            analyzedAt: new Date(),
            personalInfo: {
                name: 'Alex Johnson',
                title: 'Senior Full Stack Engineer',
                email: 'alex.johnson@example.com',
                phone: '+1 (555) 019-2834',
                address: 'San Francisco, CA',
                linkedin: 'linkedin.com/in/alexjohnson-tech',
                website: 'alexjohnson.dev'
            },
            skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'REST APIs', 'System Design', 'Docker', 'AWS'],
            experience: [{
                company: 'TechCorp Solutions',
                role: 'Senior Software Engineer',
                dates: '2021 - Present',
                description: 'Led architecture and development of scalable web applications serving 500k+ monthly active users.'
            }],
            aiAnalysis: {
                atsScore: {
                    score: 88,
                    level: 'Excellent',
                    explanation: 'Strong match for Senior Full Stack Engineer. Excellent keyword alignment across React, Node.js, and System Design.'
                },
                atsImprovement: {
                    missingKeywords: ['GraphQL', 'Kubernetes', 'CI/CD Pipelines'],
                    quickFixes: [
                        'Add quantifiable metrics to work achievements',
                        'Include GraphQL and container orchestration keywords',
                        'Expand on automated testing experience'
                    ],
                    formatWarnings: [],
                    estimatedImprovement: {
                        currentScore: 88,
                        potentialScore: 96,
                        impact: 'High'
                    }
                },
                recruiterInsights: {
                    overview: 'Candidate demonstrates strong full stack expertise with modern JavaScript/TypeScript ecosystems and system design.',
                    keyStrengths: [
                        'Proven track record scaling web apps for 500k+ active users',
                        'Deep expertise in React, Node.js, and MongoDB architecture',
                        'Clean resume structure with clear career progression'
                    ],
                    redFlags: [],
                    recommendations: [
                        'Highlight automated test coverage percentages',
                        'Specify cloud infrastructure tools used on AWS'
                    ]
                },
                strengths: [
                    'Strong technical alignment with modern web frameworks',
                    'Clear leadership & architecture experience',
                    'Well-formatted ATS-friendly structure'
                ],
                growthAreas: [
                    'Add DevOps & CI/CD deployment details',
                    'Include cloud cost optimization metrics'
                ],
                jobMatching: {
                    targetRole: 'Senior Full Stack Engineer',
                    matchPercentage: 88,
                    matchingSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'REST APIs', 'System Design'],
                    missingSkills: ['GraphQL', 'Kubernetes'],
                    recommendations: 'Excellent profile. Adding GraphQL experience will make this a 95%+ match.'
                },
                keywordAnalysis: {
                    presentKeywords: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'System Design', 'REST API'],
                    missingKeywords: ['GraphQL', 'Kubernetes', 'Jest'],
                    keywordDensity: 8.5
                },
                overallSummary: 'Outstanding candidate profile for Senior Full Stack Engineer with strong full-cycle web engineering capabilities.',
                aiModel: 'gemini-flash-latest',
                processedAt: new Date(),
                processingTime: 1240
            }
        });
        await sampleResume.save();
        console.log('[Demo Seed] Sample resume pre-populated for Demo User');
    } catch (err) {
        console.error('[Demo Seed] Sample resume creation warning:', err.message);
    }
};

// Helper function to seed/ensure demo user on database startup
const seedDemoUser = async () => {
    try {
        const demoEmail = 'demo@storypitch.ai';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('demo2026', salt);

        let user = await User.findOne({
            $or: [{ email: demoEmail }, { email: 'demo' }]
        });

        if (!user) {
            user = new User({
                name: 'Demo Interviewer',
                email: demoEmail,
                password: hashedPassword
            });
            await user.save();
            console.log('[Demo Seed] Created demo user account: demo@storypitch.ai (pass: demo2026)');
        } else {
            user.password = hashedPassword;
            if (!user.name) user.name = 'Demo Interviewer';
            await user.save();
            console.log('[Demo Seed] Updated demo user password to demo2026');
        }

        // Check if demo user has resumes pre-populated
        const resumeCount = await Resume.countDocuments({ user: user._id });
        if (resumeCount === 0) {
            await createSampleResumeForDemo(user._id);
        }
    } catch (err) {
        console.error('[Demo Seed] Error seeding demo user:', err?.message || err);
    }
};

// @route   POST api/auth/reset-demo
// @desc    Reset demo user history to fresh sample data
// @access  Public / Auth
router.post('/reset-demo', async (req, res) => {
    try {
        let user = await User.findOne({
            $or: [{ email: 'demo@storypitch.ai' }, { email: 'demo' }]
        });

        if (user) {
            await Resume.deleteMany({ user: user._id });
            await createSampleResumeForDemo(user._id);
        }

        res.json({ success: true, msg: 'Demo data reset successfully to clean sample state!' });
    } catch (err) {
        console.error('Reset Demo Error:', err.message);
        res.status(500).json({ error: 'Failed to reset demo data' });
    }
});

// @route   GET api/auth/user
// @desc    Get logged in user data
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.seedDemoUser = seedDemoUser;

module.exports = router;


