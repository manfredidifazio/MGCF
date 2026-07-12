import { Router } from "express";

import {
  editEmail,
  editPassword,
  editProfile,
  forgotPassword,
  login,
  me,
  register,
  removeOwnAccount,
  resetUserPassword,
  verifyEmail,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetUserPassword);

router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, editProfile);
router.put("/email", requireAuth, editEmail);
router.put("/password", requireAuth, editPassword);
router.delete("/me", requireAuth, removeOwnAccount);

export default router;
