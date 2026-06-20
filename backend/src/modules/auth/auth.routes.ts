import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.me); // ← protégée

export default router;