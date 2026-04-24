const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'agri_secret_key_123'; // In production, use env variables

// @route   POST api/auth/signup
// @desc    Register user
router.post('/signup', async (req, res) => {
    const { name, contact, password, role } = req.body;

    try {
        let user = await User.findOne({ contact });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this contact.' });
        }

        user = new User({
            name,
            contact,
            password,
            role
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.status(201).json({ success: true, message: 'Signup successful! Please login.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { contact, password } = req.body;

    try {
        let user = await User.findOne({ contact });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const payload = {
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                contact: user.contact
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token,
                    user: payload.user
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
