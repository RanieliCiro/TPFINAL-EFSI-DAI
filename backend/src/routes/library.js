import { Router } from "express";
import { getLibrary, addToLibrary, updateLibraryItem, removeFromLibrary } from "../controllers/library.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/", getLibrary);
router.post("/", addToLibrary);
router.patch("/:id", updateLibraryItem);
router.delete("/:id", removeFromLibrary);

export default router;
