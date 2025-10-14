import mongoose from "mongoose";
import Coupon from "./couponModel.js"; // adjust path

const loyaltySchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    points: { type: Number, default: 0, min: 0 },
    tier: { 
      type: String, 
      enum: ["Puppy Pal", "Kitty Champ", "Guardian Woof", "Legendary Lion"], 
      default: "Puppy Pal" 
    },
  },
  { timestamps: true }
);

// Custom tier calculator
const getTierFromPoints = (points) => {
  if (points >= 2000) return "Legendary Lion";   
  if (points >= 1000) return "Guardian Woof";    // 🦴
  if (points >= 500)  return "Kitty Champ";      // 😺
  return "Puppy Pal";                            // 🐶
};

loyaltySchema.methods.addPoints = async function (amountSpent) {
  // 1 point per Rs.4000
  const pointsEarned = Math.floor(amountSpent / 4000);  

  if (pointsEarned > 0) {
    this.points += pointsEarned;
    const oldTier = this.tier;
    const newTier = getTierFromPoints(this.points);
    this.tier = newTier;

    await this.save();

    // 🎁 Reward: issue tier-up coupon
    if (newTier !== oldTier) {
      await Coupon.create({
        code: `${newTier.replace(" ", "-").toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        description: `Congrats! You reached ${newTier} status in Healthy Paws 🐾`,
        discountType: "Fixed",
        discountValue: newTier === "Kitty Champ" ? 500 
                      : newTier === "Guardian Woof" ? 1500 
                      : 3000, // Legendary Lion reward
        scope: "ISSUED",
        ownerUserID: this.userID,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        status: "Available"
      });
    }
  }

  return this;
};

// Manual override
loyaltySchema.methods.updateTier = function (newTier) {
  const tiers = ["Puppy Pal", "Kitty Champ", "Guardian Woof", "Legendary Lion"];
  if (tiers.includes(newTier)) {
    this.tier = newTier;
  }
  return this.save();
};

export default mongoose.model("Loyalty", loyaltySchema);