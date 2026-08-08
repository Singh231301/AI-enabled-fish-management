import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types/notifications.types';
import { useAuth } from '../hooks/useAuth';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    // Mock data for frontend preview
    if (notifications.length === 0) {
      setNotifications([
        {
          id: '1',
          userId: 'user1',
          title: 'Water Quality Alert',
          message: 'pH level in Pond 1 has dropped to 6.2 (Action Required)',
          type: 'WATER_QUALITY_ALERT',
          priority: 'HIGH',
          isRead: false,
          isDismissed: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: 'user1',
          title: 'Feeding Reminder',
          message: 'Time for evening feed in Pond 2 (Growth phase)',
          type: 'FEEDING_REMINDER',
          priority: 'MEDIUM',
          isRead: false,
          isDismissed: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          userId: 'user1',
          title: 'Low Stock Warning',
          message: 'Starter Feed inventory is below 50kg.',
          type: 'LOW_STOCK',
          priority: 'LOW',
          isRead: true,
          isDismissed: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const dismissNotification = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isDismissed: true } : n));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.isRead && !n.isDismissed).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllRead,
      dismissNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
