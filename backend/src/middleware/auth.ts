import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Admin } from '@/models';
import { JwtPayload } from '@/types';
import { logger } from '@/utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      admin?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    if (decoded.type === 'user') {
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user not found.',
        });
      }
      req.user = user;
    } else if (decoded.type === 'admin') {
      const admin = await Admin.findByPk(decoded.userId);
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or admin not found.',
        });
      }
      req.admin = admin;
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.',
      });
    }

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const admin = await Admin.findByPk(decoded.userId);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or admin not found.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    logger.error('Admin auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

export const requirePermission = (permission: keyof import('@/types').AdminPermissions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin authentication required.',
      });
    }

    if (!req.admin.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required permission: ${permission}`,
      });
    }

    next();
  };
};