import { useState, useEffect, useCallback } from 'react';
import { MediaItem, ChatMessage } from '../types';

interface MediaStorage {
  mediaItems: MediaItem[];
  chatMessages: ChatMessage[];
}

export function useMediaStorage(pageId: string) {
  const storageKey = `mediaPage_${pageId}`;
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从本地存储加载数据
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data: MediaStorage = JSON.parse(stored);
        console.log('从本地存储加载数据:', data);
        setMediaItems(data.mediaItems || []);
        setChatMessages(data.chatMessages || []);
      }
    } catch (error) {
      console.error('加载本地存储数据失败:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // 保存数据到本地存储
  const saveToStorage = useCallback((items: MediaItem[], messages: ChatMessage[]) => {
    try {
      const data: MediaStorage = {
        mediaItems: items,
        chatMessages: messages
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log('数据已保存到本地存储:', data);
    } catch (error) {
      console.error('保存到本地存储失败:', error);
    }
  }, [storageKey]);

  // 添加媒体项
  const addMediaItems = useCallback((newItems: MediaItem[]) => {
    setMediaItems(prev => {
      const updated = [...prev, ...newItems];
      saveToStorage(updated, chatMessages);
      return updated;
    });
  }, [chatMessages, saveToStorage]);

  // 删除媒体项
  const removeMediaItem = useCallback((itemId: string) => {
    setMediaItems(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      saveToStorage(updated, chatMessages);
      return updated;
    });
  }, [chatMessages, saveToStorage]);

  // 添加聊天消息
  const addChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages(prev => {
      const updated = [...prev, message];
      saveToStorage(mediaItems, updated);
      return updated;
    });
  }, [mediaItems, saveToStorage]);

  // 清空所有数据
  const clearAllData = useCallback(() => {
    setMediaItems([]);
    setChatMessages([]);
    localStorage.removeItem(storageKey);
    console.log('已清空所有数据');
  }, [storageKey]);

  return {
    mediaItems,
    chatMessages,
    isLoaded,
    addMediaItems,
    removeMediaItem,
    addChatMessage,
    clearAllData
  };
}