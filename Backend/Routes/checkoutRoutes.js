const express = require("express");
const router = express.Router();
const { checkout } = require("../Controllers/checkoutController");

router.post("/", checkout);

module.exports = router;