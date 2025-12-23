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

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
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
            process.env.JWT_SECRET || 'secret', // Use env variable in production
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
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
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
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

module.exports = router;
