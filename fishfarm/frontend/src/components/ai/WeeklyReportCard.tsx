import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api/endpoints/ai.api';
import { AiBriefing } from '../../types/ai.types';

interface WeeklyReportCardProps {
  pondId: string;
}

const TABS = ['Summary', 'Highlights', 'Next Week'] as const;

const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({ pondId }) => {
  const [report, setReport] = useState<AiBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Summary');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await aiApi.getWeeklyReport(pondId);
        setReport(data);
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [pondId]);

  const extractSection = (content: string, ...markers: string[]): string[] => {
    const lines = content.split('\n');
    const result: string[] = [];
    let capturing = false;

    for (const line of lines) {
      if (markers.some(m => line.includes(m))) {
        capturing = true;
        continue;
      }
      if (capturing) {
        if (line.trim() === '') continue;
        const isNewSection = /^[🐟🍽️💧✅⚠️📅🎯📊💪📋🌟]/.test(line.trim());
        if (isNewSection && !markers.some(m => line.includes(m))) {
          break;
        }
        result.push(line.trim());
      }
    }
    return result;
  };

  const renderTabContent = () => {
    if (!report) return null;
    const content = report.content;

    switch (activeTab) {
      case 'Summary':
        return (
          <div style={{ color: '#ccc', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {content}
          </div>
        );

      case 'Highlights': {
        const strengths = extractSection(content, 'WHAT WENT WELL', '💪');
        const improvements = extractSection(content, 'AREAS TO IMPROVE', '⚠️');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h4 style={{ color: '#4ade80', margin: '0 0 8px', fontSize: 14 }}>💪 What Went Well</h4>
              {strengths.length > 0 ? strengths.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0',
                  color: '#ccc', fontSize: 13,
                }}>
                  <span style={{ color: '#4ade80' }}>✓</span>
                  <span>{s.replace(/^[-•*]\s*/, '')}</span>
                </div>
              )) : <div style={{ color: '#888', fontSize: 13 }}>No highlights extracted</div>}
            </div>
            <div>
              <h4 style={{ color: '#ffb74d', margin: '0 0 8px', fontSize: 14 }}>⚠️ Areas to Improve</h4>
              {improvements.length > 0 ? improvements.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0',
                  color: '#ccc', fontSize: 13,
                }}>
                  <span style={{ color: '#ffb74d' }}>⚡</span>
                  <span>{s.replace(/^[-•*]\s*/, '')}</span>
                </div>
              )) : <div style={{ color: '#888', fontSize: 13 }}>No improvements identified</div>}
            </div>
          </div>
        );
      }

      case 'Next Week': {
        const priorities = extractSection(content, "NEXT WEEK", '📋');
        return (
          <div>
            <h4 style={{ color: '#64b5f6', margin: '0 0 12px', fontSize: 14 }}>📋 Next Week's Priorities</h4>
            {priorities.length > 0 ? priorities.map((p, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#ccc',
                fontSize: 13,
                borderLeft: '3px solid #64b5f6',
              }}>
                <span style={{ fontWeight: 700, color: '#64b5f6', fontSize: 14 }}>{i + 1}</span>
                <span>{p.replace(/^\d+\.\s*/, '')}</span>
              </div>
            )) : <div style={{ color: '#888', fontSize: 13 }}>No priorities extracted</div>}
          </div>
        );
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 24,
        height: 200,
      }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, height: '100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>📊</span>
        <h3 style={{ color: '#fff', margin: 0, fontSize: 16, fontWeight: 600 }}>Weekly Report</h3>
      </div>

      {report ? (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : 'rgba(255,255,255,0.06)',
                  border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: activeTab === tab ? '#fff' : '#aaa',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: activeTab === tab ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: '4px 0' }}>
            {renderTabContent()}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#888' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <p style={{ margin: 0, fontSize: 14 }}>No weekly report available yet.</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyReportCard;
