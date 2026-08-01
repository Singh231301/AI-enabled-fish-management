import React, { useState } from 'react';
import { FarmContext } from '../../types/ai.types';

interface AIContextPanelProps {
  context: FarmContext | null;
  isLoading?: boolean;
}

const AIContextPanel: React.FC<AIContextPanelProps> = ({ context, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const statusColor = (status: string) => {
    if (['NORMAL', 'GOOD', 'EXCELLENT'].includes(status)) return '#4ade80';
    if (['LOW', 'HIGH', 'WARNING'].includes(status)) return '#fbbf24';
    if (['CRITICAL_LOW', 'CRITICAL_HIGH', 'CRITICAL'].includes(status)) return '#ef4444';
    return '#94a3b8';
  };

  const renderValue = (value: any, label?: string) => {
    if (value === null || value === undefined) return <span style={{ color: '#666' }}>—</span>;
    if (typeof value === 'boolean') return <span style={{ color: value ? '#4ade80' : '#ef4444' }}>{value ? 'Yes' : 'No'}</span>;
    if (typeof value === 'number') return <span style={{ color: '#93c5fd' }}>{value.toLocaleString()}</span>;
    if (label?.toLowerCase().includes('status')) return <span style={{ color: statusColor(String(value)) }}>{value}</span>;
    return <span style={{ color: '#e0e0e0' }}>{String(value)}</span>;
  };

  const renderSection = (key: string, icon: string, title: string, data: Record<string, any> | null) => {
    if (!data) return null;
    const isExpanded = expandedSections.has(key);

    return (
      <div key={key} style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 6,
      }}>
        <button
          onClick={() => toggleSection(key)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#ccc',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <span>{icon}</span>
            <span style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</span>
          </span>
          <span style={{ fontSize: 12, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
        </button>
        {isExpanded && (
          <div style={{ padding: '4px 14px 12px' }}>
            {Object.entries(data).map(([k, v]) => {
              if (typeof v === 'object' && !Array.isArray(v) && v !== null) return null;
              if (Array.isArray(v)) return null;
              const label = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
              return (
                <div key={k} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                  fontSize: 12,
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ color: '#888', textTransform: 'capitalize' }}>{label}</span>
                  {renderValue(v, k)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, height: 40 }}>
        <div style={{ color: '#666', fontSize: 13 }}>Loading context...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#aaa',
          fontSize: 13,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🧠</span>
          <span>{isOpen ? 'Hide AI Context' : 'View AI Context'}</span>
        </span>
        <span style={{ fontSize: 10, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {isOpen && context && (
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
            Generated: {new Date(context.generatedAt).toLocaleString()}
          </div>
          {renderSection('pond', '🏞️', 'Pond', context.pond)}
          {renderSection('fish', '🐟', 'Fish Status', context.fish)}
          {renderSection('growth', '📏', 'Growth', context.growth)}
          {renderSection('feeding', '🍽️', 'Feeding', context.feeding)}
          {renderSection('water', '💧', 'Water Quality', context.water)}
          {renderSection('financials', '💰', 'Financials', context.financials)}
          {renderSection('tasks', '✅', 'Tasks', context.tasks)}
          {renderSection('season', '🌤️', 'Season', context.season)}
          {renderSection('weather', '🌡️', 'Weather', context.weather)}
        </div>
      )}

      {isOpen && !context && (
        <div style={{ padding: '0 16px 16px', color: '#888', fontSize: 13 }}>
          Select a pond to view AI context data.
        </div>
      )}
    </div>
  );
};

export default AIContextPanel;
