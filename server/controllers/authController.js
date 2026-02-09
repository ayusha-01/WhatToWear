const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register user (Step 1: Send OTP)
// @route   POST /api/auth/register-init
// @access  Public
exports.registerInit = async (req, res) => {
    const { email } = req.body;

    try {
        const userExists = await User.findOne({ email });

        // If user exists and is verified, cannot register again
        if (userExists && userExists.isVerified) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        let user = userExists;
        if (!user) {
            user = await User.create({
                email,
                otp,
                otpExpiry
            });
        } else {
            // Update existing unverified user
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
        }

        // Send Email
        const message = `Your verification code is: ${otp}`;
        await sendEmail({
            email: user.email,
            subject: 'Outfit Inspo Verification Code',
            message
        });

        res.status(200).json({ message: 'OTP sent to email' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify OTP (Step 2)
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP Expired' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified. Please set password.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Complete Registration (Step 3: Set Password)
// @route   POST /api/auth/register-complete
// @access  Public
exports.registerComplete = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !user.isVerified) {
            return res.status(400).json({ message: 'User not verified' });
        }

        if (user.password) {
            return res.status(400).json({ message: 'User already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.username = username;

        await user.save();

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Forgot Password (Step 1: Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send Email
        const message = `Your password reset code is: ${otp}`;
        await sendEmail({
            email: user.email,
            subject: 'Outfit Inspo Password Reset Code',
            message
        });

        res.status(200).json({ message: 'OTP sent to email' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify Reset OTP (Step 2)
// @route   POST /api/auth/verify-reset-otp
// @access  Public
exports.verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP Expired' });
        }

        // OTP is valid
        res.status(200).json({ message: 'OTP verified' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password (Step 3: New Password)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify OTP again to be safe
        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or Expired OTP' });
        }

        // Hash and Update Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear OTP
        user.otp = undefined;
        user.otpExpiry = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now login.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
