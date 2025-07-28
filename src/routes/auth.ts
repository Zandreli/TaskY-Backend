import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updatePassword,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.patch("/password", authenticateToken, updatePassword);

export default router;
