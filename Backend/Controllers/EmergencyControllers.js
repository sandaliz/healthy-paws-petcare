// Controllers/EmergencyControllers.js
import CareCustomer from "../Model/CareModel.js";
import Emergency from "../Model/EmergencyModel.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * Handle emergency for a pet appointment
 * @route POST /api/emergency/send
 * @body { appointmentID, treatmentGiven, emergencyAction }
 */
export const handleEmergencyAction = async (req, res) => {
  try {
    const { appointmentID, treatmentGiven, emergencyAction } = req.body;

    // Find appointment
    const appointment = await CareCustomer.findOne({ _id: appointmentID });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Determine email subject and content
    let emailSubject = "";
    let emailText = "";

    if (emergencyAction === "contact-owner") {
      emailSubject = `Emergency with ${appointment.petName}`;
      emailText = `Dear ${appointment.ownerName},\n\nYour pet ${appointment.petName} is experiencing an emergency. Please contact us immediately.`;
    } else if (emergencyAction === "authorize-treatment") {
      emailSubject = `Emergency Treatment for ${appointment.petName}`;
      emailText = `Dear ${appointment.ownerName},\n\nYour pet ${appointment.petName} required emergency treatment.\n\nTreatment: ${treatmentGiven || "Details not provided"}.\n\nWe have proceeded as authorized.`;
    } else {
      emailSubject = `Emergency Alert for ${appointment.petName}`;
      emailText = `Dear ${appointment.ownerName},\n\nYour pet ${appointment.petName} is in an emergency situation. Please contact us immediately.`;
    }

    // Send email to appointment owner's email
    const emailStatus = await sendEmail({
      to: appointment.email,
      subject: emailSubject,
      text: emailText,
    });

    // Save emergency record
    const emergencyRecord = new Emergency({
      pet: appointment._id,
      reportedBy: req.user?.id || null, // Fixed: use req.user.id from authMiddleware
      owner: appointment._id, // owner is the appointment record itself
      actionTaken: emergencyAction,
      treatmentGiven: treatmentGiven || "",
      emailStatus,
      type: "OTHER",
      description: "Emergency reported via dashboard",
    });

    await emergencyRecord.save();

    return res.status(200).json({
      message: "Emergency handled successfully",
      emailStatus,
      emergency: emergencyRecord,
    });
  } catch (err) {
    console.error("Emergency handling error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all emergency history
 * @route GET /api/emergency/history
 */
export const getEmergencyHistory = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate("pet", "petName ownerName email")
      .populate("owner", "ownerName email")
      .populate("reportedBy", "email role")
      .sort({ createdAt: -1 });

    return res.status(200).json(emergencies);
  } catch (err) {
    console.error("Error fetching emergency history:", err);
    return res.status(500).json({ message: "Error fetching emergency history" });
  }
};
