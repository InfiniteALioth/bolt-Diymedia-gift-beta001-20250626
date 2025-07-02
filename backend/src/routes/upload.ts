import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { uploadRateLimiter } from '@/middleware/rateLimiter';
import * as uploadController from '@/controllers/uploadController';

const router = Router();

// 单文件上传
router.post('/single',
  uploadRateLimiter,
  uploadController.uploadSingleMiddleware,
  uploadController.uploadSingle
);

// 多文件上传
router.post('/multiple',
  uploadRateLimiter,
  uploadController.uploadMultipleMiddleware,
  uploadController.uploadMultiple
);

export default router;