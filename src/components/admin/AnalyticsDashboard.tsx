import React from 'react';
import { Admin } from '../../types';
import { BarChart3, Users, FileImage, MessageSquare, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsDashboardProps {
  admin: Admin;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ admin }) => {
  const stats = [
    {
      label: '活跃媒体页',
      value: '12',
      change: '+3',
      changeType: 'increase' as const,
      icon: FileImage,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: '总用户数',
      value: '1,234',
      change: '+156',
      changeType: 'increase' as const,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: '本月消息',
      value: '8,901',
      change: '+12%',
      changeType: 'increase' as const,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: '存储使用',
      value: '45.2 GB',
      change: '+2.1 GB',
      changeType: 'increase' as const,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const recentActivity = [
    { action: '新用户注册', page: '婚礼纪念页', time: '2分钟前' },
    { action: '媒体上传', page: '生日派对页', time: '5分钟前' },
    { action: '页面创建', page: '毕业典礼页', time: '10分钟前' },
    { action: '用户互动', page: '周年纪念页', time: '15分钟前' },
    { action: '媒体分享', page: '旅行记录页', time: '20分钟前' },
  ];

  const topPages = [
    { name: '婚礼纪念页', users: 89, messages: 234, storage: '2.1 GB' },
    { name: '生日派对页', users: 67, messages: 189, storage: '1.8 GB' },
    { name: '毕业典礼页', users: 45, messages: 156, storage: '1.2 GB' },
    { name: '周年纪念页', users: 38, messages: 98, storage: '0.9 GB' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">数据分析</h2>
        <p className="text-gray-600 mt-1">查看平台使用统计和趋势</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">本月</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            最近活动
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.page}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            热门页面
          </h3>
          <div className="space-y-4">
            {topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{page.name}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{page.users} 用户</span>
                    <span>{page.messages} 消息</span>
                    <span>{page.storage}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                      style={{ width: `${Math.min((page.users / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">使用趋势</h3>
        <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">图表数据展示区域</p>
            <p className="text-sm text-gray-400">实际应用中将显示详细的使用趋势图表</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;