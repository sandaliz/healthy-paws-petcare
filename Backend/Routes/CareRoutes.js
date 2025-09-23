import express from "express";
import CareCustomer from "../Model/CareModel.js";
import * as CareControllers from "../Controllers/CareControllers.js";

const router = express.Router();

router.get("/", CareControllers.getAllDetails);
router.post("/", CareControllers.addDetails);
router.get("/:id", CareControllers.getById);
router.put("/:id", CareControllers.updateUser);
router.delete("/:id", CareControllers.deleteUser);

router.put("/:id/status", CareControllers.updateStatus);
router.get("/status/:status", CareControllers.getByStatus);

export default router;