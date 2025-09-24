// models/loyaltyModel.js
import mongoose from "mongoose";

const loyaltySchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true, unique: true },
    points: { type: Number, default: 0, min: 0 },
    tier: { type: String, enum: ["Bronze", "Silver", "Gold", "Platinum"], default: "Bronze" },
  },
  { timestamps: true }
);

const getTierFromPoints = (points) => {
  if (points >= 2000) return "Platinum";
  if (points >= 1000) return "Gold";
  if (points >= 500) return "Silver";
  return "Bronze";
};

loyaltySchema.methods.addPoints = async function(amountSpent) {
  const pointsEarned = Math.floor(amountSpent / 100);
  this.points += pointsEarned;
  this.tier = getTierFromPoints(this.points);
  return this.save();
};

loyaltySchema.methods.updateTier = function(newTier) {
  if (["Bronze", "Silver", "Gold", "Platinum"].includes(newTier)) {
    this.tier = newTier;
  }
  return this.save();
};

export default mongoose.model("Loyalty", loyaltySchema);
