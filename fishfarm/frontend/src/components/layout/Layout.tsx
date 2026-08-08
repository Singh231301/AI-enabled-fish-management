import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { Sidebar } from './Sidebar';
import { NotificationPanel } from './NotificationPanel';
import { Menu, Bell } from 'lucide-react';

export const Layout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const notificationContext = React.useContext(NotificationContext);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const unreadCount = notificationContext?.unreadCount || 0;

  const toggleCollapse = () => {
    const newVal = !isSidebarCollapsed;
    setIsSidebarCollapsed(newVal);
    localStorage.setItem('sidebarCollapsed', String(newVal));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed on mobile (drawer), static on desktop */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-all duration-300 ease-in-out z-50 md:z-0 md:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        <Sidebar 
          onClose={() => setIsSidebarOpen(false)} 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={toggleCollapse} 
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Global Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors md:hidden"
            >
              <Menu size={24} />
            </button>
            <span className="text-xl font-bold text-white flex items-center gap-2 md:hidden">
              🐟 FishFarm
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 ml-auto">
            <div className="text-sm font-medium text-slate-400 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="text-sm font-medium text-slate-400 sm:hidden">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative p-2 rounded-full transition-colors ${isNotificationOpen ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Bell size={20} />
              {/* Notification indicator dot */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-slate-900"></span>
              )}
            </button>
            
            <NotificationPanel 
              isOpen={isNotificationOpen} 
              onClose={() => setIsNotificationOpen(false)} 
            />
          </div>
        </header>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
