import express from "express";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import userRoutes from "./routes/users";
import { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
