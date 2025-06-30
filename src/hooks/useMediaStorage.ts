import { useState, useEffect, useCallback } from 'react';
import { MediaItem, ChatMessage } from '../types';

interface MediaStorage {
  mediaItems: MediaItem[];
  chatMessages: ChatMessage[];
}

// IndexedDB helper functions
class MediaStorageDB {
  private dbName: string;
  private version = 1;
  private db: IDBDatabase | null = null;
  private pageId: string;

  constructor(pageId: string) {
    this.pageId = pageId;
    this.dbName = `mediaPage_${pageId}`; // 每个页面使用独立的数据库
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('mediaItems')) {
          const mediaStore = db.createObjectStore('mediaItems', { keyPath: 'id' });
          mediaStore.createIndex('pageId', 'pageId', { unique: false });
          mediaStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('chatMessages')) {
          const chatStore = db.createObjectStore('chatMessages', { keyPath: 'id' });
          chatStore.createIndex('pageId', 'pageId', { unique: false });
          chatStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('mediaBlobs')) {
          db.createObjectStore('mediaBlobs', { keyPath: 'id' });
        }
      };
    });
  }

  async saveMediaItem(mediaItem: MediaItem, blob?: Blob): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaItems', 'mediaBlobs'], 'readwrite');
      
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();

      // Save media item metadata
      const mediaStore = transaction.objectStore('mediaItems');
      mediaStore.put(mediaItem);

      // Save blob if provided
      if (blob) {
        const blobStore = transaction.objectStore('mediaBlobs');
        blobStore.put({ id: mediaItem.id, blob });
      }
    });
  }

  async getMediaItems(): Promise<MediaItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaItems'], 'readonly');
      const store = transaction.objectStore('mediaItems');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const items = request.result || [];
        // 只返回属于当前页面的媒体项
        const pageItems = items.filter(item => item.pageId === this.pageId);
        // Sort by creation date, newest first
        pageItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(pageItems);
      };
    });
  }

  async getMediaBlob(mediaId: string): Promise<Blob | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaBlobs'], 'readonly');
      const store = transaction.objectStore('mediaBlobs');
      const request = store.get(mediaId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
    });
  }

  async deleteMediaItem(mediaId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaItems', 'mediaBlobs'], 'readwrite');
      
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();

      const mediaStore = transaction.objectStore('mediaItems');
      const blobStore = transaction.objectStore('mediaBlobs');
      
      mediaStore.delete(mediaId);
      blobStore.delete(mediaId);
    });
  }

  async saveChatMessages(messages: ChatMessage[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chatMessages'], 'readwrite');
      const store = transaction.objectStore('chatMessages');
      
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();

      // 只保存属于当前页面的消息
      const pageMessages = messages.filter(msg => msg.pageId === this.pageId);
      
      // Clear existing messages for this page and add new ones
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        pageMessages.forEach(message => store.add(message));
      };
    });
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chatMessages'], 'readonly');
      const store = transaction.objectStore('chatMessages');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const messages = request.result || [];
        // 只返回属于当前页面的消息
        const pageMessages = messages.filter(msg => msg.pageId === this.pageId);
        // Sort by creation date
        pageMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(pageMessages);
      };
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mediaItems', 'chatMessages', 'mediaBlobs'], 'readwrite');
      
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();

      transaction.objectStore('mediaItems').clear();
      transaction.objectStore('chatMessages').clear();
      transaction.objectStore('mediaBlobs').clear();
    });
  }
}

