const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    ownerName: {
        type: String,
        required: true,
    },
    petName: {
        type: String,
        required: true,
    },
    grooming: {
        type: Boolean,
        default: false,
    },
    walking: {
        type: Boolean,
        default: false,
    },
    species: {
        type: String,
        enum: ["dog", "cat"],
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,   //  1–5 rating system
    },
    
    sentiment: {
        type: String,
        enum: ["good", "bad", "neutral"], // optional classification
        default: "neutral",
    },
    comment: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model(
    "ReviewsModel",
    reviewSchema
);
