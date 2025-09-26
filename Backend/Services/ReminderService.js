
import Appointment from '../Model/Appointment.js';

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


export const checkAndSendAppointmentReminders = async () => {
  try {
   
    const currentDate = new Date();
    

    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(currentDate.getDate() + 7);
    
    // Find appointments that are scheduled within the next week and not cancelled
    const upcomingAppointments = await Appointment.find({
      appointmentDate: { 
        $gte: currentDate, 
        $lte: oneWeekFromNow 
      },
      status: { $ne: 'CANCELLED' },
      isDeleted: false
    }).populate('user', 'name email');
    
    // Send reminder emails for each upcoming appointment
    for (const appointment of upcomingAppointments) {
      await sendReminderEmail(appointment);
    }
    
    return { success: true, count: upcomingAppointments.length };
  } catch (error) {
    console.error('Error checking and sending appointment reminders:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a reminder email for a specific appointment
 */
const sendReminderEmail = async (appointment) => {
  try {
    // Format date for email
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Email subject
    const subject = `Reminder: Your Pet Appointment on ${appointmentDate}`;
    
    // Email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #54413c; border-bottom: 2px solid #ffd58e; padding-bottom: 10px;">Appointment Reminder</h2>
        
        <p>Dear ${appointment.ownerName},</p>
        
        <p>This is a friendly reminder about your upcoming appointment:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Appointment ID:</strong> ${appointment.appointmentId}</p>
          <p><strong>Pet Name:</strong> ${appointment.petName}</p>
          <p><strong>Pet Type:</strong> ${appointment.petType}</p>
          <p><strong>Category:</strong> ${appointment.category.replace('_', ' ')}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
          <p><strong>Status:</strong> ${appointment.status}</p>
        </div>
        
        <p>If you need to reschedule or have any questions, please contact us.</p>
        
        <p>Thank you for choosing our services!</p>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
          <p>This is an automated reminder. Please do not reply to this email.</p>
        </div>
      </div>
    `;
    
    // Send the email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: appointment.contactEmail,
      subject: subject,
      html: html
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent for appointment: ${appointment.appointmentId} ${appointment.contactEmail}`);
    
    return true;
  } catch (error) {
    console.error(`Error sending reminder email for appointment ${appointment.appointmentId}:`, error);
    return false;
  }
};

/**
 * Checks for upcoming appointments for a specific user and sends reminders
 */
export const checkAndSendUserAppointmentReminders = async (userId) => {
  try {
    // Get current date
    const currentDate = new Date();
    
    // Get date one week from now
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(currentDate.getDate() + 7);
    
    // Find appointments for this user that are scheduled within the next week and not cancelled
    const upcomingAppointments = await Appointment.find({
      user: userId,
      appointmentDate: { 
        $gte: currentDate, 
        $lte: oneWeekFromNow 
      },
      status: { $ne: 'CANCELLED' },
      isDeleted: false
    });
    
    // Send reminder emails for each upcoming appointment
    for (const appointment of upcomingAppointments) {
      await sendReminderEmail(appointment);
    }
    
    return { success: true, count: upcomingAppointments.length };
  } catch (error) {
    console.error('Error checking and sending user appointment reminders:', error);
    return { success: false, error: error.message };
  }
};