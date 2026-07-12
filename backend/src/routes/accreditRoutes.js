import { Router } from "express";

import { addAccredit, editAccredit, listAccredits, removeAccredit } from "../controllers/accreditController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);
router.get("/", listAccredits);
router.post("/", addAccredit);
router.put("/:id", editAccredit);
router.delete("/:id", removeAccredit);

export default router;
