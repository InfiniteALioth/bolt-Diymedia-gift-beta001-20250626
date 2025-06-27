import { useState, useEffect, useCallback } from 'react';
import { databaseService } from '../services/api/database-service';
import { DatabaseAdapter, StorageAdapter } from '../services/database/types';
import { User, MediaItem, ChatMessage, MediaPage, Admin } from '../types';

// 数据库钩子 - 统一的数据访问接口
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化数据库
  useEffect(() => {
    const initDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 检查是否有Supabase配置
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          console.log('检测到Supabase配置，使用Supabase适配器');
          await databaseService.initialize({
            type: 'supabase',
            supabaseUrl,
            supabaseKey
          });
        } else {
          console.log('使用本地存储适配器');
          await databaseService.initialize({ type: 'local' });
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('数据库初始化失败:', err);
        setError(err instanceof Error ? err.message : '数据库初始化失败');
      } finally {
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []);

  // 获取数据库实例
  const getDatabase = useCallback((): DatabaseAdapter => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }
    return databaseService.getDatabase();
  }, [isInitialized]);

  // 获取存储实例
  const getStorage = useCallback((): StorageAdapter => {
    if (!isInitialized) {
      throw new Error('Storage not initialized');
    }
    return databaseService.getStorage();
  }, [isInitialized]);

  // 用户操作
  const userOperations = {
    create: useCallback(async (userData: Omit<User, 'id'>): Promise<User> => {
      return await getDatabase().createUser(userData);
    }, [getDatabase]),

    get: useCallback(async (id: string): Promise<User | null> => {
      return await getDatabase().getUser(id);
    }, [getDatabase]),

    getByDeviceId: useCallback(async (deviceId: string): Promise<User | null> => {
      return await getDatabase().getUserByDeviceId(deviceId);
    }, [getDatabase]),

    update: useCallback(async (id: string, updates: Partial<User>): Promise<User> => {
      return await getDatabase().updateUser(id, updates);
    }, [getDatabase]),

    delete: useCallback(async (id: string): Promise<void> => {
      return await getDatabase().deleteUser(id);
    }, [getDatabase])
  };

  // 媒体操作
  const mediaOperations = {
    create: useCallback(async (itemData: Omit<MediaItem, 'id'>, file?: File): Promise<MediaItem> => {
      return await getDatabase().createMediaItem(itemData, file);
    }, [getDatabase]),

    getList: useCallback(async (pageId: string, limit?: number, offset?: number): Promise<MediaItem[]> => {
      return await getDatabase().getMediaItems(pageId, limit, offset);
    }, [getDatabase]),

    get: useCallback(async (id: string): Promise<MediaItem | null> => {
      return await getDatabase().getMediaItem(id);
    }, [getDatabase]),

    update: useCallback(async (id: string, updates: Partial<MediaItem>): Promise<MediaItem> => {
      return await getDatabase().updateMediaItem(id, updates);
    }, [getDatabase]),

    delete: useCallback(async (id: string): Promise<void> => {
      return await getDatabase().deleteMediaItem(id);
    }, [getDatabase])
  };

  // 消息操作
  const messageOperations = {
    create: useCallback(async (messageData: Omit<ChatMessage, 'id'>): Promise<ChatMessage> => {
      return await getDatabase().createMessage(messageData);
    }, [getDatabase]),

    getList: useCallback(async (pageId: string, limit?: number, offset?: number): Promise<ChatMessage[]> => {
      return await getDatabase().getMessages(pageId, limit, offset);
    }, [getDatabase]),

    delete: useCallback(async (id: string): Promise<void> => {
      return await getDatabase().deleteMessage(id);
    }, [getDatabase])
  };

  // 页面操作
  const pageOperations = {
    create: useCallback(async (pageData: Omit<MediaPage, 'id'>): Promise<MediaPage> => {
      return await getDatabase().createMediaPage(pageData);
    }, [getDatabase]),

    get: useCallback(async (id: string): Promise<MediaPage | null> => {
      return await getDatabase().getMediaPage(id);
    }, [getDatabase]),

    getByCode: useCallback(async (code: string): Promise<MediaPage | null> => {
      return await getDatabase().getMediaPageByCode(code);
    }, [getDatabase]),

    getList: useCallback(async (): Promise<MediaPage[]> => {
      return await getDatabase().getMediaPages();
    }, [getDatabase]),

    update: useCallback(async (id: string, updates: Partial<MediaPage>): Promise<MediaPage> => {
      return await getDatabase().updateMediaPage(id, updates);
    }, [getDatabase]),

    delete: useCallback(async (id: string): Promise<void> => {
      return await getDatabase().deleteMediaPage(id);
    }, [getDatabase])
  };

  // 管理员操作
  const adminOperations = {
    authenticate: useCallback(async (username: string, password: string): Promise<Admin | null> => {
      return await getDatabase().authenticateAdmin(username, password);
    }, [getDatabase]),

    create: useCallback(async (adminData: Omit<Admin, 'id'>): Promise<Admin> => {
      return await getDatabase().createAdmin(adminData);
    }, [getDatabase]),

    get: useCallback(async (id: string): Promise<Admin | null> => {
      return await getDatabase().getAdmin(id);
    }, [getDatabase]),

    getList: useCallback(async (): Promise<Admin[]> => {
      return await getDatabase().getAdmins();
    }, [getDatabase]),

    update: useCallback(async (id: string, updates: Partial<Admin>): Promise<Admin> => {
      return await getDatabase().updateAdmin(id, updates);
    }, [getDatabase]),

    delete: useCallback(async (id: string): Promise<void> => {
      return await getDatabase().deleteAdmin(id);
    }, [getDatabase])
  };

  // 存储操作
  const storageOperations = {
    uploadFile: useCallback(async (file: File, path: string): Promise<string> => {
      return await getStorage().uploadFile(file, path);
    }, [getStorage]),

    uploadFiles: useCallback(async (files: File[], basePath: string): Promise<string[]> => {
      return await getStorage().uploadFiles(files, basePath);
    }, [getStorage]),

    deleteFile: useCallback(async (path: string): Promise<void> => {
      return await getStorage().deleteFile(path);
    }, [getStorage]),

    getFileUrl: useCallback(async (path: string): Promise<string> => {
      return await getStorage().getFileUrl(path);
    }, [getStorage])
  };

  // 统计操作
  const analyticsOperations = {
    getPageStats: useCallback(async (pageId: string) => {
      return await getDatabase().getPageStats(pageId);
    }, [getDatabase]),

    getGlobalStats: useCallback(async () => {
      return await getDatabase().getGlobalStats();
    }, [getDatabase]),

    getUserActivity: useCallback(async (userId: string) => {
      return await getDatabase().getUserActivity(userId);
    }, [getDatabase])
  };

  // 迁移操作
  const migrationOperations = {
    switchToSupabase: useCallback(async (supabaseUrl: string, supabaseKey: string) => {
      setIsLoading(true);
      try {
        await databaseService.switchToSupabase(supabaseUrl, supabaseKey);
        console.log('成功迁移到Supabase');
      } catch (err) {
        console.error('迁移到Supabase失败:', err);
        setError(err instanceof Error ? err.message : '迁移失败');
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []),

    switchToLocal: useCallback(async () => {
      setIsLoading(true);
      try {
        await databaseService.switchToLocal();
        console.log('成功迁移到本地存储');
      } catch (err) {
        console.error('迁移到本地存储失败:', err);
        setError(err instanceof Error ? err.message : '迁移失败');
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, []),

    healthCheck: useCallback(async () => {
      return await databaseService.healthCheck();
    }, [])
  };

  return {
    // 状态
    isInitialized,
    isLoading,
    error,

    // 操作
    users: userOperations,
    media: mediaOperations,
    messages: messageOperations,
    pages: pageOperations,
    admins: adminOperations,
    storage: storageOperations,
    analytics: analyticsOperations,
    migration: migrationOperations,

    // 原始实例（高级用法）
    getDatabase,
    getStorage
  };
}