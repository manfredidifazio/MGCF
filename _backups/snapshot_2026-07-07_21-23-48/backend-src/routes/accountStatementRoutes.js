import { Router } from "express";

import {
  addAccountStatement,
  editAccountStatement,
  listAccountStatements,
  removeAccountStatement,
} from "../controllers/accountStatementController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);
router.get("/", listAccountStatements);
router.post("/", addAccountStatement);
router.put("/:id", editAccountStatement);
router.delete("/:id", removeAccountStatement);

export default router;
