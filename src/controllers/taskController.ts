import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: string;
}

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found." });
    return;
  }

  if (!title || !description) {
    res.status(400).json({ message: "Title and description are required" });
    return;
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId: userId,
        DateCreated: new Date(),
      },
    });
    res.status(201).json({ message: "Task created successfully.", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found." });
    return;
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }
    res.status(200).json({ task });
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found." });
    return;
  }

  if (!title || !description) {
    res.status(400).json({ message: "Title and description are required." });
    return;
  }

  try {
    const updatedTask = await prisma.task.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        title,
        description,
        lastUpdated: new Date(),
      },
    });

    if (updatedTask.count === 0) {
      res.status(404).json({ message: "Task not found." });
      return;
    }
    res.status(200).json({ message: "Task updated successfully." });
    return;
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found." });
    return;
  }

  try {
    const deletedTask = await prisma.task.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isDeleted: true,
        lastUpdated: new Date(),
      },
    });

    if (deletedTask.count === 0) {
      res.status(404).json({ message: "Task not found." });
      return;
    }
    res.status(200).json({ message: "Task moved to trash successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const restoreTasks = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found." });
    return;
  }

  try {
    const restoredTask = await prisma.task.updateMany({
      where: {
        id,
        userId,
        isDeleted: true,
      },
      data: {
        isDeleted: false,
        lastUpdated: new Date(),
      },
    });

    if (restoredTask.count === 0) {
      res.status(404).json({ message: "Task not found." });
      return;
    }
    res.status(200).json({ message: "Task restored successfully." });
  } catch (error) {
    console.error("Error restoring task:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
export const getActiveTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found." });
    return;
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: userId,
        isCompleted: false,
        isDeleted: false,
      },
      orderBy: { DateCreated: "desc" },
    });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error in fetching active tasks:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

export const completeTasks = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID not found." });
    return;
  }

  try {
    const CompletedTasks = await prisma.task.updateMany({
      where: {
        id,
        userId,
        isCompleted: false,
      },
      data: {
        isCompleted: true,
        lastUpdated: new Date(),
      },
    });

    if (CompletedTasks.count === 0) {
      res.status(404).json({ message: "Tasks not found." });
    }
    res.status(200).json({ message: "Task marked as complete." });
  } catch (error) {
    console.error("Error marking task as complete:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

export const incompleteTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID no found" });
    return;
  }

  try {
    const incompleteTask = await prisma.task.updateMany({
      where: {
        id,
        userId,
        isCompleted: true,
      },
      data: {
        isCompleted: false,
        lastUpdated: new Date(),
      },
    });

    if (incompleteTask.count === 0) {
      res.status(404).json({ message: "Task not found." });
      return;
    }
    res.status(200).json({ message: "Task marked as incomplete." });
  } catch (error) {
    console.error("Error marking task as incomplete:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

export const getCompletedTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID no found" });
    return;
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isCompleted: true,
        isDeleted: false,
      },
      orderBy: { DateCreated: "desc" },
    });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching completed tasks:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

export const getDeletedTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: User ID no found" });
    return;
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isDeleted: true,
      },
      orderBy: { DateCreated: "desc" },
    });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching deleted tasks:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};
