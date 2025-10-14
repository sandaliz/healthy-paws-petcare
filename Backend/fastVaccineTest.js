import mongoose from "mongoose";
import dotenv from "dotenv";
import VaccinePlan from "./Model/VaccinePlan.js";
import { sendReminders } from "./Services/VaccineReminderCron.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

const runTest = async () => {
  try {
    console.log("⚡ Creating test vaccine plan...");

    const now = new Date();

    // Create a test plan
    const testPlan = await VaccinePlan.create({
      user: new mongoose.Types.ObjectId(),
      petName: "FastTestPet",
      breed: "Labrador Retriever",
      species: "dog",
      size: "medium",
      birthDate: now,
      sendToEmail: "your-email@example.com", // replace with a real email to test
      coreVaccines: ["Core Vaccine A"],
      recommendedNonCore: ["Non-Core Vaccine B"],
      specialNotes: "This is a test special note",
      schedule: [
        {
          week: 0,
          vaccines: ["Core Vaccine A"],
          dueDate: new Date(now.getTime() + 30 * 1000), // 30 seconds from now (simulate 1-week)
          reminderSentWeek: false,
          reminderSentDay: false,
        },
        {
          week: 0,
          vaccines: ["Non-Core Vaccine B"],
          dueDate: new Date(now.getTime() + 60 * 1000), // 60 seconds from now (simulate 1-day)
          reminderSentWeek: false,
          reminderSentDay: false,
        },
      ],
    });

    console.log("✅ Test vaccine plan created. Waiting 1 min to trigger reminders...");

    // Wait 35s and run reminders (should pick 1-week simulation)
    setTimeout(async () => {
      console.log("🚀 Triggering first reminder run (1-week simulation)");
      await sendReminders();
    }, 35000);

    // Wait 65s and run reminders (should pick 1-day simulation)
    setTimeout(async () => {
      console.log("🚀 Triggering second reminder run (1-day simulation)");
      await sendReminders();

      console.log("🏁 Fast test complete.");
      process.exit(0);
    }, 65000);

  } catch (err) {
    console.error("❌ Error in test script:", err);
    process.exit(1);
  }
};

runTest();
