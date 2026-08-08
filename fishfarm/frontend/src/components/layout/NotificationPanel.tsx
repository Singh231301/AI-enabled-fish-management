import React, { useContext, useRef, useEffect } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, Check, X, AlertTriangle, Info, 
  Droplets, Wheat, Package, Activity, Bot
} from 'lucide-react';
import { NotificationType, NotificationPriority } from '../../types/notifications.types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const context = useContext(NotificationContext);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!context || !isOpen) return null;

  const { notifications, markAsRead, markAllRead, dismissNotification } = context;
  const activeNotifications = notifications.filter(n => !n.isDismissed).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const unreadCount = activeNotifications.filter(n => !n.isRead).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'WATER_QUALITY_ALERT': return <Droplets className="text-blue-500" size={20} />;
      case 'FEEDING_REMINDER': return <Wheat className="text-amber-500" size={20} />;
      case 'LOW_STOCK': return <Package className="text-orange-500" size={20} />;
      case 'MORTALITY_ALERT': return <Activity className="text-red-500" size={20} />;
      case 'AI_ALERT': return <Bot className="text-purple-500" size={20} />;
      case 'TASK_DUE':
      case 'TASK_OVERDUE': return <Check className="text-green-500" size={20} />;
      default: return <Info className="text-sky-500" size={20} />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'LOW': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div 
      ref={panelRef}
      className="absolute top-14 right-4 sm:right-6 w-80 sm:w-96 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl overflow-hidden z-50 flex flex-col max-h-[80vh]"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllRead()}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-2 space-y-1 bg-slate-900">
        {activeNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <Bell size={48} className="mb-3 opacity-20" />
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          activeNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`p-3 rounded-lg flex items-start gap-3 group transition-colors relative ${
                notification.isRead ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-800/80 hover:bg-slate-800 border border-slate-700'
              }`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <div className="mt-1 shrink-0 bg-slate-950 p-2 rounded-lg border border-slate-800">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 pr-6 cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-slate-300' : 'text-white'}`}>
                    {notification.title}
                  </h4>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(notification.priority)}`}>
                    {notification.priority}
                  </span>
                </div>
                <p className={`text-xs ${notification.isRead ? 'text-slate-500' : 'text-slate-300'} mb-2 line-clamp-2`}>
                  {notification.message}
                </p>
                <div className="text-[10px] text-slate-500 font-medium">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); dismissNotification(notification.id); }}
                className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-all"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
