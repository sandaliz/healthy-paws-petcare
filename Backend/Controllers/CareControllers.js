// Controllers/CareControllers.js (ESM)
import CareCustomer from "../Model/CareModel.js";
import Reminder from "../Model/ReminderModel.js";
import { scheduleReminder } from "../services/ReminderScheduler.js";

// -------------------- Helpers -------------------- //

// Format date in IST
const formatIST = (dateObj) => {
  if (!dateObj) return "N/A";
  const d = new Date(dateObj);
  if (isNaN(d)) return "Invalid Date";
  return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });
};

// Merge date object + "HH:mm" string
const mergeDateAndTime = (dateVal, timeStr) => {
  const baseDate = new Date(dateVal);
  if (!timeStr) return baseDate;
  const [hours, minutes] = timeStr.split(":").map(Number);
  baseDate.setHours(hours || 0, minutes || 0, 0, 0);
  return baseDate;
};

// Generate rich HTML reminder message
const generateReminderMessage = (careCustomer, label, appointmentDate) => {
  const dropOffDateTime = mergeDateAndTime(careCustomer.dateStay, careCustomer.dropOffTime);
  const pickUpDateTime = mergeDateAndTime(careCustomer.pickUpDate, careCustomer.pickUpTime);

  return `
    <html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background-color: #f9f9f9;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 650px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }
      h2 {
        color: #2a9d8f;
        margin-bottom: 12px;
      }
      p {
        font-size: 15px;
        line-height: 1.6;
      }
      .details {
        margin-top: 18px;
        padding: 16px;
        border-left: 4px solid #2a9d8f;
        background: #f1faf9;
        border-radius: 8px;
      }
      .details p {
        margin: 6px 0;
      }
      .label {
        font-weight: bold;
        color: #264653;
      }
      .footer {
        margin-top: 30px;
        font-size: 13px;
        color: #777;
        border-top: 1px solid #eee;
        padding-top: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>🐾 HealthyPaws -Pet Stay Reminder</h2>
      <p>Dear ${careCustomer.ownerName},</p>
      <p>Here are the details of your pet’s upcoming stay:</p>
      <div class="details">
        <p><span class="label">Owner Name:</span> ${careCustomer.ownerName}</p>
        <p><span class="label">Contact Number:</span> ${careCustomer.contactNumber}</p>
        <p><span class="label">Email:</span> ${careCustomer.email}</p>
        <p><span class="label">Pet Name:</span> ${careCustomer.petName}</p>
        <p><span class="label">Species:</span> ${careCustomer.species}</p>
        <p><span class="label">Health Details:</span> ${careCustomer.healthDetails || "N/A"}</p>
        <p><span class="label">Date of Stay:</span> ${new Date(careCustomer.dateStay).toLocaleDateString()}</p>
        <p><span class="label">Pick-Up Date:</span> ${new Date(careCustomer.pickUpDate).toLocaleDateString()}</p>
        <p><span class="label">Nights Stay:</span> ${careCustomer.nightsStay}</p>
        <p><span class="label">Drop-Off Time:</span> ${careCustomer.dropOffTime}</p>
        <p><span class="label">Pick-Up Time:</span> ${careCustomer.pickUpTime}</p>
        <p><span class="label">Food Type:</span> ${careCustomer.foodType}</p>
        <p><span class="label">Feeding Times:</span> ${careCustomer.feedingTimes}</p>
        <p><span class="label">Grooming:</span> ${careCustomer.grooming ? "Yes" : "No"}</p>
        <p><span class="label">Walking:</span> ${careCustomer.walking ? "Yes" : "No"}</p>
        <p><span class="label">Emergency Action:</span> ${careCustomer.emergencyAction}</p>
      </div>
      <p><strong>Reminder:</strong> ${
        label
          ? `${careCustomer.petName}'s stay starts in ${label} (${appointmentDate.toLocaleString()})`
          : `${careCustomer.petName}'s stay is scheduled at ${appointmentDate.toLocaleString()}`
      }</p>
      <div class="footer">
        Thank you,<br>
        <strong>Healthy Paws Team</strong>
      </div>
    </div>
  </body>
  </html>
  `;
};

// -------------------- Reminder Logic -------------------- //
export const createRemindersForAppointment = async (careCustomer) => {
  const appointmentDate = mergeDateAndTime(careCustomer.dateStay, careCustomer.dropOffTime);

  const reminderTimes = [
    { hoursBefore: 24, label: "24h" },
    { hoursBefore: 3, label: "3h" },
  ];

  for (const r of reminderTimes) {
    const remindAt = new Date(appointmentDate.getTime() - r.hoursBefore * 60 * 60 * 1000);
    const message =
      remindAt > new Date()
        ? generateReminderMessage(careCustomer, r.label, appointmentDate)
        : generateReminderMessage(careCustomer, null, appointmentDate);

    const reminder = new Reminder({
      care: careCustomer._id,
      email: careCustomer.email,
      remindAt: remindAt > new Date() ? remindAt : new Date(),
      message,
      sent: false,
    });

    await reminder.save();
    scheduleReminder(reminder);

    console.log(
      `📌 Reminder scheduled -> ID: ${reminder._id}, Label: ${r.label}, RemindAt: ${remindAt}`
    );
  }
};

// -------------------- CRUD & Appointment Functions -------------------- //

export const getAllDetails = async (req, res) => {
  try {
    let query = {};
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) query = { user: req.user.id };
    const careCustomers = await CareCustomer.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    if (!careCustomers.length) return res.status(404).json({ message: "No appointments found" });
    return res.status(200).json({ careCustomers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const careCustomer = new CareCustomer({ user: userId, ...req.body });
    await careCustomer.save();
    await createRemindersForAppointment(careCustomer);

    return res.status(201).json({
      message: "Appointment created successfully & reminders guaranteed",
      careCustomer,
    });
  } catch (err) {
    console.error("❌ Error creating appointment:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const careCustomer = await CareCustomer.findById(id).populate("user", "name email");
    if (!careCustomer) return res.status(404).json({ message: "Appointment not found" });
    if (
      careCustomer.user._id.toString() !== req.user.id &&
      !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ careCustomer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let careCustomer = await CareCustomer.findById(id);
    if (!careCustomer) return res.status(404).json({ message: "Appointment not found" });

    // Authorization: only owner or admin can update
    if (careCustomer.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update fields from request body
    careCustomer = await CareCustomer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    // Delete old unsent reminders
    await Reminder.deleteMany({ care: careCustomer._id, sent: false });

    // Immediate email for status changes
    const status = careCustomer.status;
    if (["Cancelled", "Approved", "Rejected", "Checked-In", "Completed"].includes(status)) {
      let statusMessage;
      switch (status) {
        case "Cancelled":
          statusMessage = `Your pet stay appointment for ${careCustomer.petName} has been <strong>cancelled</strong>.`;
          break;
        case "Approved":
          statusMessage = `Your pet stay appointment for ${careCustomer.petName} has been <strong>approved</strong>.`;
          break;
        case "Rejected":
          statusMessage = `Your pet stay appointment for ${careCustomer.petName} has been <strong>rejected</strong>.`;
          break;
        case "Checked-In":
          statusMessage = `Your pet ${careCustomer.petName} has <strong>checked in</strong> for the stay.`;
          break;
        case "Completed":
          statusMessage = `Your pet ${careCustomer.petName} has <strong>completed</strong> the stay.`;
          break;
      }

      const message = `
        <p>Dear ${careCustomer.ownerName},</p>
        <p>${statusMessage}</p>
        <p>If you have any questions, please contact us.</p>
      `;

      const reminder = new Reminder({
        care: careCustomer._id,
        email: careCustomer.email,
        remindAt: new Date(),
        message,
        sent: false,
      });

      await reminder.save();
      scheduleReminder(reminder);
    }

    // Schedule normal reminders only for Pending appointments
    if (status === "Pending") {
      await createRemindersForAppointment(careCustomer);
    }

    return res.status(200).json({
      message: "Appointment updated successfully & reminders rescheduled",
      careCustomer,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const careCustomer = await CareCustomer.findById(id);
    if (!careCustomer) return res.status(404).json({ message: "Appointment not found" });

    await Reminder.deleteMany({ care: id });
    await careCustomer.deleteOne();

    return res
      .status(200)
      .json({ message: "Appointment & associated reminders deleted", careCustomer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Approved",
      "Rejected",
      "Checked-In",
      "Completed",
      "Cancelled",
    ];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const careCustomer = await CareCustomer.findById(id);
    if (!careCustomer) return res.status(404).json({ message: "Appointment not found" });

    // Update status
    careCustomer.status = status;
    await careCustomer.save();

    // Delete old unsent reminders
    await Reminder.deleteMany({ care: careCustomer._id, sent: false });

    // Immediate email for status changes
    if (["Cancelled", "Approved", "Rejected", "Checked-In", "Completed"].includes(status)) {
      let statusMessage;
      switch (status) {
        case "Cancelled":
          statusMessage = `Your pet stay appointment for ${careCustomer.petName} has been <strong>cancelled</strong>.`;
          break;
        case "Approved":
          statusMessage = `Your pet stay appointment for ${careCustomer.petName} has been <strong>approved</strong>.`;
          break;
        case "Rejected":
          statusMessage = `Your pet stay appointment for ${careCustomer.petName} has been <strong>rejected</strong>.`;
          break;
        case "Checked-In":
          statusMessage = `Your pet ${careCustomer.petName} has <strong>checked in</strong> for the stay.`;
          break;
        case "Completed":
          statusMessage = `Your pet ${careCustomer.petName} has <strong>completed</strong> the stay.`;
          break;
      }

      const message = `
        <p>Dear ${careCustomer.ownerName},</p>
        <p>${statusMessage}</p>
        <p>If you have any questions, please contact us.</p>
      `;

      const reminder = new Reminder({
        care: careCustomer._id,
        email: careCustomer.email,
        remindAt: new Date(),
        message,
        sent: false,
      });

      await reminder.save();
      scheduleReminder(reminder);
    }

    // Schedule normal reminders only for Pending appointments
    if (status === "Pending") {
      await createRemindersForAppointment(careCustomer);
    }

    return res.status(200).json({ message: `Status updated to ${status}`, careCustomer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const careCustomers = await CareCustomer.find({ status })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    if (!careCustomers.length)
      return res.status(404).json({ message: `No ${status} appointments found` });
    return res.status(200).json({ careCustomers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
