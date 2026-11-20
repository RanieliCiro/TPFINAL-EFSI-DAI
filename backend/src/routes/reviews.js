import { Router } from "express";
import { getReviews, createReview, updateReview, deleteReview } from "../controllers/reviews.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

router.get("/", getReviews);
router.post("/", createReview);
router.patch("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
