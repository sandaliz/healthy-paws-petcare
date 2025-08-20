const express = require("express");
const router = express.Router();
//Insert Model
const CareCustomer = require("../Model/CareModel");
//Insert Care Controller
const CareControllers = require("../Controllers/CareControllers");

router.get("/",CareControllers.getAllDetails);
router.post("/",CareControllers.addDetails);
router.get("/:id",CareControllers.getById);
router.put("/:id",CareControllers.updateUser);
router.delete("/:id",CareControllers.deleteUser);

//export
module.exports = router;