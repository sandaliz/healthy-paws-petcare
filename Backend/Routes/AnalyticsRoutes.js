// Routes/AnalyticsRoutes.js
import express from "express";
import { getAnalytics } from "../Controllers/AnalyticsController.js";

const router = express.Router();

// GET /api/analytics
router.get("/", getAnalytics);

export default router;
