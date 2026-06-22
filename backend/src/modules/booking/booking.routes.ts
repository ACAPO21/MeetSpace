import { Router } from "express";
import * as bookingController from "./booking.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.post("/", authenticate, bookingController.create);
router.get("/mine", authenticate, bookingController.listMine);
router.delete("/:id", authenticate, bookingController.cancel);
router.get("/room/:roomId", authenticate, bookingController.roomAvailability);

export default router;