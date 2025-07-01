import React from 'react';
import { Loader, Wifi, WifiOff } from 'lucide-react';
import { ConnectionStatus } from '../../services/api';

interface LoadingScreenProps {
  message?: string;
  connectionStatus?: ConnectionStatus;
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = '加载中...',
  connectionStatus,
  progress
}) => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-center text-white p-4">
        <div className="w-16 h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{message}</h3>
        
        {progress !== undefined && (
          <div className="w-64 mx-auto mt-4 mb-6">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">
              {Math.round(progress)}%
            </div>
          </div>
        )}
        
        {connectionStatus && (
          <div className="flex items-center justify-center space-x-2 mt-4">
            {connectionStatus === 'connected' ? (
              <>
                <Wifi className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">已连接到服务器</span>
              </>
            ) : connectionStatus === 'checking' ? (
              <>
                <Loader className="h-4 w-4 text-yellow-400 animate-spin" />
                <span className="text-sm text-yellow-400">正在连接服务器...</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">无法连接到服务器</span>
              </>
            )}
          </div>
        )}
        
        <p className="text-gray-400 text-sm mt-4">
          如果长时间无响应，请刷新页面或稍后再试
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;