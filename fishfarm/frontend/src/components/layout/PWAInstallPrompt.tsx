import React, { useState, useEffect } from 'react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed
      if (localStorage.getItem('pwaPromptDismissed') !== 'true') {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwaPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px', // Above mobile nav
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '400px',
      background: 'rgba(30, 41, 59, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(96, 165, 250, 0.3)',
      borderRadius: '16px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      zIndex: 99
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ 
          width: '48px', height: '48px', 
          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0
        }}>
          🐟
        </div>
        <div>
          <h4 style={{ margin: 0, color: 'white', fontWeight: 600 }}>Install FishFarm Manager</h4>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Add to your home screen for quick offline access.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button 
          onClick={handleDismiss}
          style={{
            flex: 1, padding: '8px', background: 'transparent', 
            border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', 
            borderRadius: '8px'
          }}
        >
          Not Now
        </button>
        <button 
          onClick={handleInstall}
          style={{
            flex: 2, padding: '8px', background: '#3b82f6', 
            border: 'none', color: 'white', fontWeight: 600,
            borderRadius: '8px'
          }}
        >
          Install App
        </button>
      </div>
    </div>
  );
};
