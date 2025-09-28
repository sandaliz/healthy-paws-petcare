// Controllers/EmergencyControllers.js
import CareCustomer from "../Model/CareModel.js";
import Emergency from "../Model/EmergencyModel.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * Handle emergency for a pet appointment
 * @route POST /api/emergencies/send
 * @body { appointmentID, treatmentGiven, emergencyAction }
 */
export const handleEmergencyAction = async (req, res) => {
  try {
    const { appointmentID, treatmentGiven, emergencyAction } = req.body;

    console.log("🚨 Emergency triggered:", { appointmentID, treatmentGiven, emergencyAction });

    if (!appointmentID || !emergencyAction) {
      return res.status(400).json({ message: "Missing required fields: appointmentID or emergencyAction" });
    }

    // Find appointment
    const appointment = await CareCustomer.findById(appointmentID);
    if (!appointment) {
      console.warn("⚠️ Appointment not found:", appointmentID);
      return res.status(404).json({ message: "Appointment not found" });
    }

    console.log("Found appointment:", {
      petName: appointment.petName,
      ownerName: appointment.ownerName,
      ownerEmail: appointment.email,
    });

    // Compose email
    let emailSubject = "";
    let emailText = "";

    switch (emergencyAction) {
      case "contact-owner":
        emailSubject = `Emergency with ${appointment.petName}`;
        emailText = `Dear ${appointment.ownerName},\n\nYour pet ${appointment.petName} is experiencing an emergency. Please contact us immediately.`;
        break;

      case "authorize-treatment":
        emailSubject = `Emergency Treatment for ${appointment.petName}`;
        emailText = `Dear ${appointment.ownerName},\n\nYour pet ${appointment.petName} required emergency treatment.\n\nTreatment: ${treatmentGiven || "Details not provided"}.\n\nWe have proceeded as authorized.`;
        break;

      default:
        emailSubject = `Emergency Alert for ${appointment.petName}`;
        emailText = `Dear ${appointment.ownerName},\n\nYour pet ${appointment.petName} is in an emergency situation. Please contact us immediately.`;
        break;
    }

    // Send email
    const emailStatus = await sendEmail({
      to: appointment.email,
      subject: emailSubject,
      text: emailText,
    });

    console.log("Email sending result:", emailStatus);

    // Save emergency record
    const emergencyRecord = new Emergency({
      pet: appointment._id,
      reportedBy: req.user?.id || null,
      owner: appointment._id,
      actionTaken: emergencyAction,
      treatmentGiven: treatmentGiven || "",
      emailStatus,
      type: "OTHER",
      description: "Emergency reported via dashboard",
    });

    await emergencyRecord.save();
    console.log("Emergency record saved:", emergencyRecord._id);

    return res.status(200).json({
      message: "Emergency handled successfully",
      emailStatus,
      emergency: emergencyRecord,
    });

  } catch (err) {
    console.error("❌ Emergency handling error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
