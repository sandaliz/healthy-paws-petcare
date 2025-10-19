// utils/emailService.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FM_EMAIL_USER,
    pass: process.env.FM_EMAIL_PASS,
  },
});

export const sendVaccineReminder = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"HealthyPaws" <${process.env.FM_EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Vaccine reminder sent:", info.messageId);
    return "sent";
  } catch (error) {
    console.error("Error sending vaccine reminder:", error.message);
    return "failed";
  }
};
