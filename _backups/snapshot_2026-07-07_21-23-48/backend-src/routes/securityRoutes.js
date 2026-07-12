import { Router } from "express";

import {
  changePassword,
  getSecurity,
  saveSecurity,
} from "../controllers/securityController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getSecurity);
router.put("/", saveSecurity);
router.put("/password", changePassword);

export default router;
