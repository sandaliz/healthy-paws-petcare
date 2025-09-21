import express from "express";
const router = express.Router();
import {
  createFeedback,
  getFeedbacks,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getAverageRating,
  getFeedbacksByEmail,
  getFeedbackReport,   // ✅ NEW
} from "../Controllers/feedbackController.js";
import { feedbackValidationRules, validate } from "../middleware/validation.js";

router.post("/", feedbackValidationRules(), validate, createFeedback);
router.get("/", getFeedbacks);
router.get("/stats/average-rating", getAverageRating);
router.get("/report", getFeedbackReport);  // ✅ New report route
router.get("/user/:email", getFeedbacksByEmail);
router.get("/:id", getFeedback);

router.put("/:id", feedbackValidationRules(), validate, updateFeedback);
router.delete("/:id", deleteFeedback);

export default router;