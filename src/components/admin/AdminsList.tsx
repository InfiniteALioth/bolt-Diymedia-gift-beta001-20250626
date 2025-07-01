import React, { useState } from 'react';
import { Admin } from '../../types';
import { Shield, Plus, Settings, Trash2, Edit, AlertCircle, Check, X } from 'lucide-react';
import AdminEditor from './AdminEditor';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface AdminsListProps {
  admin: Admin;
}

const AdminsList: React.FC<AdminsListProps> = ({ admin }) => {
  // 使用 localStorage 持久化存储管理员数据
  const [admins, setAdmins] = useLocalStorage<Admin[]>('systemAdmins', [
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
  ]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
  const [processingAdmins, setProcessingAdmins] = useState<Set<string>>(new Set());

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
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canManageAdmin = (targetAdmin: Admin) => {
    // 不能管理自己
    if (targetAdmin.id === admin.id) return false;
    
    // 超级管理员可以管理所有人
    if (admin.level === 1) return true;
    
    // 其他级别只能管理更低级别的管理员
    return targetAdmin.level > admin.level;
  };

  const handleCreateAdmin = () => {
    if (!admin.permissions.canCreateAdmins) {
      alert('您没有创建管理员的权限');
      return;
    }
    setEditingAdmin(null);
    setShowEditor(true);
  };

  const handleEditAdmin = (targetAdmin: Admin) => {
    if (!canManageAdmin(targetAdmin)) {
      alert('您没有权限编辑此管理员');
      return;
    }
    setEditingAdmin(targetAdmin);
    setShowEditor(true);
  };

  const handleSaveAdmin = async (adminData: Partial<Admin>, password?: string) => {
    setProcessingAdmins(prev => new Set([...prev, editingAdmin?.id || 'new']));
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingAdmin) {
        // 更新现有管理员
        setAdmins(prev => prev.map(a => 
          a.id === editingAdmin.id ? { ...a, ...adminData } : a
        ));
        
        // 显示成功提示
        showSuccessMessage(`管理员 "${editingAdmin.username}" 信息已更新`);
      } else {
        // 创建新管理员
        const newAdmin: Admin = {
          id: 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          username: adminData.username!,
          level: adminData.level!,
          createdBy: admin.id,
          createdAt: new Date().toISOString(),
          permissions: adminData.permissions!,
        };
        
        setAdmins(prev => [newAdmin, ...prev]);
        
        // 显示成功提示
        showSuccessMessage(`管理员 "${newAdmin.username}" 创建成功`);
      }
      
      setShowEditor(false);
    } catch (error) {
      console.error('保存管理员失败:', error);
      alert('保存失败，请重试');
    } finally {
      setProcessingAdmins(prev => {
        const newSet = new Set(prev);
        newSet.delete(editingAdmin?.id || 'new');
        return newSet;
      });
    }
  };

  const handleDeleteAdmin = (targetAdmin: Admin) => {
    if (!canManageAdmin(targetAdmin)) {
      alert('您没有权限删除此管理员');
      return;
    }
    setDeletingAdmin(targetAdmin);
  };

  const confirmDeleteAdmin = async () => {
    if (!deletingAdmin) return;

    setProcessingAdmins(prev => new Set([...prev, deletingAdmin.id]));
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAdmins(prev => prev.filter(a => a.id !== deletingAdmin.id));
      
      // 显示成功提示
      showSuccessMessage(`管理员 "${deletingAdmin.username}" 已删除`);
      
      setDeletingAdmin(null);
    } catch (error) {
      console.error('删除管理员失败:', error);
      alert('删除失败，请重试');
    } finally {
      setProcessingAdmins(prev => {
        const newSet = new Set(prev);
        newSet.delete(deletingAdmin.id);
        return newSet;
      });
    }
  };

  const showSuccessMessage = (message: string) => {
    // 创建临时提示元素
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg font-medium transition-all duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 3秒后移除提示
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">管理员管理</h2>
          <p className="text-gray-600 mt-1">管理系统管理员账户和权限 (共 {admins.length} 个管理员)</p>
        </div>
        {admin.permissions.canCreateAdmins && (
          <button 
            onClick={handleCreateAdmin}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>创建管理员</span>
          </button>
        )}
      </div>

      {/* 权限提示 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">权限说明</h4>
            <p className="text-sm text-blue-700 mt-1">
              您当前是 <strong>{getLevelText(admin.level)}</strong>，
              {admin.level === 1 
                ? '可以管理所有管理员账户' 
                : `只能管理级别低于 Level ${admin.level} 的管理员`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">管理员列表</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {admins.map((adminItem) => {
            const canManage = canManageAdmin(adminItem);
            const isProcessing = processingAdmins.has(adminItem.id);
            
            return (
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
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900">{adminItem.username}</h4>
                        {adminItem.id === admin.id && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            当前用户
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor(adminItem.level)}`}>
                          {getLevelText(adminItem.level)}
                        </span>
                        <span className="text-sm text-gray-500">
                          创建于 {new Date(adminItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isProcessing ? (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <span className="text-sm">处理中...</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditAdmin(adminItem)}
                          disabled={!canManage}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            canManage
                              ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={canManage ? "编辑管理员" : "权限不足"}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(adminItem)}
                          disabled={!canManage}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            canManage
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={canManage ? "删除管理员" : "权限不足"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* 权限显示 */}
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
            );
          })}
        </div>
      </div>

      {/* 管理员编辑器 */}
      {showEditor && (
        <AdminEditor
          admin={editingAdmin}
          currentAdmin={admin}
          onSave={handleSaveAdmin}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* 删除确认对话框 */}
      {deletingAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
                  <p className="text-sm text-gray-600">此操作不可恢复</p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  您确定要删除管理员 <strong>"{deletingAdmin.username}"</strong> 吗？
                </p>
                <p className="text-xs text-red-600 mt-2">
                  删除后该管理员将无法登录系统，所有相关数据将被保留。
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingAdmin(null)}
                  disabled={processingAdmins.has(deletingAdmin.id)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  取消
                </button>
                <button
                  onClick={confirmDeleteAdmin}
                  disabled={processingAdmins.has(deletingAdmin.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    processingAdmins.has(deletingAdmin.id)
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {processingAdmins.has(deletingAdmin.id) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>删除中...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>确认删除</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsList;