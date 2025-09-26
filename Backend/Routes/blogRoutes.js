import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../Controllers/blogController.js";

const router = express.Router();

router.post("/", createBlog); // Create blog
router.get("/", getAllBlogs); // Get all published blogs
router.get("/:id", getBlogById); // Get single blog by ID
router.put("/:id", updateBlog); // Update blog
router.delete("/:id", deleteBlog); // Delete blog

export default router;
