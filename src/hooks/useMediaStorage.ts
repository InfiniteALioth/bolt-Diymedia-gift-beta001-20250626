import { useState, useEffect, useCallback } from 'react';
import { MediaItem, ChatMessage } from '../types';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockData';

// 开发模式开关
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_API_URL;

export function useMediaStorage(pageId: string) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      if (!pageId) return;
      
      setIsLoading(true);
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
    try {
      const api = USE_MOCK_API ? mockApiService : apiService;
      const newItems = await api.uploadMedia(pageId, files, caption);
      
      setMediaItems(prev => [...newItems, ...prev]);
      console.log('Successfully added', newItems.length, 'media items');
    } catch (error) {
      console.error('Failed to add media items:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 删除媒体项
  const removeMediaItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      if (!USE_MOCK_API) {
        await apiService.deleteMedia(itemId);
      }
      
      setMediaItems(prev => prev.filter(item => item.id !== itemId));
      console.log('Deleted media item:', itemId);
    } catch (error) {
      console.error('Failed to delete media item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 添加聊天消息
  const addChatMessage = useCallback(async (message: ChatMessage) => {
    setIsLoading(true);
    try {
      const api = USE_MOCK_API ? mockApiService : apiService;
      const newMessage = await api.sendMessage(message.pageId, message.content);
      
      setChatMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 清空所有数据
  const clearAllData = useCallback(async () => {
    setMediaItems([]);
    setChatMessages([]);
    console.log('Cleared all data');
  }, []);

  return {
    mediaItems,
    chatMessages,
    isLoaded,
    isLoading,
    addMediaItems,
    removeMediaItem,
    addChatMessage,
    clearAllData
  };
}