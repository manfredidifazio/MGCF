import { Router } from "express";

import {
  addAccount,
  changeAccountStatus,
  editAccount,
  listAccounts,
  removeAccount,
} from "../controllers/accountController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", listAccounts);
router.post("/", addAccount);
router.put("/:id", editAccount);
router.patch("/:id/status", changeAccountStatus);
router.delete("/:id", removeAccount);

export default router;
