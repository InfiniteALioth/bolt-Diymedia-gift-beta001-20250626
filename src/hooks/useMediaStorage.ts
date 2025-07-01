import { useState, useEffect, useCallback } from 'react';
import { MediaItem, ChatMessage } from '../types';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockData';

// 开发模式开关
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export function useMediaStorage(pageId: string) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastLoadTime, setLastLoadTime] = useState<Date | null>(null);

  // 加载数据
  const loadData = useCallback(async (showLoading = true) => {
    if (!pageId) return;
    
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const api = USE_MOCK_API ? mockApiService : apiService;
      
      const [items, messages] = await Promise.all([
        api.getMediaItems(pageId),
        api.getChatMessages(pageId)
      ]);

      setMediaItems(items);
      setChatMessages(messages);
      setLastLoadTime(new Date());
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to load data:', error);
      
      // 提供更友好的错误消息
      let errorMessage = '数据加载失败';
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = '无法连接到服务器，请检查网络连接';
        } else if (error.message.includes('timeout')) {
          errorMessage = '服务器响应超时，请稍后再试';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      // 使用空数据作为回退
      if (!isLoaded) {
        setMediaItems([]);
        setChatMessages([]);
      }
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  }, [pageId]);

  // 初始加载数据
  useEffect(() => {
    loadData();
    
    // 设置定期刷新
    const refreshInterval = setInterval(() => {
      // 只有在已经成功加载过数据的情况下才自动刷新
      if (isLoaded && !error) {
        loadData(false); // 不显示加载状态，静默刷新
      }
    }, 60000); // 每分钟刷新一次
    
    return () => clearInterval(refreshInterval);
  }, [loadData, isLoaded, error]);

  // 添加媒体项
  const addMediaItems = useCallback(async (
    files: File[], 
    uploaderName: string, 
    caption: string, 
    uploaderId: string, 
    pageId: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = USE_MOCK_API ? mockApiService : apiService;
      const newItems = await api.uploadMedia(pageId, files, caption);
      
      // 确保新项目有正确的上传者信息
      const itemsWithUploader = newItems.map(item => ({
        ...item,
        uploaderName,
        uploaderId
      }));
      
      setMediaItems(prev => [...itemsWithUploader, ...prev]);
      console.log('Successfully added', newItems.length, 'media items');
      return newItems;
    } catch (error) {
      console.error('Failed to add media items:', error);
      
      // 提供更友好的错误消息
      let errorMessage = '媒体上传失败';
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = '无法连接到服务器，请检查网络连接';
        } else if (error.message.includes('timeout')) {
          errorMessage = '上传超时，请稍后再试';
        } else if (error.message.includes('size')) {
          errorMessage = '文件大小超出限制';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 删除媒体项
  const removeMediaItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!USE_MOCK_API) {
        await apiService.deleteMedia(itemId);
      }
      
      setMediaItems(prev => prev.filter(item => item.id !== itemId));
      console.log('Deleted media item:', itemId);
    } catch (error) {
      console.error('Failed to delete media item:', error);
      
      // 提供更友好的错误消息
      let errorMessage = '媒体删除失败';
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = '无法连接到服务器，请检查网络连接';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 添加聊天消息
  const addChatMessage = useCallback(async (message: ChatMessage) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = USE_MOCK_API ? mockApiService : apiService;
      const newMessage = await api.sendMessage(message.pageId, message.content);
      
      // 确保消息有正确的用户信息
      const messageWithUser = {
        ...newMessage,
        username: message.username,
        userId: message.userId
      };
      
      setChatMessages(prev => [...prev, messageWithUser]);
      return messageWithUser;
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // 提供更友好的错误消息
      let errorMessage = '消息发送失败';
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = '无法连接到服务器，请检查网络连接';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // 在离线模式下，仍然添加消息到本地（标记为本地消息）
      if (USE_MOCK_API || error.toString().includes('fetch')) {
        const offlineMessage = {
          ...message,
          id: message.id || `local_${Date.now()}`,
          isLocal: true
        };
        setChatMessages(prev => [...prev, offlineMessage]);
        return offlineMessage;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 清空所有数据
  const clearAllData = useCallback(async () => {
    setMediaItems([]);
    setChatMessages([]);
    setError(null);
    console.log('Cleared all data');
  }, []);

  // 重新加载数据
  const reloadData = useCallback(async () => {
    setIsLoaded(false);
    await loadData();
  }, [loadData]);

  return {
    mediaItems,
    chatMessages,
    isLoaded,
    isLoading,
    error,
    retryCount,
    lastLoadTime,
    addMediaItems,
    removeMediaItem,
    addChatMessage,
    clearAllData,
    reloadData
  };
}