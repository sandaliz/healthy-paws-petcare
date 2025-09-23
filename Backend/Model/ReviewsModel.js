// Model/ReviewsModel.js (ESM)
import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    ownerName: { type: String, required: true },
    petName: { type: String, required: true },
    grooming: { type: Boolean, default: false },
    walking: { type: Boolean, default: false },
    species: { type: String, enum: ["dog", "cat"], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    sentiment: { type: String, enum: ["good", "neutral", "bad"] },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Reviews = mongoose.model("ReviewsModel", reviewSchema);

export default Reviews;