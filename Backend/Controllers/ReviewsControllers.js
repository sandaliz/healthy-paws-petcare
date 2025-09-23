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
    const reviews = await Reviews.find();
    return res.status(200).json({ reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add new review
export const addReview = async (req, res) => {
  const { ownerName, petName, grooming, walking, species, rating, comment } =
    req.body;

  try {
    const sentiment = calculateSentiment(Number(rating));

    const review = new Reviews({
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
    const review = await Reviews.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.status(200).json({ review });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update review
export const updateReview = async (req, res) => {
  const id = req.params.id;
  const { ownerName, petName, grooming, walking, species, rating, comment } =
    req.body;

  try {
    const sentiment = calculateSentiment(Number(rating));

    const review = await Reviews.findByIdAndUpdate(
      id,
      {
        ownerName,
        petName,
        grooming,
        walking,
        species,
        rating,
        sentiment,
        comment,
      },
      { new: true }
    );

    if (!review)
      return res.status(404).json({ message: "Unable to update review" });
    return res.status(200).json({ review });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  const id = req.params.id;
  try {
    const review = await Reviews.findByIdAndDelete(id);
    if (!review)
      return res.status(404).json({ message: "Unable to delete review" });
    return res.status(200).json({ review });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};