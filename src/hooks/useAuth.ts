import { useState, useCallback } from 'react';
import { User, Admin } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockData';

// 开发模式开关
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_API_URL;

export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>('currentUser', null);
  const [admin, setAdmin] = useLocalStorage<Admin | null>('currentAdmin', null);
  const [deviceId] = useLocalStorage<string>('deviceId', generateDeviceId());
  const [isLoading, setIsLoading] = useState(false);

  function generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  const createUser = useCallback(async (username: string): Promise<User> => {
    setIsLoading(true);
    try {
      const api = USE_MOCK_API ? mockApiService : apiService;
      const newUser = await api.registerUser(username, deviceId);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Create user failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, setUser]);

  const updateUsername = useCallback(async (newUsername: string) => {
    if (user) {
      setIsLoading(true);
      try {
        const updatedUser = { ...user, username: newUsername.trim() };
        setUser(updatedUser);
      } catch (error) {
        console.error('Update username failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, setUser]);

  const loginAdmin = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const api = USE_MOCK_API ? mockApiService : apiService;
      const adminUser = await api.loginAdmin(username, password);
      setAdmin(adminUser);
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setAdmin]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!USE_MOCK_API) {
        await apiService.logout();
      }
      setUser(null);
      setAdmin(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setAdmin]);

  return {
    user,
    admin,
    deviceId,
    isLoading,
    createUser,
    updateUsername,
    loginAdmin,
    logout,
    isAuthenticated: !!user,
    isAdminAuthenticated: !!admin,
  };
}