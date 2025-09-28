import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CareCustomer",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CareCustomer",
      required: true,
    },
    actionTaken: {
      type: String, // "contact-owner" | "authorize-treatment"
      required: true,
    },
    type: {
      type: String,
      enum: ["ILLNESS", "ACCIDENT", "ALLERGY", "OTHER"],
      default: "OTHER",
    },
    description: {
      type: String,
      required: true,
    },
    contactStatus: {
      type: String,
      enum: ["PENDING", "CONTACTED", "FAILED"],
      default: "PENDING",
    },
    treatmentGiven: {
      type: String,
      default: "",
    },
    emailStatus: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
    emailDebug: {
      type: mongoose.Schema.Types.Mixed, // full email info for debugging
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Emergency = mongoose.model("Emergency", emergencySchema);
export default Emergency;
