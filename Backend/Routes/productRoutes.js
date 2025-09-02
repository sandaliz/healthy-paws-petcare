const express = require("express");
const router = express.Router();
const productController = require("../Controllers/productController");
const upload = require("../config/cloudinaryConfig");

router.get("/", productController.getAllProducts);
router.post("/", upload.single("image"), productController.addProducts);
router.put("/:id", upload.single("image"), productController.updateProducts);
router.delete("/:id", productController.deleteProducts);

module.exports = router;