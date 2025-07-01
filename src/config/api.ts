// API 配置文件
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // 文件上传配置
  UPLOAD: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      audio: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg']
    },
    CHUNK_SIZE: 1024 * 1024 // 1MB chunks for large files
  },
  
  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },
  
  // 重试配置
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
    BACKOFF_FACTOR: 2
  }
};

// API 端点配置
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    USER_REGISTER: '/auth/user/register',
    USER_LOGIN: '/auth/user/login',
    ADMIN_LOGIN: '/auth/admin/login',
    ADMIN_REGISTER: '/auth/admin/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  
  // 页面相关
  PAGES: {
    LIST: '/pages',
    BY_ID: (id: string) => `/pages/${id}`,
    BY_CODE: (code: string) => `/pages/code/${code}`,
    STATS: (id: string) => `/pages/${id}/stats`
  },
  
  // 媒体相关
  MEDIA: {
    LIST: (pageId: string) => `/media/${pageId}`,
    UPLOAD: (pageId: string) => `/media/${pageId}`,
    BY_ID: (id: string) => `/media/${id}`
  },
  
  // 聊天相关
  CHAT: {
    MESSAGES: (pageId: string) => `/chat/${pageId}`,
    SEND: (pageId: string) => `/chat/${pageId}`,
    DELETE: (messageId: string) => `/chat/${messageId}`
  },
  
  // 用户相关
  USERS: {
    PROFILE: '/users/profile',
    STATS: '/users/stats',
    MEDIA: '/users/media'
  },
  
  // 上传相关
  UPLOAD: {
    SINGLE: '/upload/single',
    MULTIPLE: '/upload/multiple'
  },
  
  // 管理员相关
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    ADMINS: '/admin/admins'
  },
  
  // 健康检查
  HEALTH: '/health'
};

// 环境配置
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  useMockAPI: import.meta.env.VITE_USE_MOCK_API === 'true',
  showAPILogs: import.meta.env.VITE_SHOW_API_LOGS === 'true',
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  appName: import.meta.env.VITE_APP_NAME || '互动媒体展示平台',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appMode: import.meta.env.VITE_APP_MODE || 'development'
};

// 错误消息映射
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  UNAUTHORIZED: '未授权访问，请重新登录',
  FORBIDDEN: '权限不足，无法执行此操作',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '输入数据格式错误',
  UPLOAD_ERROR: '文件上传失败',
  CONNECTION_TIMEOUT: '连接超时，请重试',
  UNKNOWN_ERROR: '未知错误，请联系管理员'
};

// 开发环境日志
if (ENV_CONFIG.isDevelopment) {
  console.log('🔧 API Configuration loaded:');
  console.log('📡 Base URL:', API_CONFIG.BASE_URL);
  console.log('🔌 Socket URL:', API_CONFIG.SOCKET_URL);
  console.log('🎭 Mock API:', ENV_CONFIG.useMockAPI);
  console.log('📊 Debug Mode:', ENV_CONFIG.debugMode);
  console.log('📝 API Logs:', ENV_CONFIG.showAPILogs);
}