import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { Play, ChevronUp, ChevronDown, AlertCircle, RefreshCw, Volume2, Plus, Minus, Upload } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface MediaDisplayProps {
  mediaItems: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  autoPlay: boolean;
  onAutoPlayChange?: (autoPlay: boolean) => void;
  onAddMedia?: () => void;
  onDeleteCurrentMedia?: () => void;
  onPauseAutoPlay?: () => void;
  hasCurrentMedia?: boolean;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({
  mediaItems,
  currentIndex,
  onIndexChange,
  autoPlay,
  onAutoPlayChange,
  onAddMedia,
  onDeleteCurrentMedia,
  onPauseAutoPlay,
  hasCurrentMedia = false
}) => {
  const [failedMedia, setFailedMedia] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const currentMedia = mediaItems[currentIndex];

  console.log('MediaDisplay 渲染:', {
    mediaItemsCount: mediaItems.length,
    currentIndex,
    currentMedia: currentMedia ? currentMedia.type : 'none',
    isLoading,
    autoPlay: autoPlay,
    onAutoPlayChange: !!onAutoPlayChange
  });

  // 自动播放逻辑
  useEffect(() => {
    if (!autoPlay || mediaItems.length <= 1) {
      return;
    }

    console.log('设置自动播放定时器，5秒后切换');
    const interval = setInterval(() => {
      console.log('自动切换到下一个媒体');
      const nextIndex = (currentIndex + 1) % mediaItems.length;
      onIndexChange(nextIndex);
    }, 5000);

    return () => {
      console.log('清除自动播放定时器');
      clearInterval(interval);
    };
  }, [autoPlay, currentIndex, mediaItems.length, onIndexChange]);

  const handleMediaError = (mediaId: string) => {
    console.log('媒体加载失败:', mediaId);
    setFailedMedia(prev => new Set([...prev, mediaId]));
  };

  const handleRetry = (mediaId: string) => {
    console.log('重试加载媒体:', mediaId);
    setFailedMedia(prev => {
      const newSet = new Set(prev);
      newSet.delete(mediaId);
      return newSet;
    });
  };

  const handleNext = () => {
    if (mediaItems.length > 1) {
      const nextIndex = (currentIndex + 1) % mediaItems.length;
      onIndexChange(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (mediaItems.length > 1) {
      const prevIndex = currentIndex === 0 ? mediaItems.length - 1 : currentIndex - 1;
      onIndexChange(prevIndex);
    }
  };

  if (!currentMedia) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl mb-4">没有可显示的媒体</p>
          {onAddMedia && (
            <button
              onClick={onAddMedia}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Upload className="w-5 h-5" />
              添加媒体
            </button>
          )}
        </div>
      </div>
    );
  }

  const isMediaFailed = failedMedia.has(currentMedia.id);

  return (
    <div className="flex-1 flex flex-col bg-gray-900 relative">
      {/* 媒体显示区域 */}
      <div className="flex-1 flex items-center justify-center relative">
        {isMediaFailed ? (
          <div className="text-center text-white">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <p className="text-xl mb-4">媒体加载失败</p>
            <button
              onClick={() => handleRetry(currentMedia.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
          </div>
        ) : (
          <>
            {currentMedia.type === 'image' && (
              <img
                src={currentMedia.url}
                alt={currentMedia.title}
                className="max-w-full max-h-full object-contain"
                onError={() => handleMediaError(currentMedia.id)}
                onLoad={() => setIsLoading(false)}
              />
            )}
            {currentMedia.type === 'video' && (
              <VideoPlayer
                src={currentMedia.url}
                title={currentMedia.title}
                autoPlay={autoPlay}
                onError={() => handleMediaError(currentMedia.id)}
                onLoadStart={() => setIsLoading(true)}
                onLoadedData={() => setIsLoading(false)}
                onPause={onPauseAutoPlay}
              />
            )}
          </>
        )}

        {/* 导航按钮 */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
            >
              <ChevronUp className="w-6 h-6 transform -rotate-90" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
            >
              <ChevronDown className="w-6 h-6 transform rotate-90" />
            </button>
          </>
        )}
      </div>

      {/* 底部信息栏 */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{currentMedia.title}</h3>
            {currentMedia.description && (
              <p className="text-gray-300 text-sm mt-1">{currentMedia.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* 媒体计数 */}
            {mediaItems.length > 1 && (
              <span className="text-sm text-gray-400">
                {currentIndex + 1} / {mediaItems.length}
              </span>
            )}

            {/* 自动播放控制 */}
            {onAutoPlayChange && mediaItems.length > 1 && (
              <button
                onClick={() => onAutoPlayChange(!autoPlay)}
                className={`p-2 rounded-lg transition-colors ${
                  autoPlay 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                }`}
                title={autoPlay ? '关闭自动播放' : '开启自动播放'}
              >
                <Play className="w-4 h-4" />
              </button>
            )}

            {/* 音量指示器（仅视频） */}
            {currentMedia.type === 'video' && (
              <Volume2 className="w-4 h-4 text-gray-400" />
            )}

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              {onAddMedia && (
                <button
                  onClick={onAddMedia}
                  className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  title="添加媒体"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              
              {onDeleteCurrentMedia && hasCurrentMedia && (
                <button
                  onClick={onDeleteCurrentMedia}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  title="删除当前媒体"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDisplay;