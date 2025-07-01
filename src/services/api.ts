// 前端 API 服务 - 连接后端接口
import { User, MediaItem, ChatMessage, MediaPage, Admin } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';
const SHOW_API_LOGS = import.meta.env.VITE_SHOW_API_LOGS === 'true';

// API日志记录
const logApiCall = (method: string, url: string, data?: any) => {
  if (SHOW_API_LOGS) {
    console.log(`🌐 API ${method.toUpperCase()}: ${url}`, data ? { data } : '');
  }
};

const logApiResponse = (method: string, url: string, response: any, error?: any) => {
  if (SHOW_API_LOGS) {
    if (error) {
      console.error(`❌ API ${method.toUpperCase()} ERROR: ${url}`, error);
    } else {
      console.log(`✅ API ${method.toUpperCase()} SUCCESS: ${url}`, response);
    }
  }
};

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

    logApiCall(options.method || 'GET', endpoint, options.body ? JSON.parse(options.body as string) : undefined);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        logApiResponse(options.method || 'GET', endpoint, null, error);
        throw error;
      }
      
      const data = await response.json();
      const result = data.data || data;
      
      logApiResponse(options.method || 'GET', endpoint, result);
      return result;
    } catch (error) {
      logApiResponse(options.method || 'GET', endpoint, null, error);
      
      // 网络错误处理
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('无法连接到服务器，请检查网络连接或确保后端服务正在运行');
      }
      
      throw error;
    }
  }

  // 健康检查
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      const data = await response.json();
      return { ...data, connected: true };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Backend not available',
        connected: false,
        error: error.message 
      };
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
    
    logApiCall('POST', `/media/${pageId}`, { filesCount: files.length, caption });

    try {
      const response = await fetch(`${API_BASE_URL}/media/${pageId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        logApiResponse('POST', `/media/${pageId}`, null, error);
        throw error;
      }

      const data = await response.json();
      const result = data.data?.mediaItems || data.mediaItems || [];
      
      logApiResponse('POST', `/media/${pageId}`, result);
      return result;
    } catch (error) {
      logApiResponse('POST', `/media/${pageId}`, null, error);
      throw error;
    }
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
    
    logApiCall('POST', '/upload/single', { fileName: file.name, fileSize: file.size });

    try {
      const response = await fetch(`${API_BASE_URL}/upload/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        logApiResponse('POST', '/upload/single', null, error);
        throw error;
      }

      const data = await response.json();
      const result = data.data?.file || data.file;
      
      logApiResponse('POST', '/upload/single', result);
      return result;
    } catch (error) {
      logApiResponse('POST', '/upload/single', null, error);
      throw error;
    }
  }

  async uploadMultiple(files: File[]): Promise<any[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const token = localStorage.getItem('authToken');
    
    logApiCall('POST', '/upload/multiple', { filesCount: files.length });

    try {
      const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        logApiResponse('POST', '/upload/multiple', null, error);
        throw error;
      }

      const data = await response.json();
      const result = data.data?.files || data.files || [];
      
      logApiResponse('POST', '/upload/multiple', result);
      return result;
    } catch (error) {
      logApiResponse('POST', '/upload/multiple', null, error);
      throw error;
    }
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
}

export const apiService = new ApiService();

// 导出调试信息
if (DEBUG_MODE) {
  (window as any).apiService = apiService;
  console.log('🔧 Debug mode enabled. API service available as window.apiService');
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('🎭 Mock API Mode:', USE_MOCK_API);
}