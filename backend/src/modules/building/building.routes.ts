import { Router } from "express";
import * as buildingController from "./building.controller";
import { authenticate, requireRole } from "../../middleware/auth.middleware";

const router = Router();
router.get("/", authenticate, buildingController.list);
router.post("/", authenticate, requireRole("ADMIN"), buildingController.create);

export default router;