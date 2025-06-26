import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MediaItem, ChatMessage } from '../types';
import MediaDisplay from './MediaDisplay';
import ChatPanel from './ChatPanel';
import MediaUpload from './MediaUpload';
import UserSetup from './UserSetup';
import { Upload, User, Settings } from 'lucide-react';

const MediaPage: React.FC = () => {
  const { user, createUser, updateUsername } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showUserEdit, setShowUserEdit] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  // Mock page ID - in real app this would come from URL params
  const pageId = 'page_demo';

  // Handle first-time user setup
  if (!user) {
    return <UserSetup onComplete={createUser} />;
  }

  const handleMediaUpload = (files: File[], caption: string) => {
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const mediaItem: MediaItem = {
        id: 'media_' + Math.random().toString(36).substr(2, 9),
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'audio',
        url,
        thumbnail: file.type.startsWith('image/') ? url : undefined,
        uploaderId: user.id,
        uploaderName: user.username,
        caption,
        createdAt: new Date().toISOString(),
        pageId,
      };
      
      setMediaItems(prev => [...prev, mediaItem]);
    });
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
    
    setChatMessages(prev => [...prev, message]);
  };

  const handleUsernameUpdate = (newUsername: string) => {
    updateUsername(newUsername);
    setShowUserEdit(false);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                autoPlay 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {autoPlay ? '自动播放' : '手动切换'}
            </button>
          </div>
          
          <button
            onClick={() => setShowUserEdit(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200"
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