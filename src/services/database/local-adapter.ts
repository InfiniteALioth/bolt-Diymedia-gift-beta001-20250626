import { DatabaseAdapter, StorageAdapter, PageStats, GlobalStats, UserActivity } from './types';
import { User, MediaItem, ChatMessage, MediaPage, Admin } from '../../types';

// 本地存储适配器 - 用于开发阶段
export class LocalDatabaseAdapter implements DatabaseAdapter {
  private dbName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'MediaPlatformDB') {
    this.dbName = dbName;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase) {
    // 用户表
    if (!db.objectStoreNames.contains('users')) {
      const userStore = db.createObjectStore('users', { keyPath: 'id' });
      userStore.createIndex('deviceId', 'deviceId', { unique: true });
      userStore.createIndex('username', 'username', { unique: false });
    }

    // 媒体项表
    if (!db.objectStoreNames.contains('mediaItems')) {
      const mediaStore = db.createObjectStore('mediaItems', { keyPath: 'id' });
      mediaStore.createIndex('pageId', 'pageId', { unique: false });
      mediaStore.createIndex('uploaderId', 'uploaderId', { unique: false });
      mediaStore.createIndex('createdAt', 'createdAt', { unique: false });
    }

    // 聊天消息表
    if (!db.objectStoreNames.contains('chatMessages')) {
      const chatStore = db.createObjectStore('chatMessages', { keyPath: 'id' });
      chatStore.createIndex('pageId', 'pageId', { unique: false });
      chatStore.createIndex('userId', 'userId', { unique: false });
      chatStore.createIndex('createdAt', 'createdAt', { unique: false });
    }

    // 媒体页面表
    if (!db.objectStoreNames.contains('mediaPages')) {
      const pageStore = db.createObjectStore('mediaPages', { keyPath: 'id' });
      pageStore.createIndex('internalCode', 'internalCode', { unique: true });
      pageStore.createIndex('purchaserEmail', 'purchaserEmail', { unique: false });
    }

    // 管理员表
    if (!db.objectStoreNames.contains('admins')) {
      const adminStore = db.createObjectStore('admins', { keyPath: 'id' });
      adminStore.createIndex('username', 'username', { unique: true });
      adminStore.createIndex('level', 'level', { unique: false });
    }

    // 文件存储表
    if (!db.objectStoreNames.contains('fileStorage')) {
      db.createObjectStore('fileStorage', { keyPath: 'path' });
    }

    // 用户活动表
    if (!db.objectStoreNames.contains('userActivity')) {
      const activityStore = db.createObjectStore('userActivity', { keyPath: 'id' });
      activityStore.createIndex('userId', 'userId', { unique: false });
      activityStore.createIndex('pageId', 'pageId', { unique: false });
      activityStore.createIndex('timestamp', 'timestamp', { unique: false });
    }
  }

  // 用户管理
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const user: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      ...userData,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(user);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(user);
    });
  }

  async getUser(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getUserByDeviceId(deviceId: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('deviceId');
      const request = index.get(deviceId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, ...updates };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(updatedUser);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(updatedUser);
    });
  }

  async deleteUser(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // 媒体管理
  async createMediaItem(itemData: Omit<MediaItem, 'id'>, file?: File): Promise<MediaItem> {
    const mediaItem: MediaItem = {
      id: 'media_' + Math.random().toString(36).substr(2, 9),
      ...itemData,
    };

    // 如果有文件，存储到文件存储中
    if (file) {
      const filePath = `media/${mediaItem.id}/${file.name}`;
      await this.storeFile(filePath, file);
      mediaItem.url = filePath;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaItems'], 'readwrite');
      const store = transaction.objectStore('mediaItems');
      const request = store.add(mediaItem);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(mediaItem);
    });
  }

  async getMediaItems(pageId: string, limit?: number, offset?: number): Promise<MediaItem[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaItems'], 'readonly');
      const store = transaction.objectStore('mediaItems');
      const index = store.index('pageId');
      const request = index.getAll(pageId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let items = request.result || [];
        
        // 按创建时间排序
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // 应用分页
        if (offset !== undefined) {
          items = items.slice(offset);
        }
        if (limit !== undefined) {
          items = items.slice(0, limit);
        }
        
        resolve(items);
      };
    });
  }

  async getMediaItem(id: string): Promise<MediaItem | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaItems'], 'readonly');
      const store = transaction.objectStore('mediaItems');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async updateMediaItem(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
    const item = await this.getMediaItem(id);
    if (!item) throw new Error('Media item not found');

    const updatedItem = { ...item, ...updates };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaItems'], 'readwrite');
      const store = transaction.objectStore('mediaItems');
      const request = store.put(updatedItem);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(updatedItem);
    });
  }

  async deleteMediaItem(id: string): Promise<void> {
    const item = await this.getMediaItem(id);
    if (item && item.url) {
      await this.deleteFile(item.url);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaItems'], 'readwrite');
      const store = transaction.objectStore('mediaItems');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // 聊天消息
  async createMessage(messageData: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      ...messageData,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chatMessages'], 'readwrite');
      const store = transaction.objectStore('chatMessages');
      const request = store.add(message);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(message);
    });
  }

  async getMessages(pageId: string, limit?: number, offset?: number): Promise<ChatMessage[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chatMessages'], 'readonly');
      const store = transaction.objectStore('chatMessages');
      const index = store.index('pageId');
      const request = index.getAll(pageId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let messages = request.result || [];
        
        // 按创建时间排序
        messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        // 应用分页
        if (offset !== undefined) {
          messages = messages.slice(offset);
        }
        if (limit !== undefined) {
          messages = messages.slice(0, limit);
        }
        
        resolve(messages);
      };
    });
  }

  async deleteMessage(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chatMessages'], 'readwrite');
      const store = transaction.objectStore('chatMessages');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // 媒体页面管理
  async createMediaPage(pageData: Omit<MediaPage, 'id'>): Promise<MediaPage> {
    const page: MediaPage = {
      id: 'page_' + Math.random().toString(36).substr(2, 9),
      ...pageData,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaPages'], 'readwrite');
      const store = transaction.objectStore('mediaPages');
      const request = store.add(page);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(page);
    });
  }

  async getMediaPage(id: string): Promise<MediaPage | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaPages'], 'readonly');
      const store = transaction.objectStore('mediaPages');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getMediaPageByCode(code: string): Promise<MediaPage | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaPages'], 'readonly');
      const store = transaction.objectStore('mediaPages');
      const index = store.index('internalCode');
      const request = index.get(code);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async updateMediaPage(id: string, updates: Partial<MediaPage>): Promise<MediaPage> {
    const page = await this.getMediaPage(id);
    if (!page) throw new Error('Media page not found');

    const updatedPage = { ...page, ...updates };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaPages'], 'readwrite');
      const store = transaction.objectStore('mediaPages');
      const request = store.put(updatedPage);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(updatedPage);
    });
  }

  async getMediaPages(): Promise<MediaPage[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaPages'], 'readonly');
      const store = transaction.objectStore('mediaPages');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteMediaPage(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaPages'], 'readwrite');
      const store = transaction.objectStore('mediaPages');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // 管理员管理
  async authenticateAdmin(username: string, password: string): Promise<Admin | null> {
    // 模拟认证逻辑
    if (username === 'superadmin' && password === 'admin123') {
      return {
        id: 'admin_1',
        username: 'superadmin',
        level: 1,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        permissions: {
          canCreateAdmins: true,
          canManagePages: true,
          canManageUsers: true,
          canManageMedia: true,
          canViewAnalytics: true,
        },
      };
    }
    return null;
  }

  async createAdmin(adminData: Omit<Admin, 'id'>): Promise<Admin> {
    const admin: Admin = {
      id: 'admin_' + Math.random().toString(36).substr(2, 9),
      ...adminData,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admins'], 'readwrite');
      const store = transaction.objectStore('admins');
      const request = store.add(admin);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(admin);
    });
  }

  async getAdmin(id: string): Promise<Admin | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admins'], 'readonly');
      const store = transaction.objectStore('admins');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAdmins(): Promise<Admin[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admins'], 'readonly');
      const store = transaction.objectStore('admins');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async updateAdmin(id: string, updates: Partial<Admin>): Promise<Admin> {
    const admin = await this.getAdmin(id);
    if (!admin) throw new Error('Admin not found');

    const updatedAdmin = { ...admin, ...updates };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admins'], 'readwrite');
      const store = transaction.objectStore('admins');
      const request = store.put(updatedAdmin);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(updatedAdmin);
    });
  }

  async deleteAdmin(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admins'], 'readwrite');
      const store = transaction.objectStore('admins');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // 统计分析
  async getPageStats(pageId: string): Promise<PageStats> {
    // 实现页面统计逻辑
    const [mediaItems, messages, users] = await Promise.all([
      this.getMediaItems(pageId),
      this.getMessages(pageId),
      this.getUsersForPage(pageId)
    ]);

    return {
      pageId,
      totalUsers: users.length,
      totalMedia: mediaItems.length,
      totalMessages: messages.length,
      storageUsed: this.calculateStorageUsed(mediaItems),
      dailyActiveUsers: 0, // 需要实现
      weeklyActiveUsers: 0, // 需要实现
      monthlyActiveUsers: 0, // 需要实现
      topUploaders: [], // 需要实现
      mediaTypeDistribution: [], // 需要实现
      activityTimeline: [], // 需要实现
    };
  }

  async getGlobalStats(): Promise<GlobalStats> {
    const [pages, users, mediaItems, messages] = await Promise.all([
      this.getMediaPages(),
      this.getAllUsers(),
      this.getAllMediaItems(),
      this.getAllMessages()
    ]);

    return {
      totalPages: pages.length,
      totalUsers: users.length,
      totalMedia: mediaItems.length,
      totalMessages: messages.length,
      totalStorageUsed: this.calculateStorageUsed(mediaItems),
      activePages: pages.filter(p => p.isActive).length,
      newUsersToday: 0, // 需要实现
      newMediaToday: 0, // 需要实现
      topPages: [], // 需要实现
    };
  }

  async getUserActivity(userId: string): Promise<UserActivity[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userActivity'], 'readonly');
      const store = transaction.objectStore('userActivity');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  // 辅助方法
  private async storeFile(path: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['fileStorage'], 'readwrite');
      const store = transaction.objectStore('fileStorage');
      const request = store.put({ path, file, createdAt: new Date().toISOString() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async deleteFile(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['fileStorage'], 'readwrite');
      const store = transaction.objectStore('fileStorage');
      const request = store.delete(path);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async getUsersForPage(pageId: string): Promise<User[]> {
    // 通过媒体项和消息获取页面用户
    const [mediaItems, messages] = await Promise.all([
      this.getMediaItems(pageId),
      this.getMessages(pageId)
    ]);

    const userIds = new Set([
      ...mediaItems.map(item => item.uploaderId),
      ...messages.map(msg => msg.userId)
    ]);

    const users: User[] = [];
    for (const userId of userIds) {
      const user = await this.getUser(userId);
      if (user) users.push(user);
    }

    return users;
  }

  private async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  private async getAllMediaItems(): Promise<MediaItem[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaItems'], 'readonly');
      const store = transaction.objectStore('mediaItems');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  private async getAllMessages(): Promise<ChatMessage[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chatMessages'], 'readonly');
      const store = transaction.objectStore('chatMessages');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  private calculateStorageUsed(mediaItems: MediaItem[]): number {
    // 简化的存储计算，实际应该从文件系统获取
    return mediaItems.length * 1024 * 1024; // 假设每个文件1MB
  }
}

// 本地存储适配器
export class LocalStorageAdapter implements StorageAdapter {
  async uploadFile(file: File, path: string): Promise<string> {
    // 转换为Base64存储在localStorage中
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64 = reader.result as string;
          localStorage.setItem(`file_${path}`, base64);
          resolve(path);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async uploadFiles(files: File[], basePath: string): Promise<string[]> {
    const paths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const path = `${basePath}/${i}_${files[i].name}`;
      await this.uploadFile(files[i], path);
      paths.push(path);
    }
    return paths;
  }

  async deleteFile(path: string): Promise<void> {
    localStorage.removeItem(`file_${path}`);
  }

  async deleteFiles(paths: string[]): Promise<void> {
    paths.forEach(path => this.deleteFile(path));
  }

  async getFileUrl(path: string): Promise<string> {
    const base64 = localStorage.getItem(`file_${path}`);
    if (!base64) throw new Error('File not found');
    return base64;
  }

  async getFileMetadata(path: string): Promise<any> {
    const base64 = localStorage.getItem(`file_${path}`);
    if (!base64) throw new Error('File not found');
    
    return {
      name: path.split('/').pop() || '',
      size: base64.length,
      type: base64.split(';')[0].split(':')[1],
      lastModified: new Date(),
      url: base64
    };
  }
}