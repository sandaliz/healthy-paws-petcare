import cron from "node-cron";
import mongoose from "mongoose";
import dotenv from "dotenv";
import VaccinePlan from "../Model/VaccinePlan.js";
import { sendVaccineReminder } from "../utils/emailService.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sendReminders = async () => {
  try {
    const now = new Date();
    const plans = await VaccinePlan.find({});

    for (const plan of plans) {
      let updated = false;

      for (const vaccine of plan.schedule) {
        const dueDate = new Date(vaccine.dueDate);

        // 1 week before
        const oneWeekBefore = new Date(dueDate);
        oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);

        // 24 hours before
        const oneDayBefore = new Date(dueDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);

        if (!vaccine.reminderSentWeek && now.toDateString() === oneWeekBefore.toDateString()) {
          await sendVaccineReminder({
            to: plan.sendToEmail,
            subject: `Vaccine Reminder for ${plan.petName}`,
            text: `Hello,\n\nThis is a 1-week reminder that your pet ${plan.petName} has the following vaccines due on ${dueDate.toLocaleDateString()}:\n\n${vaccine.vaccines.join(", ")}\n\nSpecial Notes: ${plan.specialNotes || "None"}\n\nStay safe!\nHealthyPaws Team`,
          });
          vaccine.reminderSentWeek = true;
          updated = true;
        }

        if (!vaccine.reminderSentDay && now.toDateString() === oneDayBefore.toDateString()) {
          await sendVaccineReminder({
            to: plan.sendToEmail,
            subject: `Vaccine Reminder for ${plan.petName}`,
            text: `Hello,\n\nThis is a 24-hour reminder that your pet ${plan.petName} has the following vaccines due tomorrow (${dueDate.toLocaleDateString()}):\n\n${vaccine.vaccines.join(", ")}\n\nSpecial Notes: ${plan.specialNotes || "None"}\n\nStay safe!\nHealthyPaws Team`,
          });
          vaccine.reminderSentDay = true;
          updated = true;
        }
      }

      if (updated) await plan.save();
    }

    console.log("Vaccine reminders checked successfully.");
  } catch (err) {
    console.error("Error sending vaccine reminders:", err);
  }
};

// Schedule cron job at 8:00 AM daily
cron.schedule("0 8 * * *", () => {
  console.log("Running vaccine reminder cron job...");
  sendReminders();
});
export { sendReminders };