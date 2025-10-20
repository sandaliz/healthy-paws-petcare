import mongoose from "mongoose";
import Coupon from "../../Model/finance/couponModel.js";
import Loyalty from "../../Model/finance/loyaltyModel.js";

const TIER_ORDER = ["Puppy Pal", "Kitty Champ", "Guardian Woof", "Legendary Lion"];
const tierRank = TIER_ORDER.reduce((acc, tier, idx) => ({ ...acc, [tier]: idx }), {});

export const createCoupon = async (req, res) => {
  try {
    let {
      code,
      discountType,
      discountValue,
      minInvoiceAmount,
      usageLimit,
      expiryDate,
      description,
      minTier,
    } = req.body;
    code = String(code || "").trim().toUpperCase();
    if (!code || !discountType || discountValue == null || !expiryDate) {
      return res.status(400).json({ message: "Code, discount type, discount value and expiry date are required" });
    }

    const normalizedTier = TIER_ORDER.includes(minTier) ? minTier : "Puppy Pal";

    const payload = {
      code,
      discountType,
      discountValue: Number(discountValue) || 0,
      minInvoiceAmount: Number(minInvoiceAmount) || 0,
      usageLimit: Number(usageLimit) || 0,
      expiryDate,
      description,
      scope: "GLOBAL",
      minTier: normalizedTier,
    };

    const coupon = new Coupon({
      ...payload,
    });
    await coupon.save();
    res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    console.error("createCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const { scope, userId } = req.query;
    const filter = {};
    if (scope && scope !== "ALL") filter.scope = scope;
    if (userId) filter.ownerUserID = userId;
    const coupons = await Coupon.find(filter)
      .sort({ createdAt: -1 })
      .populate("ownerUserID", "name email"); // only bring back name+email
    res.json({ coupons });
  } catch (err) {
    console.error("getCoupons error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.code) body.code = String(body.code).trim().toUpperCase();
    if (body.discountValue != null) body.discountValue = Number(body.discountValue) || 0;
    if (body.minInvoiceAmount != null) body.minInvoiceAmount = Number(body.minInvoiceAmount) || 0;
    if (body.usageLimit != null) body.usageLimit = Number(body.usageLimit) || 0;
    if (body.minTier && !TIER_ORDER.includes(body.minTier)) {
      body.minTier = "Puppy Pal";
    }
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon updated", coupon });
  } catch (err) {
    console.error("updateCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    console.error("deleteCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    let { code, invoiceTotal } = req.body;
    if (!code || invoiceTotal == null) {
      return res.status(400).json({ message: "code and invoiceTotal are required" });
    }
    code = String(code).trim().toUpperCase();
    const coupon = await Coupon.findOne({ code, scope: "GLOBAL" });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    if (!coupon.canApply(Number(invoiceTotal))) {
      return res.status(400).json({ message: "Coupon not applicable" });
    }
    const discount =
      coupon.discountType === "Percentage"
        ? +(Number(invoiceTotal) * (coupon.discountValue / 100)).toFixed(2)
        : Math.min(Number(invoiceTotal), coupon.discountValue);
    res.json({ couponId: coupon._id, discount, info: coupon });
  } catch (err) {
    console.error("validateCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const claimCoupon = async (req, res) => {
  try {
    let { userID, code, templateId } = req.body;
    if (!userID || (!code && !templateId)) {
      return res.status(400).json({ message: "userID and code/templateId are required" });
    }
    const userObjectId = new mongoose.Types.ObjectId(String(userID));
    if (code) code = String(code).trim().toUpperCase();
    const template = templateId
      ? await Coupon.findById(templateId)
      : await Coupon.findOne({ code, scope: "GLOBAL" });
    if (!template) return res.status(404).json({ message: "Template coupon not found" });
    const now = new Date();
    if (now > template.expiryDate) {
      return res.status(400).json({ message: "Coupon cannot be claimed (expired)" });
    }
    if (template.usageLimit > 0 && template.usedCount >= template.usageLimit) {
      return res.status(400).json({ message: "Coupon cannot be claimed (exhausted)" });
    }
    const loyalty = await Loyalty.findOne({ userID: userObjectId });
    const userTier = loyalty?.tier || "Puppy Pal";
    const requiredTier = template.minTier || "Puppy Pal";
    const userTierRank = tierRank[userTier] ?? 0;
    const requiredRank = tierRank[requiredTier] ?? 0;
    if (userTierRank < requiredRank) {
      return res.status(403).json({
        message: `This coupon unlocks at ${requiredTier}. Keep earning PawPoints!`,
      });
    }
    const existing = await Coupon.findOne({
      scope: "ISSUED",
      ownerUserID: userObjectId,
      parentId: template._id,
    });
    if (existing) {
      return res.status(200).json({
        message: "Already claimed",
        alreadyClaimed: true,
        coupon: existing,
      });
    }
    const issued = await Coupon.issueToUser({ templateId: template._id, userID: userObjectId });
    return res.status(201).json({
      message: "Coupon claimed",
      alreadyClaimed: false,
      coupon: issued,
    });
  } catch (err) {
    console.error("claimCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserAvailableCoupons = async (req, res) => {
  try {
    const { userId, invoiceTotal, mode } = req.query;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const ownerId = mongoose.isValidObjectId(userId)
      ? new mongoose.Types.ObjectId(String(userId))
      : userId;

    const includeWalletView = String(mode || "").toLowerCase() === "wallet";

    const baseQuery = {
      scope: "ISSUED",
      ownerUserID: ownerId,
    };

    if (!includeWalletView) baseQuery.status = "Available";

    const rows = await Coupon.find(baseQuery).sort({ createdAt: -1 }).lean();

    const now = new Date();
    const invoiceTotalRaw =
      invoiceTotal == null || invoiceTotal === ""
        ? null
        : Number(invoiceTotal);
    const invoiceTotalNumber = Number.isFinite(invoiceTotalRaw) ? invoiceTotalRaw : null;

    const processed = rows.map((c) => {
      const expiresAt = c.expiryDate ? new Date(c.expiryDate) : null;
      const expired = expiresAt ? expiresAt < now : false;
      const baseStatus = c.status || "Available";
      const derivedStatus =
        expired && baseStatus !== "Used" && baseStatus !== "Revoked"
          ? "Expired"
          : baseStatus;

      const minAmount = Number(c.minInvoiceAmount || 0);
      const meetsInvoiceRequirement =
        invoiceTotalNumber == null ? null : invoiceTotalNumber >= minAmount;

      const readyToUse = !expired && baseStatus === "Available";
      const canApplyNow =
        readyToUse && (meetsInvoiceRequirement == null ? true : meetsInvoiceRequirement);

      let blockedReason = null;
      if (derivedStatus === "Expired") blockedReason = "Expired";
      else if (derivedStatus === "Revoked") blockedReason = "Revoked";
      else if (derivedStatus === "Used") blockedReason = "Used";
      else if (readyToUse && meetsInvoiceRequirement === false) blockedReason = "Invoice minimum not met";

      return {
        couponId: c._id,
        parentTemplateId: c.parentId || null,
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minInvoiceAmount: minAmount,
        minTier: c.minTier || "Puppy Pal",
        expiryDate: c.expiryDate,
        description: c.description || "",
        scope: c.scope,
        status: baseStatus,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        usedAt: c.usedAt || null,
        derivedStatus,
        expired,
        readyToUse,
        meetsInvoiceRequirement,
        canApplyNow,
        blockedReason,
      };
    });

    const coupons = includeWalletView
      ? processed
      : processed.filter((c) => c.canApplyNow);

    res.json({ coupons });
  } catch (err) {
    console.error("getUserAvailableCoupons error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const validateUserCoupon = async (req, res) => {
  try {
    const { couponId, code, userID, invoiceTotal } = req.body;
    if ((!couponId && !code) || !userID || invoiceTotal == null) {
      return res.status(400).json({ message: "couponId/code, userID and invoiceTotal required" });
    }

    const ownerObjId = mongoose.isValidObjectId(userID) ? new mongoose.Types.ObjectId(userID) : userID;

    // Pick query condition
    const condition = couponId
      ? { _id: couponId }
      : { code: String(code).trim().toUpperCase() };

    let c = await Coupon.findOne({
      scope: "ISSUED",
      ownerUserID: ownerObjId,
      status: "Available",
      ...(couponId
        ? { _id: couponId }
        : { code: String(code).trim().toUpperCase() }),
    });

    // If not found by direct code, try resolving parent template
    if (!c && code) {
      const template = await Coupon.findOne({ code: String(code).trim().toUpperCase(), scope: "GLOBAL" });
      if (template) {
        c = await Coupon.findOne({
          scope: "ISSUED",
          ownerUserID: ownerObjId,
          parentId: template._id,
          status: "Available",
        });
      }
    }

    if (!c) return res.status(404).json({ message: "Coupon not available" });

    if (!c.canApply(Number(invoiceTotal))) {
      return res.status(400).json({ message: "Coupon not applicable" });
    }

    const discount =
      c.discountType === "Percentage"
        ? +(Number(invoiceTotal) * (c.discountValue / 100)).toFixed(2)
        : Math.min(Number(invoiceTotal), c.discountValue);

    res.json({ couponId: c._id, discount });
  } catch (err) {
    console.error("validateUserCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
