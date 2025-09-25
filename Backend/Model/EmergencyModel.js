// models/EmergencyModel.js
import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CareCustomer", // Link to pet/appointment record
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Staff or system
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Owner user record
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
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Emergency = mongoose.model("Emergency", emergencySchema);
export default Emergency;
