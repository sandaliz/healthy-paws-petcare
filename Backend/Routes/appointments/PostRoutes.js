const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const PostController = require('../../Controllers/Post/PostController');

// Define the directory for image uploads
const uploadDir = 'uploads';

// Configure multer for file storage
const storage = multer.diskStorage({
  // Set the destination folder for uploaded images
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  // Set the filename
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Create the multer middleware instance
const upload = multer({ storage: storage });


// Middleware 'upload.single('image')' handles the file upload
router.post('/', upload.single('imagePath'), PostController.createPost);

// GET all posts
router.get('/', PostController.getPosts);

// GET a single post by its ID
router.get('/:id', PostController.getPost);

// GET all posts by a specific user ID
router.get('/user/:userId', PostController.getPostsByUserId);

// DELETE a post by its ID
router.delete('/:id', PostController.deletePost);

// Update a post by its ID
router.patch('/:id', upload.single('image'), PostController.updatePost);

module.exports = router;
