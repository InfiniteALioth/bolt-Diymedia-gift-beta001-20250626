import { Router } from 'express';
import { body, query } from 'express-validator';
import { validate } from '@/middleware/validation';
import { authMiddleware } from '@/middleware/auth';
import * as userController from '@/controllers/userController';

const router = Router();

// 获取用户信息
router.get('/profile', userController.getUserProfile);

// 更新用户信息
router.put('/profile',
  validate([
    body('username').optional().isLength({ min: 1, max: 50 }).trim().escape(),
    body('avatar').optional().isURL(),
  ]),
  userController.updateUserProfile
);

// 获取用户统计信息
router.get('/stats', userController.getUserStats);

// 获取用户的媒体列表
router.get('/media',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  userController.getUserMedia
);

export default router;