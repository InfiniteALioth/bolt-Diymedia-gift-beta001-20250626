// 前端 API 服务 - 连接后端接口
import { User, MediaItem, ChatMessage, MediaPage, Admin } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 添加认证 token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 用户相关接口
  async registerUser(username: string, deviceId: string, email?: string): Promise<User> {
    const response = await this.request<{ user: User; accessToken: string }>('/auth/user/register', {
      method: 'POST',
      body: JSON.stringify({ username, deviceId, email }),
    });
    
    // 保存 token
    if (response.accessToken) {
      localStorage.setItem('authToken', response.accessToken);
    }
    
    return response.user;
  }

  async loginUser(deviceId: string, username?: string): Promise<User> {
    const response = await this.request<{ user: User; accessToken: string }>('/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ deviceId, username }),
    });
    
    // 保存 token
    if (response.accessToken) {
      localStorage.setItem('authToken', response.accessToken);
    }
    
    return response.user;
  }

  // 管理员相关接口
  async loginAdmin(username: string, password: string): Promise<Admin> {
    const response = await this.request<{ admin: Admin; accessToken: string }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // 保存 token
    localStorage.setItem('authToken', response.accessToken);
    return response.admin;
  }

  // 媒体页面相关接口
  async getPageById(pageId: string): Promise<MediaPage> {
    return this.request<MediaPage>(`/pages/${pageId}`);
  }

  async getPageByCode(internalCode: string): Promise<MediaPage> {
    return this.request<MediaPage>(`/pages/code/${internalCode}`);
  }

  async getPages(): Promise<MediaPage[]> {
    return this.request<MediaPage[]>('/pages');
  }

  async createPage(pageData: Omit<MediaPage, 'id'>): Promise<MediaPage> {
    return this.request<MediaPage>('/pages', {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
  }

  async updatePage(pageId: string, updates: Partial<MediaPage>): Promise<MediaPage> {
    return this.request<MediaPage>(`/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePage(pageId: string): Promise<void> {
    return this.request<void>(`/pages/${pageId}`, {
      method: 'DELETE',
    });
  }

  // 媒体相关接口
  async getMediaItems(pageId: string): Promise<MediaItem[]> {
    return this.request<MediaItem[]>(`/media/${pageId}`);
  }

  async uploadMedia(pageId: string, files: File[], caption: string): Promise<MediaItem[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('caption', caption);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/media/${pageId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.mediaItems || data.mediaItems || [];
  }

  async deleteMedia(mediaId: string): Promise<void> {
    return this.request<void>(`/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  async updateMedia(mediaId: string, updates: { caption?: string }): Promise<MediaItem> {
    return this.request<MediaItem>(`/media/${mediaId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // 聊天相关接口
  async getChatMessages(pageId: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/chat/${pageId}`);
  }

  async sendMessage(pageId: string, content: string): Promise<ChatMessage> {
    const response = await this.request<{ message: ChatMessage }>(`/chat/${pageId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response.message;
  }

  async deleteMessage(messageId: string): Promise<void> {
    return this.request<void>(`/chat/${messageId}`, {
      method: 'DELETE',
    });
  }

  // 用户相关接口
  async getUserProfile(): Promise<User> {
    const response = await this.request<{ user: User }>('/users/profile');
    return response.user;
  }

  async updateUserProfile(updates: { username?: string; avatar?: string }): Promise<User> {
    const response = await this.request<{ user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.user;
  }

  async getUserStats(): Promise<any> {
    const response = await this.request<{ stats: any }>('/users/stats');
    return response.stats;
  }

  // 管理员功能接口
  async getAdmins(): Promise<Admin[]> {
    const response = await this.request<{ admins: Admin[] }>('/admin/admins');
    return response.admins;
  }

  async createAdmin(adminData: Omit<Admin, 'id'>): Promise<Admin> {
    const response = await this.request<{ admin: Admin }>('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
    return response.admin;
  }

  async updateAdmin(adminId: string, updates: Partial<Admin>): Promise<Admin> {
    const response = await this.request<{ admin: Admin }>(`/admin/admins/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.admin;
  }

  async deleteAdmin(adminId: string): Promise<void> {
    return this.request<void>(`/admin/admins/${adminId}`, {
      method: 'DELETE',
    });
  }

  async getGlobalStats(): Promise<any> {
    const response = await this.request<{ stats: any }>('/admin/stats');
    return response.stats;
  }

  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<any>(url);
  }

  // 文件上传接口
  async uploadSingle(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.file || data.file;
  }

  async uploadMultiple(files: File[]): Promise<any[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.files || data.files || [];
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('authToken');
    }
  }

  // 健康检查
  async healthCheck(): Promise<any> {
    return fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`)
      .then(res => res.json())
      .catch(() => ({ status: 'error', message: 'Backend not available' }));
  }
}

export const apiService = new ApiService();