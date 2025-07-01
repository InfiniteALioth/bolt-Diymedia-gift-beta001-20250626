// 数据库适配器接口定义 - 为迁移做准备
export interface DatabaseAdapter {
  // 用户管理
  createUser(user: Omit<User, 'id'>): Promise<User>;
  getUser(id: string): Promise<User | null>;
  getUserByDeviceId(deviceId: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // 媒体管理
  createMediaItem(item: Omit<MediaItem, 'id'>, file?: File): Promise<MediaItem>;
  getMediaItems(pageId: string, limit?: number, offset?: number): Promise<MediaItem[]>;
  getMediaItem(id: string): Promise<MediaItem | null>;
  updateMediaItem(id: string, updates: Partial<MediaItem>): Promise<MediaItem>;
  deleteMediaItem(id: string): Promise<void>;
  
  // 聊天消息
  createMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;
  getMessages(pageId: string, limit?: number, offset?: number): Promise<ChatMessage[]>;
  deleteMessage(id: string): Promise<void>;
  
  // 媒体页面管理
  createMediaPage(page: Omit<MediaPage, 'id'>): Promise<MediaPage>;
  getMediaPage(id: string): Promise<MediaPage | null>;
  getMediaPageByCode(code: string): Promise<MediaPage | null>;
  updateMediaPage(id: string, updates: Partial<MediaPage>): Promise<MediaPage>;
  getMediaPages(adminId?: string): Promise<MediaPage[]>;
  deleteMediaPage(id: string): Promise<void>;
  
  // 管理员管理
  authenticateAdmin(username: string, password: string): Promise<Admin | null>;
  createAdmin(admin: Omit<Admin, 'id'>): Promise<Admin>;
  getAdmin(id: string): Promise<Admin | null>;
  getAdmins(): Promise<Admin[]>;
  updateAdmin(id: string, updates: Partial<Admin>): Promise<Admin>;
  deleteAdmin(id: string): Promise<void>;
  
  // 统计分析
  getPageStats(pageId: string): Promise<PageStats>;
  getGlobalStats(): Promise<GlobalStats>;
  getUserActivity(userId: string): Promise<UserActivity[]>;
}

export interface StorageAdapter {
  uploadFile(file: File, path: string): Promise<string>;
  uploadFiles(files: File[], basePath: string): Promise<string[]>;
  deleteFile(path: string): Promise<void>;
  deleteFiles(paths: string[]): Promise<void>;
  getFileUrl(path: string): Promise<string>;
  getFileMetadata(path: string): Promise<FileMetadata>;
}

export interface AuthAdapter {
  signUp(email: string, password: string, metadata?: any): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<any>;
  resetPassword(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
}

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// 数据类型定义
export interface AuthResult {
  user: any;
  session?: any;
  error?: any;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  url: string;
}

export interface PageStats {
  pageId: string;
  totalUsers: number;
  totalMedia: number;
  totalMessages: number;
  storageUsed: number; // bytes
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  topUploaders: UserStats[];
  mediaTypeDistribution: MediaTypeStats[];
  activityTimeline: ActivityPoint[];
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
  topPages: PageSummary[];
}

export interface UserStats {
  userId: string;
  username: string;
  mediaCount: number;
  messageCount: number;
  lastActive: string;
}

export interface MediaTypeStats {
  type: 'image' | 'video' | 'audio';
  count: number;
  totalSize: number;
}

export interface ActivityPoint {
  date: string;
  users: number;
  media: number;
  messages: number;
}

export interface PageSummary {
  id: string;
  name: string;
  userCount: number;
  mediaCount: number;
  lastActivity: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: 'login' | 'upload_media' | 'send_message' | 'view_media';
  details: any;
  timestamp: string;
  pageId?: string;
}

// 导入类型
import { User, MediaItem, ChatMessage, MediaPage, Admin } from '../../types';