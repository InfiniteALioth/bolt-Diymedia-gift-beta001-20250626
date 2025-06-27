import { useState, useEffect, useCallback } from 'react';
import { MediaItem, ChatMessage } from '../types';

interface MediaStorage {
  mediaItems: MediaItem[];
  chatMessages: ChatMessage[];
}

// Helper function to convert File to Data URL
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to create MediaItem from File with Data URL
const createMediaItemFromFile = async (
  file: File, 
  uploaderName: string, 
  caption: string, 
  uploaderId: string, 
  pageId: string
): Promise<MediaItem> => {
  try {
    const dataURL = await fileToDataURL(file);
    
    let type: 'image' | 'video' | 'audio';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else throw new Error('Unsupported file type');

    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      url: dataURL, // Use Data URL for persistence
      thumbnail: type === 'image' ? dataURL : undefined,
      uploaderId,
      uploaderName,
      caption,
      createdAt: new Date().toISOString(),
      pageId
    };
  } catch (error) {
    console.error('Failed to create media item from file:', error);
    throw error;
  }
};

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
      // If parsing fails, clear the corrupted data
      localStorage.removeItem(storageKey);
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
      // If storage fails due to quota exceeded, try to free up space
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('存储空间不足，请删除一些旧的媒体文件后重试');
      }
    }
  }, [storageKey]);

  // 添加媒体项 - 接受 File 数组并转换为 Data URL
  const addMediaItems = useCallback(async (
    files: File[], 
    uploaderName: string, 
    caption: string, 
    uploaderId: string, 
    pageId: string
  ) => {
    try {
      console.log('开始处理文件:', files.length);
      const newItems: MediaItem[] = [];
      
      for (const file of files) {
        try {
          const mediaItem = await createMediaItemFromFile(file, uploaderName, caption, uploaderId, pageId);
          newItems.push(mediaItem);
          console.log('文件处理完成:', file.name, '-> Data URL长度:', mediaItem.url.length);
        } catch (error) {
          console.error('处理文件失败:', file.name, error);
          alert(`处理文件 "${file.name}" 失败，请重试`);
        }
      }

      if (newItems.length > 0) {
        setMediaItems(prev => {
          const updated = [...prev, ...newItems];
          saveToStorage(updated, chatMessages);
          return updated;
        });
        console.log('成功添加', newItems.length, '个媒体项');
      }
    } catch (error) {
      console.error('添加媒体项失败:', error);
      alert('添加媒体失败，请重试');
    }
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