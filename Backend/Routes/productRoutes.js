const express = require("express");
const router = express.Router();
const productController = require("../Controllers/productController");
const upload = require("../config/cloudinaryConfig");

// CRUD
router.get("/", productController.getAllProducts);
router.post("/", upload.single("image"), productController.addProducts);
router.put("/:id", upload.single("image"), productController.updateProducts);
router.delete("/:id", productController.deleteProducts);

// Insights
router.get("/insights/sales", productController.getSalesByCategory);
router.get("/insights/fast-moving", productController.getFastestMoving);
router.get("/insights/top-foods", productController.getTopFoods);
router.get("/insights/stock-report", productController.generateStockReport);

module.exports = router;