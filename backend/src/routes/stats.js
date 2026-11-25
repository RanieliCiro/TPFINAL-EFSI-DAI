import { Router } from "express";
import { getStats } from "../controllers/stats.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/", getStats);

export default router;
