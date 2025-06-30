import React, { useState, useEffect } from 'react';
import { MediaPage, User } from '../../types';
import { X, Users, Search, Filter, Ban, CheckCircle, AlertCircle, Calendar, Activity, MessageSquare, Upload } from 'lucide-react';

interface PageUsersModalProps {
  page: MediaPage;
  onClose: () => void;
}

interface PageUser extends User {
  lastActive: string;
  mediaCount: number;
  messageCount: number;
  status: 'active' | 'inactive' | 'banned';
  joinedAt: string;
}

const PageUsersModal: React.FC<PageUsersModalProps> = ({ page, onClose }) => {
  const [users, setUsers] = useState<PageUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PageUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastActive' | 'mediaCount' | 'messageCount'>('lastActive');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBanModal, setShowBanModal] = useState(false);
  const [banningUser, setBanningUser] = useState<PageUser | null>(null);

  // 模拟加载用户数据
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成模拟用户数据
      const mockUsers: PageUser[] = [
        {
          id: 'user_1',
          username: '张小明',
          deviceId: 'device_001',
          createdAt: '2024-01-15T10:30:00Z',
          permissions: {
            canLogin: true,
            canView: true,
            canUploadMedia: true,
            canDeleteOwnMedia: true,
            canSendMessage: true,
            canDeleteOwnMessage: true,
          },
          lastActive: '2024-01-20T15:45:00Z',
          mediaCount: 12,
          messageCount: 45,
          status: 'active',
          joinedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: 'user_2',
          username: '李小红',
          deviceId: 'device_002',
          createdAt: '2024-01-16T14:20:00Z',
          permissions: {
            canLogin: true,
            canView: true,
            canUploadMedia: true,
            canDeleteOwnMedia: true,
            canSendMessage: true,
            canDeleteOwnMessage: true,
          },
          lastActive: '2024-01-19T09:15:00Z',
          mediaCount: 8,
          messageCount: 23,
          status: 'active',
          joinedAt: '2024-01-16T14:20:00Z',
        },
        {
          id: 'user_3',
          username: '王大力',
          deviceId: 'device_003',
          createdAt: '2024-01-17T16:45:00Z',
          permissions: {
            canLogin: false,
            canView: false,
            canUploadMedia: false,
            canDeleteOwnMedia: false,
            canSendMessage: false,
            canDeleteOwnMessage: false,
          },
          lastActive: '2024-01-18T12:30:00Z',
          mediaCount: 3,
          messageCount: 7,
          status: 'banned',
          joinedAt: '2024-01-17T16:45:00Z',
        },
        {
          id: 'user_4',
          username: '赵小美',
          deviceId: 'device_004',
          createdAt: '2024-01-18T11:10:00Z',
          permissions: {
            canLogin: true,
            canView: true,
            canUploadMedia: true,
            canDeleteOwnMedia: true,
            canSendMessage: true,
            canDeleteOwnMessage: true,
          },
          lastActive: '2024-01-17T18:20:00Z',
          mediaCount: 15,
          messageCount: 67,
          status: 'inactive',
          joinedAt: '2024-01-18T11:10:00Z',
        },
      ];
      
      setUsers(mockUsers);
      setIsLoading(false);
    };

    loadUsers();
  }, [page.id]);

  // 过滤和排序用户
  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.username.localeCompare(b.username);
        case 'lastActive':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        case 'mediaCount':
          return b.mediaCount - a.mediaCount;
        case 'messageCount':
          return b.messageCount - a.messageCount;
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, sortBy]);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  const handleBanUser = (user: PageUser) => {
    setBanningUser(user);
    setShowBanModal(true);
  };

  const confirmBanUser = async () => {
    if (!banningUser) return;

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === banningUser.id 
          ? { 
              ...user, 
              status: user.status === 'banned' ? 'active' : 'banned',
              permissions: user.status === 'banned' ? {
                canLogin: true,
                canView: true,
                canUploadMedia: true,
                canDeleteOwnMedia: true,
                canSendMessage: true,
                canDeleteOwnMessage: true,
              } : {
                canLogin: false,
                canView: false,
                canUploadMedia: false,
                canDeleteOwnMedia: false,
                canSendMessage: false,
                canDeleteOwnMessage: false,
              }
            }
          : user
      ));
      
      setShowBanModal(false);
      setBanningUser(null);
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'banned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '活跃';
      case 'inactive': return '不活跃';
      case 'banned': return '已禁用';
      default: return '未知';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours}小时前`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}天前`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">页面用户管理</h2>
              <p className="text-sm text-gray-600">{page.name} - 共 {users.length} 个用户</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">活跃用户</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">不活跃</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Ban className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">已禁用</span>
              </div>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {users.filter(u => u.status === 'banned').length}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">总媒体</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {users.reduce((sum, user) => sum + user.mediaCount, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户名或ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="active">活跃</option>
                <option value="inactive">不活跃</option>
                <option value="banned">已禁用</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="lastActive">最后活跃</option>
                <option value="name">用户名</option>
                <option value="mediaCount">媒体数量</option>
                <option value="messageCount">消息数量</option>
              </select>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">加载用户数据中...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到用户</h3>
              <p className="text-gray-600">尝试调整搜索条件或过滤器</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* 批量操作栏 */}
              {selectedUsers.size > 0 && (
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      已选择 {selectedUsers.size} 个用户
                    </span>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200">
                        批量禁用
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors duration-200">
                        批量启用
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 表头 */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">全选</span>
                </div>
              </div>

              {/* 用户列表 */}
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900">{user.username}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>ID: {user.id}</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>加入于 {new Date(user.joinedAt).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Activity className="h-4 w-4" />
                          <span>最后活跃 {formatTimeAgo(user.lastActive)}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{user.mediaCount}</div>
                        <div className="text-gray-600">媒体</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{user.messageCount}</div>
                        <div className="text-gray-600">消息</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleBanUser(user)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          user.status === 'banned'
                            ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        }`}
                        title={user.status === 'banned' ? '启用用户' : '禁用用户'}
                      >
                        {user.status === 'banned' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              显示 {filteredUsers.length} / {users.length} 个用户
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      {/* 禁用/启用确认对话框 */}
      {showBanModal && banningUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  banningUser.status === 'banned' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {banningUser.status === 'banned' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {banningUser.status === 'banned' ? '启用用户' : '禁用用户'}
                  </h3>
                  <p className="text-sm text-gray-600">此操作将立即生效</p>
                </div>
              </div>
              
              <div className={`mb-6 p-4 rounded-lg border ${
                banningUser.status === 'banned' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm ${
                  banningUser.status === 'banned' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {banningUser.status === 'banned' 
                    ? `确定要启用用户 "${banningUser.username}" 吗？启用后用户将恢复所有权限。`
                    : `确定要禁用用户 "${banningUser.username}" 吗？禁用后用户将无法访问页面。`
                  }
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  取消
                </button>
                <button
                  onClick={confirmBanUser}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    banningUser.status === 'banned'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {banningUser.status === 'banned' ? '确认启用' : '确认禁用'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageUsersModal;