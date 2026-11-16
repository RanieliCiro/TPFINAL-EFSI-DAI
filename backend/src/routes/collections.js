import { Router } from "express";
import { getCollections } from "../controllers/collections.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/", getCollections);

export default router;
