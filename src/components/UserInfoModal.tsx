import React, { useState } from 'react';
import { User } from '../types';
import { X, Edit, Clock, HardDrive, Wallet, Check } from 'lucide-react';

interface UserInfoModalProps {
  user: User;
  onClose: () => void;
  onUpdateUsername: (newUsername: string) => void;
  remainingTime: number; // 剩余时间（分钟）
  usedStorage: number; // 已用存储（MB）
  totalStorage: number; // 总存储（MB）
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  user,
  onClose,
  onUpdateUsername,
  remainingTime,
  usedStorage,
  totalStorage
}) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [isValid, setIsValid] = useState(true);

  const validateUsername = (value: string) => {
    const byteLength = new TextEncoder().encode(value).length;
    return value.trim().length > 0 && byteLength <= 30;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewUsername(value);
    setIsValid(validateUsername(value));
  };

  const handleSaveUsername = () => {
    if (isValid && newUsername.trim() !== user.username) {
      onUpdateUsername(newUsername.trim());
    }
    setIsEditingUsername(false);
  };

  const handleCancelEdit = () => {
    setNewUsername(user.username);
    setIsEditingUsername(false);
    setIsValid(true);
  };

  const handleRecharge = () => {
    // 预留充值功能接口
    console.log('充值功能待实现');
    alert('充值功能即将上线，敬请期待！');
  };

  const remainingStorage = totalStorage - usedStorage;
  const storagePercentage = (usedStorage / totalStorage) * 100;

  const byteLength = new TextEncoder().encode(newUsername).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">用户信息</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Avatar & Name */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
            <p className="text-sm text-gray-500">设备ID: {user.deviceId.slice(-8)}</p>
          </div>

          {/* Function Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* 修改昵称 */}
            <button
              onClick={() => setIsEditingUsername(true)}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-700">修改昵称</span>
            </button>

            {/* 剩余时间 */}
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-orange-700">剩余时间</span>
              <span className="text-xs text-orange-600 mt-1">
                {remainingTime > 60 
                  ? `${Math.floor(remainingTime / 60)}小时${remainingTime % 60}分钟`
                  : `${remainingTime}分钟`
                }
              </span>
            </div>

            {/* 剩余空间 */}
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <HardDrive className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-700">剩余空间</span>
              <span className="text-xs text-green-600 mt-1">
                {remainingStorage.toFixed(0)}MB
              </span>
              <div className="w-full bg-green-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* 充值 */}
            <button
              onClick={handleRecharge}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-700">充值</span>
            </button>
          </div>

          {/* 账户统计 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-medium text-gray-700 mb-3">账户统计</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>注册时间</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>存储使用率</span>
                <span>{storagePercentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>账户状态</span>
                <span className="text-green-600">正常</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Username Edit Modal */}
      {isEditingUsername && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">修改昵称</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新昵称
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={handleUsernameChange}
                placeholder="输入新的昵称"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  isValid ? 'border-gray-300' : 'border-red-300'
                }`}
                maxLength={50}
                autoFocus
              />
              <div className="mt-2 flex justify-between text-sm">
                <span className={byteLength > 30 ? 'text-red-500' : 'text-gray-500'}>
                  {byteLength}/30 字节
                </span>
                {byteLength > 30 && (
                  <span className="text-red-500">超出长度限制</span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleSaveUsername}
                disabled={!isValid || newUsername.trim() === user.username}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isValid && newUsername.trim() !== user.username
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>确认修改</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfoModal;