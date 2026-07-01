import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import buildingRoutes from "./modules/building/building.routes";
import roomRoutes from "./modules/room/room.routes";
import bookingRoutes from "./modules/booking/booking.routes";
import userRoutes from "./modules/user/user.routes";

const app = express();
app.use(helmet());

// CORS configuré explicitement : on n'autorise que l'origine du front-end
// (paramétrable par variable d'environnement), les méthodes réellement
// utilisées par l'API, et les en-têtes nécessaires (dont Authorization
// pour le jeton JWT). L'authentification passe par un en-tête Bearer,
// donc aucun cookie n'est échangé (credentials inutiles).
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/buildings", buildingRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

export default app;