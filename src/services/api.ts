// 前端 API 服务 - 连接后端接口
import { User, MediaItem, ChatMessage, MediaPage, Admin } from '../types';
import { API_CONFIG, API_ENDPOINTS, ENV_CONFIG, ERROR_MESSAGES } from '../config/api';

// API日志记录
const logApiCall = (method: string, url: string, data?: any) => {
  if (ENV_CONFIG.showAPILogs) {
    console.log(`🌐 API ${method.toUpperCase()}: ${url}`, data ? { data } : '');
  }
};

const logApiResponse = (method: string, url: string, response: any, error?: any) => {
  if (ENV_CONFIG.showAPILogs) {
    if (error) {
      console.error(`❌ API ${method.toUpperCase()} ERROR: ${url}`, error);
    } else {
      console.log(`✅ API ${method.toUpperCase()} SUCCESS: ${url}`, response);
    }
  }
};

// 错误处理函数
const handleApiError = (error: any, endpoint: string): Error => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }
  
  if (error.message.includes('timeout')) {
    return new Error(ERROR_MESSAGES.CONNECTION_TIMEOUT);
  }
  
  // 根据状态码返回相应错误
  if (error.status) {
    switch (error.status) {
      case 401:
        return new Error(ERROR_MESSAGES.UNAUTHORIZED);
      case 403:
        return new Error(ERROR_MESSAGES.FORBIDDEN);
      case 404:
        return new Error(ERROR_MESSAGES.NOT_FOUND);
      case 422:
        return new Error(ERROR_MESSAGES.VALIDATION_ERROR);
      case 500:
        return new Error(ERROR_MESSAGES.SERVER_ERROR);
      default:
        return new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
  
  return new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
};

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
      timeout: this.timeout,
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        logApiResponse(options.method || 'GET', endpoint, null, error);
        throw handleApiError(error, endpoint);
      }
      
      const data = await response.json();
      const result = data.data || data;
      
      logApiResponse(options.method || 'GET', endpoint, result);
      return result;
    } catch (error: any) {
      logApiResponse(options.method || 'GET', endpoint, null, error);
      throw handleApiError(error, endpoint);
    }
  }

  // 健康检查
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`, {
        timeout: 5000
      });
      const data = await response.json();
      return { ...data, connected: true };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Backend not available',
        connected: false,
        error: (error as Error).message 
      };
    }
  }

  // 用户相关接口
  async registerUser(username: string, deviceId: string, email?: string): Promise<User> {
    const response = await this.request<{ user: User; accessToken: string }>(API_ENDPOINTS.AUTH.USER_REGISTER, {
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
    const response = await this.request<{ user: User; accessToken: string }>(API_ENDPOINTS.AUTH.USER_LOGIN, {
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
    const response = await this.request<{ admin: Admin; accessToken: string }>(API_ENDPOINTS.AUTH.ADMIN_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // 保存 token
    localStorage.setItem('authToken', response.accessToken);
    return response.admin;
  }

  // 媒体页面相关接口
  async getPageById(pageId: string): Promise<MediaPage> {
    return this.request<MediaPage>(API_ENDPOINTS.PAGES.BY_ID(pageId));
  }

  async getPageByCode(internalCode: string): Promise<MediaPage> {
    return this.request<MediaPage>(API_ENDPOINTS.PAGES.BY_CODE(internalCode));
  }

  async getPages(): Promise<MediaPage[]> {
    return this.request<MediaPage[]>(API_ENDPOINTS.PAGES.LIST);
  }

  async createPage(pageData: Omit<MediaPage, 'id'>): Promise<MediaPage> {
    return this.request<MediaPage>(API_ENDPOINTS.PAGES.LIST, {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
  }

  async updatePage(pageId: string, updates: Partial<MediaPage>): Promise<MediaPage> {
    return this.request<MediaPage>(API_ENDPOINTS.PAGES.BY_ID(pageId), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePage(pageId: string): Promise<void> {
    return this.request<void>(API_ENDPOINTS.PAGES.BY_ID(pageId), {
      method: 'DELETE',
    });
  }

  // 媒体相关接口
  async getMediaItems(pageId: string): Promise<MediaItem[]> {
    return this.request<MediaItem[]>(API_ENDPOINTS.MEDIA.LIST(pageId));
  }

  async uploadMedia(pageId: string, files: File[], caption: string): Promise<MediaItem[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('caption', caption);

    const token = localStorage.getItem('authToken');
    
    logApiCall('POST', API_ENDPOINTS.MEDIA.UPLOAD(pageId), { filesCount: files.length, caption });

    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.MEDIA.UPLOAD(pageId)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        logApiResponse('POST', API_ENDPOINTS.MEDIA.UPLOAD(pageId), null, error);
        throw handleApiError(error, API_ENDPOINTS.MEDIA.UPLOAD(pageId));
      }

      const data = await response.json();
      const result = data.data?.mediaItems || data.mediaItems || [];
      
      logApiResponse('POST', API_ENDPOINTS.MEDIA.UPLOAD(pageId), result);
      return result;
    } catch (error: any) {
      logApiResponse('POST', API_ENDPOINTS.MEDIA.UPLOAD(pageId), null, error);
      throw handleApiError(error, API_ENDPOINTS.MEDIA.UPLOAD(pageId));
    }
  }

  async deleteMedia(mediaId: string): Promise<void> {
    return this.request<void>(API_ENDPOINTS.MEDIA.BY_ID(mediaId), {
      method: 'DELETE',
    });
  }

  async updateMedia(mediaId: string, updates: { caption?: string }): Promise<MediaItem> {
    return this.request<MediaItem>(API_ENDPOINTS.MEDIA.BY_ID(mediaId), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // 聊天相关接口
  async getChatMessages(pageId: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(API_ENDPOINTS.CHAT.MESSAGES(pageId));
  }

  async sendMessage(pageId: string, content: string): Promise<ChatMessage> {
    const response = await this.request<{ message: ChatMessage }>(API_ENDPOINTS.CHAT.SEND(pageId), {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response.message;
  }

  async deleteMessage(messageId: string): Promise<void> {
    return this.request<void>(API_ENDPOINTS.CHAT.DELETE(messageId), {
      method: 'DELETE',
    });
  }

  // 用户相关接口
  async getUserProfile(): Promise<User> {
    const response = await this.request<{ user: User }>(API_ENDPOINTS.USERS.PROFILE);
    return response.user;
  }

  async updateUserProfile(updates: { username?: string; avatar?: string }): Promise<User> {
    const response = await this.request<{ user: User }>(API_ENDPOINTS.USERS.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.user;
  }

  async getUserStats(): Promise<any> {
    const response = await this.request<{ stats: any }>(API_ENDPOINTS.USERS.STATS);
    return response.stats;
  }

  // 管理员功能接口
  async getAdmins(): Promise<Admin[]> {
    const response = await this.request<{ admins: Admin[] }>(API_ENDPOINTS.ADMIN.ADMINS);
    return response.admins;
  }

  async createAdmin(adminData: Omit<Admin, 'id'>): Promise<Admin> {
    const response = await this.request<{ admin: Admin }>(API_ENDPOINTS.ADMIN.ADMINS, {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
    return response.admin;
  }

  async updateAdmin(adminId: string, updates: Partial<Admin>): Promise<Admin> {
    const response = await this.request<{ admin: Admin }>(`${API_ENDPOINTS.ADMIN.ADMINS}/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.admin;
  }

  async deleteAdmin(adminId: string): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.ADMIN.ADMINS}/${adminId}`, {
      method: 'DELETE',
    });
  }

  async getGlobalStats(): Promise<any> {
    const response = await this.request<{ stats: any }>(API_ENDPOINTS.ADMIN.STATS);
    return response.stats;
  }

  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `${API_ENDPOINTS.ADMIN.USERS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<any>(url);
  }

  // 文件上传接口
  async uploadSingle(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('authToken');
    
    logApiCall('POST', API_ENDPOINTS.UPLOAD.SINGLE, { fileName: file.name, fileSize: file.size });

    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.UPLOAD.SINGLE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        logApiResponse('POST', API_ENDPOINTS.UPLOAD.SINGLE, null, error);
        throw handleApiError(error, API_ENDPOINTS.UPLOAD.SINGLE);
      }

      const data = await response.json();
      const result = data.data?.file || data.file;
      
      logApiResponse('POST', API_ENDPOINTS.UPLOAD.SINGLE, result);
      return result;
    } catch (error: any) {
      logApiResponse('POST', API_ENDPOINTS.UPLOAD.SINGLE, null, error);
      throw handleApiError(error, API_ENDPOINTS.UPLOAD.SINGLE);
    }
  }

  async uploadMultiple(files: File[]): Promise<any[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const token = localStorage.getItem('authToken');
    
    logApiCall('POST', API_ENDPOINTS.UPLOAD.MULTIPLE, { filesCount: files.length });

    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.UPLOAD.MULTIPLE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        logApiResponse('POST', API_ENDPOINTS.UPLOAD.MULTIPLE, null, error);
        throw handleApiError(error, API_ENDPOINTS.UPLOAD.MULTIPLE);
      }

      const data = await response.json();
      const result = data.data?.files || data.files || [];
      
      logApiResponse('POST', API_ENDPOINTS.UPLOAD.MULTIPLE, result);
      return result;
    } catch (error: any) {
      logApiResponse('POST', API_ENDPOINTS.UPLOAD.MULTIPLE, null, error);
      throw handleApiError(error, API_ENDPOINTS.UPLOAD.MULTIPLE);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('authToken');
    }
  }
}

export const apiService = new ApiService();

// 导出调试信息
if (ENV_CONFIG.debugMode) {
  (window as any).apiService = apiService;
  (window as any).API_CONFIG = API_CONFIG;
  console.log('🔧 Debug mode enabled. API service available as window.apiService');
  console.log('🌐 API Base URL:', API_CONFIG.BASE_URL);
  console.log('🎭 Mock API Mode:', ENV_CONFIG.useMockAPI);
  console.log('📊 API Config:', API_CONFIG);
}