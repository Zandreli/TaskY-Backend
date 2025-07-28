import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import path from 'path';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    userId?: string;
}

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized: User ID not found.'});
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                emailAddress: true,
                avatar: true,
                dateJoined: true,
                lastUpdate: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: 'User not found.'});
            return;
        }
        if (user.avatar) {
            user.avatar = '/uploads/avatars/${user.avatar}';
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({message: 'Something went wrong. Please try again.'});
    }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
    const { firstName, lastName, username, emailAddress } = req.body;
    const userId = req.userId;

    if  (!userId) {
        res.status(401).json({ message: 'Unauthorized: User ID not found.'});
        return;
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                username: username || undefined,
                emailAddress: emailAddress || undefined,
                lastUpdate: new Date(),
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                emailAddress: true,
                avatar: true,
                dateJoined: true,
                lastUpdate: true,
            },
        });

        if (updatedUser.avatar) {
            updatedUser.avatar = `/uploads/avatars/${updatedUser.avatar}`;
        }
        res.status(200).json({ message: 'Profile updated successfully.', user: updatedUser});
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again.'});
    }
};

export const uploadUserAvatar = async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    if  (!userId) {
        res.status(401).json({ message: 'Unauthorized: User ID not found.'});
        return;
    }
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded.' });
        return;
    }

    try {
        const avatarPath = path.basename(req.file.path);

        const updatedUser = await prisma.user.update({
            where:  { id: userId },
            data: { avatar: avatarPath, lastUpdate: new Date() },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                emailAddress: true,
                avatar: true,
                dateJoined: true,
                lastUpdate: true,
            },
        });

        if (updatedUser.avatar) {
            updatedUser.avatar = `/uploads/avatars/${updatedUser.avatar}`;
        }
        res.status(200).json({ message: 'Avatar uploaded successfully.', user: updatedUser });
    } catch (error) {
        console.error('Error uploading user avatar:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again.'});
    }
};