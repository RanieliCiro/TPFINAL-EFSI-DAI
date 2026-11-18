import { Router } from "express";
import { searchMusic, getSong } from "../controllers/music.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/search", searchMusic);
router.get("/:id", getSong);

export default router;
