// 前端 API 服务 - 连接后端接口
import { User, MediaItem, ChatMessage, MediaPage, Admin } from '../types';
import { API_CONFIG, API_ENDPOINTS, ENV_CONFIG, ERROR_MESSAGES } from '../config/api';

// API日志记录
const logApiCall = (method: string, url: string, data?: any) => {
  if (ENV_CONFIG.showAPILogs || ENV_CONFIG.isDevelopment) {
    console.log(`🌐 API ${method.toUpperCase()}: ${url}`, data ? { data } : '');
  }
};

const logApiResponse = (method: string, url: string, response: any, error?: any) => {
  if (ENV_CONFIG.showAPILogs || ENV_CONFIG.isDevelopment) {
    if (error) {
      console.error(`❌ API ${method.toUpperCase()} ERROR: ${url}`, error);
    } else {
      console.log(`✅ API ${method.toUpperCase()} SUCCESS: ${url}`, response);
    }
  }
};

// 连接状态类型
export type ConnectionStatus = 'checking' | 'connected' | 'disconnected' | 'error';

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
  private connectionStatus: ConnectionStatus = 'checking';
  private retryAttempts: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;
  private connectionListeners: ((status: ConnectionStatus) => void)[] = [];

  constructor() {
    // 使用相对路径，让 Vite 代理处理
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    this.timeout = API_CONFIG.TIMEOUT;
    
    // 初始化时检查连接
    this.checkConnection();
    
    if (ENV_CONFIG.isDevelopment) {
      console.log('🔧 API Service initialized');
      console.log('🌐 Base URL:', this.baseURL);
      console.log('⏱️ Timeout:', this.timeout);
    }
  }

  // 连接状态管理
  private setConnectionStatus(status: ConnectionStatus) {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.connectionListeners.forEach(listener => listener(status));
      
      if (ENV_CONFIG.isDevelopment) {
        console.log(`🔗 Connection status changed: ${status}`);
      }
    }
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public onConnectionStatusChange(listener: (status: ConnectionStatus) => void) {
    this.connectionListeners.push(listener);
    return () => {
      const index = this.connectionListeners.indexOf(listener);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  // 连接检查
  public async checkConnection(): Promise<boolean> {
    // 如果使用Mock API，直接返回连接成功
    if (ENV_CONFIG.useMockAPI) {
      console.log('Using Mock API mode - skipping real backend connection check');
      this.setConnectionStatus('connected');
      return true;
    }
    
    this.setConnectionStatus('checking');
    
    try {
      // 使用相对路径，让 Vite 代理处理
      const response = await fetch('/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        this.setConnectionStatus('connected');
        this.retryAttempts = 0;
        return true;
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      
      // 如果使用Mock API，则忽略连接错误
      if (ENV_CONFIG.useMockAPI) {
        console.log('Using Mock API, ignoring connection error');
        this.setConnectionStatus('connected');
        return true;
      }
      
      this.setConnectionStatus('disconnected');
      return false;
    }
  }

  // 自动重试机制
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    endpoint: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // 等待重试延迟
          await new Promise(resolve => 
            setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
          );
          
          if (ENV_CONFIG.isDevelopment) {
            console.log(`🔄 Retrying request (${attempt}/${this.maxRetries}): ${endpoint}`);
          }
        }
        
        const result = await requestFn();
        
        // 请求成功，重置重试计数
        this.retryAttempts = 0;
        if (this.connectionStatus !== 'connected') {
          this.setConnectionStatus('connected');
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        
        // 如果是网络错误，尝试重新连接
        if (error instanceof TypeError && error.message.includes('fetch')) {
          this.setConnectionStatus('disconnected');
          await this.checkConnection();
        }
        
        // 如果是最后一次尝试，抛出错误
        if (attempt === this.maxRetries) {
          this.setConnectionStatus('error');
          break;
        }
      }
    }
    
    throw handleApiError(lastError!, endpoint);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // 如果使用Mock API，直接返回模拟数据
    if (ENV_CONFIG.useMockAPI) {
      console.warn(`Using Mock API for ${options.method || 'GET'} ${endpoint} - real API call skipped`);
      throw new Error('Mock API mode is enabled, but no mock handler is available for this endpoint');
    }
    
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...API_CONFIG.HEADERS,
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

    const requestFn = async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
          (error as any).status = response.status;
          throw error;
        }
        
        const data = await response.json();
        const result = data.data || data;
        
        logApiResponse(options.method || 'GET', endpoint, result);
        return result;
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new Error(ERROR_MESSAGES.CONNECTION_TIMEOUT);
        }
        
        throw error;
      }
    };

    return this.retryRequest(requestFn, endpoint);
  }

  // 健康检查
  async healthCheck(): Promise<any> {
    try {
      // 如果使用Mock API，返回模拟的健康状态
      if (ENV_CONFIG.useMockAPI) {
        return { 
          status: 'OK', 
          message: 'Using Mock API',
          connected: true,
          timestamp: new Date().toISOString(),
          mode: 'mock'
        };
      }
      
      // 使用相对路径，让 Vite 代理处理
      const response = await fetch('/health', {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      return { ...data, connected: true };
    } catch (error) {
      // 如果使用Mock API，返回模拟的健康状态
      if (ENV_CONFIG.useMockAPI) {
        return { 
          status: 'OK', 
          message: 'Using Mock API',
          connected: true,
          timestamp: new Date().toISOString()
        };
      }
      
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

    const uploadFn = async (): Promise<MediaItem[]> => {
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
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      const result = data.data?.mediaItems || data.mediaItems || [];
      
      logApiResponse('POST', API_ENDPOINTS.MEDIA.UPLOAD(pageId), result);
      return result;
    };

    return this.retryRequest(uploadFn, API_ENDPOINTS.MEDIA.UPLOAD(pageId));
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

    const uploadFn = async (): Promise<any> => {
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
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      const result = data.data?.file || data.file;
      
      logApiResponse('POST', API_ENDPOINTS.UPLOAD.SINGLE, result);
      return result;
    };

    return this.retryRequest(uploadFn, API_ENDPOINTS.UPLOAD.SINGLE);
  }

  async uploadMultiple(files: File[]): Promise<any[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const token = localStorage.getItem('authToken');
    
    logApiCall('POST', API_ENDPOINTS.UPLOAD.MULTIPLE, { filesCount: files.length });

    const uploadFn = async (): Promise<any[]> => {
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
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      const result = data.data?.files || data.files || [];
      
      logApiResponse('POST', API_ENDPOINTS.UPLOAD.MULTIPLE, result);
      return result;
    };

    return this.retryRequest(uploadFn, API_ENDPOINTS.UPLOAD.MULTIPLE);
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
if (ENV_CONFIG.debugMode || ENV_CONFIG.isDevelopment) {
  (window as any).apiService = apiService;
  (window as any).API_CONFIG = API_CONFIG;
  console.log('🔧 Debug mode enabled. API service available as window.apiService');
  console.log('🌐 API Base URL:', API_CONFIG.BASE_URL);
  console.log('🎭 Mock API Mode:', ENV_CONFIG.useMockAPI);
  console.log('📊 API Config:', API_CONFIG);
}