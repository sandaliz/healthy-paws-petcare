import Appointment from "../Model/Appointment.js";
import { checkAndSendUserAppointmentReminders } from "../Services/ReminderService.js";

function generateAppointmentId() {
  const random4Digits = Math.floor(1000 + Math.random() * 9000);
  return `AP${random4Digits}`;
}

// Create appointment (any logged-in user)
export const createAppointment = async (req, res) => {
  try {
    const {
      petName,
      ownerName,
      petType,
      category,
      contact,
      contactEmail,
      appointmentDate,
      appointmentTime,
    } = req.body;

    if (
      !petName ||
      !ownerName ||
      !petType ||
      !category ||
      !contact ||
      !contactEmail ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const appointmentId = generateAppointmentId();

    const appointment = new Appointment({
      appointmentId,
      user: req.user.id,
      petName,
      ownerName,
      petType,
      category,
      contact,
      contactEmail,
      appointmentDate,
      appointmentTime,
    });

    await appointment.save();
    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ isDeleted: false }).populate(
      "user",
      "name email role"
    );
        try {
       checkAndSendUserAppointmentReminders(req.user.id);
    } catch (reminderError) {
      console.error("Error sending appointment reminders:", reminderError);
     
    }
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get my appointments (logged-in user)
export const getMyAppointments = async (req, res) => {
  try {
    console.log("called")
    const appointments = await Appointment.find({
      user: req.user.id,
      isDeleted: false,
    });
     try {
      await checkAndSendUserAppointmentReminders(req.user.id);
    } catch (reminderError) {
      console.error("Error sending appointment reminders:", reminderError);
     
    }
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update appointment (owner or ADMIN/SUPER_ADMIN/RECEPTIONIST)
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    Object.assign(appointment, req.body);
    await appointment.save();

    res
      .status(200)
      .json({ success: true, message: "Appointment updated", appointment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Soft delete appointment (owner or ADMIN/SUPER_ADMIN)
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    appointment.isDeleted = true;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment deleted (soft)",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
