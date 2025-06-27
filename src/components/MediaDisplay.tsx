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
      consol