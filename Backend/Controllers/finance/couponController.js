import Coupon from "../../Model/finance/couponModel.js";

export const createCoupon = async (req, res) => {
  try {
    let { code, discountType, discountValue, minInvoiceAmount, usageLimit, expiryDate, description } = req.body;
    code = String(code || "").trim().toUpperCase();

    if (!code || !discountType || discountValue == null || !expiryDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const coupon = new Coupon({
      code,
      discountType,
      discountValue,
      minInvoiceAmount,
      usageLimit,
      expiryDate,
      description,
      scope: "GLOBAL",
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

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
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
    if (!coupon) return res.status(404).json({ message: "Invalid coupon" });

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

    if (code) code = String(code).trim().toUpperCase();

    const template = templateId
      ? await Coupon.findById(templateId)
      : await Coupon.findOne({ code, scope: "GLOBAL" });

    if (!template) return res.status(404).json({ message: "Template coupon not found" });

    const now = new Date();
    const notExpired = now <= template.expiryDate;
    const withinLimit = template.usageLimit === 0 || template.usedCount < template.usageLimit;
    if (!notExpired || !withinLimit) {
      return res.status(400).json({ message: "Coupon cannot be claimed (expired/exhausted)" });
    }

    const existing = await Coupon.findOne({
      scope: "ISSUED",
      ownerUserID: userID,
      parentId: template._id,
      status: { $in: ["Available"] },
    });
    if (existing) {
      return res.status(200).json({ message: "Already claimed", alreadyClaimed: true, coupon: existing });
    }

    const issued = await Coupon.issueToUser({ templateId: template._id, userID });
    res.status(201).json({ message: "Coupon claimed", coupon: issued });
  } catch (err) {
    console.error("claimCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserAvailableCoupons = async (req, res) => {
  try {
    const { userId, invoiceTotal } = req.query;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const rows = await Coupon.find({ scope: "ISSUED", ownerUserID: userId, status: "Available" }).lean();
    const now = new Date();

    const coupons = rows
      .filter(c => now <= new Date(c.expiryDate))
      .filter(c => (invoiceTotal == null ? true : Number(invoiceTotal) >= (c.minInvoiceAmount || 0)))
      .map(c => ({
        couponId: c._id,
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minInvoiceAmount: c.minInvoiceAmount || 0,
        expiryDate: c.expiryDate,
        description: c.description || "",
        scope: c.scope,
      }));

    res.json({ coupons });
  } catch (err) {
    console.error("getUserAvailableCoupons error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const validateUserCoupon = async (req, res) => {
  try {
    const { couponId, userID, invoiceTotal } = req.body;
    if (!couponId || !userID || invoiceTotal == null) {
      return res.status(400).json({ message: "couponId, userID and invoiceTotal required" });
    }

    const c = await Coupon.findOne({
      _id: couponId,
      scope: "ISSUED",
      ownerUserID: userID,
      status: "Available",
    });
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
