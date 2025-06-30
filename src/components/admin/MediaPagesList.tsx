import React, { useState, useEffect } from 'react';
import { MediaPage, Admin } from '../../types';
import { Plus, ExternalLink, QrCode, Settings, Trash2, Calendar, Database, Users, Copy, Check, Search, Filter, Pause, Play } from 'lucide-react';
import MediaPageEditor from './MediaPageEditor';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface MediaPagesListProps {
  admin: Admin;
}

const MediaPagesList: React.FC<MediaPagesListProps> = ({ admin }) => {
  // 使用 localStorage 持久化存储媒体页数据
  const [pages, setPages] = useLocalStorage<MediaPage[]>('adminMediaPages', [
    {
      id: 'page_demo',
      name: '演示媒体页',
      purchaserName: '张三',
      purchaserEmail: 'zhangsan@example.com',
      remainingDays: 30,
      purchaseHistory: [
        {
          id: 'purchase_1',
          date: '2024-01-15',
          amount: 299,
          duration: 30,
          description: '基础套餐 - 30天'
        }
      ],
      discountRecords: [],
      purchaserGender: 'male',
      usageScenario: '婚礼纪念',
      uniqueLink: `${window.location.origin}/page/page_demo`,
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
      internalCode: 'DEMO001',
      productDetails: {
        name: '基础媒体分享套餐',
        link: 'https://example.com/product/basic',
        images: ['https://example.com/product1.jpg'],
        description: '支持图片、视频、音频分享的基础套餐'
      },
      dbSizeLimit: 1024, // 1GB
      dbUsage: 256, // 256MB
      usageDuration: 30,
      createdAt: '2024-01-15',
      isActive: true
    }
  ]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<MediaPage | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set()); // 改为通用的复制状态
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [processingPages, setProcessingPages] = useState<Set<string>>(new Set());

  // 生成唯一的内部编码
  const generateInternalCode = () => {
    const prefix = 'PAGE';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  // 生成唯一链接 - 修复为正确的路由格式
  const generateUniqueLink = (pageId: string) => {
    return `${window.location.origin}/page/${pageId}`;
  };

  const handleCreatePage = () => {
    setEditingPage(null);
    setShowEditor(true);
  };

  const handleEditPage = (page: MediaPage) => {
    setEditingPage(page);
    setShowEditor(true);
  };

  const handleSavePage = (pageData: Partial<MediaPage>) => {
    if (editingPage) {
      // 更新现有页面
      setPages(prev => prev.map(p => 
        p.id === editingPage.id ? { 
          ...p, 
          ...pageData,
          uniqueLink: generateUniqueLink(p.id) // 确保链接格式正确
        } : p
      ));
      console.log('页面更新成功:', pageData.name);
    } else {
      // 创建新页面
      const pageId = 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const newPage: MediaPage = {
        id: pageId,
        name: pageData.name || '',
        purchaserName: pageData.purchaserName || '',
        purchaserEmail: pageData.purchaserEmail || '',
        remainingDays: pageData.remainingDays || 30,
        purchaseHistory: [],
        discountRecords: [],
        purchaserGender: pageData.purchaserGender || 'other',
        usageScenario: pageData.usageScenario || '',
        uniqueLink: generateUniqueLink(pageId), // 使用正确的路由格式
        qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
        internalCode: generateInternalCode(),
        productDetails: pageData.productDetails || {
          name: '',
          link: '',
          images: [],
          description: ''
        },
        dbSizeLimit: pageData.dbSizeLimit || 1024,
        dbUsage: 0,
        usageDuration: pageData.usageDuration || 30,
        createdAt: new Date().toISOString(),
        isActive: true,
        ...pageData
      };
      
      setPages(prev => [newPage, ...prev]); // 新页面添加到顶部
      console.log('新页面创建成功:', newPage.name, '页面ID:', newPage.id, '链接:', newPage.uniqueLink);
    }
    setShowEditor(false);
  };

  const handleDeletePage = (pageId: string) => {
    const pageToDelete = pages.find(p => p.id === pageId);
    if (confirm(`确定要删除媒体页 "${pageToDelete?.name}" 吗？此操作不可恢复。`)) {
      setPages(prev => prev.filter(p => p.id !== pageId));
      console.log('页面删除成功，剩余页面数:', pages.length - 1);
    }
  };

  // 暂停/继续页面功能
  const handleTogglePageStatus = async (pageId: string, currentStatus: boolean) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    const action = currentStatus ? '暂停' : '继续';
    const confirmMessage = currentStatus 
      ? `确定要暂停媒体页 "${page.name}" 吗？暂停后用户将无法访问该页面。`
      : `确定要继续媒体页 "${page.name}" 吗？继续后用户将可以正常访问该页面。`;

    if (!confirm(confirmMessage)) return;

    // 添加处理状态
    setProcessingPages(prev => new Set([...prev, pageId]));

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 更新页面状态
      setPages(prev => prev.map(p => 
        p.id === pageId ? { ...p, isActive: !currentStatus } : p
      ));

      console.log(`页面 ${page.name} 已${action}成功`);
      
      // 显示成功提示
      const successMessage = currentStatus 
        ? `媒体页 "${page.name}" 已暂停，用户将无法访问`
        : `媒体页 "${page.name}" 已继续，用户可以正常访问`;
      
      // 创建临时提示元素
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
        currentStatus ? 'bg-orange-500' : 'bg-green-500'
      }`;
      toast.textContent = successMessage;
      document.body.appendChild(toast);
      
      // 3秒后移除提示
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);

    } catch (error) {
      console.error(`${action}页面失败:`, error);
      alert(`${action}页面失败，请重试`);
    } finally {
      // 移除处理状态
      setProcessingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pageId);
        return newSet;
      });
    }
  };

  const handleOpenLink = (url: string) => {
    console.log('尝试打开链接:', url);
    try {
      // 检查是否是内部链接
      if (url.includes(window.location.origin)) {
        // 内部链接，使用路由导航
        const path = url.replace(window.location.origin, '');
        window.location.href = path;
      } else {
        // 外部链接，在新标签页打开
        if (window.innerWidth <= 768) { // 移动端设备
          window.location.href = url;
        } else {
          // 桌面端尝试新标签页
          const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
          if (!newWindow) {
            // 如果弹窗被阻止，回退到同一标签页
            window.location.href = url;
          }
        }
      }
    } catch (error) {
      console.error('打开链接失败:', error);
      // 最后的回退方案
      window.location.href = url;
    }
  };

  // 通用复制功能
  const handleCopyText = async (text: string, itemId: string, itemType: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 回退方案：创建临时文本区域
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      const copyKey = `${itemId}_${itemType}`;
      setCopiedItems(prev => new Set([...prev, copyKey]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(copyKey);
          return newSet;
        });
      }, 2000);
      console.log(`${itemType}复制成功:`, text);
    } catch (error) {
      console.error(`复制${itemType}失败:`, error);
      alert(`复制失败，请手动复制${itemType}`);
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  // 过滤和搜索逻辑
  const filteredPages = pages.filter(page => {
    const matchesSearch = searchTerm === '' || 
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.purchaserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.internalCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && page.isActive) ||
      (filterStatus === 'inactive' && !page.isActive);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col">
      {/* 固定头部 */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">媒体页管理</h2>
            <p className="text-gray-600 mt-1">管理所有媒体展示页面 (共 {pages.length} 个页面)</p>
          </div>
          <button
            onClick={handleCreatePage}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>创建新页面</span>
          </button>
        </div>

        {/* 搜索和过滤栏 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索页面名称、购买者或内部编码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">全部状态</option>
                <option value="active">活跃</option>
                <option value="inactive">已停用</option>
              </select>
            </div>
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                清除
              </button>
            )}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">总页面数</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{pages.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">活跃页面</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{pages.filter(p => p.isActive).length}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Pause className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">已暂停</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">{pages.filter(p => !p.isActive).length}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">今日创建</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {pages.filter(p => {
                const today = new Date().toDateString();
                const pageDate = new Date(p.createdAt).toDateString();
                return today === pageDate;
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* 可滚动的页面列表容器 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          <div className="space-y-6 pb-6">
            {filteredPages.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? '没有找到匹配的页面' : '暂无媒体页面'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? '尝试调整搜索条件或过滤器' 
                    : '点击上方按钮创建第一个媒体页面'
                  }
                </p>
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    清除筛选
                  </button>
                )}
              </div>
            ) : (
              filteredPages.map((page, index) => (
                <div key={page.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{page.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      
                      {/* 内部编码显示和复制 */}
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-gray-500">内部编码:</span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                          {page.internalCode}
                        </code>
                        <button
                          onClick={() => handleCopyText(page.internalCode, page.id, 'internalCode')}
                          className={`p-1 rounded transition-all duration-200 ${
                            copiedItems.has(`${page.id}_internalCode`)
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                          }`}
                          title="复制内部编码"
                        >
                          {copiedItems.has(`${page.id}_internalCode`) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      
                      {/* 页面ID显示和复制 */}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">页面ID:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                          {page.id}
                        </code>
                        <button
                          onClick={() => handleCopyText(page.id, page.id, 'pageId')}
                          className={`p-1 rounded transition-all duration-200 ${
                            copiedItems.has(`${page.id}_pageId`)
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                          }`}
                          title="复制页面ID"
                        >
                          {copiedItems.has(`${page.id}_pageId`) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        page.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {page.isActive ? '活跃' : '已暂停'}
                      </span>
                      <div className="flex space-x-1">
                        {/* 暂停/继续按钮 */}
                        <button
                          onClick={() => handleTogglePageStatus(page.id, page.isActive)}
                          disabled={processingPages.has(page.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            processingPages.has(page.id)
                              ? 'text-gray-400 cursor-not-allowed'
                              : page.isActive
                                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title={processingPages.has(page.id) ? '处理中...' : page.isActive ? '暂停页面' : '继续页面'}
                        >
                          {processingPages.has(page.id) ? (
                            <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                          ) : page.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleEditPage(page)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="编辑"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenLink(page.uniqueLink)}
                          disabled={!page.isActive}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            page.isActive
                              ? 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={page.isActive ? "访问页面" : "页面已暂停，无法访问"}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{page.purchaserName}</p>
                        <p className="text-xs text-gray-500">{page.purchaserEmail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{page.remainingDays} 天</p>
                        <p className="text-xs text-gray-500">剩余使用时长</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatFileSize(page.dbUsage)} / {formatFileSize(page.dbSizeLimit)}
                        </p>
                        <p className="text-xs text-gray-500">存储使用量</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{page.usageScenario}</span>
                      <span>•</span>
                      <span>创建于 {new Date(page.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200">
                        <QrCode className="h-3 w-3" />
                        <span>二维码</span>
                      </button>
                      
                      {/* 链接复制按钮 */}
                      <button
                        onClick={() => handleCopyText(page.uniqueLink, page.id, 'link')}
                        className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                          copiedItems.has(`${page.id}_link`)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                        title="复制访问链接"
                      >
                        {copiedItems.has(`${page.id}_link`) ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>已复制链接</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>复制链接</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleOpenLink(page.uniqueLink)}
                        disabled={!page.isActive}
                        className={`text-xs font-medium px-2 py-1 rounded transition-all duration-200 ${
                          page.isActive
                            ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={page.isActive ? "点击访问页面" : "页面已暂停，无法访问"}
                      >
                        {page.isActive ? '访问页面' : '已暂停'}
                      </button>
                    </div>
                  </div>

                  {/* 显示完整链接和复制功能 */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 mb-1">
                          <strong>访问链接:</strong>
                        </p>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs text-gray-800 bg-white px-2 py-1 rounded border break-all flex-1">
                            {page.uniqueLink}
                          </code>
                          <button
                            onClick={() => handleCopyText(page.uniqueLink, page.id, 'fullLink')}
                            className={`flex-shrink-0 p-1.5 rounded transition-all duration-200 ${
                              copiedItems.has(`${page.id}_fullLink`)
                                ? 'bg-green-100 text-green-600'
                                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 border'
                            }`}
                            title="复制完整链接"
                          >
                            {copiedItems.has(`${page.id}_fullLink`) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 页面状态提示 */}
                  {!page.isActive && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Pause className="h-4 w-4 text-orange-600" />
                        <p className="text-sm text-orange-800">
                          <strong>页面已暂停：</strong>用户无法访问此页面，所有功能已停用
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Usage Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>存储使用率</span>
                      <span>{((page.dbUsage / page.dbSizeLimit) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          page.isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{
                          width: `${Math.min((page.dbUsage / page.dbSizeLimit) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* 移动端友好提示 */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg md:hidden">
                    <p className="text-xs text-blue-800">
                      <strong>移动端提示：</strong>
                      {page.isActive 
                        ? '点击"访问页面"将在当前标签页打开链接。您也可以使用复制按钮将页面ID、内部编码或链接分享给他人。'
                        : '页面已暂停，用户无法访问。点击播放按钮可以继续页面。'
                      }
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 滚动提示 */}
      {filteredPages.length > 3 && (
        <div className="flex-shrink-0 mt-4 text-center">
          <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg inline-block">
            📜 共 {filteredPages.length} 个页面，可上下滚动查看更多
          </p>
        </div>
      )}

      {showEditor && (
        <MediaPageEditor
          page={editingPage}
          onSave={handleSavePage}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default MediaPagesList;