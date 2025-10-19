// Controllers/emailController.js
import nodemailer from "nodemailer";
import QRCode from "qrcode";

export const sendPrescriptionEmail = async (req, res) => {
  const { email, prescriptionId } = req.body;

  try {
    const link = `http://localhost:3000/cart/${prescriptionId}`;

    // Generate QR code as DataURL (base64)
    const qrDataUrl = await QRCode.toDataURL(link);

    // Convert base64 to Buffer for attachment
    const base64Data = qrDataUrl.split(",")[1];
    const qrBuffer = Buffer.from(base64Data, "base64");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your Prescription QR & Link",
      html: `
        <h2>Your Prescription is Ready</h2>
        <p>Scan QR or click the link:</p>
        <img src="cid:qrimage" alt="Prescription QR"/>
        <br/>
        <a href="${link}">${link}</a>
      `,
      attachments: [
        {
          filename: "prescription-qr.png",
          content: qrBuffer,
          cid: "qrimage", // referenced in <img src>
        },
      ],
    });

    res.json({ success: true, message: "Email sent with QR attached" });
  } catch (err) {
    console.error("🚨 Email error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
};