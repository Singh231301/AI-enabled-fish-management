import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api/endpoints/ai.api';
import { FarmHealthScore as FarmHealthScoreType } from '../../types/ai.types';

interface FarmHealthScoreProps {
  pondId: string;
}

const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#eab308',
  D: '#f97316',
  F: '#ef4444',
};

const FarmHealthScore: React.FC<FarmHealthScoreProps> = ({ pondId }) => {
  const [score, setScore] = useState<FarmHealthScoreType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await aiApi.getFarmHealthScore(pondId);
        setScore(data);
      } catch {
        setScore(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [pondId]);

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 24,
        height: 300,
      }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '50%', width: 160, height: 160, margin: '0 auto', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
      </div>
    );
  }

  if (!score) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '32px 24px',
        textAlign: 'center',
        color: '#888',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <p style={{ margin: 0, fontSize: 14 }}>Unable to calculate farm health score.</p>
      </div>
    );
  }

  const gradeColor = GRADE_COLORS[score.grade] || '#94a3b8';
  const percentage = score.totalScore;

  const getBarColor = (ratio: number) => {
    if (ratio >= 0.8) return '#22c55e';
    if (ratio >= 0.6) return '#3b82f6';
    if (ratio >= 0.4) return '#eab308';
    if (ratio >= 0.2) return '#f97316';
    return '#ef4444';
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 24,
      backdropFilter: 'blur(10px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 22 }}>🏥</span>
        <h3 style={{ color: '#fff', margin: 0, fontSize: 16, fontWeight: 600 }}>Farm Health Score</h3>
      </div>

      {/* Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: `conic-gradient(${gradeColor} 0deg, ${gradeColor} ${percentage * 3.6}deg, rgba(255,255,255,0.08) ${percentage * 3.6}deg, rgba(255,255,255,0.08) 360deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: '#0f0f1a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: gradeColor }}>{score.totalScore}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: gradeColor, marginTop: -4 }}>{score.grade}</span>
            <span style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{score.label}</span>
          </div>
        </div>
      </div>

      {/* Component Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {Object.values(score.components).map((comp, i) => {
          const ratio = comp.score / comp.maxScore;
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: '#aaa' }}>{comp.label}</span>
                <span style={{ color: '#ccc', fontWeight: 600 }}>{comp.score}/{comp.maxScore}</span>
              </div>
              <div style={{
                height: 6,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: 3,
                  width: `${ratio * 100}%`,
                  background: getBarColor(ratio),
                  transition: 'width 0.8s ease-out',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Strengths & Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <h4 style={{ color: '#4ade80', fontSize: 12, margin: '0 0 6px', textTransform: 'uppercase' }}>Strengths</h4>
          {score.topStrengths.map((s, i) => (
            <div key={i} style={{
              color: '#ccc',
              fontSize: 12,
              padding: '3px 0',
              borderLeft: '2px solid #4ade80',
              paddingLeft: 8,
              marginBottom: 4,
            }}>
              {s}
            </div>
          ))}
        </div>
        <div>
          <h4 style={{ color: '#ef4444', fontSize: 12, margin: '0 0 6px', textTransform: 'uppercase' }}>Weaknesses</h4>
          {score.topWeaknesses.map((w, i) => (
            <div key={i} style={{
              color: '#ccc',
              fontSize: 12,
              padding: '3px 0',
              borderLeft: '2px solid #ef4444',
              paddingLeft: 8,
              marginBottom: 4,
            }}>
              {w}
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Tip */}
      <div style={{
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
      }}>
        <span style={{ fontSize: 14 }}>💡</span>
        <span style={{ color: '#93c5fd', fontSize: 12, lineHeight: 1.5 }}>{score.improvementTip}</span>
      </div>
    </div>
  );
};

export default FarmHealthScore;
