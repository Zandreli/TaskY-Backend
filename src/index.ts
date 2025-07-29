import express from "express";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import userRoutes from "./routes/users";
import { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();
const app: Express = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://task-y-frontend-4odj.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (_req, res) => {
  res.send("<h1>Welcome to Tasky</h1>");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.get("/test-db", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      take: 1,
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
