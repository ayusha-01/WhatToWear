const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        sparse: true, // Allow null/undefined to be duplicated (for unverified users)
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        // Required only if not using Google Auth
    },
    profilePic: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
