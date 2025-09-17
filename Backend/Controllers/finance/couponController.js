const Coupon = require("../../Model/finance/couponModel");

const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minInvoiceAmount, usageLimit, expiryDate, description } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
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
    });

    await coupon.save();
    res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    console.error("createCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json({ coupons });
  } catch (err) {
    console.error("getCoupons error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon updated", coupon });
  } catch (err) {
    console.error("updateCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    console.error("deleteCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// validate coupon and compute discount
const validateCoupon = async (req, res) => {
  try {
    const { code, invoiceTotal } = req.body;
    if (!code || invoiceTotal == null) {
      return res.status(400).json({ message: "code and invoiceTotal are required" });
    }

    const coupon = await Coupon.findOne({ code });
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

module.exports = { createCoupon, getCoupons, updateCoupon, deleteCoupon, validateCoupon };