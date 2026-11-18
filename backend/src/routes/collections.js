import { Router } from "express";
import {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  addItem,
  removeItem,
} from "../controllers/collections.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/", getCollections);
router.post("/", createCollection);
router.get("/:id", getCollection);
router.patch("/:id", updateCollection);
router.delete("/:id", deleteCollection);
router.post("/:id/items", addItem);
router.delete("/:id/items/:itemId", removeItem);

export default router;
