import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseAdapter, StorageAdapter, AuthAdapter, PageStats, GlobalStats, UserActivity } from './types';
import { User, MediaItem, ChatMessage, MediaPage, Admin } from '../../types';

// Supabase适配器 - 用于生产环境
export class SupabaseDatabaseAdapter implements DatabaseAdapter {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // 用户管理
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserByDeviceId(deviceId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('deviceId', deviceId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // 媒体管理
  async createMediaItem(itemData: Omit<MediaItem, 'id'>, file?: File): Promise<MediaItem> {
    let url = itemData.url;
    
    // 如果有文件，先上传到存储
    if (file) {
      const filePath = `media/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('media-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      const { data: urlData } = this.supabase.storage
        .from('media-files')
        .getPublicUrl(filePath);
      
      url = urlData.publicUrl;
    }

    const { data, error } = await this.supabase
      .from('media_items')
      .insert([{ ...itemData, url }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMediaItems(pageId: string, limit?: number, offset?: number): Promise<MediaItem[]> {
    let query = this.supabase
      .from('media_items')
      .select('*')
      .eq('pageId', pageId)
      .order('createdAt', { ascending: false });

    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + (limit || 10) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getMediaItem(id: string): Promise<MediaItem | null> {
    const { data, error } = await this.supabase
      .from('media_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateMediaItem(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
    const { data, error } = await this.supabase
      .from('media_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMediaItem(id: string): Promise<void> {
    // 先获取媒体项信息
    const item = await this.getMediaItem(id);
    
    // 删除存储文件
    if (item && item.url) {
      const filePath = item.url.split('/').pop();
      if (filePath) {
        await this.supabase.storage
          .from('media-files')
          .remove([filePath]);
      }
    }

    // 删除数据库记录
    const { error } = await this.supabase
      .from('media_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // 聊天消息
  async createMessage(messageData: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMessages(pageId: string, limit?: number, offset?: number): Promise<ChatMessage[]> {
    let query = this.supabase
      .from('chat_messages')
      .select('*')
      .eq('pageId', pageId)
      .order('createdAt', { ascending: true });

    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + (limit || 50) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async deleteMessage(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // 媒体页面管理
  async createMediaPage(pageData: Omit<MediaPage, 'id'>): Promise<MediaPage> {
    const { data, error } = await this.supabase
      .from('media_pages')
      .insert([pageData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMediaPage(id: string): Promise<MediaPage | null> {
    const { data, error } = await this.supabase
      .from('media_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getMediaPageByCode(code: string): Promise<MediaPage | null> {
    const { data, error } = await this.supabase
      .from('media_pages')
      .select('*')
      .eq('internalCode', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateMediaPage(id: string, updates: Partial<MediaPage>): Promise<MediaPage> {
    const { data, error } = await this.supabase
      .from('media_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMediaPages(): Promise<MediaPage[]> {
    const { data, error } = await this.supabase
      .from('media_pages')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async deleteMediaPage(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('media_pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // 管理员管理
  async authenticateAdmin(username: string, password: string): Promise<Admin | null> {
    // 使用Supabase Auth进行认证
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email: `${username}@admin.local`,
      password
    });

    if (authError) return null;

    // 获取管理员信息
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error) return null;
    return data;
  }

  async createAdmin(adminData: Omit<Admin, 'id'>): Promise<Admin> {
    const { data, error } = await this.supabase
      .from('admins')
      .insert([adminData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAdmin(id: string): Promise<Admin | null> {
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAdmins(): Promise<Admin[]> {
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .order('level', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateAdmin(id: string, updates: Partial<Admin>): Promise<Admin> {
    const { data, error } = await this.supabase
      .from('admins')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAdmin(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // 统计分析
  async getPageStats(pageId: string): Promise<PageStats> {
    // 使用Supabase的RPC函数或复杂查询来获取统计数据
    const { data, error } = await this.supabase
      .rpc('get_page_stats', { page_id: pageId });

    if (error) throw error;
    return data;
  }

  async getGlobalStats(): Promise<GlobalStats> {
    const { data, error } = await this.supabase
      .rpc('get_global_stats');

    if (error) throw error;
    return data;
  }

  async getUserActivity(userId: string): Promise<UserActivity[]> {
    const { data, error } = await this.supabase
      .from('user_activity')
      .select('*')
      .eq('userId', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

// Supabase存储适配器
export class SupabaseStorageAdapter implements StorageAdapter {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(supabaseUrl: string, supabaseKey: string, bucketName: string = 'media-files') {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucketName = bucketName;
  }

  async uploadFile(file: File, path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(path, file);

    if (error) throw error;
    return data.path;
  }

  async uploadFiles(files: File[], basePath: string): Promise<string[]> {
    const paths: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${basePath}/${Date.now()}_${i}_${file.name}`;
      const uploadedPath = await this.uploadFile(file, path);
      paths.push(uploadedPath);
    }
    
    return paths;
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) throw error;
  }

  async deleteFiles(paths: string[]): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove(paths);

    if (error) throw error;
  }

  async getFileUrl(path: string): Promise<string> {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async getFileMetadata(path: string): Promise<any> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      });

    if (error) throw error;
    return data[0];
  }
}

// Supabase认证适配器
export class SupabaseAuthAdapter implements AuthAdapter {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async signUp(email: string, password: string, metadata?: any): Promise<any> {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  }

  async signIn(email: string, password: string): Promise<any> {
    return await this.supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<any> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }
}