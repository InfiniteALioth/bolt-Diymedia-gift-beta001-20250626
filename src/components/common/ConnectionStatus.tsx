import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { apiService } from '../../services/api';
import { socketService } from '../../services/socket';

type ConnectionStatus = 'checking' | 'connected' | 'disconnected' | 'error';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = '',
  showDetails = false,
  position = 'top-right'
}) => {
  const [apiStatus, setApiStatus] = useState<ConnectionStatus>('checking');
  const [socketStatus, setSocketStatus] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);

  // 位置样式映射
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  useEffect(() => {
    // 监听 API 连接状态变化
    const unsubscribe = apiService.onConnectionStatusChange((status) => {
      setApiStatus(status);
      setLastChecked(new Date());
      
      if (status === 'connected') {
        setRetryCount(0);
      }
    });

    // 初始检查连接状态
    setApiStatus(apiService.getConnectionStatus());

    // 定期检查连接状态
    const interval = setInterval(async () => {
      if (apiStatus === 'disconnected' || apiStatus === 'error') {
        setRetryCount(prev => prev + 1);
        await apiService.checkConnection();
      }
      setLastChecked(new Date());
    }, 30000); // 每30秒检查一次

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [apiStatus]);

  useEffect(() => {
    // 监听 Socket.IO 连接状态
    const checkSocketStatus = () => {
      setSocketStatus(socketService.isSocketConnected());
    };

    // 初始检查
    checkSocketStatus();

    // 定期检查 Socket 状态
    const socketInterval = setInterval(checkSocketStatus, 5000);

    return () => clearInterval(socketInterval);
  }, []);

  const handleRetryConnection = async () => {
    setApiStatus('checking');
    await apiService.checkConnection();
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'connected':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'checking':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'disconnected':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'connected':
        return '已连接';
      case 'checking':
        return '连接中...';
      case 'disconnected':
        return '连接断开';
      case 'error':
        return '连接错误';
      default:
        return '未知状态';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!showDetails && apiStatus === 'connected') {
    return null; // 连接正常时不显示
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <div
        className={`
          border rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 cursor-pointer
          ${getStatusColor()}
          ${isExpanded ? 'p-4 min-w-64' : 'p-2'}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* 简化状态显示 */}
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
          {!isExpanded && (
            <div className="flex items-center space-x-1">
              {socketStatus ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-gray-400" />
              )}
            </div>
          )}
        </div>

        {/* 详细信息展开 */}
        {isExpanded && (
          <div className="mt-3 space-y-2 text-xs">
            {/* API 连接详情 */}
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">API 连接:</span>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
              <div className="text-gray-600 mt-1">
                最后检查: {formatTime(lastChecked)}
              </div>
              {retryCount > 0 && (
                <div className="text-orange-600">
                  重试次数: {retryCount}
                </div>
              )}
            </div>

            {/* Socket.IO 连接详情 */}
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">实时连接:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  socketStatus 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {socketStatus ? '已连接' : '未连接'}
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="border-t pt-2 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetryConnection();
                }}
                disabled={apiStatus === 'checking'}
                className="flex-1 px-2 py-1 bg-white bg-opacity-50 hover:bg-opacity-70 rounded text-xs font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {apiStatus === 'checking' ? '检查中...' : '重新连接'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="px-2 py-1 bg-white bg-opacity-50 hover:bg-opacity-70 rounded text-xs font-medium transition-colors duration-200"
              >
                收起
              </button>
            </div>

            {/* 开发环境信息 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="border-t pt-2 text-gray-600">
                <div>环境: 开发模式</div>
                <div>API: {import.meta.env.VITE_API_BASE_URL}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;