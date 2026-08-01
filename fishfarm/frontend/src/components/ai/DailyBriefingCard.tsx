import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api/endpoints/ai.api';
import { AiBriefing } from '../../types/ai.types';

interface DailyBriefingCardProps {
  pondId: string;
}

const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({ pondId }) => {
  const [briefing, setBriefing] = useState<AiBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const data = await aiApi.getDailyBriefing(pondId);
      setBriefing(data);
    } catch {
      setBriefing(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBriefing(); }, [pondId]);

  const handleGenerate = async (force = false) => {
    try {
      setGenerating(true);
      const data = await aiApi.generateDailyBriefing({ pondId, forceRegenerate: force });
      setBriefing(data);
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  };

  const parseSections = (content: string) => {
    const emojiHeaders = ['🐟', '🍽️', '💧', '✅', '⚠️', '📅', '🎯', '📊', '💪', '📋'];
    const lines = content.split('\n');
    const sections: { title: string; content: string[] }[] = [];
    let current: { title: string; content: string[] } | null = null;

    for (const line of lines) {
      const isHeader = emojiHeaders.some(e => line.trim().startsWith(e));
      if (isHeader) {
        if (current) sections.push(current);
        current = { title: line.trim(), content: [] };
      } else if (current) {
        if (line.trim()) current.content.push(line.trim());
      }
    }
    if (current) sections.push(current);
    return sections;
  };

  const getSectionColor = (title: string) => {
    if (title.includes('🐟')) return '#4fc3f7';
    if (title.includes('🍽️')) return '#81c784';
    if (title.includes('💧')) return '#64b5f6';
    if (title.includes('✅')) return '#4ade80';
    if (title.includes('⚠️')) return '#ffb74d';
    if (title.includes('📅')) return '#ba68c8';
    return '#90a4ae';
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 24,
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
            height: 60,
            marginBottom: 12,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 24,
      backdropFilter: 'blur(10px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🌅</span>
          <h3 style={{ color: '#fff', margin: 0, fontSize: 16, fontWeight: 600 }}>Daily Briefing</h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {briefing && (
            <span style={{ color: '#888', fontSize: 11, alignSelf: 'center' }}>
              {new Date(briefing.briefingDate).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={() => handleGenerate(!!briefing)}
            disabled={generating}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              color: '#fff',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontSize: 12,
              fontWeight: 600,
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? '⏳ Generating...' : briefing ? '🔄 Refresh' : '✨ Generate'}
          </button>
        </div>
      </div>

      {/* Content */}
      {briefing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {parseSections(briefing.content).map((section, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 10,
              padding: '12px 16px',
              borderLeft: `3px solid ${getSectionColor(section.title)}`,
            }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                {section.title}
              </div>
              <div style={{ color: '#bbb', fontSize: 13, lineHeight: 1.7 }}>
                {section.content.map((line, j) => (
                  <div key={j} style={{ marginBottom: 2 }}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#888' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
          <p style={{ margin: '0 0 8px', fontSize: 14 }}>No briefing generated yet for today.</p>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
            Click "Generate" to create your AI-powered daily farm briefing.
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyBriefingCard;
