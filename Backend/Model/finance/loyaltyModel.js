import mongoose from "mongoose";
import Coupon from "./couponModel.js"; // careful adjust path

const loyaltySchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
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

loyaltySchema.methods.addPoints = async function (amountSpent) {
  const pointsEarned = Math.round(amountSpent / 1);
  this.points += pointsEarned;
  const oldTier = this.tier;
  const newTier = getTierFromPoints(this.points);
  this.tier = newTier;

  await this.save();

  // Reward user if they tier-up
  if (newTier !== oldTier) {
    // Example: issue a fixed discount coupon for tier-up
    await Coupon.create({
      code: `${newTier}-BONUS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      description: `Congrats on reaching ${newTier}! 🎉 Enjoy your reward.`,
      discountType: "Fixed",
      discountValue: newTier === "Silver" ? 500 : newTier === "Gold" ? 1500 : 3000,
      scope: "ISSUED",
      ownerUserID: this.userID,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // valid 2 months
      status: "Available"
    });
  }

  return this;
};

loyaltySchema.methods.updateTier = function (newTier) {
  if (["Bronze", "Silver", "Gold", "Platinum"].includes(newTier)) {
    this.tier = newTier;
  }
  return this.save();
};

export default mongoose.model("Loyalty", loyaltySchema);
