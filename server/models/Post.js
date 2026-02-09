const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true,
        index: true, // For faster filtering
        trim: true
    },
    location: {
        type: String,
        index: true,
        trim: true
    },
    caption: {
        type: String,
        default: ""
    },
    items: [{
        name: String,
        category: String,
        purchaseLink: String,
        x: Number, // Percentage coordinate (0-100)
        y: Number  // Percentage coordinate (0-100)
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
