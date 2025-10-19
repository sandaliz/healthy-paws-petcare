// CareModel.js (ESM version)
import mongoose from "mongoose";

const { Schema } = mongoose;

const careSchema = new Schema(
  {
    appointmentID: {
      type: String,
      unique: true,
    },

    // Foreign key reference to logged-in User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    // Pet Owner Information
    ownerName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
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

    // Health & Safety Details
    healthDetails: {
      type: String,
    },

    // Booking Details
    dateStay: {
      type: Date,
      required: true,
    },
    pickUpDate: {
      type: Date,
      required: true,
    },
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

    // Status
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Checked-In",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    // Agreement
    agree: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

// Generate custom appointment ID
careSchema.pre("save", function (next) {
  if (!this.appointmentID) {
    this.appointmentID =
      "APP" +
      Date.now() +
      Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const CareCustomer = mongoose.model("CareCustomer", careSchema);

export default CareCustomer;
