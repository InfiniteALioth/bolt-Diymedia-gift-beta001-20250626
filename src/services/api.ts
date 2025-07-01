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
        throw new Error(`HTTP error! status: ${response.status}`);
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
    return this.request<User>('/auth/user/register', {
      method: 'POST',
      body: JSON.stringify({ username, deviceId, email }),
    });
  }

  async loginUser(deviceId: string, username?: string): Promise<User> {
    return this.request<User>('/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ deviceId, username }),
    });
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

    const response = await fetch(`${API_BASE_URL}/media/${pageId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async deleteMedia(mediaId: string): Promise<void> {
    return this.request<void>(`/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  // 聊天相关接口
  async getChatMessages(pageId: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/chat/${pageId}`);
  }

  async sendMessage(pageId: string, content: string): Promise<ChatMessage> {
    return this.request<ChatMessage>(`/chat/${pageId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // 管理员功能接口
  async getAdmins(): Promise<Admin[]> {
    return this.request<Admin[]>('/admin/admins');
  }

  async createAdmin(adminData: Omit<Admin, 'id'>): Promise<Admin> {
    return this.request<Admin>('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async getGlobalStats(): Promise<any> {
    return this.request<any>('/admin/stats');
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();