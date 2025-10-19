// Routes/productRoutes.js
import express from "express";
import * as productController from "../Controllers/productController.js";
import upload from "../config/cloudinaryConfig.js";

const router = express.Router();

// CRUD
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);   // ✅ NEW: get single product by ID
router.post("/", upload.single("image"), productController.addProducts);
router.put("/:id", upload.single("image"), productController.updateProducts);
router.delete("/:id", productController.deleteProducts);

// Insights
router.get("/insights/sales", productController.getSalesByCategory);
router.get("/insights/fast-moving", productController.getFastestMoving);
router.get("/insights/top-foods", productController.getTopFoods);
router.get("/insights/stock-report", productController.generateStockReport);

export default router;