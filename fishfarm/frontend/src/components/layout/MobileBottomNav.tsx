import React from 'react';
import { NavLink } from 'react-router-dom';

export const MobileBottomNav: React.FC = () => {
  return (
    <div className="md:hidden" style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 8px 24px 8px', // Extra bottom padding for iOS home indicator
      zIndex: 50
    }}>
      <NavItem to="/dashboard" icon="🏠" label="Home" />
      <NavItem to="/dashboard/ponds" icon="🌊" label="Ponds" />
      <NavItem to="/dashboard/ai" icon="✨" label="AI" />
      <NavItem to="/dashboard/reports" icon="📊" label="Reports" />
      <NavItem to="/dashboard/settings" icon="⚙️" label="Settings" />
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      end={to === '/dashboard'}
      style={({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        color: isActive ? '#60a5fa' : '#94a3b8',
        textDecoration: 'none',
        flex: 1
      })}
    >
      <span style={{ fontSize: '1.25rem', filter: 'grayscale(0.5)' }}>{icon}</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{label}</span>
    </NavLink>
  );
};
