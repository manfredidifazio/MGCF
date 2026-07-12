import { Router } from "express";

import { adminEditUser, adminListUsers, adminRemoveUser } from "../controllers/adminUserController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.get("/users", adminListUsers);
router.put("/users/:id", adminEditUser);
router.delete("/users/:id", adminRemoveUser);

export default router;
