import React, { useState } from 'react';
import { CloudOff, RefreshCw, Settings, Info, AlertCircle, Server } from 'lucide-react';

interface OfflineModeProps {
  onRetry: () => Promise<void>;
  errorMessage?: string;
  showAdminLink?: boolean;
}

const OfflineMode: React.FC<OfflineModeProps> = ({
  onRetry,
  errorMessage,
  showAdminLink = true
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // 检查是否使用模拟API
  const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

  const handleRetry = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('重试连接失败:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // 如果使用模拟API，显示特殊提示
  if (useMockApi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">模拟API模式</h1>
            <p className="text-gray-300 mb-6">
              您当前正在使用模拟API模式，无需连接后端服务器。所有数据都是本地模拟的。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-5 w-5" />
                <span>返回首页</span>
              </button>
              
              {showAdminLink && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600/50 hover:bg-gray-600/70 text-white rounded-lg transition-all duration-200"
                >
                  <Settings className="h-5 w-5" />
                  <span>管理后台</span>
                </button>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-left">
              <h3 className="text-sm font-medium text-blue-200 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                模拟API模式说明
              </h3>
              <p className="text-xs text-blue-300 leading-relaxed">
                在模拟API模式下，所有数据都存储在浏览器本地，无需连接后端服务器。
                这种模式适合前端开发和测试，但数据不会持久化到服务器。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="w-16 h-16 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <CloudOff className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">后端服务不可用</h1>
          <p className="text-gray-300 mb-6">
            无法连接到后端服务器，请检查网络连接或稍后再试。
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isRetrying
                  ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>连接中...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  <span>重新连接</span>
                </>
              )}
            </button>
            
            {showAdminLink && (
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600/50 hover:bg-gray-600/70 text-white rounded-lg transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
                <span>管理后台</span>
              </button>
            )}
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-700/30 hover:bg-gray-700/50 text-white/70 hover:text-white rounded-lg transition-all duration-200"
            >
              <Info className="h-5 w-5" />
              <span>{showDetails ? '隐藏详情' : '查看详情'}</span>
            </button>
          </div>

          {showDetails && (
            <div className="mt-6 p-4 bg-black/30 border border-white/10 rounded-lg text-left">
              <h3 className="text-sm font-medium text-white/80 mb-2 flex items-center">
                <Server className="h-4 w-4 mr-2" />
                连接诊断信息
              </h3>
              
              <div className="space-y-2 text-xs text-white/60">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-300">错误信息:</p>
                    <p className="mt-1">{errorMessage || '无法连接到后端服务器'}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-white/10">
                  <p className="font-medium text-white/70 mb-1">可能的原因:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>后端服务器未启动或已崩溃</li>
                    <li>网络连接问题</li>
                    <li>防火墙或安全设置阻止了连接</li>
                    <li>后端服务器地址配置错误</li>
                  </ul>
                </div>
                
                <div className="pt-2 border-t border-white/10">
                  <p className="font-medium text-white/70 mb-1">建议操作:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>确认后端服务器已启动</li>
                    <li>检查网络连接</li>
                    <li>查看后端服务器日志</li>
                    <li>联系系统管理员</li>
                  </ul>
                </div>
                
                <div className="pt-2 border-t border-white/10">
                  <p className="font-medium text-white/70 mb-1">技术信息:</p>
                  <p>API地址: {import.meta.env.VITE_API_URL || '默认地址'}</p>
                  <p>当前时间: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineMode;