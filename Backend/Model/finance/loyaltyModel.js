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
  if (points >= 1000) return "Guardian Woof";    
  if (points >= 500) return "Kitty Champ";      
  return "Puppy Pal";                            
};

loyaltySchema.methods.addPoints = async function (amountSpent) {
  // 1 point per Rs.500 spent (rounded down to nearest 500)
  const pointsEarned = Math.floor(amountSpent / 500);

  if (pointsEarned > 0) {
    this.points += pointsEarned;
    const oldTier = this.tier;
    const newTier = getTierFromPoints(this.points);
    this.tier = newTier;

    await this.save();

    // Reward: issue tier-up coupon when tier changes
    if (newTier !== oldTier) {
      const rewardConfig = {
        "Kitty Champ": { value: 500, description: "Enjoy LKR 500 off for hitting Kitty Champ!" },
        "Guardian Woof": { value: 1500, description: "Woof yeah! LKR 1500 off for Guardian Woof." },
        "Legendary Lion": { value: 3000, description: "Roar! Legendary Lion earns LKR 3000 off." },
      };

      const reward = rewardConfig[newTier];
      if (reward) {
        await Coupon.create({
          code: `${newTier.replace(/\s+/g, "-").toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          description: reward.description,
          discountType: "Fixed",
          discountValue: reward.value,
          scope: "ISSUED",
          ownerUserID: this.userID,
          expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          usageLimit: 1,
          status: "Available",
          minInvoiceAmount: 0,
        });
      }
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