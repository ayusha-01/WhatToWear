const express = require('express');
const router = express.Router();
const { createPost, getFeed, likePost, savePost, deletePost, getPost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('image'), createPost);
router.get('/', getFeed);
router.get('/:id', getPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.put('/:id/save', protect, savePost);

module.exports = router;
