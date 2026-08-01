import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api/endpoints/ai.api';
import { AIInsight } from '../../types/ai.types';

interface AIInsightsPanelProps {
  pondId: string;
}

const TYPE_COLORS: Record<string, string> = {
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  success: '#22c55e',
};

const TYPE_ICONS: Record<string, string> = {
  danger: '🚨',
  warning: '⚠️',
  info: 'ℹ️',
  success: '✅',
};

const URGENCY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#6b7280',
};

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ pondId }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await aiApi.getInsights({ pondId });
        setInsights(data);
      } catch {
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [pondId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 12,
            height: 72,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
        <p style={{ color: '#aaa', margin: 0, fontSize: 14 }}>
          No active insights — your farm is doing great!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <h3 style={{ color: '#fff', margin: 0, fontSize: 16, fontWeight: 600 }}>Farm Insights</h3>
        <span style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: '2px 8px',
          fontSize: 12,
          color: '#aaa',
        }}>
          {insights.length}
        </span>
      </div>

      {insights.map((insight, i) => (
        <div
          key={i}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '14px 16px',
            borderLeft: `3px solid ${TYPE_COLORS[insight.type]}`,
            position: 'relative',
            animation: insight.urgency === 'critical' ? 'criticalPulse 2s ease-in-out infinite' : 'none',
          }}
        >
          <style>{`@keyframes criticalPulse { 0%, 100% { box-shadow: 0 0 0 rgba(239,68,68,0); } 50% { box-shadow: 0 0 16px rgba(239,68,68,0.15); } }`}</style>

          {/* Urgency badge */}
          <span style={{
            position: 'absolute',
            top: 8,
            right: 10,
            background: `${URGENCY_COLORS[insight.urgency]}22`,
            color: URGENCY_COLORS[insight.urgency],
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            {insight.urgency}
          </span>

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{TYPE_ICONS[insight.type]}</span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{insight.title}</span>
          </div>

          {/* Detail */}
          {insight.detail && (
            <p style={{ color: '#aaa', fontSize: 13, margin: '4px 0 8px 24px', lineHeight: 1.5 }}>
              {insight.detail}
            </p>
          )}

          {/* Action */}
          <div style={{ marginLeft: 24, marginTop: 8 }}>
            <span style={{
              background: `${TYPE_COLORS[insight.type]}15`,
              border: `1px solid ${TYPE_COLORS[insight.type]}40`,
              color: TYPE_COLORS[insight.type],
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              {insight.action}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIInsightsPanel;
