import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '@/middleware/validation';
import { adminAuthMiddleware, requirePermission } from '@/middleware/auth';
import * as adminController from '@/controllers/adminController';

const router = Router();

// 获取全局统计信息
router.get('/stats',
  adminAuthMiddleware,
  requirePermission('canViewAnalytics'),
  adminController.getGlobalStats
);

// 获取所有用户列表
router.get('/users',
  adminAuthMiddleware,
  requirePermission('canManageUsers'),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isLength({ max: 100 }).trim(),
  ]),
  adminController.getUsers
);

// 获取所有管理员列表
router.get('/admins',
  adminAuthMiddleware,
  requirePermission('canCreateAdmins'),
  adminController.getAdmins
);

// 创建新管理员
router.post('/admins',
  adminAuthMiddleware,
  requirePermission('canCreateAdmins'),
  validate([
    body('username').isLength({ min: 3, max: 50 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6, max: 100 }),
    body('level').isInt({ min: 1, max: 3 }),
  ]),
  adminController.createAdmin
);

// 更新管理员信息
router.put('/admins/:adminId',
  adminAuthMiddleware,
  validate([
    param('adminId').isUUID(),
    body('username').optional().isLength({ min: 3, max: 50 }).trim().escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6, max: 100 }),
    body('level').optional().isInt({ min: 1, max: 3 }),
    body('isActive').optional().isBoolean(),
  ]),
  adminController.updateAdmin
);

// 删除管理员
router.delete('/admins/:adminId',
  adminAuthMiddleware,
  requirePermission('canCreateAdmins'),
  validate([
    param('adminId').isUUID(),
  ]),
  adminController.deleteAdmin
);

export default router;