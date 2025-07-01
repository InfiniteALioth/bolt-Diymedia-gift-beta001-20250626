import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Admin } from '@/models';
import { JwtPayload } from '@/types';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';

// Generate JWT tokens
const generateTokens = (userId: string, username: string, type: 'user' | 'admin') => {
  const payload: JwtPayload = { userId, username, type };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  
  return { accessToken, refreshToken };
};

// User registration
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, deviceId, email } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { deviceId } });
  if (existingUser) {
    throw createError('User with this device already exists', 409);
  }

  // Create new user
  const user = await User.create({
    username,
    deviceId,
    email,
    isActive: true,
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.username, 'user');

  // Update last login
  await user.update({ lastLoginAt: new Date() });

  logger.info(`User registered: ${user.username} (${user.id})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        deviceId: user.deviceId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    },
    timestamp: new Date().toISOString(),
  });
});

// User login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { deviceId, username } = req.body;

  // Find user by deviceId
  const user = await User.findOne({ where: { deviceId } });
  if (!user) {
    throw createError('User not found', 404);
  }

  if (!user.isActive) {
    throw createError('User account is disabled', 403);
  }

  // Update username if provided
  if (username && username !== user.username) {
    await user.update({ username });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.username, 'user');

  // Update last login
  await user.update({ lastLoginAt: new Date() });

  logger.info(`User logged in: ${user.username} (${user.id})`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        deviceId: user.deviceId,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
      accessToken,
      refreshToken,
    },
    timestamp: new Date().toISOString(),
  });
});

// Admin login
export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Find admin by username
  const admin = await Admin.findOne({ where: { username } });
  if (!admin) {
    throw createError('Invalid credentials', 401);
  }

  if (!admin.isActive) {
    throw createError('Admin account is disabled', 403);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw createError('Invalid credentials', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(admin.id, admin.username, 'admin');

  // Update last login
  await admin.update({ lastLoginAt: new Date() });

  logger.info(`Admin logged in: ${admin.username} (${admin.id})`);

  res.json({
    success: true,
    message: 'Admin login successful',
    data: {
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        level: admin.level,
        permissions: admin.permissions,
        isActive: admin.isActive,
        lastLoginAt: admin.lastLoginAt,
      },
      accessToken,
      refreshToken,
    },
    timestamp: new Date().toISOString(),
  });
});

// Admin registration (only for super admins)
export const registerAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, level } = req.body;

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({
    where: { $or: [{ username }, { email }] } as any
  });
  if (existingAdmin) {
    throw createError('Admin with this username or email already exists', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Set default permissions based on level
  const permissions = {
    canCreateAdmins: level === 1,
    canManagePages: level <= 2,
    canManageUsers: level <= 2,
    canManageMedia: true,
    canViewAnalytics: level <= 2,
  };

  // Create new admin
  const admin = await Admin.create({
    username,
    email,
    passwordHash,
    level,
    permissions,
    isActive: true,
  });

  logger.info(`Admin registered: ${admin.username} (${admin.id})`);

  res.status(201).json({
    success: true,
    message: 'Admin registered successfully',
    data: {
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        level: admin.level,
        permissions: admin.permissions,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
      decoded.username,
      decoded.type
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw createError('Invalid refresh token', 401);
  }
});

// Logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // In a real implementation, you might want to blacklist the token
  // For now, we'll just return a success response
  res.json({
    success: true,
    message: 'Logged out successfully',
    timestamp: new Date().toISOString(),
  });
});