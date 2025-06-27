import React, { useState } from 'react';
import { MediaPage, Admin } from '../../types';
import { Plus, ExternalLink, QrCode, Settings, Trash2, Calendar, Database, Users, Copy, Check } from 'lucide-react';
import MediaPageEditor from './MediaPageEditor';

interface MediaPagesListProps {
  admin: Admin;
}

const MediaPagesList: React.FC<MediaPagesListProps> = ({ admin }) => {
  const [pages, setPages] = useState<MediaPage[]>([
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
      uniqueLink: 'https://media.example.com/page/demo',
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
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());

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
      // Update existing page
      setPages(prev => prev.map(p => 
        p.id === editingPage.id ? { ...p, ...pageData } : p
      ));
    } else {
      // Create new page
      const newPage: MediaPage = {
        id: 'page_' + Math.random().toString(36).substr(2, 9),
        name: pageData.name || '',
        purchaserName: pageData.purchaserName || '',
        purchaserEmail: pageData.purchaserEmail || '',
        remainingDays: pageData.remainingDays || 0,
        purchaseHistory: [],
        discountRecords: [],
        purchaserGender: pageData.purchaserGender || 'other',
        usageScenario: pageData.usageScenario || '',
        uniqueLink: `https://media.example.com/page/${pageData.name?.toLowerCase().replace(/\s+/g, '-')}`,
        qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
        internalCode: 'PAGE' + Math.random().toString(36).substr(2, 6).toUpperCase(),
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
      setPages(prev => [...prev, newPage]);
    }
    setShowEditor(false);
  };

  const handleDeletePage = (pageId: string) => {
    if (confirm('确定要删除这个媒体页吗？此操作不可恢复。')) {
      setPages(prev => prev.filter(p => p.id !== pageId));
    }
  };

  const handleOpenLink = (url: string) => {
    // 尝试多种方式打开链接，提高移动端兼容性
    try {
      // 方法1: 直接赋值给 window.location（在同一标签页打开）
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
    } catch (error) {
      console.error('打开链接失败:', error);
      // 最后的回退方案
      window.location.href = url;
    }
  };

  const handleCopyLink = async (url: string, pageId: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // 回退方案：创建临时文本区域
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopiedLinks(prev => new Set([...prev, pageId]));
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(pageId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('复制链接失败:', error);
      alert('复制失败，请手动复制链接');
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">媒体页管理</h2>
          <p className="text-gray-600 mt-1">管理所有媒体展示页面</p>
        </div>
        <button
          onClick={handleCreatePage}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>创建新页面</span>
        </button>
      </div>

      <div className="grid gap-6">
        {pages.map((page) => (
          <div key={page.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{page.name}</h3>
                <p className="text-sm text-gray-500">内部编码: {page.internalCode}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  page.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {page.isActive ? '活跃' : '已停用'}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditPage(page)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="编辑"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenLink(page.uniqueLink)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="访问页面"
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
                
                {/* 链接显示和操作区域 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyLink(page.uniqueLink, page.id)}
                    className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                      copiedLinks.has(page.id)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    title="复制链接"
                  >
                    {copiedLinks.has(page.id) ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>已复制</span>
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
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded transition-all duration-200"
                    title="点击访问页面"
                  >
                    访问页面
                  </button>
                </div>
              </div>
            </div>

            {/* Usage Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>存储使用率</span>
                <span>{((page.dbUsage / page.dbSizeLimit) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((page.dbUsage / page.dbSizeLimit) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* 移动端友好提示 */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg md:hidden">
              <p className="text-xs text-blue-800">
                <strong>移动端提示：</strong>点击"访问页面"将在当前标签页打开链接。您也可以使用"复制链接"功能将链接分享给他人。
              </p>
            </div>
          </div>
        ))}
      </div>

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