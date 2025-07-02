export interface User {
  id: string;
  username: string;
  deviceId: string;
  email?: string;
  avatar?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  permissions?: UserPermissions;
}

export interface UserPermissions {
  canLogin: boolean;
  canView: boolean;
  canUploadMedia: boolean;
  canDeleteOwnMedia: boolean;
  canSendMessage: boolean;
  canDeleteOwnMessage: boolean;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  uploaderId: string;
  uploaderName: string;
  caption: string;
  createdAt: string;
  pageId: string;
  filename?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  isActive?: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  pageId: string;
  type?: 'text' | 'system';
  metadata?: any;
  isDeleted?: boolean;
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
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
  // 兼容旧版本字段
  remainingDays?: number;
  purchaseHistory?: PurchaseRecord[];
  discountRecords?: DiscountRecord[];
  productDetails?: ProductDetails;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  amount: number;
  duration: number; // days
  description: string;
}

export interface DiscountRecord {
  id: string;
  date: string;
  type: string;
  value: number;
  description: string;
}

export interface ProductDetails {
  name: string;
  link: string;
  images: string[];
  description: string;
}

export interface Admin {
  id: string;
  username: string;
  email?: string;
  level: 1 | 2 | 3; // 1=Super Admin, 2=Level 2, 3=Level 3
  permissions: AdminPermissions;
  isActive?: boolean;
  lastLoginAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminPermissions {
  canCreateAdmins: boolean;
  canManagePages: boolean;
  canManageUsers: boolean;
  canManageMedia: boolean;
  canViewAnalytics: boolean;
}

export interface AppState {
  currentUser: User | null;
  currentAdmin: Admin | null;
  currentPageId: string | null;
  mediaItems: MediaItem[];
  chatMessages: ChatMessage[];
  mediaPages: MediaPage[];
  admins: Admin[];
}

// API响应类型
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

// 连接状态类型
export type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

// 健康检查响应
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  connected: boolean;
  error?: string;
}

// 部署状态类型
export interface DeploymentStatus {
  isDeployed: boolean;
  deploymentUrl?: string;
  status: 'not_deployed' | 'deploying' | 'deployed' | 'failed';
  lastDeployment?: {
    timestamp: string;
    version: string;
    environment: string;
  };
  healthCheck: {
    database: boolean;
    redis: boolean;
    server: boolean;
  };
}

export interface DeploymentInfo {
  build: {
    version: string;
    buildTime: string;
    gitCommit: string;
    nodeVersion: string;
    environment: string;
  };
  system: {
    platform: string;
    arch: string;
    cpus: number;
    memory: {
      total: string;
      free: string;
    };
    uptime: string;
  };
  environment: {
    nodeEnv: string;
    port: string;
    dbHost: string;
    redisHost: string;
  };
}