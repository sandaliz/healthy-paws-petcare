// controllers/VaccineController.js
import VaccineRule from "../Model/VaccineRule.js";
import VaccinePlan from "../Model/VaccinePlan.js";
import { sendVaccineReminder } from "../utils/emailService.js";

const calculateDueDate = (birthDate, week) => {
  const date = new Date(birthDate);
  date.setDate(date.getDate() + week * 7);
  return date;
};

// Create vaccine plan and send email
export const createVaccinePlan = async (req, res) => {
  try {
    const { petName, breed, birthDate, sendToEmail } = req.body;
    const userId = req.user.id; // from auth middleware

    // Validate required fields
    if (!petName || !breed || !birthDate || !sendToEmail) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find vaccine rule for this breed
    const rule = await VaccineRule.findOne({ breed });
    if (!rule) {
      return res.status(404).json({ message: "No vaccine rules found for this breed." });
    }

    const birth = new Date(birthDate);
    let schedule = [];

    // Base schedule from vaccine rule
    rule.schedule.forEach(item => {
      schedule.push({
        week: item.week,
        vaccines: item.vaccines,
        dueDate: calculateDueDate(birth, item.week),
        reminderSentWeek: false, // 1-week reminder flag
        reminderSentDay: false,  // 24-hour reminder flag
      });
    });

    // Booster weeks (e.g., "All boosters")
    const boosterWeeks = rule.schedule
      .filter(item => item.vaccines.includes("All boosters"))
      .map(item => item.week);

    // Extend boosters yearly up to 10 years
    for (let year = 1; year < 10; year++) {
      boosterWeeks.forEach(week => {
        schedule.push({
          week: week + year * 52,
          vaccines: rule.coreVaccines, // Replace "All boosters" with real vaccines
          dueDate: calculateDueDate(birth, week + year * 52),
          reminderSentWeek: false,
          reminderSentDay: false,
        });
      });
    }

    // Create plan in DB
    const plan = await VaccinePlan.create({
      user: userId,
      petName,
      breed: rule.breed,
      species: rule.species,
      size: rule.size,
      birthDate: birth,
      sendToEmail,
      coreVaccines: rule.coreVaccines,
      recommendedNonCore: rule.recommendedNonCore,
      specialNotes: rule.specialNotes,
      schedule,
    });

    // Generate HTML email
    const vaccineRows = schedule
      .map(
        item =>
          `<tr>
            <td style="padding:8px; border:1px solid #ccc;">Week ${item.week}</td>
            <td style="padding:8px; border:1px solid #ccc;">${item.vaccines.join(", ")}</td>
            <td style="padding:8px; border:1px solid #ccc;">${item.dueDate.toLocaleDateString()}</td>
          </tr>`
      )
      .join("");

    const specialNotesHtml = rule.specialNotes
      ? `<p style="margin-top:16px;"><strong>Special Notes:</strong> ${rule.specialNotes}</p>`
      : "";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#2c7be5;">Vaccine Plan for ${petName}</h2>
        <p>Hello,</p>
        <p>Here is the vaccine plan for <strong>${petName}</strong>:</p>
        <table style="border-collapse: collapse; width: 100%; margin-top:10px;">
          <thead>
            <tr>
              <th style="padding:8px; border:1px solid #ccc; background:#f0f0f0;">Week</th>
              <th style="padding:8px; border:1px solid #ccc; background:#f0f0f0;">Vaccines</th>
              <th style="padding:8px; border:1px solid #ccc; background:#f0f0f0;">Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${vaccineRows}
          </tbody>
        </table>
        ${specialNotesHtml}
        <p style="margin-top:20px;">Stay safe!<br/>HealthyPaws Team</p>
      </div>
    `;

    // Send email
    await sendVaccineReminder({
      to: sendToEmail,
      subject: `Vaccine Plan for ${petName}`,
      html: emailHtml,
    });

    res.status(201).json({ message: "Vaccine plan created and email sent successfully.", plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all vaccine plans for a user
export const getUserVaccinePlans = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 
    const plans = await VaccinePlan.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ plans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