// Helper function to create MediaItem from File
const createMediaItemFromFile = async (
  file: File, 
  uploaderName: string, 
  caption: string, 
  uploaderId: string, 
  pageId: string
): Promise<{ mediaItem: MediaItem; blob: Blob }> => {
  try {
    let type: 'image' | 'video' | 'audio';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else throw new Error('Unsupported file type');

    const mediaItem: MediaItem = {
      id: `${pageId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 包含页面ID的唯一标识
      type,
      url: '', // Will be generated from blob when needed
      thumbnail: type === 'image' ? '' : undefined, // Will be generated from blob when needed
      uploaderId,
      uploaderName,
      caption,
      createdAt: new Date().toISOString(),
      pageId // 确保媒体项关联到正确的页面
    };

    return { mediaItem, blob: file };
  } catch (error) {
    console.error('Failed to create media item from file:', error);
    throw error;
  }
};

export function useMediaStorage(pageId: string) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [db, setDb] = useState<MediaStorageDB | null>(null);
  const [blobUrls, setBlobUrls] = useState<Map<string, string>>(new Map());

  console.log('useMediaStorage 初始化，页面ID:', pageId);

  // Initialize IndexedDB - 每个页面使用独立的数据库实例
  useEffect(() => {
    const initDB = async () => {
      try {
        console.log('初始化页面数据库:', pageId);
        
        // 清理之前的blob URLs
        blobUrls.forEach(url => URL.revokeObjectURL(url));
        setBlobUrls(new Map());
        
        const database = new MediaStorageDB(pageId);
        await database.init();
        setDb(database);

        // Load existing data for this specific page
        const [items, messages] = await Promise.all([
          database.getMediaItems(),
          database.getChatMessages()
        ]);

        console.log(`从页面 ${pageId} 加载数据:`, { items: items.length, messages: messages.length });
        
        // Create blob URLs for media items
        const urlMap = new Map<string, string>();
        for (const item of items) {
          try {
            const blob = await database.getMediaBlob(item.id);
            if (blob) {
              const url = URL.createObjectURL(blob);
              urlMap.set(item.id, url);
              // Update item with blob URL
              item.url = url;
              if (item.type === 'image') {
                item.thumbnail = url;
              }
            }
          } catch (error) {
            console.error('Failed to load blob for item:', item.id, error);
          }
        }

        setBlobUrls(urlMap);
        setMediaItems(items);
        setChatMessages(messages);
      } catch (error) {
        console.error('初始化页面数据库失败:', pageId, error);
        // Fallback to empty state
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
    
    initDB();

    // Cleanup blob URLs on unmount or page change
    return () => {
      blobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [pageId]); // 依赖于pageId，页面变化时重新初始化

  // 添加媒体项 - 接受 File 数组并存储到 IndexedDB
  const addMediaItems = useCallback(async (
    files: File[], 
    uploaderName: string, 
    caption: string, 
    uploaderId: string, 
    targetPageId: string
  ) => {
    if (!db) {
      console.error('Database not initialized');
      alert('数据库未初始化，请刷新页面重试');
      return;
    }

    // 确保使用正确的页面ID
    const actualPageId = targetPageId || pageId;
    console.log('添加媒体到页面:', actualPageId, '文件数量:', files.length);

    try {
      const newItems: MediaItem[] = [];
      const newBlobUrls = new Map(blobUrls);
      
      for (const file of files) {
        try {
          const { mediaItem, blob } = await createMediaItemFromFile(file, uploaderName, caption, uploaderId, actualPageId);
          
          // Save to IndexedDB
          await db.saveMediaItem(mediaItem, blob);
          
          // Create blob URL for immediate use
          const blobUrl = URL.createObjectURL(blob);
          newBlobUrls.set(mediaItem.id, blobUrl);
          
          // Update media item with blob URL
          mediaItem.url = blobUrl;
          if (mediaItem.type === 'image') {
            mediaItem.thumbnail = blobUrl;
          }
          
          newItems.push(mediaItem);
          console.log('文件处理完成:', file.name, '-> 存储到页面', actualPageId);
        } catch (error) {
          console.error('处理文件失败:', file.name, error);
          alert(`处理文件 "${file.name}" 失败，请重试`);
        }
      }

      if (newItems.length > 0) {
        setBlobUrls(newBlobUrls);
        setMediaItems(prev => [...newItems, ...prev]); // Add new items at the beginning
        console.log(`成功添加 ${newItems.length} 个媒体项到页面 ${actualPageId}`);
      }
    } catch (error) {
      console.error('添加媒体项失败:', error);
      alert('添加媒体失败，请重试');
    }
  }, [db, blobUrls, pageId]);

  // 删除媒体项
  const removeMediaItem = useCallback(async (itemId: string) => {
    if (!db) return;

    try {
      await db.deleteMediaItem(itemId);
      
      // Revoke blob URL
      const blobUrl = blobUrls.get(itemId);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        const newBlobUrls = new Map(blobUrls);
        newBlobUrls.delete(itemId);
        setBlobUrls(newBlobUrls);
      }
      
      setMediaItems(prev => prev.filter(item => item.id !== itemId));
      console.log('删除媒体项:', itemId, '从页面:', pageId);
    } catch (error) {
      console.error('删除媒体项失败:', error);
      alert('删除失败，请重试');
    }
  }, [db, blobUrls, pageId]);

  // 添加聊天消息
  const addChatMessage = useCallback(async (message: ChatMessage) => {
    if (!db) return;

    try {
      // 确保消息关联到正确的页面
      const messageWithPageId = { ...message, pageId };
      const updatedMessages = [...chatMessages, messageWithPageId];
      await db.saveChatMessages(updatedMessages);
      setChatMessages(updatedMessages);
      console.log('添加消息到页面:', pageId, '消息内容:', message.content);
    } catch (error) {
      console.error('保存聊天消息失败:', error);
      alert('发送消息失败，请重试');
    }
  }, [db, chatMessages, pageId]);

  // 清空所有数据
  const clearAllData = useCallback(async () => {
    if (!db) return;

    try {
      await db.clearAll();
      
      // Revoke all blob URLs
      blobUrls.forEach(url => URL.revokeObjectURL(url));
      setBlobUrls(new Map());
      
      setMediaItems([]);
      setChatMessages([]);
      console.log('已清空页面数据:', pageId);
    } catch (error) {
      console.error('清空数据失败:', error);
      alert('清空数据失败，请重试');
    }
  }, [db, blobUrls, pageId]);

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