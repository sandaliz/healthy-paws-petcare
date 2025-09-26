import express from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestionsByUser,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from "../Controllers/quesionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new question (requires authentication)
router.post("/", protect, createQuestion);

// Get all questions (requires authentication)
router.get("/",  getAllQuestions);

// Get questions by user ID (requires authentication)
router.get("/user/:userId",  getQuestionsByUser);

// Get my questions (requires authentication)
router.get("/my", protect, (req, res) => {
  req.params.userId = req.user.id;
  return getQuestionsByUser(req, res);
});

// Get question by ID (requires authentication)
router.get("/:id", protect, getQuestionById);

// Update question (requires authentication)
router.put("/:id",  updateQuestion);

// Delete question (requires authentication)
router.delete("/:id", protect, deleteQuestion);

export default router;