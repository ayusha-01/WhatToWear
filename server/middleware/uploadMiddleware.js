const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    // We'll use memory storage or temporary disk storage before uploading to Cloudinary
    // For simplicity with Cloudinary, keeping it in memory or temp is fine.
    // Using diskStorage to keep it simple for local dev if needed, but here we plan to stream or upload directly.
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|webp|gif|bmp|tiff/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        console.log('File upload failed. Type:', file.mimetype, 'Ext:', path.extname(file.originalname));
        cb('Error: Images only! Allowed: jpeg, jpg, png, webp, gif');
    }
}

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
