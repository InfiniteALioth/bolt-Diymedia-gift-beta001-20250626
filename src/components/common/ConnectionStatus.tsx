import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw, Clock, Check, Server } from 'lucide-react';
import { apiService, deploymentApi } from '../../services/api';
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
  const [deploymentHealth, setDeploymentHealth] = useState<any>(null);

  // 检查是否使用模拟API
  const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

  // 位置样式映射
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  // 检查部署健康状态
  const checkDeploymentHealth = async () => {
    try {
      const health = await deploymentApi.checkHealth();
      setDeploymentHealth(health);
    } catch (error) {
      console.error('Failed to check deployment health:', error);
      setDeploymentHealth(null);
    }
  };

  useEffect(() => {
    // 如果使用模拟API，直接设置为已连接状态
    if (useMockApi) {
      setApiStatus('connected');
      setDeploymentHealth({
        status: 'OK',
        service: 'mock-api',
        timestamp: new Date().toISOString(),
        health: {
          database: true,
          redis: true,
          server: true
        }
      });
      return;
    }
    
    // 监听 API 连接状态变化
    const unsubscribe = apiService.onConnectionStatusChange((status) => {
      setApiStatus(status);
      setLastChecked(new Date());
      
      if (status === 'connected') {
        setRetryCount(0);
        // 连接成功后检查部署健康状态
        checkDeploymentHealth();
      }
    });

    // 初始检查连接状态
    setApiStatus(apiService.getConnectionStatus());
    if (apiService.getConnectionStatus() === 'connected') {
      checkDeploymentHealth();
    }

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
  }, [apiStatus, useMockApi]);

  useEffect(() => {
    // 如果使用模拟API，不需要检查Socket状态
    if (useMockApi) {
      return;
    }
    
    // 监听 Socket.IO 连接状态
    const checkSocketStatus = () => {
      setSocketStatus(socketService.isSocketConnected());
    };

    // 初始检查
    checkSocketStatus();

    // 定期检查 Socket 状态
    const socketInterval = setInterval(checkSocketStatus, 5000);

    return () => clearInterval(socketInterval);
  }, [useMockApi]);

  const handleRetryConnection = async () => {
    if (useMockApi) {
      setApiStatus('connected');
      return;
    }
    
    setApiStatus('checking');
    await apiService.checkConnection();
    if (apiStatus === 'connected') {
      checkDeploymentHealth();
    }
  };

  const getStatusIcon = () => {
    if (useMockApi) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    
    switch (apiStatus) {
      case 'connected':
        return <Check className="h-4 w-4 text-green-500" />;
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
    if (useMockApi) {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    
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
    if (useMockApi) {
      return '模拟API模式';
    }
    
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

  if (!showDetails && (apiStatus === 'connected' || useMockApi)) {
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
          {!isExpanded && !useMockApi && (
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
                  {useMockApi ? '模拟API模式' : getStatusText()}
                </span>
              </div>
              <div className="text-gray-600 mt-1">
                最后检查: {formatTime(lastChecked)}
              </div>
              {retryCount > 0 && !useMockApi && (
                <div className="text-orange-600">
                  重试次数: {retryCount}
                </div>
              )}
            </div>

            {/* Socket.IO 连接详情 */}
            {!useMockApi && (
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
            )}

            {/* 部署健康状态 */}
            {deploymentHealth && (
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">部署状态:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    deploymentHealth.status === 'OK' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {deploymentHealth.status === 'OK' ? '正常' : '异常'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1 text-gray-600">
                  <Server className="h-3 w-3" />
                  <span>{deploymentHealth.service || 'API服务'}</span>
                </div>
                {deploymentHealth.health && (
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        deploymentHealth.health.database ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>数据库</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        deploymentHealth.health.server ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>服务器</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        deploymentHealth.health.redis ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>Redis</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="border-t pt-2 flex space-x-2">
              {!useMockApi && (
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
              )}
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
                <div>API模式: {useMockApi ? '模拟API' : '真实API'}</div>
                <div>API: {import.meta.env.VITE_API_BASE_URL || '相对路径'}</div>
                {!useMockApi && <div>代理: http://localhost:3001</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;