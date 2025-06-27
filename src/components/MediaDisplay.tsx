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

  // 自动播放逻辑 - 调整为5秒
  useEffect(() => {
    if (!autoPlay || mediaItems.length <= 1) {
      return;
    }

    console.log('设置自动播放定时器，5秒后切换');
    const interval = setInterval(() => {
      console.log('自动切换到下一个媒体');
      onIndexChange((currentIndex + 1) % mediaItems.length);
    }, 5000); // 从3000改为5000毫秒（5秒）

    return () => {
      console.log('清除自动播放定时器');
      clearInterval(interval);
    };
  }, [currentIndex, mediaItems.length, autoPlay, onIndexChange]);

  useEffect(() => {
    // 当媒体项改变时重置加载状态
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [currentMedia?.id]);

  const handlePrevious = () => {
    if (mediaItems.length === 0) return;
    const newIndex = currentIndex === 0 ? mediaItems.length - 1 : currentIndex - 1;
    onIndexChange(newIndex);
  };

  const handleNext = () => {
    if (mediaItems.length === 0) return;
    const newIndex = (currentIndex + 1) % mediaItems.length;
    onIndexChange(newIndex);
  };

  const handleMediaError = (mediaId: string) => {
    console.error('媒体加载失败:', mediaId);
    setFailedMedia(prev => new Set([...prev, mediaId]));
    setIsLoading(false);
  };

  const handleRetryMedia = (mediaId: string) => {
    setFailedMedia(prev => {
      const newSet = new Set(prev);
      newSet.delete(mediaId);
      return newSet;
    });
    setIsLoading(true);
  };

  const handleMediaLoad = () => {
    console.log('媒体加载成功');
    setIsLoading(false);
  };

  const handleVideoEnded = () => {
    if (autoPlay && mediaItems.length > 1) {
      // 视频结束后等待5秒自动切换
      console.log('视频播放结束，5秒后自动切换');
      setTimeout(() => {
        console.log('视频结束后自动切换到下一个媒体');
        handleNext();
      }, 5000); // 从3000改为5000毫秒（5秒）
    }
  };

  // 处理自动播放切换
  const handleAutoPlayToggle = () => {
    const newAutoPlay = !autoPlay;
    console.log('切换自动播放状态:', autoPlay, '->', newAutoPlay);
    onAutoPlayChange?.(newAutoPlay);
  };

  // 删除当前媒体
  const handleDeleteMedia = () => {
    if (!hasCurrentMedia) return;
    
    // 暂停自动播放
    onPauseAutoPlay?.();
    
    // 询问用户确认删除
    const confirmed = confirm('确定要删除当前显示的媒体吗？此操作不可恢复。');
    if (confirmed && onDeleteCurrentMedia) {
      onDeleteCurrentMedia();
    }
  };

  const isMediaFailed = (mediaId: string) => failedMedia.has(mediaId);

  if (mediaItems.length === 0) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <div className="w-16 h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">暂无媒体内容</h3>
          <p className="text-gray-300 mb-4">点击右下角的上传按钮开始分享</p>
          
          {/* 移动端提示 */}
          <div className="mt-4 p-3 bg-blue-500 bg-opacity-20 rounded-lg md:hidden">
            <p className="text-sm text-blue-200">
              移动端用户：请确保浏览器支持文件上传功能
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentMedia) {
    console.warn('当前媒体项为空，但媒体列表不为空');
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h3 className="text-xl font-semibold mb-2">媒体加载中...</h3>
          <p className="text-gray-300">请稍候</p>
          <div className="mt-4 w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const MediaErrorFallback = ({ mediaId, onRetry }: { mediaId: string; onRetry: () => void }) => (
    <div className="w-full max-w-md p-8 mx-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl text-center">
      <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">媒体加载失败</h3>
      <p className="text-white text-opacity-80 mb-4">
        文件可能已损坏或不再可用
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all duration-200"
      >
        <RefreshCw className="h-4 w-4" />
        <span>重试加载</span>
      </button>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="w-full max-w-md p-8 mx-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl text-center">
      <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">正在加载媒体</h3>
      <p className="text-white text-opacity-80">请稍候...</p>
    </div>
  );

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Media Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isLoading ? (
          <LoadingSpinner />
        ) : isMediaFailed(currentMedia.id) ? (
          <MediaErrorFallback 
            mediaId={currentMedia.id} 
            onRetry={() => handleRetryMedia(currentMedia.id)} 
          />
        ) : (
          <>
            {currentMedia.type === 'image' && (
              <img
                src={currentMedia.url}
                alt={currentMedia.caption || '图片'}
                className="max-w-full max-h-full object-contain"
                style={{ 
                  maxWidth: '100vw', 
                  maxHeight: '100vh',
                  width: 'auto',
                  height: 'auto'
                }}
                onLoad={handleMediaLoad}
                onError={() => handleMediaError(currentMedia.id)}
                loading="eager"
              />
            )}
            
            {currentMedia.type === 'video' && (
              <VideoPlayer
                src={currentMedia.url}
                autoPlay={autoPlay}
                loop={false}
                onEnded={handleVideoEnded}
                onError={() => handleMediaError(currentMedia.id)}
                onLoadedData={handleMediaLoad}
                className="w-full h-full"
              />
            )}
            
            {currentMedia.type === 'audio' && (
              <div className="w-full max-w-md p-8 mx-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Volume2 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">音频播放中</h3>
                  <p className="text-white text-opacity-80">{currentMedia.caption || '正在播放音频内容'}</p>
                </div>
                <audio
                  src={currentMedia.url}
                  className="w-full"
                  controls
                  autoPlay={autoPlay}
                  preload="metadata"
                  onLoadedData={handleMediaLoad}
                  onError={() => handleMediaError(currentMedia.id)}
                  onEnded={handleVideoEnded}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Media Info Overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6 pt-20">
        <div className="text-center text-white px-4">
          <p className="text-lg font-medium">
            {currentMedia.caption && `"${currentMedia.caption}" - `}
            由 {currentMedia.uploaderName} 上传
          </p>
        </div>
      </div>

      {/* Auto-play Toggle */}
      <div className="absolute top-4 left-4">
        <button
          onClick={handleAutoPlayToggle}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
            autoPlay 
              ? 'bg-green-500 text-white shadow-lg hover:bg-green-600' 
              : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 backdrop-blur-sm'
          }`}
        >
          {autoPlay ? '自动播放 (5秒)' : '手动切换'}
        </button>
      </div>

      {/* Navigation Controls */}
      {mediaItems.length > 1 && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
          <button
            onClick={handlePrevious}
            className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-200 active:scale-95"
          >
            <ChevronUp className="h-6 w-6" />
          </button>
          
          <button
            onClick={handleNext}
            className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-200 active:scale-95"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Media Control Buttons - 右下角 */}
      <div className="absolute bottom-20 right-4 flex flex-col space-y-3 z-40">
        {/* 删除当前媒体按钮 (-) */}
        <button
          onClick={handleDeleteMedia}
          disabled={!hasCurrentMedia}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl ${
            hasCurrentMedia
              ? 'bg-red-500/80 hover:bg-red-600/90 text-white'
              : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
          }`}
          title={hasCurrentMedia ? "删除当前媒体" : "无媒体可删除"}
        >
          <Minus className="h-4 w-4" />
        </button>
        
        {/* 添加媒体按钮 (+) */}
        <button
          onClick={onAddMedia}
          className="w-8 h-8 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg hover:shadow-xl"
          title="添加媒体"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Indicator */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {mediaItems.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaDisplay;