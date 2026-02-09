const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get current user profile (Me)
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });

        res.json({ user, posts });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Follow a user
// @route   PUT /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res) => {
    if (req.user._id.toString() === req.params.id) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!userToFollow.followers.includes(req.user._id)) {
            userToFollow.followers.push(req.user._id);
            currentUser.following.push(req.params.id);

            await userToFollow.save();
            await currentUser.save();

            // Notification
            const io = req.app.get('io');
            if (io) {
                io.to(userToFollow._id.toString()).emit('notification', {
                    message: `${req.user.username} started following you`,
                    type: 'follow',
                    userId: req.user._id
                });
            }
            res.json({ message: 'User followed' });
        } else {
            res.status(400).json({ message: 'You already follow this user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res) => {
    if (req.user._id.toString() === req.params.id) {
        return res.status(400).json({ message: 'Cannot unfollow yourself' });
    }

    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userToUnfollow.followers.includes(req.user._id)) {
            await userToUnfollow.updateOne({ $pull: { followers: req.user._id } });
            await currentUser.updateOne({ $pull: { following: req.params.id } });
            res.json({ message: 'User unfollowed' });
        } else {
            res.status(400).json({ message: 'You dont follow this user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.bio = req.body.bio || user.bio;

            // Handle Username Update
            if (req.body.username && req.body.username !== user.username) {
                const usernameExists = await User.findOne({ username: req.body.username });
                if (usernameExists) {
                    return res.status(400).json({ message: 'Username is already taken' });
                }
                user.username = req.body.username;
            }

            if (req.file) {
                // Check Cloudinary
                if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
                    // Local fallback
                    const serverUrl = `http://localhost:${process.env.PORT || 5001}`;
                    user.profilePic = `${serverUrl}/uploads/${req.file.filename}`;
                } else {
                    // Cloudinary
                    // (Import cloudinary if needed here, but assuming it was handled or reusing logic)
                    // Re-using simplified logic:
                    const cloudinary = require('../config/cloudinary');
                    const fs = require('fs');
                    try {
                        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'outfit-inspo-profiles' });
                        user.profilePic = result.secure_url;
                        fs.unlinkSync(req.file.path);
                    } catch (e) {
                        // Fallback
                        const serverUrl = `http://localhost:${process.env.PORT || 5001}`;
                        user.profilePic = `${serverUrl}/uploads/${req.file.filename}`;
                    }
                }
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                profilePic: updatedUser.profilePic,
                bio: updatedUser.bio,
                followers: updatedUser.followers,
                following: updatedUser.following,
                isVerified: updatedUser.isVerified
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search users by username or email
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        }).select('username profilePic isVerified followers');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get current user's saved posts
// @route   GET /api/users/saved
// @access  Private
exports.getSavedPosts = async (req, res) => {
    try {
        // Correct approach: Find posts where savedBy includes req.user._id
        const savedPosts = await Post.find({ savedBy: req.user._id }).populate('user', 'username profilePic');
        res.json(savedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}
