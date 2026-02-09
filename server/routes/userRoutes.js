const express = require('express');
const router = express.Router();
const { getUserProfile, followUser, unfollowUser, getSavedPosts, getMe, updateProfile, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePic'), updateProfile);
router.get('/saved', protect, getSavedPosts);
router.get('/search', protect, searchUsers);
router.get('/:username', getUserProfile);
router.put('/:id/follow', protect, followUser);
router.put('/:id/unfollow', protect, unfollowUser);

module.exports = router;
