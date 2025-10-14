import mongoose from "mongoose";

const vaccineSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  vaccines: [{ type: String, required: true }],
  dueDate: { type: Date, required: true },
});

const vaccinePlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petName: { type: String, required: true },
    breed: { type: String, required: true },
    species: {
      type: String,
      enum: ["dog", "cat"],
      required: true,
    },
    size: { type: String, default: "medium" },
    birthDate: { type: Date, required: true },
    sendToEmail: { type: String, required: true },
    coreVaccines: [{ type: String }],
    recommendedNonCore: [{ type: String }],
    specialNotes: { type: String },
    schedule: [vaccineSchema],
  },
  { timestamps: true }
);

export default mongoose.model("VaccinePlan", vaccinePlanSchema);
