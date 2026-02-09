const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getMutuals } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/', protect, getMessages);
router.get('/mutuals', protect, getMutuals);

module.exports = router;
