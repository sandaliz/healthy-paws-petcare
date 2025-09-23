// Routes/ReviewsRoutes.js (ESM version)
import express from "express";
import * as ReviewsController from "../Controllers/ReviewsControllers.js";

const router = express.Router();

router.get("/", ReviewsController.getAllReviews);
router.post("/", ReviewsController.addReview);
router.get("/:id", ReviewsController.getReviewById);
router.put("/:id", ReviewsController.updateReview);
router.delete("/:id", ReviewsController.deleteReview);

export default router;