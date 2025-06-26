import React, { useState } from 'react';
import { MediaPage } from '../../types';
import { X, Upload, Trash2 } from 'lucide-react';

interface MediaPageEditorProps {
  page: MediaPage | null;
  onSave: (pageData: Partial<MediaPage>) => void;
  onClose: () => void;
}

const MediaPageEditor: React.FC<MediaPageEditorProps> = ({
  page,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: page?.name || '',
    purchaserName: page?.purchaserName || '',
    purchaserEmail: page?.purchaserEmail || '',
    remainingDays: page?.remainingDays || 30,
    purchaserGender: page?.purchaserGender || 'other',
    usageScenario: page?.usageScenario || '',
    dbSizeLimit: page?.dbSizeLimit || 1024,
    usageDuration: page?.usageDuration || 30,
    productDetails: {
      name: page?.productDetails.name || '',
      link: page?.productDetails.link || '',
      description: page?.productDetails.description || '',
      images: page?.productDetails.images || []
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      productDetails: {
        ...prev.productDetails,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {page ? '编辑媒体页' : '创建新媒体页'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  媒体页名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="输入媒体页名称"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  使用场景
                </label>
                <input
                  type="text"
                  value={formData.usageScenario}
                  onChange={(e) => handleInputChange('usageScenario', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="如：婚礼纪念、生日派对等"
                />
              </div>
            </div>
          </div>

          {/* Purchaser Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">购买者信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  购买者姓名 *
                </label>
                <input
                  type="text"
                  value={formData.purchaserName}
                  onChange={(e) => handleInputChange('purchaserName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  购买者邮箱 *
                </label>
                <input
                  type="email"
                  value={formData.purchaserEmail}
                  onChange={(e) => handleInputChange('purchaserEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性别
                </label>
                <select
                  value={formData.purchaserGender}
                  onChange={(e) => handleInputChange('purchaserGender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>
          </div>

          {/* Usage Settings */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">使用设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  剩余使用天数
                </label>
                <input
                  type="number"
                  value={formData.remainingDays}
                  onChange={(e) => handleInputChange('remainingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  存储限制 (MB)
                </label>
                <input
                  type="number"
                  value={formData.dbSizeLimit}
                  onChange={(e) => handleInputChange('dbSizeLimit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  总使用期限 (天)
                </label>
                <input
                  type="number"
                  value={formData.usageDuration}
                  onChange={(e) => handleInputChange('usageDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">产品详情</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  产品名称
                </label>
                <input
                  type="text"
                  value={formData.productDetails.name}
                  onChange={(e) => handleProductDetailsChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="产品名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  产品链接
                </label>
                <input
                  type="url"
                  value={formData.productDetails.link}
                  onChange={(e) => handleProductDetailsChange('link', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  产品描述
                </label>
                <textarea
                  value={formData.productDetails.description}
                  onChange={(e) => handleProductDetailsChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="产品详细描述"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
              {page ? '保存修改' : '创建页面'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaPageEditor;