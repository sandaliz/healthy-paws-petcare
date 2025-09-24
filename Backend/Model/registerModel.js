// models/registerModel.js
import mongoose from "mongoose";

const registerSchema = new mongoose.Schema(
  {
    RegisterId: { type: String, required: true, unique: true },
    OwnerName: { type: String, required: true },
    OwnerEmail: { type: String, required: true, unique: true },
    OwnerPhone: { type: String },
    EmergencyContact: { type: String },
    OwnerAddress: { type: String },

    // Pet info
    PetName: { type: String, required: true },
    PetSpecies: { type: String, required: true, enum: ["dog", "cat", "other"] },
    PetBreed: { type: String },
    PetAge: { type: Number },
    PetWeight: { type: Number },
    BloodGroup: { type: String },
    PetGender: { type: String, enum: ["Male", "Female"] },
    SpecialNotes: { type: String }
  },
  { 
    timestamps: true, 
    collection: "registers"   
  }
);

export default mongoose.model("Register", registerSchema);
