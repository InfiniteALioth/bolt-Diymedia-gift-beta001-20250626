import React, { useState, useCallback } from 'react';
import { Upload, X, Image, Video, Music, ChevronRight } from 'lucide-react';

interface MediaUploadProps {
  uploaderName: string;
  onUpload: (files: File[], caption: string) => void;
  onClose: () => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  uploaderName,
  onUpload,
  onClose
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [currentStep, setCurrentStep] = useState<'select' | 'edit'>('select');
  const [dragOver, setDragOver] = useState(false);

  const captionByteLength = new TextEncoder().encode(caption).length;
  const isCaptionValid = captionByteLength <= 120;

  const acceptedTypes = {
    image: 'image/*',
    video: 'video/*',
    audio: 'audio/*'
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (type.startsWith('video/')) return <Video className="h-6 w-6" />;
    if (type.startsWith('audio/')) return <Music className="h-6 w-6" />;
    return <Upload className="h-6 w-6" />;
  };

  const validateFiles = (files: File[]): string | null => {
    if (files.length === 0) return '请选择至少一个文件';
    
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const videoFiles = files.filter(f => f.type.startsWith('video/'));
    const audioFiles = files.filter(f => f.type.startsWith('audio/'));

    console.log('文件验证:', { imageFiles: imageFiles.length, videoFiles: videoFiles.length, audioFiles: audioFiles.length });

    if (imageFiles.length > 3) return '图片最多选择3张';
    if (videoFiles.length > 1) return '视频最多选择1个';
    if (audioFiles.length > 1) return '音频最多选择1个';

    // Check mixed types
    const hasImages = imageFiles.length > 0;
    const hasVideos = videoFiles.length > 0;
    const hasAudios = audioFiles.length > 0;
    const typeCount = [hasImages, hasVideos, hasAudios].filter(Boolean).length;

    if (typeCount > 1) return '每次只能上传同一类型的媒体';

    return null;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    console.log('选择的文件:', fileArray.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    const error = validateFiles(fileArray);

    if (error) {
      alert(error);
      return;
    }

    setSelectedFiles(fileArray);
    setCurrentStep('edit');
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleSubmit = () => {
    if (selectedFiles.length > 0 && isCaptionValid) {
      console.log('提交上传:', selectedFiles.length, '个文件，说明:', caption);
      onUpload(selectedFiles, caption);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes >= 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } else if (sizeInBytes >= 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (sizeInBytes >= 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${sizeInBytes} B`;
    }
  };

  if (currentStep === 'select') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">上传媒体</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                选择媒体文件
              </h3>
              <p className="text-gray-600 mb-4">
                拖拽文件到此处，或点击选择文件
              </p>
              <input
                type="file"
                multiple
                accept={`${acceptedTypes.image},${acceptedTypes.video},${acceptedTypes.audio}`}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 cursor-pointer transition-all duration-200"
              >
                选择文件
              </label>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Image className="h-4 w-4" />
                <span>图片：最多3张，支持 JPG、PNG、GIF 等格式</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Video className="h-4 w-4" />
                <span>视频：1个，支持 MP4、WebM、MOV 等格式</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Music className="h-4 w-4" />
                <span>音频：1个，支持 MP3、WAV、OGG 等格式</span>
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  <strong>无大小限制：</strong>您可以上传任意大小的媒体文件。文件将保存在浏览器本地存储中，较大的文件可能需要更长的处理时间。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">编辑媒体信息</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Selected Files */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">已选择的文件</h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-blue-600">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* 显示总文件大小 */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>总大小：</strong>{formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                文件将转换为 Base64 格式保存，处理时间取决于文件大小
              </p>
            </div>
          </div>

          {/* Uploader Info */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传者名称
            </label>
            <input
              type="text"
              value={uploaderName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Caption */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              想说的话
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="分享您的想法..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="mt-1 flex justify-between text-sm">
              <span className={captionByteLength > 120 ? 'text-red-500' : 'text-gray-500'}>
                {captionByteLength}/120 字节
              </span>
              {captionByteLength > 120 && (
                <span className="text-red-500">超出长度限制</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('select')}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              返回选择
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0 || !isCaptionValid}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                selectedFiles.length > 0 && isCaptionValid
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>发布</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;