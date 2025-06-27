import React, { useState, useEffect } from 'react';
import { User, Smile, Smartphone } from 'lucide-react';

interface UserSetupProps {
  onComplete: (username: string) => void;
  isEditing?: boolean;
  currentUsername?: string;
}

const UserSetup: React.FC<UserSetupProps> = ({ 
  onComplete, 
  isEditing = false, 
  currentUsername = '' 
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [isValid, setIsValid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // 检测移动端
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      // 更新调试信息
      const info = [
        `设备类型: ${mobile ? '移动端' : '桌面端'}`,
        `屏幕尺寸: ${window.innerWidth}x${window.innerHeight}`,
        `用户代理: ${navigator.userAgent.substring(0, 50)}...`,
        `当前时间: ${new Date().toLocaleTimeString()}`,
        `组件状态: ${isEditing ? '编辑模式' : '初始设置'}`
      ].join('\n');
      setDebugInfo(info);
      
      console.log('UserSetup - 移动端检测:', mobile, {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent
      });
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isEditing]);

  const validateUsername = (value: string) => {
    const byteLength = new TextEncoder().encode(value).length;
    return value.trim().length > 0 && byteLength <= 30;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setIsValid(validateUsername(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      console.log('UserSetup - 提交用户名:', username);
      try {
        onComplete(username);
      } catch (error) {
        console.error('UserSetup - 提交失败:', error);
        alert('设置用户名失败，请重试');
      }
    }
  };

  const byteLength = new TextEncoder().encode(username).length;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden'
      }}
    >
      {/* 移动端状态指示器 */}
      {isMobile && (
        <div className="absolute top-4 left-4 right-4 bg-green-500 text-white text-xs p-3 rounded-lg z-50 shadow-lg">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span className="font-medium">移动端模式已激活</span>
          </div>
          <div className="mt-1 text-xs opacity-90">
            屏幕: {window.innerWidth}x{window.innerHeight} | 
            浏览器: {navigator.userAgent.split(' ')[0]}
          </div>
        </div>
      )}
      
      <div className="max-w-md w-full" style={{ marginTop: isMobile ? '60px' : '0' }}>
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white border-opacity-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditing ? '修改用户名称' : '欢迎使用'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? '设置您的新用户名称' : '首先，请设置您的用户名称'}
            </p>
            {isMobile && (
              <div className="mt-2 text-sm text-blue-600">
                📱 移动端优化版本
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用户名称
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="输入您的用户名称（支持表情符号）"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 ${
                    isMobile ? 'text-base' : ''
                  }`}
                  style={{
                    fontSize: isMobile ? '16px' : 'inherit', // 防止移动端缩放
                    WebkitAppearance: 'none',
                    borderRadius: '8px'
                  }}
                  maxLength={50}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <Smile className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className={`${byteLength > 30 ? 'text-red-500' : 'text-gray-500'}`}>
                  {byteLength}/30 字节
                </span>
                {byteLength > 30 && (
                  <span className="text-red-500">超出长度限制</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isValid
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={{
                touchAction: 'manipulation' // 优化移动端点击
              }}
            >
              {isEditing ? '确认修改' : '开始使用'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">小提示</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 支持输入表情符号和特殊字符</li>
              <li>• 长度限制为30个字节</li>
              <li>• {isEditing ? '修改后将立即生效' : '设置后可随时修改'}</li>
              {isMobile && <li>• 🎯 移动端优化版本，触控友好</li>}
            </ul>
          </div>

          {/* 移动端调试信息 */}
          {isMobile && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <details>
                <summary className="text-xs text-gray-600 cursor-pointer">
                  🔧 调试信息 (点击展开)
                </summary>
                <div className="mt-2 text-xs text-gray-500 whitespace-pre-line font-mono">
                  {debugInfo}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSetup;