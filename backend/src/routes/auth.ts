import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '@/middleware/validation';
import { authRateLimiter } from '@/middleware/rateLimiter';
import * as authController from '@/controllers/authController';

const router = Router();

// User registration/login
router.post('/user/register',
  authRateLimiter,
  validate([
    body('username').isLength({ min: 1, max: 50 }).trim().escape(),
    body('deviceId').isLength({ min: 1, max: 100 }).trim(),
    body('email').optional().isEmail().normalizeEmail(),
  ]),
  authController.registerUser
);

router.post('/user/login',
  authRateLimiter,
  validate([
    body('deviceId').isLength({ min: 1, max: 100 }).trim(),
    body('username').optional().isLength({ min: 1, max: 50 }).trim().escape(),
  ]),
  authController.loginUser
);

// Admin authentication
router.post('/admin/login',
  authRateLimiter,
  validate([
    body('username').isLength({ min: 3, max: 50 }).trim().escape(),
    body('password').isLength({ min: 6, max: 100 }),
  ]),
  authController.loginAdmin
);

router.post('/admin/register',
  authRateLimiter,
  validate([
    body('username').isLength({ min: 3, max: 50 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6, max: 100 }),
    body('level').isInt({ min: 1, max: 3 }),
  ]),
  authController.registerAdmin
);

// Token refresh
router.post('/refresh',
  validate([
    body('refreshToken').notEmpty(),
  ]),
  authController.refreshToken
);

// Logout
router.post('/logout', authController.logout);

export default router;