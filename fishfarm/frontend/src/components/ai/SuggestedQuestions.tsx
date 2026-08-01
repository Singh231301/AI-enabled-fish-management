import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api/endpoints/ai.api';
import { SuggestedQuestion } from '../../types/ai.types';

interface SuggestedQuestionsProps {
  pondId: string;
  onSelect: (question: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  general: '📋',
  fish: '🐟',
  feeding: '🍽️',
  water: '💧',
  health: '🩺',
  harvest: '🎣',
  seasonal: '🌡️',
  tasks: '✅',
  inventory: '📦',
  financials: '💰',
  infrastructure: '🏗️',
};

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ pondId, onSelect }) => {
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await aiApi.getSuggestedQuestions(pondId);
        setQuestions(data);
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [pondId]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 12,
            padding: 16,
            height: 48,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q.text)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: q.urgent
              ? '1px solid rgba(255,107,107,0.5)'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '12px 14px',
            color: '#ddd',
            cursor: 'pointer',
            fontSize: 13,
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'all 0.2s',
            position: 'relative',
            boxShadow: q.urgent ? '0 0 12px rgba(255,107,107,0.15)' : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.borderColor = q.urgent ? 'rgba(255,107,107,0.7)' : 'rgba(102,126,234,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = q.urgent ? 'rgba(255,107,107,0.5)' : 'rgba(255,255,255,0.1)';
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>{CATEGORY_ICONS[q.category] || '❓'}</span>
          <span style={{ lineHeight: 1.4 }}>{q.text}</span>
          {q.urgent && (
            <span style={{
              position: 'absolute',
              top: 6,
              right: 8,
              background: 'rgba(255,107,107,0.2)',
              color: '#ff6b6b',
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 6,
              fontWeight: 600,
            }}>
              URGENT
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default SuggestedQuestions;
