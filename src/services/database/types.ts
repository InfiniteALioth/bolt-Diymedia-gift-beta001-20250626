// 数据库适配器接口定义 - 为迁移做准备
export interface DatabaseAdapter {
  // 用户管理
  createUser(user: Omit<User, 'id'>): Promise<User>;
  getUser(id: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // 媒体管理
  createMediaItem(item: Omit<MediaItem, 'id'>): Promise<MediaItem>;
  getMediaItems(pageId: string): Promise<MediaItem[]>;
  deleteMediaItem(id: string): Promise<void>;
  
  // 聊天消息
  createMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;
  getMessages(pageId: string): Promise<ChatMessage[]>;
  
  // 媒体页面管理
  createMediaPage(page: Omit<MediaPage, 'id'>): Promise<MediaPage>;
  getMediaPage(id: string): Promise<MediaPage | null>;
  updateMediaPage(id: string, updates: Partial<MediaPage>): Promise<MediaPage>;
  getMediaPages(): Promise<MediaPage[]>;
  
  // 管理员管理
  authenticateAdmin(username: string, password: string): Promise<Admin | null>;
  createAdmin(admin: Omit<Admin, 'id'>): Promise<Admin>;
  getAdmins(): Promise<Admin[]>;
}

export interface StorageAdapter {
  uploadFile(file: File, path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): Promise<string>;
}

export interface AuthAdapter {
  signUp(email: string, password: string): Promise<{ user: any; error?: any }>;
  signIn(email: string, password: string): Promise<{ user: any; error?: any }>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<any>;
}

// 导入类型
import { User, MediaItem, ChatMessage, MediaPage, Admin } from '../../types';