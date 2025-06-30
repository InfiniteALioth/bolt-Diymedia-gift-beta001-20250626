import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check, QrCode, Share2, Smartphone } from 'lucide-react';
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

  // 分享功能（移动端）
  const handleShare = async () => {
    try {
      if (navigator.share && canvasRef.current) {
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;

          const file = new File([blob], `qrcode-${title}.png`, { type: 'image/png' });
          
          try {
            await navigator.share({
              title: `${title} - 二维码`,
              text: `扫描二维码访问：${title}`,
              files: [file]
            });
          } catch (shareError) {
            // 如果分享文件失败，尝试只分享链接
            await navigator.share({
              title: `${title} - 访问链接`,
              text: `访问链接：${url}`,
              url: url
            });
          }
        }, 'image/png');
      } else {
        // 回退到复制链接
        await navigator.clipboard.writeText(url);
        alert('链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('分享失败:', error);
      // 最后回退到复制链接
      try {
        await navigator.clipboard.writeText(url);
        alert('分享功能不可用，链接已复制到剪贴板');
      } catch (copyError) {
        alert('分享失败，请手动复制链接');
      }
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

          {/* 使用说明 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">使用方法</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 使用手机相机或二维码扫描应用扫描</li>
                  <li>• 扫描后将自动跳转到媒体交互页面</li>
                  <li>• 支持微信、支付宝等主流扫码工具</li>
                  <li>• 可保存图片后分享给他人使用</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 链接信息 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">访问链接</h4>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-xs text-gray-800 bg-white px-3 py-2 rounded border break-all">
                {url}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(url)}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
                title="复制链接"
              >
                <Copy className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-1 gap-3">
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
                  <span>已复制二维码</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  <span>复制二维码图片</span>
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
                  <span>已保存到下载</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>下载二维码</span>
                </>
              )}
            </button>

            {/* 分享功能（移动端优先显示） */}
            {navigator.share && (
              <button
                onClick={handleShare}
                disabled={isLoading || !qrCodeDataUrl}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isLoading || !qrCodeDataUrl
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <Share2 className="h-5 w-5" />
                <span>分享二维码</span>
              </button>
            )}
          </div>

          {/* 移动端提示 */}
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg md:hidden">
            <p className="text-xs text-orange-800">
              <strong>移动端提示：</strong>长按二维码图片可以保存到相册，或使用上方按钮进行复制和分享。
            </p>
          </div>

          {/* 技术说明 */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-xs font-medium text-gray-700 mb-1">技术信息</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• 二维码格式：PNG，300x300像素</p>
              <p>• 错误纠正级别：中等 (M)</p>
              <p>• 兼容性：支持所有主流扫码应用</p>
              <p>• 有效期：永久有效（除非页面被删除）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;