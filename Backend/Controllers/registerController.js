// Controllers/registerController.js
import Register from "../Model/Register.js";
import nodemailer from "nodemailer";
import validator from "validator";

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", mailOptions.to);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
  }
};

// Email normalization helpers
const normalizeStrict = (email) =>
  validator.normalizeEmail(email, {
    all_lowercase: true,
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    gmail_convert_googlemaildotcom: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  }) || String(email || "").toLowerCase();

const normalizeLegacy = (email) =>
  validator.normalizeEmail(email, {
    all_lowercase: true,
    gmail_remove_dots: true,
    gmail_remove_subaddress: true,
    gmail_convert_googlemaildotcom: true,
    outlookdotcom_remove_subaddress: true,
    yahoo_remove_subaddress: true,
    icloud_remove_subaddress: true,
  });

// @desc Create new registration
// @route POST /api/register
// @access PROTECTED (should ideally require login)
export const createRegister = async (req, res) => {
  try {
    // ✅ Ensure userId is set
    const register = await Register.create({
      ...req.body,
      userId: req.user ? req.user._id : req.body.userId, // If using auth, req.user._id is set
    });

    // 📧 Confirmation email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: register.OwnerEmail,
      subject: `🐾 Pet Registration Confirmed for ${register.PetName}`,
      html: `
        <h2>Hello ${register.OwnerName},</h2>
        <p>Your pet <strong>${register.PetName}</strong> (${register.PetSpecies}) has been registered successfully. 🐶🐱</p>
        <p><strong>Breed:</strong> ${register.PetBreed}</p>
        <p><strong>Age:</strong> ${register.PetAge} years</p>
        <p><strong>Weight:</strong> ${register.PetWeight} kg</p>
        <p><strong>Blood Group:</strong> ${register.BloodGroup}</p>
        <p><strong>Special Notes:</strong> ${register.SpecialNotes || "None"}</p>
        <br>
        <p>We’ll ensure ${register.PetName} receives the best care possible at our hospital ❤️</p>
      `,
    };
    sendEmail(mailOptions);

    res.status(201).json({ success: true, data: register });
  } catch (error) {
    console.error("Server error in createRegister:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc Get all registrations
// @route GET /api/register
export const getRegisters = async (req, res) => {
  try {
    // ✅ populate userId
    const registers = await Register.find().populate("userId").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: registers.length, data: registers });
  } catch (error) {
    console.error("Server error in getRegisters:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc Get single registration
// @route GET /api/register/:id
export const getRegister = async (req, res) => {
  try {
    // ✅ populate userId
    const register = await Register.findById(req.params.id).populate("userId");
    if (!register) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }
    res.status(200).json({ success: true, data: register });
  } catch (error) {
    console.error("Server error in getRegister:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc Get registrations by email (all history)
export const getRegistersByEmail = async (req, res) => {
  try {
    const raw = req.params.email;
    const strict = normalizeStrict(raw);
    const legacy = normalizeLegacy(raw);

    const candidates = [...new Set([strict, legacy].filter(Boolean))];
    const query =
      candidates.length > 1
        ? { OwnerEmail: { $in: candidates } }
        : { OwnerEmail: strict };

    const registers = await Register.find(query).populate("userId").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: registers.length, data: registers });
  } catch (error) {
    console.error("Server error in getRegistersByEmail:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc Get latest registration by email
export const getLatestRegisterByEmail = async (req, res) => {
  try {
    const raw = req.params.email;
    const strict = normalizeStrict(raw);
    const legacy = normalizeLegacy(raw);
    const candidates = [...new Set([strict, legacy].filter(Boolean))];

    let register;
    if (candidates.length > 1) {
      register = await Register.findOne({ OwnerEmail: { $in: candidates } })
        .populate("userId")
        .sort({ createdAt: -1 });
    } else {
      register = await Register.findOne({ OwnerEmail: strict })
        .populate("userId")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, data: register || null });
  } catch (error) {
    console.error("Server error in getLatestRegisterByEmail:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc Update registration
export const updateRegister = async (req, res) => {
  try {
    const register = await Register.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("userId");

    if (!register) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: register.OwnerEmail,
      subject: `🔄 Pet Registration Updated for ${register.PetName}`,
      html: `<h2>Hello ${register.OwnerName},</h2>
        <p>Your registration for <strong>${register.PetName}</strong> has been updated.</p>
        <p>Please review your updated details in the system.</p>`,
    };
    sendEmail(mailOptions);

    res.status(200).json({ success: true, data: register });
  } catch (error) {
    console.error("Server error in updateRegister:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc Delete registration
export const deleteRegister = async (req, res) => {
  try {
    const register = await Register.findByIdAndDelete(req.params.id).populate("userId");

    if (!register) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: register.OwnerEmail,
      subject: `❌ Pet Registration Deleted for ${register.PetName}`,
      html: `
        <h2>Hello ${register.OwnerName},</h2>
        <p>The registration for your pet <strong>${register.PetName}</strong> has been removed.</p>
        <p>If this was a mistake, please contact the hospital immediately.</p>
      `,
    };
    sendEmail(mailOptions);

    res.status(200).json({ success: true, message: "Registration deleted successfully" });
  } catch (error) {
    console.error("Server error in deleteRegister:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};