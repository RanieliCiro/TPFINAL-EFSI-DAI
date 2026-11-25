import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profile.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/", getProfile);
router.patch("/", updateProfile);

export default router;
