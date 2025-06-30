import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMediaStorage } from '../hooks/useMediaStorage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChatMessage, MediaPage as MediaPageType } from '../types';
import MediaDisplay from './MediaDisplay';
import ChatPanel from './ChatPanel';
import MediaUpload from './MediaUpload';
import UserSetup from './UserSetup';
import UserInfoModal from './UserInfoModal';
import { User, ChevronDown, AlertCircle, Home, Settings } from 'lucide-react';

const MediaPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const { user, createUser, updateUsername } = useAuth();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [pageNotFound, setPageNotFound] = useState(false);
  const [pageData, setPageData] = useState<MediaPageType | null>(null);

  // 获取存储的媒体页数据
  const [storedPages] = useLocalStorage<MediaPageType[]>('adminMediaPages', []);

  // 确定当前页面ID
  const currentPageId = pageId || 'page_demo';

  // 验证页面是否存在
  useEffect(() => {
    // 改进的页面查找逻辑
    let foundPage = storedPages.find(page => {
      // 1. 精确匹配页面ID
      if (page.id === currentPageId) {
        return true;
      }
      
      // 2. 匹配内部编码
      if (page.internalCode === currentPageId) {
        return true;
      }
      
      // 3. 从链接中提取页面ID进行匹配
      try {
        const linkPageId = page.uniqueLink.split('/page/')[1];
        if (linkPageId === currentPageId) {
          return true;
        }
      } catch (e) {
        // 忽略链接解析错误
      }
      
      // 4. 处理可能的URL编码问题
      try {
        const decodedPageId = decodeURIComponent(currentPageId);
        if (page.id === decodedPageId || page.internalCode === decodedPageId) {
          return true;
        }
      } catch (e) {
        // 忽略解码错误
      }
      
      return false;
    });

    if (foundPage) {
      setPageData(foundPage);
      setPageNotFound(false);
    } else if (currentPageId === 'page_demo') {
      // 默认演示页面
      const demoPage: MediaPageType = {
        id: 'page_demo',
        name: '演示媒体页',
        purchaserName: '张三',
        purchaserEmail: 'zhangsan@example.com',
        remainingDays: 30,
        purchaseHistory: [],
        discountRecords: [],
        purchaserGender: 'male',
        usageScenario: '婚礼纪念',
        uniqueLink: `${window.location.origin}/page/page_demo`,
        qrCode: '',
        internalCode: 'DEMO001',
        productDetails: {
          name: '基础媒体分享套餐',
          link: 'https://example.com/product/basic',
          images: [],
          description: '支持图片、视频、音频分享的基础套餐'
        },
        dbSizeLimit: 1024,
        dbUsage: 256,
        usageDuration: 30,
        createdAt: '2024-01-15',
        isActive: true
      };
      setPageData(demoPage);
      setPageNotFound(false);
    } else {
      setPageNotFound(true);
    }
  }, [currentPageId, storedPages]);

  // 使用持久化存储钩子 - 现在每个页面都有独立数据
  const {
    mediaItems,
    chatMessages,
    isLoaded,
    addMediaItems,
    removeMediaItem,
    addChatMessage,
    clearAllData
  } = useMediaStorage(currentPageId);

  // 模拟剩余时间和存储数据
  const [remainingTime, setRemainingTime] = useState(1440); // 24小时 = 1440分钟
  const totalStorage = pageData?.dbSizeLimit || 1024; // 使用页面配置的存储限制
  const usedStorage = Math.min(mediaItems.length * 50, totalStorage); // 假设每个媒体项50MB

  // 模拟时间倒计时
  useEffect(() => {
    if (!pageData?.isActive) return; // 如果页面未激活，不启动倒计时

    const timer = setInterval(() => {
      setRemainingTime(prev => Math.max(0, prev - 1));
    }, 60000); // 每分钟减1

    return () => clearInterval(timer);
  }, [pageData?.isActive]);

  // Handle first-time user setup
  if (!user) {
    return <UserSetup onComplete={createUser} />;
  }

  // 页面未找到
  if (pageNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">页面未找到</h1>
            <p className="text-gray-600 mb-6">
              抱歉，您访问的媒体页面不存在或已被删除。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Home className="h-5 w-5" />
                <span>返回首页</span>
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
                <span>管理后台</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 页面未激活
  if (pageData && !pageData.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">页面已停用</h1>
            <p className="text-gray-600 mb-6">
              该媒体页面已被管理员停用，暂时无法访问。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Home className="h-5 w-5" />
                <span>返回首页</span>
              </button>
            </div>
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>页面名称:</strong> {pageData.name}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                如需重新激活，请联系管理员
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 等待数据加载完成
  if (!isLoaded || !pageData) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-4">
          <div className="w-16 h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">加载中...</h3>
          <p className="text-gray-300 mb-4">正在加载媒体内容</p>
        </div>
      </div>
    );
  }

  const handleMediaUpload = async (files: File[], caption: string) => {
    // 如果这是第一次上传，设置当前索引为0
    if (mediaItems.length === 0) {
      setCurrentMediaIndex(0);
    }
    
    // 直接传递文件到 useMediaStorage 钩子进行处理
    await addMediaItems(files, user.username, caption, user.id, currentPageId);
    
    setShowUpload(false);
  };

  const handleSendMessage = (content: string) => {
    const message: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      content,
      createdAt: new Date().toISOString(),
      pageId: currentPageId,
    };
    
    // 使用持久化存储添加消息
    addChatMessage(message);
  };

  const handleUsernameUpdate = (newUsername: string) => {
    updateUsername(newUsername);
    setShowUserInfo(false);
  };

  const handleDeleteCurrentMedia = () => {
    if (mediaItems.length > 0 && currentMediaIndex < mediaItems.length) {
      const currentMedia = mediaItems[currentMediaIndex];
      removeMediaItem(currentMedia.id);
      
      // 调整当前索引
      if (currentMediaIndex >= mediaItems.length - 1) {
        setCurrentMediaIndex(Math.max(0, mediaItems.length - 2));
      }
    }
  };

  const handlePauseAutoPlay = () => {
    setAutoPlay(false);
  };

  // 自动播放状态变化处理函数
  const handleAutoPlayChange = (newAutoPlay: boolean) => {
    setAutoPlay(newAutoPlay);
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4">
          {/* 左侧页面信息 */}
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-white text-sm font-medium">{pageData.name}</span>
            </div>
            {pageData.usageScenario && (
              <div className="bg-blue-500 bg-opacity-20 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-blue-200 text-xs">{pageData.usageScenario}</span>
              </div>
            )}
          </div>

          {/* 右侧用户信息按钮 */}
          <button
            onClick={() => setShowUserInfo(true)}
            className="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all duration-200 group"
          >
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium">{user.username}</span>
            <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
          </button>
        </div>
      </div>

      {/* Media Display */}
      <MediaDisplay
        mediaItems={mediaItems}
        currentIndex={currentMediaIndex}
        onIndexChange={setCurrentMediaIndex}
        autoPlay={autoPlay}
        onAutoPlayChange={handleAutoPlayChange}
        onAddMedia={() => setShowUpload(true)}
        onDeleteCurrentMedia={handleDeleteCurrentMedia}
        onPauseAutoPlay={handlePauseAutoPlay}
        hasCurrentMedia={mediaItems.length > 0}
      />

      {/* Chat Panel */}
      <ChatPanel
        messages={chatMessages}
        currentUsername={user.username}
        onSendMessage={handleSendMessage}
      />

      {/* Modals */}
      {showUpload && (
        <MediaUpload
          uploaderName={user.username}
          onUpload={handleMediaUpload}
          onClose={() => setShowUpload(false)}
        />
      )}

      {showUserEdit && (
        <UserSetup
          isEditing
          currentUsername={user.username}
          onComplete={handleUsernameUpdate}
        />
      )}

      {showUserInfo && (
        <UserInfoModal
          user={user}
          onClose={() => setShowUserInfo(false)}
          onUpdateUsername={handleUsernameUpdate}
          remainingTime={remainingTime}
          usedStorage={usedStorage}
          totalStorage={totalStorage}
        />
      )}
    </div>
  );
};

export default MediaPage;