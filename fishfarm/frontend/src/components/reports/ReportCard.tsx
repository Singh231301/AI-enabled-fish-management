import React from 'react';

interface ReportCardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  delay?: number;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, icon, children, action, delay = 0 }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      overflow: 'hidden',
      animation: `fadeInUp 0.5s ease-out ${delay}s both`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon && <span style={{ fontSize: '1.5rem' }}>{icon}</span>}
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 600 }}>{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ReportCard;
