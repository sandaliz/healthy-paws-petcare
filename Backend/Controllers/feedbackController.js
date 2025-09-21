import Feedback from "../Model/Feedback.js";
import nodemailer from "nodemailer";

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// @desc    Create new feedback
export const createFeedback = async (req, res) => {
  try {
    const { petOwnerName, petName, email, message, rating } = req.body;

    const feedback = await Feedback.create({ petOwnerName, petName, email, message, rating });

    // Send confirmation email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Thank you for your feedback!",
      html: `
        <h2>Thank you for your feedback, ${petOwnerName}!</h2>
        <p>We appreciate you sharing about ${petName}.</p>
        <p>Your rating: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}</p>
        <p>Your message: ${message}</p>
      `,
    };

    try { await transporter.sendMail(mailOptions); } catch (err) { console.error("Mail failed:", err); }

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all feedbacks
export const getFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Feedback.countDocuments({});

    res.status(200).json({ success: true, count: feedbacks.length, total, page, pages: Math.ceil(total / limit), data: feedbacks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get single feedback
export const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: "Feedback not found" });
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update feedback
export const updateFeedback = async (req, res) => {
  try {
    const { petOwnerName, petName, email, message, rating } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { petOwnerName, petName, email, message, rating },
      { new: true, runValidators: true }
    );
    if (!feedback) return res.status(404).json({ success: false, message: "Feedback not found" });
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: "Feedback not found" });
    res.status(200).json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get average rating and stats (good/bad summary)
export const getAverageRating = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalFeedbacks: { $sum: 1 },
          goodRatings: { $sum: { $cond: [{ $gte: ["$rating", 3] }, 1, 0] } },
          badRatings: { $sum: { $cond: [{ $lt: ["$rating", 3] }, 1, 0] } },
          ratingDistribution: { $push: "$rating" },
        },
      },
    ]);

    if (!stats.length) {
      return res.status(200).json({ success: true, data: { averageRating: 0, totalFeedbacks: 0, goodRatings: 0, badRatings: 0, distribution: { 1:0,2:0,3:0,4:0,5:0 } }});
    }

    const dist = { 1:0,2:0,3:0,4:0,5:0 };
    stats[0].ratingDistribution.forEach(r => { dist[r]++; });

    res.status(200).json({
      success: true,
      data: {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalFeedbacks: stats[0].totalFeedbacks,
        goodRatings: stats[0].goodRatings,
        badRatings: stats[0].badRatings,
        distribution: dist,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Report: list good/bad separately
export const getFeedbackReport = async (req, res) => {
  try {
    const good = await Feedback.find({ rating: { $gte: 3 } }).sort({ createdAt: -1 });
    const bad = await Feedback.find({ rating: { $lt: 3 } }).sort({ createdAt: -1 });
    const total = await Feedback.countDocuments({});

    res.status(200).json({
      success: true,
      counts: { total, good: good.length, bad: bad.length },
      feedbacks: { good, bad },
    });
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get feedbacks by user email
export const getFeedbacksByEmail = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find({ email: req.params.email }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Feedback.countDocuments({ email: req.params.email });

    res.status(200).json({ success: true, count: feedbacks.length, total, page, pages: Math.ceil(total / limit), data: feedbacks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};