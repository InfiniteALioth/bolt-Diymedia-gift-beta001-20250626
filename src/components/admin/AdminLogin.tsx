import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Home } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => boolean;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API delay
    setTimeout(() => {
      const success = onLogin(credentials.username, credentials.password);
      if (!success) {
        setError('用户名或密码错误');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* 返回首页按钮 */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-200"
            >
              <Home className="h-4 w-4" />
              <span className="text-sm">返回首页</span>
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">管理员登录</h1>
            <p className="text-gray-300">访问后台管理系统</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="请输入管理员用户名"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="请输入管理员密码"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-sm font-medium text-blue-200 mb-2">测试账户</h3>
            <p className="text-sm text-blue-300">
              用户名: superadmin<br />
              密码: admin123
            </p>
          </div>

          {/* 调试信息 */}
          <div className="mt-4 p-3 bg-gray-500/20 border border-gray-500/30 rounded-lg">
            <h4 className="text-xs font-medium text-gray-300 mb-1">调试信息</h4>
            <p className="text-xs text-gray-400">
              当前URL: {window.location.href}<br />
              路径: {window.location.pathname}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;