import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ url, title, onClose }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadCopied, setDownloadCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成二维码
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        
        // 生成高质量二维码
        const qrCodeOptions = {
          errorCorrectionLevel: 'M' as const,
          type: 'image/png' as const,
          quality: 0.92,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 300
        };

        const dataUrl = await QRCode.toDataURL(url, qrCodeOptions);
        setQrCodeDataUrl(dataUrl);
        
        // 同时生成到canvas用于下载
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, url, {
            ...qrCodeOptions,
            width: 400 // 下载版本使用更高分辨率
          });
        }
      } catch (error) {
        console.error('生成二维码失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [url]);

  // 复制二维码图片到剪贴板
  const handleCopyImage = async () => {
    try {
      if (!canvasRef.current) return;

      // 将canvas转换为blob
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;

        try {
          // 尝试使用现代剪贴板API
          if (navigator.clipboard && window.ClipboardItem) {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } else {
            // 回退方案：复制数据URL
            await navigator.clipboard.writeText(qrCodeDataUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        } catch (error) {
          console.error('复制二维码失败:', error);
          // 最后的回退方案：提示用户手动保存
          alert('复制失败，请长按二维码图片手动保存');
        }
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('复制二维码失败:', error);
      alert('复制失败，请重试');
    }
  };

  // 下载二维码
  const handleDownload = () => {
    try {
      if (!canvasRef.current) return;

      // 创建下载链接
      canvasRef.current.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-${title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setDownloadCopied(true);
        setTimeout(() => setDownloadCopied(false), 2000);
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('下载二维码失败:', error);
      alert('下载失败，请重试');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">页面二维码</h2>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* 二维码显示区域 */}
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
              {isLoading ? (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">生成中...</p>
                  </div>
                </div>
              ) : qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="二维码"
                  className="w-64 h-64 rounded-lg"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="w-64 h-64 bg-red-100 rounded-lg flex items-center justify-center">
                  <p className="text-red-600">生成失败</p>
                </div>
              )}
            </div>
            
            {/* 隐藏的canvas用于高质量下载 */}
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 复制二维码图片 */}
            <button
              onClick={handleCopyImage}
              disabled={isLoading || !qrCodeDataUrl}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : isLoading || !qrCodeDataUrl
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  <span>复制图片</span>
                </>
              )}
            </button>

            {/* 下载二维码 */}
            <button
              onClick={handleDownload}
              disabled={isLoading || !qrCodeDataUrl}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                downloadCopied
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : isLoading || !qrCodeDataUrl
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300'
              }`}
            >
              {downloadCopied ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>已下载</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>下载</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;