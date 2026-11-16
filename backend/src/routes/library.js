import { Router } from "express";
import { getLibrary } from "../controllers/library.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/", getLibrary);

export default router;
