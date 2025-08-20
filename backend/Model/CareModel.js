const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const careSchema = new Schema({
    
    // Pet Owner Information
    ownerName: {
        type: String, //dataType
        required: true, //validate
    },
    contactNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    alternateContact: {
        type: String,
    },

    // Pet Information
    petName: {
        type: String,
        required: true,
    },
    species: {
        type: String,
        enum: ["dog", "cat"],
        required: true,
    },
    breed: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ["male", "female"],
    },

    // Health & Safety Details
    healthDetails: {
        type: String,
    },

    // Booking Details
    nightsStay: {
        type: Number,
        required: true,
    },
    dropOffTime: {
        type: String,
        required: true,
    },
    pickUpTime: {
        type: String,
        required: true,
    },

    // Feeding Instructions
    foodType: {
        type: String,
        enum: ["owner-provided", "hospital-provided"],
    },
    feedingTimes: {
        type: String,
    },

    // Additional Services
    grooming: {
        type: Boolean,
        default: false,
    },
    walking: {
        type: Boolean,
        default: false,
    },

    // Emergency Instructions
    emergencyAction: {
        type: String,
        enum: ["contact-owner", "authorize-treatment"],
        required: true,
    },

    // Agreement
    agree: {
        type: Boolean,
        required: true,
    }
});

module.exports = mongoose.model(
    "CareModel", //file name
    careSchema //function name
)