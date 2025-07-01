import { Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { generateUniqueFilename } from '@/utils/helpers';
import multer from 'multer';

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

// 单文件上传
export const uploadSingle = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  
  if (!file) {
    throw createError('请选择要上传的文件', 400);
  }

  try {
    // 生成唯一文件名
    const filename = generateUniqueFilename(file.originalname);
    
    // 这里应该上传到OSS，暂时使用Base64存储
    const base64Data = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64Data}`;

    const fileInfo = {
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: dataUrl,
    };

    logger.info(`文件上传成功: ${filename}`);

    res.json({
      success: true,
      message: '文件上传成功',
      data: { file: fileInfo },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('文件上传失败:', error);
    throw createError('文件上传失败', 500);
  }
});

// 多文件上传
export const uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    throw createError('请选择要上传的文件', 400);
  }

  const uploadedFiles = [];

  for (const file of files) {
    try {
      // 生成唯一文件名
      const filename = generateUniqueFilename(file.originalname);
      
      // 这里应该上传到OSS，暂时使用Base64存储
      const base64Data = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64Data}`;

      const fileInfo = {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: dataUrl,
      };

      uploadedFiles.push(fileInfo);

    } catch (error) {
      logger.error(`文件上传失败: ${file.originalname}`, error);
      throw createError(`文件 ${file.originalname} 上传失败`, 500);
    }
  }

  logger.info(`批量文件上传成功: ${uploadedFiles.length} 个文件`);

  res.json({
    success: true,
    message: `成功上传 ${uploadedFiles.length} 个文件`,
    data: { files: uploadedFiles },
    timestamp: new Date().toISOString(),
  });
});

// 导出multer中间件
export const uploadSingleMiddleware = upload.single('file');
export const uploadMultipleMiddleware = upload.array('files', 10);