import React, { useState, useEffect } from 'react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '24px',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(8px)'
    }}>
      <span>⚠️</span> You are currently offline
    </div>
  );
};
