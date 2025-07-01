import { Request, Response } from 'express';
import { MediaItem, MediaPage } from '@/models';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { generateUniqueFilename } from '@/utils/helpers';
import multer from 'multer';
import path from 'path';

// 配置文件上传
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// 获取页面媒体列表
export const getMediaItems = asyncHandler(async (req: Request, res: Response) => {
  const { pageId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  // 验证页面是否存在
  const mediaPage = await MediaPage.findByPk(pageId);
  if (!mediaPage) {
    throw createError('页面不存在', 404);
  }

  const { count, rows } = await MediaItem.findAndCountAll({
    where: { pageId, isActive: true },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: require('@/models').User,
        as: 'uploader',
        attributes: ['id', 'username']
      }
    ]
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    message: '媒体列表获取成功',
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

// 上传媒体文件
export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const { pageId } = req.params;
  const { caption } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw createError('请选择要上传的文件', 400);
  }

  // 验证页面是否存在且活跃
  const mediaPage = await MediaPage.findByPk(pageId);
  if (!mediaPage) {
    throw createError('页面不存在', 404);
  }

  if (!mediaPage.isActive) {
    throw createError('页面已停用', 403);
  }

  const uploadedItems: MediaItem[] = [];

  for (const file of files) {
    try {
      // 生成唯一文件名
      const filename = generateUniqueFilename(file.originalname);
      
      // 确定媒体类型
      let type: 'image' | 'video' | 'audio' = 'image';
      if (file.mimetype.startsWith('video/')) type = 'video';
      else if (file.mimetype.startsWith('audio/')) type = 'audio';

      // 这里应该上传到OSS，暂时使用Base64存储
      const base64Data = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64Data}`;

      // 创建媒体记录
      const mediaItem = await MediaItem.create({
        pageId,
        uploaderId: req.user.id,
        type,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: dataUrl,
        thumbnailUrl: type === 'image' ? dataUrl : undefined,
        caption: caption || '',
        isActive: true,
      });

      uploadedItems.push(mediaItem);

      // 更新页面存储使用量
      const sizeInMB = Math.ceil(file.size / (1024 * 1024));
      await mediaPage.increment('dbUsage', { by: sizeInMB });

    } catch (error) {
      logger.error(`文件上传失败: ${file.originalname}`, error);
      throw createError(`文件 ${file.originalname} 上传失败`, 500);
    }
  }

  logger.info(`用户 ${req.user.username} 上传了 ${uploadedItems.length} 个媒体文件到页面 ${pageId}`);

  res.status(201).json({
    success: true,
    message: `成功上传 ${uploadedItems.length} 个文件`,
    data: { mediaItems: uploadedItems },
    timestamp: new Date().toISOString(),
  });
});

// 删除媒体文件
export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const { mediaId } = req.params;

  const mediaItem = await MediaItem.findByPk(mediaId);
  if (!mediaItem) {
    throw createError('媒体文件不存在', 404);
  }

  // 检查权限：只有上传者或管理员可以删除
  if (mediaItem.uploaderId !== req.user.id && !req.admin) {
    throw createError('无权限删除此文件', 403);
  }

  // 更新页面存储使用量
  const mediaPage = await MediaPage.findByPk(mediaItem.pageId);
  if (mediaPage) {
    const sizeInMB = Math.ceil(mediaItem.size / (1024 * 1024));
    await mediaPage.decrement('dbUsage', { by: sizeInMB });
  }

  await mediaItem.destroy();

  logger.info(`媒体文件已删除: ${mediaItem.filename} by ${req.user?.username || req.admin?.username}`);

  res.json({
    success: true,
    message: '媒体文件删除成功',
    timestamp: new Date().toISOString(),
  });
});

// 更新媒体信息
export const updateMedia = asyncHandler(async (req: Request, res: Response) => {
  const { mediaId } = req.params;
  const { caption } = req.body;

  const mediaItem = await MediaItem.findByPk(mediaId);
  if (!mediaItem) {
    throw createError('媒体文件不存在', 404);
  }

  // 检查权限：只有上传者可以编辑
  if (mediaItem.uploaderId !== req.user.id) {
    throw createError('无权限编辑此文件', 403);
  }

  await mediaItem.update({ caption });

  res.json({
    success: true,
    message: '媒体信息更新成功',
    data: { mediaItem },
    timestamp: new Date().toISOString(),
  });
});

// 导出multer中间件
export const uploadMiddleware = upload.array('files', 10);