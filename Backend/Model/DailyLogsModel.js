// Model/DailyLogsModel.js  (ESM version)
import mongoose from "mongoose";

const { Schema } = mongoose;

const dailyLogSchema = new Schema(
  {
    logID: {
      type: String,
      unique: true,
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "CareCustomer",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    feeding: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    playtime: {
      type: String,
    },
    walking: {
      type: String,
    },
    grooming: {
      type: String,
    },
    mood: {
      type: String,
      enum: ["excellent", "good", "okay", "poor"],
      default: "good",
    },
    loggedBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate custom logID
dailyLogSchema.pre("save", function (next) {
  if (!this.logID) {
    this.logID =
      "LOG" +
      Date.now() +
      Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const DailyLog = mongoose.model("DailyLog", dailyLogSchema);

export default DailyLog;