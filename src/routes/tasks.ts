import { Router } from "express";
import {
  createTask,
  getActiveTasks,
  getTaskById,
  updateTask,
  deleteTask,
  restoreTasks,
  completeTasks,
  incompleteTask,
  getCompletedTasks,
  getDeletedTasks,
} from "../controllers/taskController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.post("/", createTask);
router.get("/", getActiveTasks);
router.get("/:id", getTaskById);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/restore/:id", restoreTasks);
router.patch("/complete/:id", completeTasks);
router.patch("/incomplete/:id", incompleteTask);
router.get("/completed/:id", getCompletedTasks);
router.get("/deleted/:id", getDeletedTasks);

export default router;
