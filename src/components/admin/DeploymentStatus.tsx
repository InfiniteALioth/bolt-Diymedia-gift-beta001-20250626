import React, { useState, useEffect } from 'react';
import { deploymentApi } from '../../services/api';
import { 
  RefreshCw, 
  Database, 
  Server, 
  Cloud, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Globe, 
  GitBranch, 
  Cpu, 
  HardDrive, 
  Calendar
} from 'lucide-react';

const DeploymentStatus: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);
  const [deploymentInfo, setDeploymentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDeploymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行获取状态和信息
      const [statusResult, infoResult] = await Promise.all([
        deploymentApi.getStatus(),
        deploymentApi.getInfo()
      ]);

      setDeploymentStatus(statusResult);
      setDeploymentInfo(infoResult);
    } catch (error: any) {
      console.error('Failed to fetch deployment data:', error);
      setError(error.message || '获取部署信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeploymentData();
  }, []);

  const getStatusBadge = (status: boolean | undefined) => {
    if (status === undefined) return null;
    
    return status ? (
      <span className="flex items-center text-green-600">
        <CheckCircle className="h-4 w-4 mr-1" />
        <span>正常</span>
      </span>
    ) : (
      <span className="flex items-center text-red-600">
        <XCircle className="h-4 w-4 mr-1" />
        <span>异常</span>
      </span>
    );
  };

  const getDeploymentStatusBadge = (status: string) => {
    switch (status) {
      case 'deployed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            已部署
          </span>
        );
      case 'deploying':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            部署中
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            部署失败
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            未部署
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading && !deploymentStatus) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-600">正在获取部署状态...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-red-800">获取部署状态失败</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchDeploymentData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">部署状态</h2>
          <p className="text-gray-600 mt-1">查看系统部署和健康状态</p>
        </div>
        <button
          onClick={fetchDeploymentData}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
          <span>{loading ? '刷新中...' : '刷新'}</span>
        </button>
      </div>

      {/* 部署状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              deploymentStatus?.isDeployed 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">部署状态</h3>
              <div className="mt-1">
                {deploymentStatus?.status && getDeploymentStatusBadge(deploymentStatus.status)}
              </div>
            </div>
          </div>
          
          {deploymentStatus?.deploymentUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">部署URL:</p>
              <a 
                href={deploymentStatus.deploymentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {deploymentStatus.deploymentUrl}
              </a>
            </div>
          )}
          
          {deploymentStatus?.lastDeployment && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">最后部署时间:</p>
              <p className="text-gray-900">
                {formatDate(deploymentStatus.lastDeployment.timestamp)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">健康状态</h3>
              <p className="text-sm text-gray-600">系统组件状态</p>
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 flex items-center">
                <Database className="h-4 w-4 mr-2" />
                数据库
              </span>
              {getStatusBadge(deploymentStatus?.healthCheck?.database)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 flex items-center">
                <Server className="h-4 w-4 mr-2" />
                服务器
              </span>
              {getStatusBadge(deploymentStatus?.healthCheck?.server)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 flex items-center">
                <Cloud className="h-4 w-4 mr-2" />
                Redis
              </span>
              {getStatusBadge(deploymentStatus?.healthCheck?.redis)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">版本信息</h3>
              <p className="text-sm text-gray-600">当前部署版本</p>
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">版本号</span>
              <span className="font-medium text-gray-900">
                {deploymentInfo?.build?.version || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">环境</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                deploymentInfo?.build?.environment === 'production'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {deploymentInfo?.build?.environment || 'development'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">构建时间</span>
              <span className="text-gray-900">
                {deploymentInfo?.build?.buildTime ? formatDate(deploymentInfo.build.buildTime) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 系统信息 */}
      {deploymentInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">系统信息</h3>
                <p className="text-sm text-gray-600">服务器系统状态</p>
              </div>
            </div>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">平台</p>
                  <p className="font-medium text-gray-900">{deploymentInfo.system?.platform || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">架构</p>
                  <p className="font-medium text-gray-900">{deploymentInfo.system?.arch || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">CPU核心</p>
                  <p className="font-medium text-gray-900">{deploymentInfo.system?.cpus || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">运行时间</p>
                  <p className="font-medium text-gray-900">{deploymentInfo.system?.uptime || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">内存</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: deploymentInfo.system?.memory?.total && deploymentInfo.system?.memory?.free
                            ? `${(1 - (parseInt(deploymentInfo.system.memory.free) / parseInt(deploymentInfo.system.memory.total))) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {deploymentInfo.system?.memory?.free || 'N/A'} / {deploymentInfo.system?.memory?.total || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">构建信息</h3>
                <p className="text-sm text-gray-600">应用构建详情</p>
              </div>
            </div>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Node版本</p>
                  <p className="font-medium text-gray-900">{deploymentInfo.build?.nodeVersion || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">环境</p>
                  <p className="font-medium text-gray-900">{deploymentInfo.environment?.nodeEnv || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Git提交</p>
                <p className="font-medium text-gray-900 font-mono text-sm break-all">
                  {deploymentInfo.build?.gitCommit || 'N/A'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">数据库主机</p>
                  <p className="font-medium text-gray-900">{deploymentInfo.environment?.dbHost || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Redis主机</p>
                  <p className="font-medium text-gray-900">{deploymentInfo.environment?.redisHost || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">构建时间</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {deploymentInfo.build?.buildTime ? formatDate(deploymentInfo.build.buildTime) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 如果没有数据 */}
      {!deploymentStatus && !deploymentInfo && !loading && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无部署数据</h3>
          <p className="text-gray-600 mb-4">无法获取部署状态信息</p>
          <button
            onClick={fetchDeploymentData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            重新获取
          </button>
        </div>
      )}
    </div>
  );
};

export default DeploymentStatus;