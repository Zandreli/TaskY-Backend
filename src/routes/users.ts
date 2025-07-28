import { Router } from "express";
import {
    getUserProfile,
    updateUserProfile,
    uploadUserAvatar,
} from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";
import { uploadAvatar } from "../middleware/upload";

const router = Router();

router.use(authenticateToken);

router.get('/', getUserProfile);
router.patch('/', updateUserProfile);
router.post('/avatar', uploadAvatar.single('avatar'), uploadUserAvatar);

export default router;
