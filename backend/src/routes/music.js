import { Router } from "express";
import { searchMusic } from "../controllers/music.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/search", searchMusic);

export default router;
