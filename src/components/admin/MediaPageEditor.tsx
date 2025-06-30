import React, { useState } from 'react';
import { MediaPage } from '../../types';
import { X, Upload, Trash2, Play, Pause } from 'lucide-react';

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
    isActive: page?.isActive !== undefined ? page.isActive : true,
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

  const handleToggleStatus = () => {
    const newStatus = !formData.isActive;
    setFormData(prev => ({ ...prev, isActive: newStatus }));
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
          {/* 页面状态控制 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {formData.isActive ? (
                <Play className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <Pause className="h-5 w-5 text-orange-600 mr-2" />
              )}
              页面状态控制
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-1">
                  页面访问状态
                </h4>
                <p className="text-sm text-gray-600">
                  {formData.isActive 
                    ? '页面当前处于活跃状态，用户可以正常访问和使用所有功能'
                    : '页面当前已暂停，用户无法访问此页面'
                  }
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  formData.isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'
                    : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white'
                }`}
              >
                {formData.isActive ? (
                  <>
                    <Pause className="h-5 w-5" />
                    <span>暂停页面</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>继续页面</span>
                  </>
                )}
              </button>
            </div>

            {/* 状态说明 */}
            <div className={`mt-4 p-4 rounded-lg border ${
              formData.isActive 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-start space-x-3">
                {formData.isActive ? (
                  <Play className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <Pause className="h-5 w-5 text-orange-600 mt-0.5" />
                )}
                <div>
                  <h5 className={`font-medium ${
                    formData.isActive ? 'text-green-800' : 'text-orange-800'
                  }`}>
                    {formData.isActive ? '页面活跃状态' : '页面暂停状态'}
                  </h5>
                  <ul className={`text-sm mt-2 space-y-1 ${
                    formData.isActive ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {formData.isActive ? (
                      <>
                        <li>• 用户可以正常访问页面</li>
                        <li>• 可以上传和查看媒体内容</li>
                        <li>• 聊天功能正常工作</li>
                        <li>• 所有交互功能可用</li>
                      </>
                    ) : (
                      <>
                        <li>• 用户无法访问页面</li>
                        <li>• 显示"页面已停用"提示</li>
                        <li>• 所有功能暂时不可用</li>
                        <li>• 数据保持完整，可随时恢复</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

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
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {formData.isActive ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Play className="h-4 w-4" />
                  <span>页面将保持活跃状态</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-orange-600">
                  <Pause className="h-4 w-4" />
                  <span>页面将保持暂停状态</span>
                </div>
              )}
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
                {page ? '保存修改' : '创建页面'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaPageEditor;