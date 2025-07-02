import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '@/middleware/validation';
import { authMiddleware } from '@/middleware/auth';
import * as chatController from '@/controllers/chatController';

const router = Router();

// 获取聊天消息
router.get('/:pageId',
  validate([
    param('pageId').isUUID().withMessage('Invalid page ID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  chatController.getChatMessages
);

// 发送消息
router.post('/:pageId',
  validate([
    param('pageId').isUUID().withMessage('Invalid page ID'),
    body('content').isLength({ min: 1, max: 1000 }).trim().escape(),
  ]),
  chatController.sendMessage
);

// 删除消息
router.delete('/:messageId',
  validate([
    param('messageId').isUUID().withMessage('Invalid message ID'),
  ]),
  chatController.deleteMessage
);

export default router;