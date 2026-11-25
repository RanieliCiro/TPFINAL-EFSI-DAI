import { Router } from "express";
import { getActivity } from "../controllers/activity.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/", getActivity);

export default router;
