import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '@/middleware/validation';
import { authMiddleware } from '@/middleware/auth';
import { uploadRateLimiter } from '@/middleware/rateLimiter';
import * as mediaController from '@/controllers/mediaController';

const router = Router();

// 获取页面媒体列表
router.get('/:pageId',
  validate([
    param('pageId').isUUID().withMessage('Invalid page ID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  mediaController.getMediaItems
);

// 上传媒体文件
router.post('/:pageId',
  uploadRateLimiter,
  validate([
    param('pageId').isUUID().withMessage('Invalid page ID'),
    body('caption').optional().isLength({ max: 500 }).trim(),
  ]),
  mediaController.uploadMiddleware,
  mediaController.uploadMedia
);

// 更新媒体信息
router.put('/:mediaId',
  validate([
    param('mediaId').isUUID().withMessage('Invalid media ID'),
    body('caption').optional().isLength({ max: 500 }).trim(),
  ]),
  mediaController.updateMedia
);

// 删除媒体文件
router.delete('/:mediaId',
  validate([
    param('mediaId').isUUID().withMessage('Invalid media ID'),
  ]),
  mediaController.deleteMedia
);

export default router;