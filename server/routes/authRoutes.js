const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { registerInit, verifyOtp, registerComplete, login, forgotPassword, verifyResetOtp, resetPassword } = require('../controllers/authController');
const { getMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

router.post('/register-init', registerInit);
router.post('/verify-otp', verifyOtp);
router.post('/register-complete', registerComplete);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL + '/login', session: false }),
    (req, res) => {
        // Successful authentication
        const token = generateToken(req.user._id);
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    }
);

module.exports = router;
