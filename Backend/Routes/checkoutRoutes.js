import express from "express";
import { checkout } from "../Controllers/checkoutController.js";

const router = express.Router();

router.post("/", checkout);

export default router;   // ✅ replaces module.exports