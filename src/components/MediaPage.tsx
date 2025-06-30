import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMediaStorage } from '../hooks/useMediaStorage';
import { ChatMessage } from '../types';
import MediaDisplay from './MediaDisplay';
import ChatPanel from './ChatPanel';
import MediaUpload from './MediaUpload';
import UserSetup from './UserSetup';
import UserInfoModal from './UserInfoModal';
import { User, ChevronDown } from 'lucide-react';

const MediaPage: React.FC = () => {
  const { user, createUser, updateUsername } = useAuth();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  // Mock page ID - in real app this would come from URL params
  const pageId = 'page_demo';
  
  // 使用持久化存储钩子
  const {
    mediaItems,
    chatMessages,
    isLoaded,
    addMediaItems,
    removeMediaItem,
    addChatMessage,
    clearAllData
  } = useMediaStorage(pageId);

  // 模拟剩余时间和存储数据
  const [remainingTime, setRemainingTime] = useState(1440); // 24小时 = 1440分钟
  const totalStorage = 1024; // 1GB = 1024MB
  const usedStorage = Math.min(mediaItems.length * 50, totalStorage); // 假设每个媒体项50MB

  // 模拟时间倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => Math.max(0, prev - 1));
    }, 60000); // 每分钟减1

    return () => clearInterval(timer);
  }, []);

  // Handle first-time user setup
  if (!user) {
    return <UserSetup onComplete={createUser} />;
  }

  // 等待数据加载完成
  if (!isLoaded) {
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
    console.log('开始处理媒体上传:', files.length, '个文件');
    
    // 如果这是第一次上传，设置当前索引为0
    if (mediaItems.length === 0) {
      setCurrentMediaIndex(0);
    }
    
    // 直接传递文件到 useMediaStorage 钩子进行处理
    await addMediaItems(files, user.username, caption, user.id, pageId);
    
    setShowUpload(false);
  };

  const handleSendMessage = (content: string) => {
    const message: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      content,
      createdAt: new Date().toISOString(),
      pageId,
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
    console.log('暂停自动播放被调用');
    setAutoPlay(false);
  };

  // 自动播放状态变化处理函数 - 关键修复
  const handleAutoPlayChange = (newAutoPlay: boolean) => {
    console.log('🔄 MediaPage 收到自动播放状态变化:', autoPlay, '->', newAutoPlay);
    setAutoPlay(newAutoPlay);
  };

  // 调试信息
  console.log('MediaPage 渲染状态:', {
    mediaItemsCount: mediaItems.length,
    currentMediaIndex,
    chatMessagesCount: chatMessages.length,
    autoPlay,
    user: user?.username
  });

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-end p-4">
          {/* 右侧用户信息按钮 - 进一步调整高度和图标大小 */}
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

      {/* Media Display - 确保传递正确的回调函数 */}
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