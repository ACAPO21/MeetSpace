import { Router } from "express";
import * as bookingController from "./booking.controller";
import { authenticate, requireRole } from "../../middleware/auth.middleware";

const router = Router();
router.post("/", authenticate, bookingController.create);
router.get("/", authenticate, requireRole("ADMIN"), bookingController.listAll); // US7 : admin voit tout
router.get("/mine", authenticate, bookingController.listMine);
router.get("/room/:roomId", authenticate, bookingController.roomAvailability);
router.delete("/:id", authenticate, bookingController.cancel);

export default router;