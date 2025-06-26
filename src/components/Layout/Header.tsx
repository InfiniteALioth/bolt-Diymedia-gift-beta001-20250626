import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Settings, Home } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MediaVault
            </span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                !isAdminPath
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Gallery</span>
            </Link>
            <Link
              to="/admin"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                isAdminPath
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;