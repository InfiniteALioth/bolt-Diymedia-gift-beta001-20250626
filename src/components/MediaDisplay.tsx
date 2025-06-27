import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';

interface MediaDisplayProps {
  mediaItems: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  autoPlay: boolean;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({
  mediaItems,
  currentIndex,
  onIndexChange,
  autoPlay
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const currentMedia = mediaItems[currentIndex];

  console.log('MediaDisplay 渲染:', {
    mediaItemsCount: mediaItems.length,
    currentIndex,
    currentMedia: currentMedia ? currentMedia.type : 'none'
  });

  useEffect(() => {
    if (!autoPlay || mediaItems.length <= 1) return;

    const interval = setInterval(() => {
      onIndexChange((currentIndex + 1) % mediaItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, mediaItems.length, autoPlay, onIndexChange]);

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

  if (mediaItems.length === 0) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">暂无媒体内容</h3>
          <p className="text-gray-300">点击右上角的上传按钮开始分享</p>
        </div>
      </div>
    );
  }

  if (!currentMedia) {
    console.warn('当前媒体项为空，但媒体列表不为空');
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h3 className="text-xl font-semibold mb-2">媒体加载中...</h3>
          <p className="text-gray-300">请稍候</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Media Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {currentMedia.type === 'image' && (
          <img
            src={currentMedia.url}
            alt={currentMedia.caption}
            className="max-w-full max-h-full object-contain"
            onLoad={() => console.log('图片加载完成:', currentMedia.url)}
            onError={(e) => console.error('图片加载失败:', currentMedia.url, e)}
          />
        )}
        
        {currentMedia.type === 'video' && (
          <video
            src={currentMedia.url}
            className="max-w-full max-h-full object-contain"
            autoPlay={autoPlay}
            muted={isMuted}
            loop
            playsInline
            controls
            onLoadedData={() => console.log('视频加载完成:', currentMedia.url)}
            onError={(e) => console.error('视频加载失败:', currentMedia.url, e)}
          />
        )}
        
        {currentMedia.type === 'audio' && (
          <div className="w-full max-w-md p-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">音频播放中</h3>
              <p className="text-white/80">{currentMedia.caption || '正在播放音频内容'}</p>
            </div>
            <audio
              src={currentMedia.url}
              className="w-full"
              controls
              autoPlay={autoPlay}
              muted={isMuted}
              onLoadedData={() => console.log('音频加载完成:', currentMedia.url)}
              onError={(e) => console.error('音频加载失败:', currentMedia.url, e)}
            />
          </div>
        )}
      </div>

      {/* Media Info Overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6 pt-20">
        <div className="text-center text-white">
          <p className="text-lg font-medium">
            {currentMedia.caption && `"${currentMedia.caption}" - `}
            由 {currentMedia.uploaderName} 上传
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      {mediaItems.length > 1 && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
          <button
            onClick={handlePrevious}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          >
            <ChevronUp className="h-6 w-6" />
          </button>
          
          <button
            onClick={handleNext}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Media Controls */}
      {(currentMedia.type === 'video' || currentMedia.type === 'audio') && (
        <div className="absolute bottom-20 right-4 flex flex-col space-y-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          >
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {mediaItems.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaDisplay;