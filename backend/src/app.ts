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
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/buildings", buildingRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

export default app;