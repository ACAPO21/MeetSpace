import { Router } from "express";
import * as buildingController from "./building.controller";
import { authenticate, requireRole } from "../../middleware/auth.middleware";

const router = Router();
router.get("/", authenticate, buildingController.list);
router.post("/", authenticate, requireRole("ADMIN"), buildingController.create);
router.put("/:id", authenticate, requireRole("ADMIN"), buildingController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), buildingController.remove);

export default router;