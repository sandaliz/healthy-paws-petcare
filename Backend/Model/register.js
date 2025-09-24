// Model/Register.js
import mongoose from "mongoose";

const registerSchema = new mongoose.Schema(
  {
    RegisterId: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    OwnerName: { type: String, required: true, trim: true },
    OwnerEmail: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
      index: true,
    },
    OwnerPhone: { type: String, required: true, trim: true },
    EmergencyContact: { type: String, required: true, trim: true },
    OwnerAddress: { type: String, required: true, trim: true },
    PetName: { type: String, required: true, trim: true },
    PetSpecies: { type: String, enum: ["cat", "dog"], required: true },
    PetBreed: { type: String, required: true },
    PetAge: { type: Number, required: true },
    PetWeight: { type: Number, required: true },

    // ✅ Updated with all 8 blood groups
    BloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },

    PetGender: { type: String, enum: ["Male", "Female"], required: true },
    SpecialNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("register", registerSchema);