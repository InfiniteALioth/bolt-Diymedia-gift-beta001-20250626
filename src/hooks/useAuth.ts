import { useState, useCallback, useEffect } from 'react';
import { User, Admin } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockData';

// 开发模式开关
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>('currentUser', null);
  const [admin, setAdmin] = useLocalStorage<Admin | null>('currentAdmin', null);
  const [deviceId] = useLocalStorage<string>('deviceId', generateDeviceId());
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastError, setLastError] = useState<string | null>(null);

  function generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // 检查后端连接状态
  const checkConnection = useCallback(async () => {
    if (USE_MOCK_API) {
      setConnectionStatus('connected');
      return true;
    }

    setConnectionStatus('checking');
    try {
      const isConnected = await apiService.checkConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      setLastError(null);
      return isConnected;
    } catch (error) {
      console.error('连接检查失败:', error);
      setConnectionStatus('disconnected');
      setLastError(error instanceof Error ? error.message : '连接检查失败');
      return false;
    }
  }, []);

  // 初始化时检查连接
  useEffect(() => {
    checkConnection();
    
    // 设置定期检查
    const interval = setInterval(() => {
      if (connectionStatus !== 'connected') {
        checkConnection();
      }
    }, 30000); // 每30秒检查一次
    
    return () => clearInterval(interval);
  }, [checkConnection, connectionStatus]);

  // 监听API服务的连接状态变化
  useEffect(() => {
    const unsubscribe = apiService.onConnectionStatusChange((status) => {
      setConnectionStatus(
        status === 'connected' ? 'connected' :
        status === 'checking' ? 'checking' : 'disconnected'
      );
    });
    
    return unsubscribe;
  }, []);

  const createUser = useCallback(async (username: string): Promise<User> => {
    setIsLoading(true);
    setLastError(null);
    
    try {
      const api = USE_MOCK_API ? mockApiService : apiService;
      const newUser = await api.registerUser(username, deviceId);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Create user failed:', error);
      
      // 提供更友好的错误信息
      const errorMessage = error instanceof Error 
        ? error.message 
        : '创建用户失败，请重试';
      
      setLastError(errorMessage);
      
      if (errorMessage.includes('无法连接到服务器')) {
        throw new Error('无法连接到服务器，请检查网络连接或联系管理员');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, setUser]);

  const updateUsername = useCallback(async (newUsername: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setLastError(null);
    
    try {
      if (USE_MOCK_API) {
        const updatedUser = { ...user, username: newUsername.trim() };
        setUser(updatedUser);
        return updatedUser;
      } else {
        const updatedUser = await apiService.updateUserProfile({ username: newUsername.trim() });
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error('Update username failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '更新用户名失败，请重试';
      
      setLastError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, setUser]);

  const loginAdmin = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setLastError(null);
    
    try {
      const api = USE_MOCK_API ? mockApiService : apiService;
      const adminUser = await api.loginAdmin(username, password);
      setAdmin(adminUser);
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '管理员登录失败，请重试';
      
      setLastError(errorMessage);
      
      // 提供更友好的错误信息
      if (errorMessage.includes('无法连接到服务器')) {
        throw new Error('无法连接到服务器，请检查网络连接');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setAdmin]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setLastError(null);
    
    try {
      if (!USE_MOCK_API) {
        await apiService.logout();
      }
      setUser(null);
      setAdmin(null);
    } catch (error) {
      console.error('Logout failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '登出失败，请重试';
      
      setLastError(errorMessage);
      
      // 即使登出失败也要清除本地状态
      setUser(null);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAdmin]);

  return {
    user,
    admin,
    deviceId,
    isLoading,
    connectionStatus,
    lastError,
    createUser,
    updateUsername,
    loginAdmin,
    logout,
    checkConnection,
    isAuthenticated: !!user,
    isAdminAuthenticated: !!admin,
  };
}