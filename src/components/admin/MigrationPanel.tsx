import React, { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { Database, Cloud, HardDrive, ArrowRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const MigrationPanel: React.FC = () => {
  const { migration, isInitialized } = useDatabase();
  const [isChecking, setIsChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [migrationError, setMigrationError] = useState<string | null>(null);

  const [supabaseConfig, setSupabaseConfig] = useState({
    url: '',
    key: ''
  });

  const handleHealthCheck = async () => {
    setIsChecking(true);
    try {
      const status = await migration.healthCheck();
      setHealthStatus(status);
    } catch (error) {
      console.error('健康检查失败:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleMigrateToSupabase = async () => {
    if (!supabaseConfig.url || !supabaseConfig.key) {
      alert('请填写Supabase配置信息');
      return;
    }

    setMigrationStatus('migrating');
    setMigrationError(null);

    try {
      await migration.switchToSupabase(supabaseConfig.url, supabaseConfig.key);
      setMigrationStatus('success');
    } catch (error) {
      setMigrationStatus('error');
      setMigrationError(error instanceof Error ? error.message : '迁移失败');
    }
  };

  const handleMigrateToLocal = async () => {
    setMigrationStatus('migrating');
    setMigrationError(null);

    try {
      await migration.switchToLocal();
      setMigrationStatus('success');
    } catch (error) {
      setMigrationStatus('error');
      setMigrationError(error instanceof Error ? error.message : '迁移失败');
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">数据库初始化中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">数据迁移管理</h2>
        <p className="text-gray-600 mt-1">管理数据库后端和数据迁移</p>
      </div>

      {/* 健康检查 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            系统健康检查
          </h3>
          <button
            onClick={handleHealthCheck}
            disabled={isChecking}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
          >
            {isChecking ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>{isChecking ? '检查中...' : '运行检查'}</span>
          </button>
        </div>

        {healthStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${
              healthStatus.database ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {healthStatus.database ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  healthStatus.database ? 'text-green-800' : 'text-red-800'
                }`}>
                  数据库
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                healthStatus.database ? 'text-green-600' : 'text-red-600'
              }`}>
                {healthStatus.database ? '连接正常' : '连接失败'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              healthStatus.storage ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {healthStatus.storage ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  healthStatus.storage ? 'text-green-800' : 'text-red-800'
                }`}>
                  存储
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                healthStatus.storage ? 'text-green-600' : 'text-red-600'
              }`}>
                {healthStatus.storage ? '连接正常' : '连接失败'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              healthStatus.auth ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {healthStatus.auth ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  healthStatus.auth ? 'text-green-800' : 'text-red-800'
                }`}>
                  认证
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                healthStatus.auth ? 'text-green-600' : 'text-red-600'
              }`}>
                {healthStatus.auth ? '服务正常' : '服务异常'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 迁移到Supabase */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Cloud className="h-5 w-5 mr-2 text-purple-600" />
          迁移到Supabase云端
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase URL
            </label>
            <input
              type="url"
              value={supabaseConfig.url}
              onChange={(e) => setSupabaseConfig(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase Anon Key
            </label>
            <input
              type="password"
              value={supabaseConfig.key}
              onChange={(e) => setSupabaseConfig(prev => ({ ...prev, key: e.target.value }))}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <HardDrive className="h-4 w-4" />
              <ArrowRight className="h-4 w-4" />
              <Cloud className="h-4 w-4" />
              <span>本地存储 → Supabase云端</span>
            </div>

            <button
              onClick={handleMigrateToSupabase}
              disabled={migrationStatus === 'migrating' || !supabaseConfig.url || !supabaseConfig.key}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors duration-200"
            >
              {migrationStatus === 'migrating' ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              <span>
                {migrationStatus === 'migrating' ? '迁移中...' : '开始迁移'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 迁移到本地 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <HardDrive className="h-5 w-5 mr-2 text-green-600" />
          迁移到本地存储
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mb-2">
              将数据从云端迁移回本地IndexedDB存储
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Cloud className="h-4 w-4" />
              <ArrowRight className="h-4 w-4" />
              <HardDrive className="h-4 w-4" />
              <span>云端存储 → 本地存储</span>
            </div>
          </div>

          <button
            onClick={handleMigrateToLocal}
            disabled={migrationStatus === 'migrating'}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
          >
            {migrationStatus === 'migrating' ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <HardDrive className="h-4 w-4" />
            )}
            <span>
              {migrationStatus === 'migrating' ? '迁移中...' : '迁移到本地'}
            </span>
          </button>
        </div>
      </div>

      {/* 迁移状态 */}
      {migrationStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border ${
          migrationStatus === 'success' ? 'bg-green-50 border-green-200' :
          migrationStatus === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            {migrationStatus === 'migrating' && <Loader className="h-5 w-5 animate-spin text-blue-600" />}
            {migrationStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {migrationStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
            
            <span className={`font-medium ${
              migrationStatus === 'success' ? 'text-green-800' :
              migrationStatus === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {migrationStatus === 'migrating' && '正在迁移数据...'}
              {migrationStatus === 'success' && '迁移完成！'}
              {migrationStatus === 'error' && '迁移失败'}
            </span>
          </div>
          
          {migrationError && (
            <p className="text-red-600 text-sm mt-2">{migrationError}</p>
          )}
          
          {migrationStatus === 'success' && (
            <p className="text-green-600 text-sm mt-2">
              数据已成功迁移，请刷新页面以使用新的后端。
            </p>
          )}
        </div>
      )}

      {/* 说明信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">迁移说明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 迁移过程会自动备份和转移所有数据</li>
          <li>• 迁移期间请勿关闭浏览器或刷新页面</li>
          <li>• 建议在迁移前进行健康检查</li>
          <li>• 迁移完成后需要刷新页面</li>
          <li>• 可以随时在不同后端之间切换</li>
        </ul>
      </div>
    </div>
  );
};

export default MigrationPanel;