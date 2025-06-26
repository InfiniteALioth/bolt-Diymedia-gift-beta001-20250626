import React, { useState } from 'react';
import { Admin, MediaPage } from '../../types';
import { LayoutDashboard, Users, Settings, FileImage, BarChart3, LogOut, Plus } from 'lucide-react';
import MediaPagesList from './MediaPagesList';
import AdminsList from './AdminsList';
import AnalyticsDashboard from './AnalyticsDashboard';

interface AdminDashboardProps {
  admin: Admin;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'admins' | 'analytics'>('pages');

  const menuItems = [
    { id: 'pages' as const, label: '媒体页管理', icon: FileImage },
    { id: 'admins' as const, label: '管理员管理', icon: Users },
    { id: 'analytics' as const, label: '数据分析', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
              </div>
              <div className="text-sm text-gray-500">
                {admin.level === 1 ? '超级管理员' : `Level ${admin.level} 管理员`}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎，{admin.username}</span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'pages' && <MediaPagesList admin={admin} />}
            {activeTab === 'admins' && <AdminsList admin={admin} />}
            {activeTab === 'analytics' && <AnalyticsDashboard admin={admin} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;