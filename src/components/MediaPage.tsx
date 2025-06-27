import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMediaStorage } from '../hooks/useMediaStorage';
import { ChatMessage } from '../types';
import MediaDisplay from './MediaDisplay';
import ChatPanel from './ChatPanel';
import MediaUpload from './MediaUpload';
import UserSetup from './UserSetup';
import { Upload, User } from 'lucide-react';

const MediaPage: React.FC = () => {
  const { user, createUser, updateUsername } = useAuth();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);
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
            <Upload className="h-8 w-8" />
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
    setShowUserEdit(false);
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

  const handleAutoPlayChange = (newAutoPlay: boolean) => {
    setAutoPlay(newAutoPlay);
  };

  // 调试信息
  console.log('当前媒体项数量:', mediaItems.length);
  console.log('当前媒体索引:', currentMediaIndex);
  console.log('聊天消息数量:', chatMessages.length);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-end p-4">
          {/* 右侧用户按钮 */}
          <button
            onClick={() => setShowUserEdit(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all duration-200"
          >
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{user.username}</span>
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
      />

      {/* Upload Button */}
      <button
        onClick={() => setShowUpload(true)}
        className="absolute top-20 right-4 z-40 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        <Upload className="h-6 w-6" />
      </button>

      {/* Chat Panel */}
      <ChatPanel
        messages={chatMessages}
        currentUsername={user.username}
        onSendMessage={handleSendMessage}
        onAddMedia={() => setShowUpload(true)}
        onDeleteCurrentMedia={handleDeleteCurrentMedia}
        onPauseAutoPlay={handlePauseAutoPlay}
        hasCurrentMedia={mediaItems.length > 0}
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
    </div>
  );
};

export default MediaPage;