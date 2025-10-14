import mongoose from "mongoose";

const vaccineRuleSchema = new mongoose.Schema({
  breed: { type: String, required: true, unique: true },
  species: { type: String, required: true },
  size: { type: String },
  coreVaccines: [{ type: String }],
  recommendedNonCore: [{ type: String }],
  specialNotes: { type: String },
  schedule: [
    {
      week: { type: Number, required: true },
      vaccines: [{ type: String, required: true }],
    },
  ],
});

export default mongoose.model("VaccineRule", vaccineRuleSchema);
