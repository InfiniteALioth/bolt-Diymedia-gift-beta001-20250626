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

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      if (!pageId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const api = USE_MOCK_API ? mockApiService : apiService;
        
        const [items, messages] = await Promise.all([
          api.getMediaItems(pageId),
          api.getChatMessages(pageId)
        ]);

        setMediaItems(items);
        setChatMessages(messages);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError(error.message || '数据加载失败');
        
        // 使用空数据作为回退
        setMediaItems([]);
        setChatMessages([]);
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
      }
    };

    loadData();
  }, [pageId]);

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
    } catch (error) {
      console.error('Failed to add media items:', error);
      setError(error.message || '媒体上传失败');
      throw error;
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
      setError(error.message || '媒体删除失败');
      throw error;
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
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error.message || '消息发送失败');
      throw error;
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
    const loadData = async () => {
      if (!pageId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const api = USE_MOCK_API ? mockApiService : apiService;
        
        const [items, messages] = await Promise.all([
          api.getMediaItems(pageId),
          api.getChatMessages(pageId)
        ]);

        setMediaItems(items);
        setChatMessages(messages);
      } catch (error) {
        console.error('Failed to reload data:', error);
        setError(error.message || '数据重新加载失败');
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
      }
    };

    await loadData();
  }, [pageId]);

  return {
    mediaItems,
    chatMessages,
    isLoaded,
    isLoading,
    error,
    addMediaItems,
    removeMediaItem,
    addChatMessage,
    clearAllData,
    reloadData
  };
}