const express = require("express");
const router = express.Router();

// Insert Controller
const ReviewsController = require("../Controllers/ReviewsControllers");

router.get("/", ReviewsController.getAllReviews);
router.post("/", ReviewsController.addReview);
router.get("/:id", ReviewsController.getReviewById);
router.put("/:id", ReviewsController.updateReview);
router.delete("/:id", ReviewsController.deleteReview);

module.exports = router;
