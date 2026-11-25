import { Router } from "express";
import { register, login, me } from "../controllers/auth.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verificarToken, me);

export default router;
