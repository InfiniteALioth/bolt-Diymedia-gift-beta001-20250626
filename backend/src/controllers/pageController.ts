import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { MediaPage, MediaItem, ChatMessage, User } from '@/models';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { generateQRCode } from '@/utils/qrcode';
import { generateInternalCode } from '@/utils/helpers';

// Get page by ID (public)
export const getPageById = asyncHandler(async (req: Request, res: Response) => {
  const { pageId } = req.params;

  const page = await MediaPage.findByPk(pageId);
  if (!page) {
    throw createError('Page not found', 404);
  }

  // Check if page is active
  if (!page.isActive) {
    throw createError('Page is not active', 403);
  }

  // Check if page has expired
  if (page.expiresAt < new Date()) {
    throw createError('Page has expired', 410);
  }

  res.json({
    success: true,
    message: 'Page retrieved successfully',
    data: {
      page: {
        id: page.id,
        name: page.name,
        description: page.description,
        usageScenario: page.usageScenario,
        remainingDays: page.remainingDays,
        dbSizeLimit: page.dbSizeLimit,
        dbUsage: page.dbUsage,
        isActive: page.isActive,
        expiresAt: page.expiresAt,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Get page by internal code (public)
export const getPageByCode = asyncHandler(async (req: Request, res: Response) => {
  const { internalCode } = req.params;

  const page = await MediaPage.findOne({ where: { internalCode } });
  if (!page) {
    throw createError('Page not found', 404);
  }

  // Check if page is active
  if (!page.isActive) {
    throw createError('Page is not active', 403);
  }

  // Check if page has expired
  if (page.expiresAt < new Date()) {
    throw createError('Page has expired', 410);
  }

  res.json({
    success: true,
    message: 'Page retrieved successfully',
    data: {
      page: {
        id: page.id,
        name: page.name,
        description: page.description,
        usageScenario: page.usageScenario,
        remainingDays: page.remainingDays,
        dbSizeLimit: page.dbSizeLimit,
        dbUsage: page.dbUsage,
        isActive: page.isActive,
        expiresAt: page.expiresAt,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Get all pages (admin)
export const getPages = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const offset = (page - 1) * limit;

  let whereClause: any = {};
  
  if (search) {
    whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { purchaserName: { [Op.like]: `%${search}%` } },
        { purchaserEmail: { [Op.like]: `%${search}%` } },
        { internalCode: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  const { count, rows } = await MediaPage.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    message: 'Pages retrieved successfully',
    data: {
      pages: rows,
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

// Create new page (admin)
export const createPage = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    purchaserName,
    purchaserEmail,
    purchaserGender,
    usageScenario,
    dbSizeLimit,
    usageDuration,
  } = req.body;

  // Generate unique internal code
  const internalCode = await generateInternalCode();

  // Generate unique link
  const uniqueLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/page/${internalCode}`;

  // Generate QR code
  const qrCode = await generateQRCode(uniqueLink);

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + usageDuration);

  const page = await MediaPage.create({
    name,
    description,
    purchaserName,
    purchaserEmail,
    purchaserGender,
    usageScenario,
    uniqueLink,
    qrCode,
    internalCode,
    dbSizeLimit,
    dbUsage: 0,
    usageDuration,
    remainingDays: usageDuration,
    isActive: true,
    expiresAt,
  });

  logger.info(`Page created: ${page.name} (${page.id}) by admin ${req.admin.id}`);

  res.status(201).json({
    success: true,
    message: 'Page created successfully',
    data: { page },
    timestamp: new Date().toISOString(),
  });
});

// Update page (admin)
export const updatePage = asyncHandler(async (req: Request, res: Response) => {
  const { pageId } = req.params;
  const updates = req.body;

  const page = await MediaPage.findByPk(pageId);
  if (!page) {
    throw createError('Page not found', 404);
  }

  // If usage duration is updated, recalculate expiration
  if (updates.usageDuration) {
    const createdAt = new Date(page.createdAt);
    const newExpiresAt = new Date(createdAt);
    newExpiresAt.setDate(newExpiresAt.getDate() + updates.usageDuration);
    
    const now = new Date();
    const remainingDays = Math.max(0, Math.ceil((newExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    updates.expiresAt = newExpiresAt;
    updates.remainingDays = remainingDays;
  }

  await page.update(updates);

  logger.info(`Page updated: ${page.name} (${page.id}) by admin ${req.admin.id}`);

  res.json({
    success: true,
    message: 'Page updated successfully',
    data: { page },
    timestamp: new Date().toISOString(),
  });
});

// Delete page (admin)
export const deletePage = asyncHandler(async (req: Request, res: Response) => {
  const { pageId } = req.params;

  const page = await MediaPage.findByPk(pageId);
  if (!page) {
    throw createError('Page not found', 404);
  }

  // Delete associated media items and chat messages
  await MediaItem.destroy({ where: { pageId } });
  await ChatMessage.destroy({ where: { pageId } });

  await page.destroy();

  logger.info(`Page deleted: ${page.name} (${page.id}) by admin ${req.admin.id}`);

  res.json({
    success: true,
    message: 'Page deleted successfully',
    timestamp: new Date().toISOString(),
  });
});

// Get page statistics (admin)
export const getPageStats = asyncHandler(async (req: Request, res: Response) => {
  const { pageId } = req.params;

  const page = await MediaPage.findByPk(pageId);
  if (!page) {
    throw createError('Page not found', 404);
  }

  // Get media items count and total size
  const mediaItems = await MediaItem.findAll({
    where: { pageId, isActive: true },
    attributes: ['size', 'type'],
  });

  // Get messages count
  const messagesCount = await ChatMessage.count({
    where: { pageId, isDeleted: false },
  });

  // Get unique users count
  const uniqueUsers = await User.count({
    distinct: true,
    include: [
      {
        model: MediaItem,
        as: 'mediaItems',
        where: { pageId },
        required: false,
      },
      {
        model: ChatMessage,
        as: 'chatMessages',
        where: { pageId },
        required: false,
      },
    ],
  });

  // Calculate storage usage
  const totalSize = mediaItems.reduce((sum, item) => sum + item.size, 0);
  const storageUsedMB = Math.round(totalSize / (1024 * 1024));

  // Media type distribution
  const mediaTypeDistribution = mediaItems.reduce((acc: any, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const stats = {
    pageId,
    totalUsers: uniqueUsers,
    totalMedia: mediaItems.length,
    totalMessages: messagesCount,
    storageUsed: storageUsedMB,
    storageLimit: page.dbSizeLimit,
    storageUsagePercent: Math.round((storageUsedMB / page.dbSizeLimit) * 100),
    mediaTypeDistribution,
    remainingDays: page.remainingDays,
    isActive: page.isActive,
    expiresAt: page.expiresAt,
  };

  res.json({
    success: true,
    message: 'Page statistics retrieved successfully',
    data: { stats },
    timestamp: new Date().toISOString(),
  });
});