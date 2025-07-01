import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '@/middleware/validation';
import { authMiddleware, adminAuthMiddleware, requirePermission } from '@/middleware/auth';
import * as pageController from '@/controllers/pageController';

const router = Router();

// Public routes
router.get('/:pageId', 
  validate([
    param('pageId').isUUID().withMessage('Invalid page ID'),
  ]),
  pageController.getPageById
);

router.get('/code/:internalCode',
  validate([
    param('internalCode').isLength({ min: 1, max: 20 }).trim(),
  ]),
  pageController.getPageByCode
);

// Protected routes (require authentication)
router.get('/',
  authMiddleware,
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isLength({ max: 100 }).trim(),
  ]),
  pageController.getPages
);

// Admin routes
router.post('/',
  adminAuthMiddleware,
  requirePermission('canManagePages'),
  validate([
    body('name').isLength({ min: 1, max: 100 }).trim().escape(),
    body('purchaserName').isLength({ min: 1, max: 50 }).trim().escape(),
    body('purchaserEmail').isEmail().normalizeEmail(),
    body('purchaserGender').isIn(['male', 'female', 'other']),
    body('usageScenario').isLength({ min: 1, max: 100 }).trim().escape(),
    body('dbSizeLimit').isInt({ min: 100, max: 10240 }),
    body('usageDuration').isInt({ min: 1, max: 365 }),
    body('description').optional().isLength({ max: 500 }).trim(),
  ]),
  pageController.createPage
);

router.put('/:pageId',
  adminAuthMiddleware,
  requirePermission('canManagePages'),
  validate([
    param('pageId').isUUID(),
    body('name').optional().isLength({ min: 1, max: 100 }).trim().escape(),
    body('purchaserName').optional().isLength({ min: 1, max: 50 }).trim().escape(),
    body('purchaserEmail').optional().isEmail().normalizeEmail(),
    body('purchaserGender').optional().isIn(['male', 'female', 'other']),
    body('usageScenario').optional().isLength({ min: 1, max: 100 }).trim().escape(),
    body('dbSizeLimit').optional().isInt({ min: 100, max: 10240 }),
    body('usageDuration').optional().isInt({ min: 1, max: 365 }),
    body('isActive').optional().isBoolean(),
    body('description').optional().isLength({ max: 500 }).trim(),
  ]),
  pageController.updatePage
);

router.delete('/:pageId',
  adminAuthMiddleware,
  requirePermission('canManagePages'),
  validate([
    param('pageId').isUUID(),
  ]),
  pageController.deletePage
);

router.get('/:pageId/stats',
  adminAuthMiddleware,
  requirePermission('canViewAnalytics'),
  validate([
    param('pageId').isUUID(),
  ]),
  pageController.getPageStats
);

export default router;