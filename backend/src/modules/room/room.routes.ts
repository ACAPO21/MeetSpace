import { Router } from "express";
import * as roomController from "./room.controller";
import { authenticate, requireRole } from "../../middleware/auth.middleware";

const router = Router();
router.get("/", authenticate, roomController.list);
router.post("/", authenticate, requireRole("ADMIN"), roomController.create);
router.put("/:id", authenticate, requireRole("ADMIN"), roomController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), roomController.remove);

export default router;