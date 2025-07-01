import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import MediaPage from './components/MediaPage';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  const { admin, loginAdmin, logout } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Media Page Routes */}
        <Route path="/" element={<MediaPage />} />
        <Route path="/page/:pageId" element={<MediaPage />} />
        
        {/* Admin Routes - 修复路由访问问题 */}
        <Route 
          path="/admin" 
          element={
            admin ? (
              <AdminDashboard admin={admin} onLogout={logout} />
            ) : (
              <AdminLogin onLogin={loginAdmin} />
            )
          } 
        />
        
        {/* 添加管理员登录页面的直接路由 */}
        <Route 
          path="/admin/login" 
          element={
            admin ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin onLogin={loginAdmin} />
            )
          } 
        />
        
        {/* 添加管理员仪表板的直接路由 */}
        <Route 
          path="/admin/dashboard" 
          element={
            admin ? (
              <AdminDashboard admin={admin} onLogout={logout} />
            ) : (
              <Navigate to="/admin" replace />
            )
          } 
        />
        
        {/* Fallback - 确保未匹配的路由重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;