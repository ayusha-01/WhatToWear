const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
    try {
        const { venue, location, caption, items } = req.body;

        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        let imageUrl = '';

        // Check if Cloudinary is configured properly
        if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
            // Fallback: Use local file
            console.log('[DEV MODE] Using local file upload (Cloudinary not configured)');
            const serverUrl = `http://localhost:${process.env.PORT || 5001}`;
            imageUrl = `${serverUrl}/uploads/${req.file.filename}`;
        } else {
            // Upload to Cloudinary
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'outfit-inspo',
                });
                imageUrl = result.secure_url;
                // Clean up local file only if cloud upload succeeded
                try {
                    fs.unlinkSync(req.file.path);
                } catch (err) {
                    console.error("Failed to delete local file", err);
                }
            } catch (uploadError) {
                console.error('Cloudinary Upload Failed:', uploadError);
                // Fallback to local if Cloudinary fails
                console.log('Falling back to local storage due to Cloudinary error');
                const serverUrl = `http://localhost:${process.env.PORT || 5001}`;
                imageUrl = `${serverUrl}/uploads/${req.file.filename}`;
            }
        }

        // Parse items if sent as string (from FormData)
        let parsedItems = [];
        if (items) {
            try {
                parsedItems = JSON.parse(items);
            } catch (e) {
                parsedItems = [];
            }
        }

        // Create Post
        const post = await Post.create({
            user: req.user._id,
            imageUrl: imageUrl,
            venue,
            location,
            caption,
            items: parsedItems
        });

        res.status(201).json(post);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all posts (Feed) with Filters
// @route   GET /api/posts
// @access  Public
exports.getFeed = async (req, res) => {
    try {
        const { venue, location } = req.query;
        let query = {};

        if (venue) {
            query.venue = { $regex: venue, $options: 'i' };
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const posts = await Post.find(query)
            .populate('user', 'username profilePic')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Like / Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if already liked
        if (post.likes.includes(req.user._id)) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            // Like
            post.likes.push(req.user._id);

            // Send Notification
            if (post.user.toString() !== req.user._id.toString()) {
                console.log(`Attempting to send notification to user ${post.user.toString()} from ${req.user.username}`);
                const io = req.app.get('io');
                if (io) {
                    io.to(post.user.toString()).emit('notification', {
                        message: `${req.user.username} liked your post`,
                        type: 'like',
                        postId: post._id
                    });
                    console.log("Notification emitted!");
                } else {
                    console.log("Socket.io instance not found");
                }
            }
        }

        await post.save();
        res.json(post.likes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Save / Unsave a post
// @route   PUT /api/posts/:id/save
// @access  Private
exports.savePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if already saved
        if (post.savedBy.includes(req.user._id)) {
            // Unsave
            post.savedBy = post.savedBy.filter(id => id.toString() !== req.user._id.toString());
        } else {
            // Save
            post.savedBy.push(req.user._id);
        }

        await post.save();
        res.json(post.savedBy);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check user
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await post.deleteOne();
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user', 'username profilePic');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
