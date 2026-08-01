import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Ponds & Fish', path: '/dashboard/ponds' },
    { label: 'Water Quality', path: '/dashboard/water' },
    { label: 'Feeding Management', path: '/dashboard/feeding' },
    { label: 'Financials', path: '/dashboard/financials' },
    { label: 'Inventory', path: '/dashboard/inventory' },
    { label: 'Tasks', path: '/dashboard/tasks' },
    { label: 'AI Assistant', path: '/dashboard/ai' },
    { label: 'Reports', path: '/dashboard/reports' },
    { label: 'Settings', path: '/dashboard/settings' },
  ];

  const filteredItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '10vh'
    }} onClick={() => setIsOpen(false)}>
      <div 
        style={{
          width: '100%', maxWidth: '600px',
          background: '#0f172a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', marginRight: '12px', color: '#94a3b8' }}>🔍</span>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search modules... (ESC to close)" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '1.2rem'
            }}
          />
        </div>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filteredItems.map(item => (
            <div 
              key={item.path}
              onClick={() => handleSelect(item.path)}
              style={{
                padding: '16px 24px',
                cursor: 'pointer',
                color: '#cbd5e1',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {item.label}
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              No modules found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
