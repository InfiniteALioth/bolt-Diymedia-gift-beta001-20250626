import { DatabaseAdapter, StorageAdapter, AuthAdapter } from '../database/types';
import { LocalDatabaseAdapter, LocalStorageAdapter } from '../database/local-adapter';
import { SupabaseDatabaseAdapter, SupabaseStorageAdapter, SupabaseAuthAdapter } from '../database/supabase-adapter';

// 数据库服务管理器
export class DatabaseService {
  private static instance: DatabaseService;
  private databaseAdapter: DatabaseAdapter;
  private storageAdapter: StorageAdapter;
  private authAdapter?: AuthAdapter;
  private isInitialized = false;

  private constructor() {
    // 默认使用本地适配器
    this.databaseAdapter = new LocalDatabaseAdapter();
    this.storageAdapter = new LocalStorageAdapter();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(config?: {
    type: 'local' | 'supabase';
    supabaseUrl?: string;
    supabaseKey?: string;
  }): Promise<void> {
    if (this.isInitialized) return;

    if (config?.type === 'supabase' && config.supabaseUrl && config.supabaseKey) {
      // 切换到Supabase适配器
      this.databaseAdapter = new SupabaseDatabaseAdapter(config.supabaseUrl, config.supabaseKey);
      this.storageAdapter = new SupabaseStorageAdapter(config.supabaseUrl, config.supabaseKey);
      this.authAdapter = new SupabaseAuthAdapter(config.supabaseUrl, config.supabaseKey);
    } else {
      // 使用本地适配器
      this.databaseAdapter = new LocalDatabaseAdapter();
      this.storageAdapter = new LocalStorageAdapter();
      
      // 初始化本地数据库
      if (this.databaseAdapter instanceof LocalDatabaseAdapter) {
        await this.databaseAdapter.init();
      }
    }

    this.isInitialized = true;
    console.log(`数据库服务初始化完成 - 类型: ${config?.type || 'local'}`);
  }

  // 获取适配器实例
  getDatabase(): DatabaseAdapter {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }
    return this.databaseAdapter;
  }

  getStorage(): StorageAdapter {
    if (!this.isInitialized) {
      throw new Error('Database service not initialized');
    }
    return this.storageAdapter;
  }

  getAuth(): AuthAdapter | undefined {
    return this.authAdapter;
  }

  // 切换适配器（用于迁移）
  async switchToSupabase(supabaseUrl: string, supabaseKey: string): Promise<void> {
    console.log('开始迁移到Supabase...');
    
    // 备份当前数据
    const currentData = await this.exportData();
    
    // 切换到Supabase适配器
    this.databaseAdapter = new SupabaseDatabaseAdapter(supabaseUrl, supabaseKey);
    this.storageAdapter = new SupabaseStorageAdapter(supabaseUrl, supabaseKey);
    this.authAdapter = new SupabaseAuthAdapter(supabaseUrl, supabaseKey);
    
    // 导入数据到Supabase
    await this.importData(currentData);
    
    console.log('迁移到Supabase完成');
  }

  async switchToLocal(): Promise<void> {
    console.log('开始迁移到本地存储...');
    
    // 备份当前数据
    const currentData = await this.exportData();
    
    // 切换到本地适配器
    this.databaseAdapter = new LocalDatabaseAdapter();
    this.storageAdapter = new LocalStorageAdapter();
    this.authAdapter = undefined;
    
    // 初始化本地数据库
    if (this.databaseAdapter instanceof LocalDatabaseAdapter) {
      await this.databaseAdapter.init();
    }
    
    // 导入数据到本地
    await this.importData(currentData);
    
    console.log('迁移到本地存储完成');
  }

  // 数据导出（用于迁移）
  private async exportData(): Promise<any> {
    try {
      const [users, mediaPages, admins] = await Promise.all([
        this.getAllUsers(),
        this.databaseAdapter.getMediaPages(),
        this.databaseAdapter.getAdmins()
      ]);

      const data: any = {
        users,
        mediaPages,
        admins,
        mediaItems: {},
        chatMessages: {}
      };

      // 导出每个页面的媒体和消息
      for (const page of mediaPages) {
        data.mediaItems[page.id] = await this.databaseAdapter.getMediaItems(page.id);
        data.chatMessages[page.id] = await this.databaseAdapter.getMessages(page.id);
      }

      return data;
    } catch (error) {
      console.error('数据导出失败:', error);
      throw error;
    }
  }

  // 数据导入（用于迁移）
  private async importData(data: any): Promise<void> {
    try {
      // 导入用户
      for (const user of data.users || []) {
        await this.databaseAdapter.createUser(user);
      }

      // 导入管理员
      for (const admin of data.admins || []) {
        await this.databaseAdapter.createAdmin(admin);
      }

      // 导入媒体页面
      for (const page of data.mediaPages || []) {
        await this.databaseAdapter.createMediaPage(page);
      }

      // 导入媒体项和消息
      for (const pageId in data.mediaItems) {
        for (const mediaItem of data.mediaItems[pageId]) {
          await this.databaseAdapter.createMediaItem(mediaItem);
        }
      }

      for (const pageId in data.chatMessages) {
        for (const message of data.chatMessages[pageId]) {
          await this.databaseAdapter.createMessage(message);
        }
      }

      console.log('数据导入完成');
    } catch (error) {
      console.error('数据导入失败:', error);
      throw error;
    }
  }

  private async getAllUsers(): Promise<any[]> {
    // 这里需要实现获取所有用户的逻辑
    // 由于当前接口限制，这里返回空数组
    return [];
  }

  // 健康检查
  async healthCheck(): Promise<{
    database: boolean;
    storage: boolean;
    auth: boolean;
  }> {
    const result = {
      database: false,
      storage: false,
      auth: false
    };

    try {
      // 测试数据库连接
      await this.databaseAdapter.getMediaPages();
      result.database = true;
    } catch (error) {
      console.error('数据库健康检查失败:', error);
    }

    try {
      // 测试存储连接（创建一个测试文件）
      const testFile = new File(['test'], 'health-check.txt', { type: 'text/plain' });
      const path = await this.storageAdapter.uploadFile(testFile, 'health-check.txt');
      await this.storageAdapter.deleteFile(path);
      result.storage = true;
    } catch (error) {
      console.error('存储健康检查失败:', error);
    }

    try {
      // 测试认证连接
      if (this.authAdapter) {
        await this.authAdapter.getCurrentUser();
        result.auth = true;
      } else {
        result.auth = true; // 本地模式不需要认证
      }
    } catch (error) {
      console.error('认证健康检查失败:', error);
    }

    return result;
  }
}

// 导出单例实例
export const databaseService = DatabaseService.getInstance();