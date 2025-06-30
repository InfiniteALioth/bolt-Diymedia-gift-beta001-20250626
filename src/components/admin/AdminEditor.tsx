import React, { useState, useEffect } from 'react';
import { Admin, AdminPermissions } from '../../types';
import { X, Shield, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface AdminEditorProps {
  admin: Admin | null; // null表示创建新管理员
  currentAdmin: Admin; // 当前操作的管理员
  onSave: (adminData: Partial<Admin>, password?: string) => void;
  onClose: () => void;
}

const AdminEditor: React.FC<AdminEditorProps> = ({
  admin,
  currentAdmin,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    username: admin?.username || '',
    level: admin?.level || 3,
    permissions: admin?.permissions || {
      canCreateAdmins: false,
      canManagePages: false,
      canManageUsers: false,
      canManageMedia: false,
      canViewAnalytics: false,
    }
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!admin;
  const isCreating = !admin;

  // 权限级别配置
  const levelConfigs = {
    1: {
      name: '超级管理员',
      description: '拥有所有权限，可以管理其他管理员',
      color: 'text-red-800 bg-red-100 border-red-200',
      defaultPermissions: {
        canCreateAdmins: true,
        canManagePages: true,
        canManageUsers: true,
        canManageMedia: true,
        canViewAnalytics: true,
      }
    },
    2: {
      name: '二级管理员',
      description: '可以管理页面和用户，但不能管理媒体',
      color: 'text-blue-800 bg-blue-100 border-blue-200',
      defaultPermissions: {
        canCreateAdmins: true,
        canManagePages: true,
        canManageUsers: true,
        canManageMedia: false,
        canViewAnalytics: true,
      }
    },
    3: {
      name: '三级管理员',
      description: '基础管理权限，主要负责内容审核',
      color: 'text-green-800 bg-green-100 border-green-200',
      defaultPermissions: {
        canCreateAdmins: false,
        canManagePages: false,
        canManageUsers: false,
        canManageMedia: true,
        canViewAnalytics: false,
      }
    }
  };

  // 权限检查
  const canCreateLevel = (level: number) => {
    // 只有超级管理员可以创建同级或更低级别的管理员
    // 其他级别只能创建更低级别的管理员
    if (currentAdmin.level === 1) return true;
    return level > currentAdmin.level;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 用户名验证
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线';
    }

    // 级别验证
    if (!canCreateLevel(formData.level)) {
      newErrors.level = '您无权创建此级别的管理员';
    }

    // 密码验证（仅在创建时必填）
    if (isCreating) {
      if (!password) {
        newErrors.password = '密码不能为空';
      } else if (password.length < 6) {
        newErrors.password = '密码至少6个字符';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }
    } else if (password && password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLevelChange = (level: number) => {
    setFormData(prev => ({
      ...prev,
      level,
      permissions: levelConfigs[level as keyof typeof levelConfigs].defaultPermissions
    }));
  };

  const handlePermissionChange = (permission: keyof AdminPermissions, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const adminData: Partial<Admin> = {
      username: formData.username.trim(),
      level: formData.level,
      permissions: formData.permissions,
      createdBy: currentAdmin.id,
      createdAt: isCreating ? new Date().toISOString() : admin?.createdAt,
    };

    onSave(adminData, password || undefined);
  };

  const permissionLabels = {
    canCreateAdmins: '创建管理员',
    canManagePages: '管理页面',
    canManageUsers: '管理用户',
    canManageMedia: '管理媒体',
    canViewAnalytics: '查看分析',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? '编辑管理员' : '创建新管理员'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEditing ? `编辑 ${admin?.username} 的信息` : '添加新的管理员账户'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            
            <div className="space-y-4">
              {/* 用户名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名 *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="输入管理员用户名"
                  disabled={isEditing} // 编辑时不允许修改用户名
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* 管理员级别 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  管理员级别 *
                </label>
                <div className="space-y-3">
                  {Object.entries(levelConfigs).map(([level, config]) => {
                    const levelNum = parseInt(level);
                    const canSelect = canCreateLevel(levelNum);
                    
                    return (
                      <div
                        key={level}
                        className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          formData.level === levelNum
                            ? config.color
                            : canSelect
                              ? 'border-gray-200 hover:border-gray-300 bg-white'
                              : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                        }`}
                        onClick={() => canSelect && handleLevelChange(levelNum)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            formData.level === levelNum
                              ? 'border-current bg-current'
                              : 'border-gray-300'
                          }`}>
                            {formData.level === levelNum && (
                              <Check className="h-2.5 w-2.5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{config.name}</h4>
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                                Level {level}
                              </span>
                            </div>
                            <p className="text-sm opacity-75 mt-1">{config.description}</p>
                          </div>
                        </div>
                        {!canSelect && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                            <span className="text-sm text-gray-500 font-medium">权限不足</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {errors.level && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.level}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 权限设置 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">权限设置</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(permissionLabels).map(([key, label]) => {
                const permissionKey = key as keyof AdminPermissions;
                const isChecked = formData.permissions[permissionKey];
                
                return (
                  <div
                    key={key}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? 'border-purple-200 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => handlePermissionChange(permissionKey, !isChecked)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isChecked
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {isChecked && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={`font-medium ${
                        isChecked ? 'text-purple-800' : 'text-gray-700'
                      }`}>
                        {label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 密码设置 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isEditing ? '修改密码（可选）' : '设置密码'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEditing ? '新密码' : '密码'} {isCreating && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-10 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder={isEditing ? '留空表示不修改密码' : '输入密码'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* 确认密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码 {isCreating && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-10 ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="再次输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {isEditing ? '修改后将立即生效' : '创建后管理员可立即登录'}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isEditing ? '保存修改' : '创建管理员'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditor;