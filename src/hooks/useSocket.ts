// Socket.IO React Hook
import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services/socket';
import { ChatMessage } from '../types';

interface UseSocketOptions {
  pageId?: string;
  onUserJoined?: (data: { userId: string; username: string; joinedAt: string }) => void;
  onUserLeft?: (data: { userId: string; username: string; leftAt: string }) => void;
  onRoomUsers?: (users: Array<{ id: string; username: string; joinedAt: string }>) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onMediaUploaded?: (data: { 
    id: string; 
    uploaderId: string; 
    uploaderName: string; 
    type: string; 
    caption?: string; 
    createdAt: string; 
    pageId: string; 
  }) => void;
  onUserTyping?: (data: { userId: string; username: string }) => void;
  onUserStoppedTyping?: (data: { userId: string; username: string }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConnectError?: (error: Error) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const {
    pageId,
    onUserJoined,
    onUserLeft,
    onRoomUsers,
    onMessageReceived,
    onMediaUploaded,
    onUserTyping,
    onUserStoppedTyping,
    onConnect,
    onDisconnect,
    onConnectError
  } = options;

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 连接到 Socket.IO
  const connect = useCallback(async (token: string) => {
    try {
      await socketService.connect(token);
    } catch (error) {
      console.error('Failed to connect to socket:', error);
      throw error;
    }
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  // 加入页面
  const joinPage = useCallback((targetPageId: string) => {
    socketService.joinPage(targetPageId);
  }, []);

  // 离开页面
  const leavePage = useCallback((targetPageId: string) => {
    socketService.leavePage(targetPageId);
  }, []);

  // 发送消息通知
  const sendMessageNotification = useCallback((content: string, messageId: string) => {
    if (pageId) {
      socketService.sendMessageNotification(pageId, content, messageId);
    }
  }, [pageId]);

  // 发送媒体通知
  const sendMediaNotification = useCallback((mediaId: string, type: string, caption?: string) => {
    if (pageId) {
      socketService.sendMediaNotification(pageId, mediaId, type, caption);
    }
  }, [pageId]);

  // 开始输入
  const startTyping = useCallback(() => {
    if (pageId) {
      socketService.startTyping(pageId);
      
      // 清除之前的定时器
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // 3秒后自动停止输入状态
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(pageId);
      }, 3000);
    }
  }, [pageId]);

  // 停止输入
  const stopTyping = useCallback(() => {
    if (pageId) {
      socketService.stopTyping(pageId);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [pageId]);

  // 检查连接状态
  const isConnected = useCallback(() => {
    return socketService.isSocketConnected();
  }, []);

  // 设置事件监听器
  useEffect(() => {
    if (onUserJoined) {
      socketService.on('user-joined', onUserJoined);
    }
    if (onUserLeft) {
      socketService.on('user-left', onUserLeft);
    }
    if (onRoomUsers) {
      socketService.on('room-users', onRoomUsers);
    }
    if (onMessageReceived) {
      socketService.on('message-received', onMessageReceived);
    }
    if (onMediaUploaded) {
      socketService.on('media-uploaded', onMediaUploaded);
    }
    if (onUserTyping) {
      socketService.on('user-typing', onUserTyping);
    }
    if (onUserStoppedTyping) {
      socketService.on('user-stopped-typing', onUserStoppedTyping);
    }
    if (onConnect) {
      socketService.on('connect', onConnect);
    }
    if (onDisconnect) {
      socketService.on('disconnect', onDisconnect);
    }
    if (onConnectError) {
      socketService.on('connect_error', onConnectError);
    }

    // 清理函数
    return () => {
      if (onUserJoined) {
        socketService.off('user-joined', onUserJoined);
      }
      if (onUserLeft) {
        socketService.off('user-left', onUserLeft);
      }
      if (onRoomUsers) {
        socketService.off('room-users', onRoomUsers);
      }
      if (onMessageReceived) {
        socketService.off('message-received', onMessageReceived);
      }
      if (onMediaUploaded) {
        socketService.off('media-uploaded', onMediaUploaded);
      }
      if (onUserTyping) {
        socketService.off('user-typing', onUserTyping);
      }
      if (onUserStoppedTyping) {
        socketService.off('user-stopped-typing', onUserStoppedTyping);
      }
      if (onConnect) {
        socketService.off('connect', onConnect);
      }
      if (onDisconnect) {
        socketService.off('disconnect', onDisconnect);
      }
      if (onConnectError) {
        socketService.off('connect_error', onConnectError);
      }
    };
  }, [
    onUserJoined,
    onUserLeft,
    onRoomUsers,
    onMessageReceived,
    onMediaUploaded,
    onUserTyping,
    onUserStoppedTyping,
    onConnect,
    onDisconnect,
    onConnectError
  ]);

  // 自动加入/离开页面
  useEffect(() => {
    if (pageId && isConnected()) {
      joinPage(pageId);
    }

    return () => {
      if (pageId && isConnected()) {
        leavePage(pageId);
      }
    };
  }, [pageId, joinPage, leavePage, isConnected]);

  // 清理输入定时器
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    joinPage,
    leavePage,
    sendMessageNotification,
    sendMediaNotification,
    startTyping,
    stopTyping,
    isConnected,
    socketService
  };
}