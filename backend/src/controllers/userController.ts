import { Request, Response } from 'express';
import { User, MediaItem, ChatMessage } from '@/models';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';

// 获取用户信息
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: [] }
  });

  if (!user) {
    throw createError('用户不存在', 404);
  }

  res.json({
    success: true,
    message: '用户信息获取成功',
    data: { user },
    timestamp: new Date().toISOString(),
  });
});

// 更新用户信息
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { username, avatar } = req.body;
  
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw createError('用户不存在', 404);
  }

  const updates: any = {};
  if (username) updates.username = username;
  if (avatar) updates.avatar = avatar;

  await user.update(updates);

  logger.info(`用户 ${user.id} 更新了个人信息`);

  res.json({
    success: true,
    message: '用户信息更新成功',
    data: { user },
    timestamp: new Date().toISOString(),
  });
});

// 获取用户统计信息
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const [mediaCount, messageCount] = await Promise.all([
    MediaItem.count({ where: { uploaderId: userId, isActive: true } }),
    ChatMessage.count({ where: { userId, isDeleted: false } })
  ]);

  const stats = {
    mediaCount,
    messageCount,
    joinDate: req.user.createdAt,
    lastActive: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: '用户统计信息获取成功',
    data: { stats },
    timestamp: new Date().toISOString(),
  });
});

// 获取用户的媒体列表
export const getUserMedia = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await MediaItem.findAndCountAll({
    where: { uploaderId: req.user.id, isActive: true },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: require('@/models').MediaPage,
        as: 'page',
        attributes: ['id', 'name']
      }
    ]
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    message: '用户媒体列表获取成功',
    data: {
      mediaItems: rows,
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