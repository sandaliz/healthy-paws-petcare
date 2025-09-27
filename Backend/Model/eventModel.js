import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    eventDate: { type: Date, required: true },

    fromTime: { type: String, required: true },
    toTime: { type: String, required: true },

    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
