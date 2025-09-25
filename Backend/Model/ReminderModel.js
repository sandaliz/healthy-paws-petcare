import mongoose from "mongoose";

const { Schema } = mongoose;

const reminderSchema = new Schema(
  {
    care: { type: mongoose.Schema.Types.ObjectId, ref: "CareCustomer", required: true },
    email: { type: String, required: true },
    remindAt: { type: Date, required: true },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
