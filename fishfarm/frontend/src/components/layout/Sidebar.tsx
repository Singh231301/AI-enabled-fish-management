import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Map, LogOut, Fish, Wheat, Droplets, IndianRupee, Package, ListTodo, Bot, BarChart2, Settings, X, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose, isCollapsed = false, onToggleCollapse }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Pond Profile', path: '/pond', icon: Map },
    { name: 'Tasks', path: '/tasks', icon: ListTodo },
    { name: 'Fish Stocking', path: '/fish', icon: Fish },
    { name: 'Feeding', path: '/feeding', icon: Wheat },
    { name: 'Water Quality', path: '/water', icon: Droplets },
    { name: 'Financials', path: '/financials', icon: IndianRupee },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
    { name: 'AI Assistant', path: '/ai', icon: Bot },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="bg-slate-950 border-r border-slate-800 flex flex-col h-full shrink-0 w-full">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
        <div className={`flex items-center gap-2 ${isCollapsed ? 'hidden' : 'block'}`}>
          <span className="text-xl">🐟</span>
          <span className="text-xl font-bold text-white">FishFarm</span>
        </div>
        
        {/* Desktop Collapse Toggle */}
        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse} 
            className="hidden md:flex text-slate-400 hover:text-white p-1 transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <Menu size={20} />
          </button>
        )}
        
        {/* Mobile Close Button */}
        {onClose && (
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group relative ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        {user ? (
          <div className={`flex items-center gap-3 rounded-lg bg-slate-900 border border-slate-800 transition-all ${isCollapsed ? 'justify-center p-2' : 'px-3 py-3'}`}>
            {!isCollapsed && (
              <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden flex-1">
                <span className="text-sm font-medium text-white truncate" data-testid="sidebar-user-name">
                  {user.fullName}
                </span>
                <span className="text-xs text-slate-400 truncate">{user.email}</span>
              </div>
            )}
            <button
              onClick={logout}
              data-testid="sidebar-logout"
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors shrink-0"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            data-testid="sidebar-logout"
            title={isCollapsed ? 'Logout' : undefined}
            className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        )}
      </div>
    </div>
  );
};
