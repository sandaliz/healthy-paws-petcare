// Controllers/ReviewsControllers.js (ESM)
import Reviews from "../Model/ReviewsModel.js";

// Helper function to calculate sentiment from rating
const calculateSentiment = (rating) => {
  if (rating <= 2) return "bad";
  if (rating === 3) return "neutral";
  return "good"; // 4–5
};

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    // Use lean() for plain JS objects
    const reviews = await Reviews.find().lean();

    // Ensure owner is always a string (or null if missing)
    const safeReviews = reviews.map((r) => ({
      ...r,
      owner: r.owner ? r.owner.toString() : null,
    }));

    return res.status(200).json({ reviews: safeReviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add new review
export const addReview = async (req, res) => {
  const { ownerName, petName, grooming, walking, species, rating, comment } = req.body;

  try {
    const sentiment = calculateSentiment(Number(rating));

    const review = new Reviews({
      owner: req.user.id, // <-- set owner from logged-in user
      ownerName,
      petName,
      grooming,
      walking,
      species,
      rating,
      sentiment,
      comment,
    });

    await review.save();
    return res.status(201).json({ review });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add review" });
  }
};


// Get review by ID
export const getReviewById = async (req, res) => {
  const id = req.params.id;
  try {
    const review = await Reviews.findById(id).lean();

    if (!review) return res.status(404).json({ message: "Review not found" });

    // Ensure owner is always a string (or null)
    const safeReview = {
      ...review,
      owner: review.owner ? review.owner.toString() : null,
    };

    return res.status(200).json({ review: safeReview });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update review
export const updateReview = async (req, res) => {
  const id = req.params.id;
  const { ownerName, petName, grooming, walking, species, rating, comment } = req.body;

  try {
    const review = await Reviews.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Check if logged-in user is the owner
    if (review.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    const sentiment = calculateSentiment(Number(rating));

    review.ownerName = ownerName;
    review.petName = petName;
    review.grooming = grooming;
    review.walking = walking;
    review.species = species;
    review.rating = rating;
    review.sentiment = sentiment;
    review.comment = comment;

    const updatedReview = await review.save();
    return res.status(200).json({ review: updatedReview });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


// Delete review
export const deleteReview = async (req, res) => {
  const id = req.params.id;
  try {
    const review = await Reviews.findById(id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only allow deletion if owner exists and matches current user
    if (!review.owner || review.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    // Use findByIdAndDelete to safely remove
    await Reviews.findByIdAndDelete(id);

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
