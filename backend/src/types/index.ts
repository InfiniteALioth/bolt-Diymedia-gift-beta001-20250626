export interface User {
  id: string;
  username: string;
  email?: string;
  deviceId: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaPage {
  id: string;
  name: string;
  description?: string;
  purchaserName: string;
  purchaserEmail: string;
  purchaserGender: 'male' | 'female' | 'other';
  usageScenario: string;
  uniqueLink: string;
  qrCode?: string;
  internalCode: string;
  dbSizeLimit: number; // in MB
  dbUsage: number; // in MB
  usageDuration: number; // in days
  remainingDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface MediaItem {
  id: string;
  pageId: string;
  uploaderId: string;
  type: 'image' | 'video' | 'audio';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number; // in bytes
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  metadata?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  pageId: string;
  userId: string;
  content: string;
  type: 'text' | 'system';
  metadata?: any;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  level: 1 | 2 | 3; // 1=Super Admin, 2=Level 2, 3=Level 3
  permissions: AdminPermissions;
  isActive: boolean;
  lastLoginAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPermissions {
  canCreateAdmins: boolean;
  canManagePages: boolean;
  canManageUsers: boolean;
  canManageMedia: boolean;
  canViewAnalytics: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface JwtPayload {
  userId: string;
  username: string;
  type: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export interface SocketUser {
  id: string;
  username: string;
  pageId: string;
  socketId: string;
  joinedAt: Date;
}

export interface FileUploadResult {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface PageStats {
  pageId: string;
  totalUsers: number;
  totalMedia: number;
  totalMessages: number;
  storageUsed: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
}

export interface GlobalStats {
  totalPages: number;
  totalUsers: number;
  totalMedia: number;
  totalMessages: number;
  totalStorageUsed: number;
  activePages: number;
  newUsersToday: number;
  newMediaToday: number;
}