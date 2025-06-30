import { useState, useEffect, useCallback } from 'react';
import { MediaItem, ChatMessage } from '../types';

interface MediaStorage {
  mediaItems: MediaItem[];
  chatMessages: ChatMessage[];
}

// 改进的存储管理器 - 确保每个页面完全独立
class PageDataManager {
  private static instance: PageDataManager;
  private pageDataMap: Map<string, MediaStorage> = new Map();
  private blobUrlsMap: Map<string, Map<string, string>> = new Map();

  static getInstance(): PageDataManager {
    if (!PageDataManager.instance) {
      PageDataManager.instance = new PageDataManager();
    }
    return PageDataManager.instance;
  }

  // 将文件转换为Base64字符串
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 将Base64字符串转换为Blob URL
  private base64ToBlobUrl(base64String: string): string {
    try {
      // 从data URL中提取MIME类型和数据
      const [header, data] = base64String.split(',');
      const mimeMatch = header.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      
      // 将Base64转换为二进制数据
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // 创建Blob并生成URL
      const blob = new Blob([bytes], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Base64转换为Blob URL失败:', error);
      return '';
    }
  }

  // 获取页面数据
  getPageData(pageId: string): MediaStorage {
    if (!this.pageDataMap.has(pageId)) {
      this.pageDataMap.set(pageId, {
        mediaItems: [],
        chatMessages: []
      });
      this.blobUrlsMap.set(pageId, new Map());
    }
    return this.pageDataMap.get(pageId)!;
  }

  // 获取页面的blob URLs
  getPageBlobUrls(pageId: string): Map<string, string> {
    if (!this.blobUrlsMap.has(pageId)) {
      this.blobUrlsMap.set(pageId, new Map());
    }
    return this.blobUrlsMap.get(pageId)!;
  }

  // 保存页面数据到localStorage
  savePageData(pageId: string, data: MediaStorage): void {
    this.pageDataMap.set(pageId, data);
    try {
      // 现在可以直接保存，因为URL已经是Base64字符串
      localStorage.setItem(`pageData_${pageId}`, JSON.stringify(data));
    } catch (error) {
      console.error('保存页面数据失败:', error);
    }
  }

  // 从localStorage加载页面数据
  loadPageData(pageId: string): MediaStorage {
    try {
      const saved = localStorage.getItem(`pageData_${pageId}`);
      if (saved) {
        const data = JSON.parse(saved);
        const blobUrls = this.getPageBlobUrls(pageId);
        
        // 将Base64 URLs转换回Blob URLs
        data.mediaItems = data.mediaItems.map((item: MediaItem) => {
          if (item.url && item.url.startsWith('data:')) {
            // 这是一个Base64 URL，需要转换为Blob URL
            const blobUrl = this.base64ToBlobUrl(item.url);
            blobUrls.set(item.id, blobUrl);
            
            return {
              ...item,
              url: blobUrl,
              thumbnail: item.type === 'image' ? blobUrl : item.thumbnail
            };
          }
          return item;
        });
        
        this.pageDataMap.set(pageId, data);
        return data;
      }
    } catch (error) {
      console.error('加载页面数据失败:', error);
    }
    
    // 返回空数据
    const emptyData = { mediaItems: [], chatMessages: [] };
    this.pageDataMap.set(pageId, emptyData);
    return emptyData;
  }

  // 添加媒体项
  async addMediaItem(pageId: string, file: File, uploaderName: string, caption: string, uploaderId: string): Promise<MediaItem> {
    const pageData = this.getPageData(pageId);
    const blobUrls = this.getPageBlobUrls(pageId);

    // 创建媒体项
    let type: 'image' | 'video' | 'audio';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else throw new Error('Unsupported file type');

    const mediaItem: MediaItem = {
      id: `${pageId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      url: '', // 将在下面设置
      thumbnail: type === 'image' ? '' : undefined,
      uploaderId,
      uploaderName,
      caption,
      createdAt: new Date().toISOString(),
      pageId
    };

    try {
      // 将文件转换为Base64字符串用于持久化存储
      const base64String = await this.fileToBase64(file);
      
      // 创建blob URL用于运行时显示
      const blobUrl = URL.createObjectURL(file);
      blobUrls.set(mediaItem.id, blobUrl);
      
      // 设置URL - 存储Base64用于持久化，但在运行时使用blob URL
      mediaItem.url = base64String; // 存储Base64字符串
      if (mediaItem.type === 'image') {
        mediaItem.thumbnail = base64String;
      }

      // 添加到页面数据
      pageData.mediaItems.unshift(mediaItem); // 添加到开头
      
      // 保存数据（现在包含Base64数据）
      this.savePageData(pageId, pageData);
      
      // 返回运行时版本（使用blob URL）
      return {
        ...mediaItem,
        url: blobUrl,
        thumbnail: mediaItem.type === 'image' ? blobUrl : mediaItem.thumbnail
      };
    } catch (error) {
      console.error('处理文件失败:', error);
      throw error;
    }
  }

  // 删除媒体项
  removeMediaItem(pageId: string, itemId: string): void {
    const pageData = this.getPageData(pageId);
    const blobUrls = this.getPageBlobUrls(pageId);

    // 释放blob URL
    const blobUrl = blobUrls.get(itemId);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrls.delete(itemId);
    }

    // 从数据中移除
    pageData.mediaItems = pageData.mediaItems.filter(item => item.id !== itemId);
    
    // 保存数据
    this.savePageData(pageId, pageData);
  }

  // 添加聊天消息
  addChatMessage(pageId: string, message: ChatMessage): void {
    const pageData = this.getPageData(pageId);
    
    // 确保消息关联到正确的页面
    const messageWithPageId = { ...message, pageId };
    pageData.chatMessages.push(messageWithPageId);
    
    // 保存数据
    this.savePageData(pageId, pageData);
  }

  // 清空页面数据
  clearPageData(pageId: string): void {
    const blobUrls = this.getPageBlobUrls(pageId);
    
    // 释放所有blob URLs
    blobUrls.forEach(url => URL.revokeObjectURL(url));
    blobUrls.clear();
    
    // 清空数据
    this.pageDataMap.set(pageId, { mediaItems: [], chatMessages: [] });
    
    // 从localStorage删除
    localStorage.removeItem(`pageData_${pageId}`);
  }

  // 获取所有页面ID（用于调试）
  getAllPageIds(): string[] {
    return Array.from(this.pageDataMap.keys());
  }
}

export function useMediaStorage(pageId: string) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const dataManager = PageDataManager.getInstance();

  // 加载页面数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 从localStorage加载数据
        const pageData = dataManager.loadPageData(pageId);
        
        // 设置状态
        setMediaItems(pageData.mediaItems);
        setChatMessages(pageData.chatMessages);
        
      } catch (error) {
        console.error('加载页面数据失败:', pageId, error);
        setMediaItems([]);
        setChatMessages([]);
      } finally {
        setIsLoaded(true);
      }
    };

    // 重置状态
    setIsLoaded(false);
    setMediaItems([]);
    setChatMessages([]);
    
    loadData();

    // 清理函数：页面切换时清理blob URLs
    return () => {
      const blobUrls = dataManager.getPageBlobUrls(pageId);
      blobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [pageId]);

  // 添加媒体项
  const addMediaItems = useCallback(async (
    files: File[], 
    uploaderName: string, 
    caption: string, 
    uploaderId: string, 
    targetPageId: string
  ) => {
    const actualPageId = targetPageId || pageId;

    try {
      const newItems: MediaItem[] = [];
      
      for (const file of files) {
        try {
          const mediaItem = await dataManager.addMediaItem(actualPageId, file, uploaderName, caption, uploaderId);
          newItems.push(mediaItem);
        } catch (error) {
          console.error('处理文件失败:', file.name, error);
          alert(`处理文件 "${file.name}" 失败，请重试`);
        }
      }

      if (newItems.length > 0 && actualPageId === pageId) {
        // 只有当前页面才更新状态
        setMediaItems(prev => [...newItems, ...prev]);
      }
    } catch (error) {
      console.error('添加媒体项失败:', error);
      alert('添加媒体失败，请重试');
    }
  }, [pageId]);

  // 删除媒体项
  const removeMediaItem = useCallback(async (itemId: string) => {
    try {
      dataManager.removeMediaItem(pageId, itemId);
      setMediaItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('删除媒体项失败:', error);
      alert('删除失败，请重试');
    }
  }, [pageId]);

  // 添加聊天消息
  const addChatMessage = useCallback(async (message: ChatMessage) => {
    try {
      dataManager.addChatMessage(pageId, message);
      setChatMessages(prev => [...prev, { ...message, pageId }]);
    } catch (error) {
      console.error('保存聊天消息失败:', error);
      alert('发送消息失败，请重试');
    }
  }, [pageId]);

  // 清空所有数据
  const clearAllData = useCallback(async () => {
    try {
      dataManager.clearPageData(pageId);
      setMediaItems([]);
      setChatMessages([]);
    } catch (error) {
      console.error('清空数据失败:', error);
      alert('清空数据失败，请重试');
    }
  }, [pageId]);

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