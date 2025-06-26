import React from 'react';
import { Admin } from '../../types';
import { Shield, Plus, Settings, Trash2 } from 'lucide-react';

interface AdminsListProps {
  admin: Admin;
}

const AdminsList: React.FC<AdminsListProps> = ({ admin }) => {
  const mockAdmins: Admin[] = [
    {
      id: 'admin_1',
      username: 'superadmin',
      level: 1,
      createdBy: 'system',
      createdAt: '2024-01-01T00:00:00Z',
      permissions: {
        canCreateAdmins: true,
        canManagePages: true,
        canManageUsers: true,
        canManageMedia: true,
        canViewAnalytics: true,
      }
    },
    {
      id: 'admin_2',
      username: 'level2admin',
      level: 2,
      createdBy: 'admin_1',
      createdAt: '2024-01-15T00:00:00Z',
      permissions: {
        canCreateAdmins: true,
        canManagePages: true,
        canManageUsers: true,
        canManageMedia: false,
        canViewAnalytics: true,
      }
    },
  ];

  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return '超级管理员';
      case 2: return '二级管理员';
      case 3: return '三级管理员';
      default: return `Level ${level}`;
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">管理员管理</h2>
          <p className="text-gray-600 mt-1">管理系统管理员账户和权限</p>
        </div>
        {admin.permissions.canCreateAdmins && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <Plus className="h-5 w-5" />
            <span>创建管理员</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">管理员列表</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {mockAdmins.map((adminItem) => (
            <div key={adminItem.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    adminItem.level === 1 ? 'bg-red-100' : 
                    adminItem.level === 2 ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <Shield className={`h-6 w-6 ${
                      adminItem.level === 1 ? 'text-red-600' : 
                      adminItem.level === 2 ? 'text-blue-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{adminItem.username}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(adminItem.level)}`}>
                        {getLevelText(adminItem.level)}
                      </span>
                      <span className="text-sm text-gray-500">
                        创建于 {new Date(adminItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                    <Settings className="h-4 w-4" />
                  </button>
                  {admin.level <= adminItem.level && adminItem.id !== admin.id && (
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className={`flex items-center space-x-2 ${adminItem.permissions.canCreateAdmins ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${adminItem.permissions.canCreateAdmins ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>创建管理员</span>
                </div>
                <div className={`flex items-center space-x-2 ${adminItem.permissions.canManagePages ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${adminItem.permissions.canManagePages ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>管理页面</span>
                </div>
                <div className={`flex items-center space-x-2 ${adminItem.permissions.canManageUsers ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${adminItem.permissions.canManageUsers ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>管理用户</span>
                </div>
                <div className={`flex items-center space-x-2 ${adminItem.permissions.canManageMedia ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${adminItem.permissions.canManageMedia ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>管理媒体</span>
                </div>
                <div className={`flex items-center space-x-2 ${adminItem.permissions.canViewAnalytics ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${adminItem.permissions.canViewAnalytics ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>查看分析</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminsList;