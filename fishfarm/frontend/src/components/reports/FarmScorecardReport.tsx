import React from 'react';
import { FarmScorecard } from '../../types/reports.types';
import ReportCard from './ReportCard';

interface Props {
  data: FarmScorecard;
}

const FarmScorecardReport: React.FC<Props> = ({ data }) => {
  const renderGauge = (score: number, grade: string, color: string) => {
    // A simple conic gradient to act as a circular progress bar
    const colorMap: Record<string, string> = {
      green: '#10b981',
      sky: '#0ea5e9',
      amber: '#f59e0b',
      orange: '#f97316',
      red: '#ef4444'
    };
    const hexColor = colorMap[color] || colorMap.green;
    
    return (
      <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `conic-gradient(${hexColor} ${score}%, rgba(255,255,255,0.1) ${score}%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: '#1a1a2e', // Match theme background approximately
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)'
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: hexColor }}>Grade {grade}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderGradeBar = (label: string, scoreObj: any) => {
    const colorMap: Record<string, string> = {
      green: '#10b981', sky: '#0ea5e9', amber: '#f59e0b', orange: '#f97316', red: '#ef4444'
    };
    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
          <span style={{ color: '#cbd5e1' }}>{label}</span>
          <span style={{ fontWeight: 600, color: colorMap[scoreObj.color] }}>{scoreObj.grade} ({scoreObj.score}%)</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${scoreObj.score}%`, height: '100%', background: colorMap[scoreObj.color], borderRadius: '4px' }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      <ReportCard title="Overall Farm Health" icon="🏥" delay={0}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {renderGauge(data.scores.overall.score, data.scores.overall.grade, data.scores.overall.color)}
          <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '1.1rem' }}>
            {data.scores.overall.label}
          </p>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1rem' }}>Component Breakdown</h4>
          {renderGradeBar('Fish Health', data.scores.fishHealth)}
          {renderGradeBar('Feeding Consistency', data.scores.feedingConsistency)}
          {renderGradeBar('Water Quality', data.scores.waterQuality)}
          {renderGradeBar('Task Completion', data.scores.taskCompletion)}
          {renderGradeBar('Financial Health', data.scores.financialHealth)}
        </div>
      </ReportCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <ReportCard title="Key Milestones" icon="🏆" delay={0.1}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.milestones.map((m, i) => (
              <li key={i} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                padding: '12px',
                background: m.isAchieved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                borderLeft: m.isAchieved ? '4px solid #10b981' : '4px solid rgba(255,255,255,0.1)',
                borderRadius: '0 8px 8px 0'
              }}>
                <span style={{ opacity: m.isAchieved ? 1 : 0.3 }}>{m.isAchieved ? '✅' : '⏳'}</span>
                <div>
                  <p style={{ margin: 0, color: m.isAchieved ? '#f8fafc' : '#94a3b8', fontWeight: m.isAchieved ? 600 : 400 }}>{m.label}</p>
                  {m.achievedDate && <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#10b981' }}>{new Date(m.achievedDate).toLocaleDateString()}</p>}
                </div>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard title="Actionable Recommendations" icon="💡" delay={0.2}>
          <ul style={{ paddingLeft: '20px', margin: 0, color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </ReportCard>
      </div>
    </div>
  );
};

export default FarmScorecardReport;
