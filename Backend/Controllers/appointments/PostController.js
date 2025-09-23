const Post = require('../../Models/Post/PostSchema');
const mongoose = require('mongoose');
const fs = require('fs');

// Controller function to create a new blog post
const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }
    const imagePath = req.file.path;
    const { userId, userName, title, content} = req.body;
    const newPost = new Post({
    userId,
    userName,
      imagePath,
      title,
      content,
    });
    await newPost.save();

    res.status(201).json({ message: 'Post created successfully!', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get all blog posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//get a single post by post id
const getPost = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such post' });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'No such post' });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//get all posts by user id
const getPostsByUserId = async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({ error: 'No such user' });
  }
  try {
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts by user ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//delete a post by post id
const deletePost = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such post' });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'No such post' });
    }

    // Delete the image file from the server's disk
    if (post.imagePath && fs.existsSync(post.imagePath)) {
        fs.unlinkSync(post.imagePath);
    }
    const deletedPost = await Post.findByIdAndDelete(id);
    res.status(200).json({ message: 'Post deleted successfully!', post: deletedPost });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//update a blog post by post id
const updatePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such post' });
  }
  
  try {
    let updatedData = { ...req.body };
    if (req.file) {
      const oldPost = await Post.findById(id);
      if (oldPost && oldPost.imagePath && fs.existsSync(oldPost.imagePath)) {
        // Delete the old image file from the server's disk
        fs.unlinkSync(oldPost.imagePath);
      }
      updatedData.imagePath = req.file.path;
    }
    const updatedPost = await Post.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ error: 'No such post' });
    }
    res.status(200).json({ message: 'Post updated successfully!', post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  deletePost,
  updatePost,
  getPostsByUserId
};
