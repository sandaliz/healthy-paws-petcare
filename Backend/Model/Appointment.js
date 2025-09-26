import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    petName: { type: String, required: true },
    ownerName: { type: String, required: true },
    petType: { type: String, required: true }, // e.g., Dog, Cat, Rabbit

    category: {
      type: String,
      enum: ["VACCINE", "SURGERY", "DENTAL", "GENERAL_CHECKUP"],
      required: true,
    },

    contact: { type: String, required: true },
    contactEmail: { type: String, required: true },

    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true }, // store as "HH:mm"

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },

    isDeleted: { type: Boolean, default: false }, // soft delete
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
