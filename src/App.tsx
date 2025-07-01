import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import MediaPage from './components/MediaPage';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import { ConnectionStatus, ErrorBoundary } from './components/common';

function App() {
  const { admin, loginAdmin, logout } = useAuth();

  return (
    <ErrorBoundary>
      <Router>
        {/* 连接状态指示器 */}
        <ConnectionStatus 
          showDetails={process.env.NODE_ENV === 'development'}
          position="top-right"
        />
        
        <Routes>
          {/* Public Media Page Routes */}
          <Route path="/" element={<MediaPage />} />
          <Route path="/page/:pageId" element={<MediaPage />} />
          
          {/* Admin Routes */}
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
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;