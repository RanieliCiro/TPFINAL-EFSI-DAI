import { Router } from "express";
import { createReview, updateReview, deleteReview } from "../controllers/reviews.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.post("/", createReview);
router.patch("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
