import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, username, emailAddress, password } = req.body;

  if (!firstName || !lastName || !username || !emailAddress || !password) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ emailAddress: emailAddress }, { username: username }],
      },
    });

    if (existingUser) {
      res
        .status(409)
        .json({ message: "User with this email or username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        emailAddress,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User registered successfully. Please log in.",
      userId: user.id,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { loginIdentifier, password } = req.body;

  if (!loginIdentifier || !password) {
    res.status(400).json({ message: "Login Credentials required." });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ emailAddress: loginIdentifier }, { username: loginIdentifier }],
      },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET as string, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.username,
        emailAddress: user.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  res.status(200).json({ message: "Logout successful." });
};

export const updatePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = (req as any).userId;

  if (!currentPassword || !newPassword) {
    res
      .status(400)
      .json({
        message:
          "Current and new passwords are required to complete the request.",
      });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      res.status(401).json({ message: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
