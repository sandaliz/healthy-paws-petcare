// feedbackController.js (corrected)
import Feedback from "../Model/Feedback.js";
import transporter from "../config/nodemailer.js"; // Import the transporter

// @desc    Create new feedback
export const createFeedback = async (req, res) => {
  try {
    const { petOwnerName, petName, email, message, rating } = req.body;

    const feedback = await Feedback.create({ petOwnerName, petName, email, message, rating });

    // Send confirmation email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Thank you for your feedback! 🐾 - Healthy Paws",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #54413C;">Thank you for your feedback, ${petOwnerName}! 🐾</h2>
          <p>We truly appreciate you taking the time to share your experience with Healthy Paws.</p>
          
          <div style="background-color: #FFD58E; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #54413C; margin: 0;">Feedback Details:</h3>
            <p style="margin: 10px 0;"><strong>Pet's Name:</strong> ${petName}</p>
            <p style="margin: 10px 0;"><strong>Rating:</strong> ${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}/5)</p>
            <p style="margin: 10px 0;"><strong>Your Message:</strong> ${message}</p>
          </div>
          
          <p>Your feedback helps us improve our services for you and ${petName}!</p>
          <p>Best regards,<br>The Healthy Paws Team</p>
        </div>
      `,
    };

    // Send email with better error handling
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Confirmation email sent to: ${email}`);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      // Don't fail the request if email fails, just log it
    }

    res.status(201).json({ 
      success: true, 
      data: feedback,
      message: "Feedback submitted successfully!" 
    });
    
  } catch (error) {
    console.error("❌ Error creating feedback:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error: " + error.message 
    });
  }
};

// Keep all your other controller functions the same...
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