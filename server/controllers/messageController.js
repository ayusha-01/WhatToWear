const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message (or share a post)
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, postId, text } = req.body;

        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            post: postId,
            text
        });

        // Socket.io for real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(recipientId).emit('newMessage', message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get conversation with a user (or all messages for inbox)
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { recipient: req.user._id },
                { sender: req.user._id }
            ]
        })
            .populate('sender', 'username profilePic')
            .populate('recipient', 'username profilePic')
            .populate({
                path: 'post',
                select: 'imageUrl caption'
            })
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get mutual followers (people I follow who follow me)
// @route   GET /api/users/mutuals
// @access  Private
exports.getMutuals = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('following', 'username profilePic followers');

        // Filter: Users I follow who also have me in their followers list
        const mutuals = user.following.filter(followedUser =>
            followedUser.followers.includes(req.user._id)
        );

        res.json(mutuals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
