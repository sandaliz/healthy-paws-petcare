import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../Controllers/eventController.js";

const router = express.Router();

router.post("/", createEvent); // Create event
router.get("/", getAllEvents); // Get all events
router.get("/:id", getEventById); // Get event by ID
router.put("/:id", updateEvent); // Update event
router.delete("/:id", deleteEvent); // Delete event

export default router;
