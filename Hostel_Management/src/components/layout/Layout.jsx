import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Menu, X, LogOut, User, Settings } from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              
              <div className="flex items-center ml-4 lg:ml-0">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  HostelManager
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    user?.role === 'admin' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    user?.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="pt-16">
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;