import express from "express";
import * as ReviewsController from "../Controllers/ReviewsControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", ReviewsController.getAllReviews);
router.post("/", protect, ReviewsController.addReview); // only logged-in users can post
router.get("/:id", ReviewsController.getReviewById);
router.put("/:id", protect, ReviewsController.updateReview); // only owner can update
router.delete("/:id", protect, ReviewsController.deleteReview); // only owner can delete

export default router;
