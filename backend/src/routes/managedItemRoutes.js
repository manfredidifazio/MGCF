import { Router } from "express";

import {
  addManagedItem,
  changeManagedItemStatus,
  editManagedItem,
  listManagedItems,
  removeManagedItem,
  reorderManagedItemsHandler,
} from "../controllers/managedItemController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.get("/:type", listManagedItems);
router.post("/:type", addManagedItem);
router.patch("/:type/reorder", reorderManagedItemsHandler);
router.put("/:type/:id", editManagedItem);
router.patch("/:type/:id/status", changeManagedItemStatus);
router.delete("/:type/:id", removeManagedItem);

export default router;
