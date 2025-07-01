import { MediaPage } from '@/models';

export const generateInternalCode = async (): Promise<string> => {
  const prefix = 'PAGE';
  let code: string;
  let exists = true;

  while (exists) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    code = `${prefix}${timestamp}${random}`;
    
    const existingPage = await MediaPage.findOne({ where: { internalCode: code } });
    exists = !!existingPage;
  }

  return code!;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculateRemainingDays = (expiresAt: Date): number => {
  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const isValidFileType = (mimeType: string): boolean => {
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
    'audio/ogg',
  ];
  
  return allowedTypes.includes(mimeType);
};

export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
};