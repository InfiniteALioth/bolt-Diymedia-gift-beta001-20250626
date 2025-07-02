import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMediaStorage } from '../hooks/useMediaStorage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChatMessage, MediaPage as MediaPageType } from '../types';
import { apiService } from '../services/api';
import { mockApiService, mockMediaPages } from '../services/mockData';
import MediaDisplay from './MediaDisplay';
import ChatPanel from './ChatPanel';
import MediaUpload from './MediaUpload';
import UserSetup from './UserSetup';
import UserInfoModal from './UserInfoModal';
import { OfflineMode, LoadingScreen } from './common';
import { User, ChevronDown, AlertCircle, Home, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react';

// 开发模式开关
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_API_URL;

const MediaPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const { user, createUser, updateUsername, connectionStatus, checkConnection } = useAuth();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [pageNotFound, setPageNotFound] = useState(false);
  const [pageData, setPageData] = useState<MediaPageType | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // 确定当前页面ID
  const currentPageId = pageId || 'page_demo';

  // 使用媒体存储钩子
  const {
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
  } = useMediaStorage(currentPageId);

  // 验证页面是否存在
  useEffect(() => {
    const loadPageData = async () => {
      setIsLoadingPage(true);
      setLoadError(null);
      
      try {
        const api = USE_MOCK_API ? mockApiService : apiService;
        let foundPage: MediaPageType | null = null;

        if (USE_MOCK_API) {
          // 使用 mock 数据
          foundPage = mockMediaPages.find(page => 
            page.id === currentPageId || page.internalCode === currentPageId
          ) || null;
        } else {
          // 尝试通过 ID 或代码获取页面
          try {
            foundPage = await api.getPageById(currentPageId);
          } catch (error) {
            // 如果通过ID获取失败，尝试通过代码获取
            if (error instanceof Error && !error.message.includes('fetch')) {
              try {
                foundPage = await api.getPageByCode(currentPageId);
              } catch {
                foundPage = null;
              }
            } else {
              // 如果是网络错误，直接抛出
              throw error;
            }
          }
        }

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
      } catch (error) {
        console.error('Failed to load page data:', error);
        
        // 提供更友好的错误消息
        let errorMessage = '加载页面数据失败';
        if (error instanceof Error) {
          if (error.message.includes('fetch')) {
            errorMessage = '无法连接到服务器，请检查网络连接';
          } else if (error.message.includes('timeout')) {
            errorMessage = '服务器响应超时，请稍后再试';
          } else {
            errorMessage = error.message;
          }
        }
        
        setLoadError(errorMessage);
        
        // 如果是网络错误，不设置页面未找到
        if (!(error instanceof Error && error.message.includes('fetch'))) {
          setPageNotFound(true);
        }
      } finally {
        setIsLoadingPage(false);
      }
    };

    loadPageData();
  }, [currentPageId]);

  // 模拟剩余时间和存储数据
  const [remainingTime, setRemainingTime] = useState(1440); // 24小时 = 1440分钟
  const totalStorage = pageData?.dbSizeLimit || 1024;
  const usedStorage = Math.min(mediaItems.length * 50, totalStorage);

  // 模拟时间倒计时
  useEffect(() => {
    if (!pageData?.isActive) return;

    const timer = setInterval(() => {
      setRemainingTime(prev => Math.max(0, prev - 1));
    }, 60000);

    return () => clearInterval(timer);
  }, [pageData?.isActive]);

  // 重试连接
  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      const isConnected = await checkConnection();
      if (isConnected) {
        // 重新加载页面数据
        setIsLoadingPage(true);
        setLoadError(null);
        setPageNotFound(false);
        
        const api = USE_MOCK_API ? mockApiService : apiService;
        try {
          const foundPage = await api.getPageById(currentPageId);
          setPageData(foundPage);
          await reloadData();
        } catch (error) {
          console.error('Failed to reload page data:', error);
          throw error;
        } finally {
          setIsLoadingPage(false);
        }
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Handle first-time user setup
  if (!user) {
    return <UserSetup onComplete={createUser} />;
  }

  // 连接状态检查 - 如果不是使用模拟API且连接断开
  if (!USE_MOCK_API && (connectionStatus === 'disconnected' || loadError?.includes('无法连接到服务器'))) {
    return (
      <OfflineMode 
        onRetry={handleRetryConnection}
        errorMessage={loadError || '无法连接到后端服务器'}
      />
    );
  }

  // 页面加载中
  if (isLoadingPage) {
    return (
      <LoadingScreen 
        message="加载页面中..."
        connectionStatus={connectionStatus === 'connected' ? 'connected' : 
                         isRetrying ? 'checking' : 'disconnected'}
      />
    );
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
      <LoadingScreen 
        message="加载媒体内容中..."
        connectionStatus={connectionStatus === 'connected' ? 'connected' : 
                         connectionStatus === 'checking' ? 'checking' : 'disconnected'}
      />
    );
  }

  const handleMediaUpload = async (files: File[], caption: string) => {
    if (mediaItems.length === 0) {
      setCurrentMediaIndex(0);
    }
    
    try {
      await addMediaItems(files, user.username, caption, user.id, currentPageId);
      setShowUpload(false);
    } catch (error) {
      // 错误已在 addMediaItems 中处理
      console.error('Upload failed:', error);
      // 不关闭上传对话框，让用户可以重试
    }
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
    
    addChatMessage(message).catch(error => {
      console.error('Send message failed:', error);
      // 错误已在 addChatMessage 中处理
    });
  };

  const handleUsernameUpdate = (newUsername: string) => {
    updateUsername(newUsername)
      .then(() => setShowUserInfo(false))
      .catch(error => {
        console.error('Update username failed:', error);
        alert(`更新用户名失败: ${error.message}`);
      });
  };

  const handleDeleteCurrentMedia = () => {
    if (mediaItems.length > 0 && currentMediaIndex < mediaItems.length) {
      const currentMedia = mediaItems[currentMediaIndex];
      removeMediaItem(currentMedia.id)
        .then(() => {
          if (currentMediaIndex >= mediaItems.length - 1) {
            setCurrentMediaIndex(Math.max(0, mediaItems.length - 2));
          }
        })
        .catch(error => {
          console.error('Delete media failed:', error);
          alert(`删除媒体失败: ${error.message}`);
        });
    }
  };

  const handlePauseAutoPlay = () => {
    setAutoPlay(false);
  };

  const handleAutoPlayChange = (newAutoPlay: boolean) => {
    setAutoPlay(newAutoPlay);
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4">
          {/* 连接状态指示器 */}
          {!USE_MOCK_API && (
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <div className="flex items-center space-x-1 text-green-400">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">已连接</span>
                </div>
              ) : connectionStatus === 'checking' ? (
                <div className="flex items-center space-x-1 text-yellow-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-xs">连接中...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-400">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs">连接中断</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setShowUserInfo(true)}
            className="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all duration-200 group ml-auto"
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

      {/* 开发模式提示 */}
      {USE_MOCK_API && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-medium z-50">
          开发模式 (Mock API)
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="fixed top-20 left-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-lg text-sm z-50 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={reloadData}
            className="ml-4 px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors duration-200"
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaPage;