import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import libraryRoutes from "./routes/library.js";
import activityRoutes from "./routes/activity.js";
import statsRoutes from "./routes/stats.js";
import collectionsRoutes from "./routes/collections.js";
import musicRoutes from "./routes/music.js";
import reviewsRoutes from "./routes/reviews.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/collections", collectionsRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/reviews", reviewsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
