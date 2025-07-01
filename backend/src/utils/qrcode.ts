import QRCode from 'qrcode';
import { logger } from './logger';

export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    
    return qrCodeDataURL;
  } catch (error) {
    logger.error('Failed to generate QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateQRCodeBuffer = async (text: string): Promise<Buffer> => {
  try {
    const buffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: 'M',
      type: 'png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    
    return buffer;
  } catch (error) {
    logger.error('Failed to generate QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
};