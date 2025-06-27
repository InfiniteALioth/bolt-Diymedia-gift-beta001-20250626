import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMediaStorage } from '../hooks/useMediaStorage';
import { ChatMessage } from '../types';
import MediaDisplay from './MediaDisplay';
import ChatPanel from './ChatPanel';
import MediaUpload from './MediaUpload';
import UserSetup from './UserSetup';
import { Upload, User, Trash2 } from 'lucide-react';

const MediaPage: React.FC = () => {
  const { user, createUser, updateUsername } = useAuth();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

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

  // 添加调试信息
  useEffect(() => {
    const info = [
      `用户: ${user ? user.username : '未设置'}`,
      `媒体数量: ${mediaItems.length}`,
      `消息数量: ${chatMessages.length}`,
      `数据已加载: ${isLoaded}`,
      `当前索引: ${currentMediaIndex}`,
      `屏幕尺寸: ${window.innerWidth}x${window.innerHeight}`,
      `用户代理: ${navigator.userAgent.substring(0, 50)}...`
    ].join('\n');
    setDebugInfo(info);
  }, [user, mediaItems.length, chatMessages.length, isLoaded, currentMediaIndex]);

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
          
          {/* 调试信息 */}
          <div className="mt-4 p-3 bg-black bg-opacity-50 rounded-lg text-left">
            <p className="text-xs text-gray-400 whitespace-pre-line">{debugInfo}</p>
          </div>
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

  const handleClearAllData = () => {
    if (confirm('确定要清空所有媒体和聊天记录吗？此操作不可恢复。')) {
      clearAllData();
      setCurrentMediaIndex(0);
    }
  };

  // 调试信息
  console.log('当前媒体项数量:', mediaItems.length);
  console.log('当前媒体索引:', currentMediaIndex);
  console.log('聊天消息数量:', chatMessages.length);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* 移动端兼容性检测 */}
      <div className="absolute top-0 left-0 z-50 p-2 bg-red-500 text-white text-xs opacity-75 md:hidden">
        移动端模式 | {window.innerWidth}x{window.innerHeight}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4 pt-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                autoPlay 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              {autoPlay ? '自动播放' : '手动切换'}
            </button>
            
            {/* 数据统计显示 */}
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-blue-500 bg-opacity-80 text-white text-xs rounded-full">
                媒体: {mediaItems.length}
              </div>
              <div className="px-3 py-1 bg-purple-500 bg-opacity-80 text-white text-xs rounded-full">
                消息: {chatMessages.length}
              </div>
            </div>

            {/* 清空数据按钮 */}
            {(mediaItems.length > 0 || chatMessages.length > 0) && (
              <button
                onClick={handleClearAllData}
                className="px-3 py-1 bg-red-500 bg-opacity-80 text-white text-xs rounded-full hover:bg-opacity-100 transition-all duration-200 flex items-center space-x-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>清空</span>
              </button>
            )}
          </div>
          
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
      />

      {/* Debug Panel - 仅在移动端显示 */}
      <div className="absolute bottom-4 left-4 z-50 p-3 bg-black bg-opacity-75 rounded-lg text-white text-xs max-w-xs md:hidden">
        <div className="whitespace-pre-line">{debugInfo}</div>
      </div>

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