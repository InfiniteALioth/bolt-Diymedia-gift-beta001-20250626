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
        {/* Public Media Page Route */}
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
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;