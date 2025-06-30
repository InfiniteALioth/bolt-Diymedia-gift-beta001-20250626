import React, { useState, useEffect } from 'react';
import { MediaPage, MediaItem } from '../../types';
import { X, Image, Video, Music, Search, Filter, Trash2, Eye, Download, Calendar, User, AlertCircle, Check } from 'lucide-react';

interface PageMediaModalProps {
  page: MediaPage;
  onClose: () => void;
}

interface ExtendedMediaItem extends MediaItem {
  fileSize: number; // in bytes
  status: 'approved' | 'pending' | 'rejected';
  views: number;
}

const PageMediaModal: React.FC<PageMediaModalProps> = ({ page, onClose }) => {
  const [mediaItems, setMediaItems] = useState<ExtendedMediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ExtendedMediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'fileSize' | 'views' | 'uploaderName'>('createdAt');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ExtendedMediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<ExtendedMediaItem | null>(null);

  // 模拟加载媒体数据
  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成模拟媒体数据
      const mockMedia: ExtendedMediaItem[] = [
        {
          id: 'media_1',
          type: 'image',
          url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
          thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?w=400',
          uploaderId: 'user_1',
          uploaderName: '张小明',
          caption: '美丽的山景照片，在日出时分拍摄',
          createdAt: '2024-01-20T10:30:00Z',
          pageId: page.id,
          fileSize: 2048576, // 2MB
          status: 'approved',
          views: 156,
        },
        {
          id: 'media_2',
          type: 'video',
          url: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4',
          uploaderId: 'user_2',
          uploaderName: '李小红',
          caption: '海浪拍打岩石的视频',
          createdAt: '2024-01-19T15:45:00Z',
          pageId: page.id,
          fileSize: 15728640, // 15MB
          status: 'approved',
          views: 89,
        },
        {
          id: 'media_3',
          type: 'image',
          url: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg',
          thumbnail: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?w=400',
          uploaderId: 'user_3',
          uploaderName: '王大力',
          caption: '城市夜景',
          createdAt: '2024-01-18T20:15:00Z',
          pageId: page.id,
          fileSize: 3145728, // 3MB
          status: 'pending',
          views: 23,
        },
        {
          id: 'media_4',
          type: 'audio',
          url: '/audio/sample.mp3',
          uploaderId: 'user_4',
          uploaderName: '赵小美',
          caption: '生日歌录音',
          createdAt: '2024-01-17T14:20:00Z',
          pageId: page.id,
          fileSize: 5242880, // 5MB
          status: 'approved',
          views: 67,
        },
        {
          id: 'media_5',
          type: 'image',
          url: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg',
          thumbnail: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?w=400',
          uploaderId: 'user_1',
          uploaderName: '张小明',
          caption: '森林小径',
          createdAt: '2024-01-16T09:30:00Z',
          pageId: page.id,
          fileSize: 1572864, // 1.5MB
          status: 'rejected',
          views: 12,
        },
      ];
      
      setMediaItems(mockMedia);
      setIsLoading(false);
    };

    loadMedia();
  }, [page.id]);

  // 过滤和排序媒体
  useEffect(() => {
    let filtered = mediaItems.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uploaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'fileSize':
          return b.fileSize - a.fileSize;
        case 'views':
          return b.views - a.views;
        case 'uploaderName':
          return a.uploaderName.localeCompare(b.uploaderName);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [mediaItems, searchTerm, typeFilter, statusFilter, sortBy]);

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleDeleteItem = (item: ExtendedMediaItem) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMediaItems(prev => prev.filter(item => item.id !== deletingItem.id));
      setShowDeleteModal(false);
      setDeletingItem(null);
      
      // 显示成功提示
      showSuccessMessage('媒体已删除');
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleApproveItem = async (itemId: string) => {
    try {
      setMediaItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'approved' } : item
      ));
      showSuccessMessage('媒体已审核通过');
    } catch (error) {
      console.error('审核失败:', error);
      alert('审核失败，请重试');
    }
  };

  const handleRejectItem = async (itemId: string) => {
    try {
      setMediaItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'rejected' } : item
      ));
      showSuccessMessage('媒体已拒绝');
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  const showSuccessMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg font-medium transition-all duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      default: return <Image className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'text-blue-600 bg-blue-100';
      case 'video': return 'text-purple-600 bg-purple-100';
      case 'audio': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '已通过';
      case 'pending': return '待审核';
      case 'rejected': return '已拒绝';
      default: return '未知';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${bytes} B`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours}小时前`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}天前`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">页面媒体管理</h2>
              <p className="text-sm text-gray-600">{page.name} - 共 {mediaItems.length} 个媒体文件</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">图片</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {mediaItems.filter(item => item.type === 'image').length}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">视频</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {mediaItems.filter(item => item.type === 'video').length}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Music className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">音频</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {mediaItems.filter(item => item.type === 'audio').length}
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">待审核</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {mediaItems.filter(item => item.status === 'pending').length}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">总存储</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatFileSize(mediaItems.reduce((sum, item) => sum + item.fileSize, 0))}
              </p>
            </div>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索媒体标题、上传者或ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">全部类型</option>
                <option value="image">图片</option>
                <option value="video">视频</option>
                <option value="audio">音频</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="approved">已通过</option>
                <option value="pending">待审核</option>
                <option value="rejected">已拒绝</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="createdAt">上传时间</option>
                <option value="fileSize">文件大小</option>
                <option value="views">查看次数</option>
                <option value="uploaderName">上传者</option>
              </select>
            </div>
          </div>
        </div>

        {/* 媒体列表 */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">加载媒体数据中...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到媒体</h3>
              <p className="text-gray-600">尝试调整搜索条件或过滤器</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* 批量操作栏 */}
              {selectedItems.size > 0 && (
                <div className="p-4 bg-purple-50 border-b border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-800">
                      已选择 {selectedItems.size} 个媒体文件
                    </span>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors duration-200">
                        批量通过
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200">
                        批量删除
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 表头 */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">全选</span>
                </div>
              </div>

              {/* 媒体列表 */}
              {filteredItems.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-2"
                    />
                    
                    {/* 媒体预览 */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.type === 'image' && item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.caption}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          onClick={() => setPreviewItem(item)}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {item.caption || '无标题'}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                              {getStatusText(item.status)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                              {item.type.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{item.uploaderName}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatTimeAgo(item.createdAt)}</span>
                            </span>
                            <span>{formatFileSize(item.fileSize)}</span>
                            <span>{item.views} 次查看</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {item.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveItem(item.id)}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                                title="审核通过"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectItem(item.id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="拒绝"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="预览"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {item.caption && (
                        <p className="text-sm text-gray-700 line-clamp-2 mt-2">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              显示 {filteredItems.length} / {mediaItems.length} 个媒体文件
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteModal && deletingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
                  <p className="text-sm text-gray-600">此操作不可恢复</p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  确定要删除媒体 <strong>"{deletingItem.caption || '无标题'}"</strong> 吗？
                </p>
                <p className="text-xs text-red-600 mt-2">
                  文件大小: {formatFileSize(deletingItem.fileSize)} | 上传者: {deletingItem.uploaderName}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  取消
                </button>
                <button
                  onClick={confirmDeleteItem}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 媒体预览对话框 */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-screen overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">媒体预览</h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-4">
                {previewItem.type === 'image' ? (
                  <img
                    src={previewItem.url}
                    alt={previewItem.caption}
                    className="max-w-full max-h-96 mx-auto rounded-lg"
                  />
                ) : previewItem.type === 'video' ? (
                  <video
                    src={previewItem.url}
                    controls
                    className="max-w-full max-h-96 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Music className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800">音频文件</p>
                      <audio src={previewItem.url} controls className="mt-4" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{previewItem.caption || '无标题'}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">上传者:</span> {previewItem.uploaderName}
                  </div>
                  <div>
                    <span className="font-medium">文件大小:</span> {formatFileSize(previewItem.fileSize)}
                  </div>
                  <div>
                    <span className="font-medium">上传时间:</span> {new Date(previewItem.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">查看次数:</span> {previewItem.views}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageMediaModal;