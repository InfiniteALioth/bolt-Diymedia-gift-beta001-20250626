import { Request, Response } from 'express';
import { Admin, User, MediaPage, MediaItem, ChatMessage } from '@/models';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import bcrypt from 'bcryptjs';

// 获取全局统计信息
export const getGlobalStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalPages,
    totalUsers,
    totalMedia,
    totalMessages,
    activePages
  ] = await Promise.all([
    MediaPage.count(),
    User.count(),
    MediaItem.count({ where: { isActive: true } }),
    ChatMessage.count({ where: { isDeleted: false } }),
    MediaPage.count({ where: { isActive: true } })
  ]);

  // 获取今日新增数据
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [newUsersToday, newMediaToday] = await Promise.all([
    User.count({ where: { createdAt: { $gte: today } } as any }),
    MediaItem.count({ where: { createdAt: { $gte: today } } as any })
  ]);

  const stats = {
    totalPages,
    totalUsers,
    totalMedia,
    totalMessages,
    activePages,
    newUsersToday,
    newMediaToday,
    inactivePages: totalPages - activePages,
  };

  res.json({
    success: true,
    message: '全局统计信息获取成功',
    data: { stats },
    timestamp: new Date().toISOString(),
  });
});

// 获取所有用户列表
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const offset = (page - 1) * limit;

  let whereClause: any = {};
  
  if (search) {
    whereClause = {
      $or: [
        { username: { $like: `%${search}%` } },
        { email: { $like: `%${search}%` } },
        { deviceId: { $like: `%${search}%` } },
      ],
    } as any;
  }

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: [] }
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    message: '用户列表获取成功',
    data: {
      users: rows,
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

// 获取所有管理员列表
export const getAdmins = asyncHandler(async (req: Request, res: Response) => {
  const admins = await Admin.findAll({
    order: [['level', 'ASC'], ['createdAt', 'DESC']],
    attributes: { exclude: ['passwordHash'] }
  });

  res.json({
    success: true,
    message: '管理员列表获取成功',
    data: { admins },
    timestamp: new Date().toISOString(),
  });
});

// 创建新管理员
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, level } = req.body;

  // 检查权限：只有超级管理员可以创建管理员
  if (req.admin.level !== 1) {
    throw createError('权限不足', 403);
  }

  // 检查用户名和邮箱是否已存在
  const existingAdmin = await Admin.findOne({
    where: { $or: [{ username }, { email }] } as any
  });

  if (existingAdmin) {
    throw createError('用户名或邮箱已存在', 409);
  }

  // 加密密码
  const passwordHash = await bcrypt.hash(password, 12);

  // 设置默认权限
  const permissions = {
    canCreateAdmins: level === 1,
    canManagePages: level <= 2,
    canManageUsers: level <= 2,
    canManageMedia: true,
    canViewAnalytics: level <= 2,
  };

  const admin = await Admin.create({
    username,
    email,
    passwordHash,
    level,
    permissions,
    isActive: true,
    createdBy: req.admin.id,
  });

  logger.info(`管理员创建成功: ${username} by ${req.admin.username}`);

  res.status(201).json({
    success: true,
    message: '管理员创建成功',
    data: {
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        level: admin.level,
        permissions: admin.permissions,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      }
    },
    timestamp: new Date().toISOString(),
  });
});

// 更新管理员信息
export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const updates = req.body;

  // 检查权限
  if (req.admin.level !== 1 && adminId !== req.admin.id) {
    throw createError('权限不足', 403);
  }

  const admin = await Admin.findByPk(adminId);
  if (!admin) {
    throw createError('管理员不存在', 404);
  }

  // 如果更新密码，需要加密
  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 12);
    delete updates.password;
  }

  await admin.update(updates);

  logger.info(`管理员信息更新: ${admin.username} by ${req.admin.username}`);

  res.json({
    success: true,
    message: '管理员信息更新成功',
    data: {
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        level: admin.level,
        permissions: admin.permissions,
        isActive: admin.isActive,
        updatedAt: admin.updatedAt,
      }
    },
    timestamp: new Date().toISOString(),
  });
});

// 删除管理员
export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;

  // 检查权限：只有超级管理员可以删除管理员
  if (req.admin.level !== 1) {
    throw createError('权限不足', 403);
  }

  // 不能删除自己
  if (adminId === req.admin.id) {
    throw createError('不能删除自己的账户', 400);
  }

  const admin = await Admin.findByPk(adminId);
  if (!admin) {
    throw createError('管理员不存在', 404);
  }

  await admin.destroy();

  logger.info(`管理员删除: ${admin.username} by ${req.admin.username}`);

  res.json({
    success: true,
    message: '管理员删除成功',
    timestamp: new Date().toISOString(),
  });
});