// Mock 数据服务 - 用于前端独立开发
import { User, MediaItem, ChatMessage, MediaPage, Admin } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user_1',
    username: '张小明',
    deviceId: 'device_001',
    createdAt: '2024-01-15T10:30:00Z',
    permissions: {
      canLogin: true,
      canView: true,
      canUploadMedia: true,
      canDeleteOwnMedia: true,
      canSendMessage: true,
      canDeleteOwnMessage: true,
    },
  },
  {
    id: 'user_2',
    username: '李小红',
    deviceId: 'device_002',
    createdAt: '2024-01-16T14:20:00Z',
    permissions: {
      canLogin: true,
      canView: true,
      canUploadMedia: true,
      canDeleteOwnMedia: true,
      canSendMessage: true,
      canDeleteOwnMessage: true,
    },
  },
];

export const mockMediaItems: MediaItem[] = [
  {
    id: 'media_1',
    type: 'image',
    url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
    thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?w=400',
    uploaderId: 'user_1',
    uploaderName: '张小明',
    caption: '美丽的山景照片，在日出时分拍摄',
    createdAt: '2024-01-20T10:30:00Z',
    pageId: 'page_demo',
  },
  {
    id: 'media_2',
    type: 'video',
    url: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4',
    uploaderId: 'user_2',
    uploaderName: '李小红',
    caption: '海浪拍打岩石的视频',
    createdAt: '2024-01-19T15:45:00Z',
    pageId: 'page_demo',
  },
  {
    id: 'media_3',
    type: 'image',
    url: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg',
    thumbnail: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?w=400',
    uploaderId: 'user_1',
    uploaderName: '张小明',
    caption: '城市夜景',
    createdAt: '2024-01-18T20:15:00Z',
    pageId: 'page_demo',
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    userId: 'user_1',
    username: '张小明',
    content: '大家好！欢迎来到我们的媒体分享页面',
    createdAt: '2024-01-20T10:00:00Z',
    pageId: 'page_demo',
  },
  {
    id: 'msg_2',
    userId: 'user_2',
    username: '李小红',
    content: '哇，这些照片太美了！',
    createdAt: '2024-01-20T10:05:00Z',
    pageId: 'page_demo',
  },
  {
    id: 'msg_3',
    userId: 'user_1',
    username: '张小明',
    content: '谢谢！这是我们旅行时拍摄的',
    createdAt: '2024-01-20T10:10:00Z',
    pageId: 'page_demo',
  },
];

export const mockMediaPages: MediaPage[] = [
  {
    id: 'page_demo',
    name: '演示媒体页',
    purchaserName: '张三',
    purchaserEmail: 'zhangsan@example.com',
    remainingDays: 30,
    purchaseHistory: [
      {
        id: 'purchase_1',
        date: '2024-01-15',
        amount: 299,
        duration: 30,
        description: '基础套餐 - 30天'
      }
    ],
    discountRecords: [],
    purchaserGender: 'male',
    usageScenario: '婚礼纪念',
    uniqueLink: `${window.location.origin}/page/page_demo`,
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
    internalCode: 'DEMO001',
    productDetails: {
      name: '基础媒体分享套餐',
      link: 'https://example.com/product/basic',
      images: ['https://example.com/product1.jpg'],
      description: '支持图片、视频、音频分享的基础套餐'
    },
    dbSizeLimit: 1024, // 1GB
    dbUsage: 256, // 256MB
    usageDuration: 30,
    createdAt: '2024-01-15',
    isActive: true
  }
];

export const mockAdmins: Admin[] = [
  {
    id: 'admin_1',
    username: 'superadmin',
    level: 1,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    permissions: {
      canCreateAdmins: true,
      canManagePages: true,
      canManageUsers: true,
      canManageMedia: true,
      canViewAnalytics: true,
    },
  },
  {
    id: 'admin_2',
    username: 'level2admin',
    level: 2,
    createdBy: 'admin_1',
    createdAt: '2024-01-15T00:00:00Z',
    permissions: {
      canCreateAdmins: true,
      canManagePages: true,
      canManageUsers: true,
      canManageMedia: false,
      canViewAnalytics: true,
    },
  },
];

// Mock API 服务类
export class MockApiService {
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 用户相关
  async registerUser(username: string, deviceId: string, email?: string): Promise<User> {
    await this.delay();
    const user: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      username,
      deviceId,
      createdAt: new Date().toISOString(),
      permissions: {
        canLogin: true,
        canView: true,
        canUploadMedia: true,
        canDeleteOwnMedia: true,
        canSendMessage: true,
        canDeleteOwnMessage: true,
      },
    };
    return user;
  }

  async loginUser(deviceId: string, username?: string): Promise<User> {
    await this.delay();
    const user = mockUsers.find(u => u.deviceId === deviceId);
    if (!user) throw new Error('User not found');
    return user;
  }

  // 管理员相关
  async loginAdmin(username: string, password: string): Promise<Admin> {
    await this.delay();
    if (username === 'superadmin' && password === 'admin123') {
      return mockAdmins[0];
    }
    throw new Error('Invalid credentials');
  }

  // 媒体页面相关
  async getPageById(pageId: string): Promise<MediaPage> {
    await this.delay();
    const page = mockMediaPages.find(p => p.id === pageId);
    if (!page) throw new Error('Page not found');
    return page;
  }

  async getPageByCode(internalCode: string): Promise<MediaPage> {
    await this.delay();
    const page = mockMediaPages.find(p => p.internalCode === internalCode);
    if (!page) throw new Error('Page not found');
    return page;
  }

  async getPages(): Promise<MediaPage[]> {
    await this.delay();
    return mockMediaPages;
  }

  // 媒体相关
  async getMediaItems(pageId: string): Promise<MediaItem[]> {
    await this.delay();
    return mockMediaItems.filter(item => item.pageId === pageId);
  }

  async uploadMedia(pageId: string, files: File[], caption: string): Promise<MediaItem[]> {
    await this.delay(1000); // 模拟上传延迟
    
    const newItems: MediaItem[] = files.map(file => ({
      id: 'media_' + Math.random().toString(36).substr(2, 9),
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'audio',
      url: URL.createObjectURL(file),
      thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploaderId: 'user_1',
      uploaderName: '当前用户',
      caption,
      createdAt: new Date().toISOString(),
      pageId,
    }));

    return newItems;
  }

  // 聊天相关
  async getChatMessages(pageId: string): Promise<ChatMessage[]> {
    await this.delay();
    return mockChatMessages.filter(msg => msg.pageId === pageId);
  }

  async sendMessage(pageId: string, content: string): Promise<ChatMessage> {
    await this.delay();
    const message: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      userId: 'user_1',
      username: '当前用户',
      content,
      createdAt: new Date().toISOString(),
      pageId,
    };
    return message;
  }
}

export const mockApiService = new MockApiService();