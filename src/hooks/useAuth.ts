import { useState, useCallback } from 'react';
import { User, Admin } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>('currentUser', null);
  const [admin, setAdmin] = useLocalStorage<Admin | null>('currentAdmin', null);
  const [deviceId] = useLocalStorage<string>('deviceId', generateDeviceId());

  function generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  const createUser = useCallback((username: string): User => {
    const newUser: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      username: username.trim(),
      deviceId,
      createdAt: new Date().toISOString(),
      permissions: {
        canLogin: true,
        canView: true,
        canUploadMedia: true,
        canDeleteOwnMedia: true,
        canSendMessage: true,
        canDeleteOwnMessage: true,
      },
    };
    setUser(newUser);
    return newUser;
  }, [deviceId, setUser]);

  const updateUsername = useCallback((newUsername: string) => {
    if (user) {
      const updatedUser = { ...user, username: newUsername.trim() };
      setUser(updatedUser);
    }
  }, [user, setUser]);

  const loginAdmin = useCallback((username: string, password: string): boolean => {
    // Mock admin authentication - in real app, this would be an API call
    if (username === 'superadmin' && password === 'admin123') {
      const adminUser: Admin = {
        id: 'admin_1',
        username: 'superadmin',
        level: 1,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        permissions: {
          canCreateAdmins: true,
          canManagePages: true,
          canManageUsers: true,
          canManageMedia: true,
          canViewAnalytics: true,
        },
      };
      setAdmin(adminUser);
      return true;
    }
    return false;
  }, [setAdmin]);

  const logout = useCallback(() => {
    setUser(null);
    setAdmin(null);
  }, [setUser, setAdmin]);

  return {
    user,
    admin,
    deviceId,
    createUser,
    updateUsername,
    loginAdmin,
    logout,
    isAuthenticated: !!user,
    isAdminAuthenticated: !!admin,
  };
}