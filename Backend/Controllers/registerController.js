import mongoose from "mongoose";
import Register from "../Model/Register.js";
import nodemailer from "nodemailer"; 

// Helper: handle Mongoose validation + duplicate errors
 
const handleMongooseError = (err, res) => {
  console.error("❌ Register Controller Error:", err.message);

  if (err.name === "ValidationError") {
    let errors = {};
    Object.keys(err.errors).forEach((field) => {
      errors[field] = err.errors[field].message;
    });
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate value error",
      field: Object.keys(err.keyValue)[0],
    });
  }

  return res.status(500).json({
    success: false,
    message: "Server error",
    error: err.message,
  });
};

// Setup nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

//Create a new register 
export const createRegister = async (req, res) => {
  try {
    const newRegister = new Register(req.body);
    const saved = await newRegister.save();

    // Send email after saving
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: saved.OwnerEmail, 
        subject: "🐾 Pet Registered Successfully!",
        text: `Hello ${saved.OwnerName}, your pet ${saved.PetName} has been registered successfully.`,
        html: `
          <h2>🐾 Pet Registration Confirmation</h2>
          <p>Dear ${saved.OwnerName || "Pet Owner"},</p>
          <p>Your pet <b>${saved.PetName}</b> has been successfully registered with Pet Care Management.</p>
          <ul>
            <li>📛 Pet Name: ${saved.PetName}</li>
            <li>👤 Owner: ${saved.OwnerName}</li>
            <li>📧 Email: ${saved.OwnerEmail}</li>
            <li>📅 Registered on: ${new Date(saved.createdAt).toLocaleString()}</li>
          </ul>
          <p>Thank you for trusting us 🐶🐱</p>
        `,
      });

      if (process.env.SUPER_ADMIN_EMAIL) {
        await transporter.sendMail({
          from: process.env.SENDER_EMAIL,
          to: process.env.SUPER_ADMIN_EMAIL,
          subject: `📢 New Pet Registered - ${saved.PetName}`,
          html: `
            <h3>A new pet has been registered!</h3>
            <p><b>Pet Name:</b> ${saved.PetName}</p>
            <p><b>Owner:</b> ${saved.OwnerName} (${saved.OwnerEmail})</p>
            <p><b>Date:</b> ${new Date(saved.createdAt).toLocaleString()}</p>
          `,
        });
      }
      console.log(`📧 Email sent to owner: ${saved.OwnerEmail}`);
    } catch (mailErr) {
      console.error("❌ Failed to send registration email:", mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Register created successfully & email sent",
      data: saved,
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
};

//Get all registers 
export const getRegisters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;  
    const skip = (page - 1) * limit;

    const registers = await Register.find()
      .populate("userId", "name email role")   
      .sort({ createdAt: -1 })                 
      .skip(skip)
      .limit(limit);

    const total = await Register.countDocuments();

    return res.status(200).json({
      success: true,
      message: "Registers fetched successfully",
      count: registers.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: registers,
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
};

//Get a single register by ID
export const getRegister = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const register = await Register.findById(id).populate("userId", "name email role");
    if (!register) {
      return res
        .status(404)
        .json({ success: false, message: "Register not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Register fetched successfully",
      data: register,
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
};


// Get all registers by OwnerEmail
 
export const getRegistersByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const registers = await Register.find({ OwnerEmail: email.toLowerCase() })
      .populate("userId", "name email role");

    if (!registers.length) {
      return res.status(404).json({
        success: false,
        message: "No registers found for this email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Registers by email fetched successfully",
      count: registers.length,
      data: registers,
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
};


//Get the latest register by OwnerEmail
export const getLatestRegisterByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const register = await Register.findOne({ OwnerEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .populate("userId", "name email role");

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "No register found for this email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Latest register fetched successfully",
      data: register,
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
};


//Update a register by ID
export const updateRegister = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const updated = await Register.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("userId", "name email role");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Register not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Register updated successfully",
      data: updated,
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
};


//Delete a register by ID
export const deleteRegister = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const deleted = await Register.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Register not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Register deleted successfully",
      data: deleted,
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
};