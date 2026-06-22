import { Router } from "express";
import * as userController from "./user.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.get("/", authenticate, userController.list);

export default router;