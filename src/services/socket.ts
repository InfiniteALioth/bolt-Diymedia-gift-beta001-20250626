// Socket.IO 客户端服务
import { io, Socket } from 'socket.io-client';
import { API_CONFIG, ENV_CONFIG } from '../config/api';
import { ChatMessage, MediaItem } from '../types';

interface SocketEvents {
  // 服务器到客户端事件
  'user-joined': (data: { userId: string; username: string; joinedAt: string }) => void;
  'user-left': (data: { userId: string; username: string; leftAt: string }) => void;
  'room-users': (users: Array<{ id: string; username: string; joinedAt: string }>) => void;
  'message-received': (message: ChatMessage) => void;
  'media-uploaded': (data: { 
    id: string; 
    uploaderId: string; 
    uploaderName: string; 
    type: string; 
    caption?: string; 
    createdAt: string; 
    pageId: string; 
  }) => void;
  'user-typing': (data: { userId: string; username: string }) => void;
  'user-stopped-typing': (data: { userId: string; username: string }) => void;
  'connect': () => void;
  'disconnect': () => void;
  'connect_error': (error: Error) => void;
}

interface SocketEmitEvents {
  // 客户端到服务器事件
  'join-page': (pageId: string) => void;
  'leave-page': (pageId: string) => void;
  'new-message': (data: { pageId: string; content: string; messageId: string }) => void;
  'new-media': (data: { pageId: string; mediaId: string; type: string; caption?: string }) => void;
  'typing-start': (pageId: string) => void;
  'typing-stop': (pageId: string) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentPageId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // 事件监听器存储
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    if (ENV_CONFIG.debugMode) {
      console.log('🔌 Socket service initialized');
    }
  }

  // 连接到 Socket.IO 服务器
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      // 使用相对路径，让 Vite 代理处理
      const socketUrl = import.meta.env.VITE_SOCKET_URL || '';
      
      this.socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        path: '/socket.io'
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        if (ENV_CONFIG.debugMode) {
          console.log('🔌 Socket connected:', this.socket?.id);
        }
        
        this.emit('connect');
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        
        if (ENV_CONFIG.debugMode) {
          console.log('🔌 Socket disconnected:', reason);
        }
        
        this.emit('disconnect');
      });

      this.socket.on('connect_error', (error) => {
        this.reconnectAttempts++;
        
        if (ENV_CONFIG.debugMode) {
          console.error('🔌 Socket connection error:', error);
        }
        
        this.emit('connect_error', error);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to real-time server'));
        }
      });

      // 设置页面相关事件监听器
      this.setupPageEventListeners();
    });
  }

  // 断开连接
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentPageId = null;
      
      if (ENV_CONFIG.debugMode) {
        console.log('🔌 Socket disconnected manually');
      }
    }
  }

  // 检查连接状态
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // 加入页面房间
  joinPage(pageId: string): void {
    if (!this.isSocketConnected()) {
      console.warn('Socket not connected, cannot join page');
      return;
    }

    // 如果已经在其他页面，先离开
    if (this.currentPageId && this.currentPageId !== pageId) {
      this.leavePage(this.currentPageId);
    }

    this.currentPageId = pageId;
    this.socket?.emit('join-page', pageId);
    
    if (ENV_CONFIG.debugMode) {
      console.log('🔌 Joined page:', pageId);
    }
  }

  // 离开页面房间
  leavePage(pageId: string): void {
    if (!this.isSocketConnected()) {
      return;
    }

    this.socket?.emit('leave-page', pageId);
    
    if (this.currentPageId === pageId) {
      this.currentPageId = null;
    }
    
    if (ENV_CONFIG.debugMode) {
      console.log('🔌 Left page:', pageId);
    }
  }

  // 发送新消息通知
  sendMessageNotification(pageId: string, content: string, messageId: string): void {
    if (!this.isSocketConnected()) {
      return;
    }

    this.socket?.emit('new-message', { pageId, content, messageId });
  }

  // 发送新媒体通知
  sendMediaNotification(pageId: string, mediaId: string, type: string, caption?: string): void {
    if (!this.isSocketConnected()) {
      return;
    }

    this.socket?.emit('new-media', { pageId, mediaId, type, caption });
  }

  // 发送正在输入通知
  startTyping(pageId: string): void {
    if (!this.isSocketConnected()) {
      return;
    }

    this.socket?.emit('typing-start', pageId);
  }

  // 停止输入通知
  stopTyping(pageId: string): void {
    if (!this.isSocketConnected()) {
      return;
    }

    this.socket?.emit('typing-stop', pageId);
  }

  // 设置页面相关事件监听器
  private setupPageEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('user-joined', (data) => {
      this.emit('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      this.emit('user-left', data);
    });

    this.socket.on('room-users', (users) => {
      this.emit('room-users', users);
    });

    this.socket.on('message-received', (message) => {
      this.emit('message-received', message);
    });

    this.socket.on('media-uploaded', (data) => {
      this.emit('media-uploaded', data);
    });

    this.socket.on('user-typing', (data) => {
      this.emit('user-typing', data);
    });

    this.socket.on('user-stopped-typing', (data) => {
      this.emit('user-stopped-typing', data);
    });
  }

  // 事件监听器管理
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          (callback as any)(...args);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // 获取当前页面ID
  getCurrentPageId(): string | null {
    return this.currentPageId;
  }

  // 重新连接
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }
}

// 创建单例实例
export const socketService = new SocketService();

// 导出调试信息
if (ENV_CONFIG.debugMode) {
  (window as any).socketService = socketService;
  console.log('🔌 Socket service available as window.socketService');
}

export default socketService;