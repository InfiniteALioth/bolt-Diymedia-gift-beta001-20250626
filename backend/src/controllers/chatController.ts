import { Request, Response } from 'express';
import { ChatMessage, MediaPage, User } from '@/models';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';

// 获取聊天消息
export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const { pageId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = (page - 1) * limit;

  // 验证页面是否存在
  const mediaPage = await MediaPage.findByPk(pageId);
  if (!mediaPage) {
    throw createError('页面不存在', 404);
  }

  const { count, rows } = await ChatMessage.findAndCountAll({
    where: { pageId, isDeleted: false },
    limit,
    offset,
    order: [['createdAt', 'ASC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }
    ]
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    message: '聊天消息获取成功',
    data: {
      messages: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// 发送消息
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { pageId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw createError('消息内容不能为空', 400);
  }

  if (content.length > 1000) {
    throw createError('消息内容过长', 400);
  }

  // 验证页面是否存在且活跃
  const mediaPage = await MediaPage.findByPk(pageId);
  if (!mediaPage) {
    throw createError('页面不存在', 404);
  }

  if (!mediaPage.isActive) {
    throw createError('页面已停用', 403);
  }

  // 创建消息
  const message = await ChatMessage.create({
    pageId,
    userId: req.user.id,
    content: content.trim(),
    type: 'text',
    isDeleted: false,
  });

  // 获取完整的消息信息（包含用户信息）
  const fullMessage = await ChatMessage.findByPk(message.id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }
    ]
  });

  logger.info(`用户 ${req.user.username} 在页面 ${pageId} 发送了消息`);

  res.status(201).json({
    success: true,
    message: '消息发送成功',
    data: { message: fullMessage },
    timestamp: new Date().toISOString(),
  });
});

// 删除消息
export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;

  const message = await ChatMessage.findByPk(messageId);
  if (!message) {
    throw createError('消息不存在', 404);
  }

  // 检查权限：只有发送者或管理员可以删除
  if (message.userId !== req.user.id && !req.admin) {
    throw createError('无权限删除此消息', 403);
  }

  await message.update({ isDeleted: true });

  logger.info(`消息已删除: ${messageId} by ${req.user?.username || req.admin?.username}`);

  res.json({
    success: true,
    message: '消息删除成功',
    timestamp: new Date().toISOString(),
  });
});