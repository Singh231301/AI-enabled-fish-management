import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { WaterQualityReportData } from '../../types/reports.types';
import ReportCard from './ReportCard';

interface Props {
  data: WaterQualityReportData;
}

const WaterQualityReport: React.FC<Props> = ({ data }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>pH Health</div>
          <div style={{ 
            color: data.phHealthPercent && data.phHealthPercent >= 80 ? '#10b981' : (data.phHealthPercent && data.phHealthPercent >= 60 ? '#f59e0b' : '#ef4444'), 
            fontSize: '1.8rem', 
            fontWeight: 'bold' 
          }}>
            {data.phHealthPercent !== null ? `${data.phHealthPercent.toFixed(1)}%` : 'N/A'}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>% of readings in optimal range</div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Avg pH</div>
          <div style={{ color: '#3b82f6', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {data.phStats.avg ? data.phStats.avg.toFixed(2) : 'N/A'}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>Min: {data.phStats.min} | Max: {data.phStats.max}</div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Readings Frequency</div>
          <div style={{ color: '#8b5cf6', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {data.readingsPerWeek.toFixed(1)} / week
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>Longest gap: {data.longestGapDays} days</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Avg Temp / DO</div>
          <div style={{ color: '#10b981', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {data.tempStats.avg ? `${data.tempStats.avg.toFixed(1)}°C` : 'N/A'}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
            DO: {data.doStats.avg ? `${data.doStats.avg.toFixed(1)} mg/L` : 'N/A'}
          </div>
        </div>
      </div>

      <ReportCard title="pH Weekly Trend" icon="📉" delay={0.1}>
        <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.weeklyPHTrend}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} domain={[4, 10]} />
              <Tooltip 
                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
              />
              <Legend />
              {/* Optimal pH Range Reference Lines */}
              <ReferenceLine y={6.5} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideTopLeft', fill: '#10b981', value: 'Min Optimal (6.5)' }} />
              <ReferenceLine y={8.5} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', fill: '#10b981', value: 'Max Optimal (8.5)' }} />
              
              <Line 
                type="monotone" 
                dataKey="avgPH" 
                name="Average pH" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ReportCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <ReportCard title="Water Color Distribution" icon="🎨" delay={0.2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {data.colorFrequency.map((c, i) => {
              // Map common colors to actual CSS colors
              const colorMap: Record<string, string> = {
                'Green': '#22c55e',
                'Dark Green': '#166534',
                'Brown': '#a16207',
                'Clear': '#38bdf8',
                'Muddy': '#78350f'
              };
              const dotColor = colorMap[c.color] || '#cbd5e1';
              
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: dotColor, border: '2px solid rgba(255,255,255,0.2)' }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#f8fafc', fontWeight: 500 }}>{c.color}</span>
                      <span style={{ color: '#94a3b8' }}>{c.count} readings</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${c.percentage}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#3b82f6', minWidth: '40px', textAlign: 'right' }}>
                    {c.percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
            {data.colorFrequency.length === 0 && (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No water color data recorded.</div>
            )}
          </div>
        </ReportCard>

        <ReportCard title="Treatment Effects (Liming)" icon="🧪" delay={0.3}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {data.limeApplicationEffects.map((effect, i) => (
              <div key={i} style={{ 
                background: 'rgba(255,255,255,0.03)', 
                padding: '16px', 
                borderRadius: '8px',
                borderLeft: `4px solid ${effect.wasEffective ? '#10b981' : '#f59e0b'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#f8fafc', fontWeight: 500 }}>{effect.chemicalName} ({effect.quantityKg}kg)</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{new Date(effect.treatmentDate).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Before</div>
                    <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>{effect.phBefore?.toFixed(2) || '?'}</div>
                  </div>
                  <span style={{ color: '#64748b' }}>→</span>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>After</div>
                    <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>{effect.phAfter?.toFixed(2) || '?'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Change</div>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: effect.phChange && effect.phChange > 0 ? '#10b981' : (effect.phChange && effect.phChange < 0 ? '#ef4444' : '#94a3b8') 
                    }}>
                      {effect.phChange ? `${effect.phChange > 0 ? '+' : ''}${effect.phChange.toFixed(2)}` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {data.limeApplicationEffects.length === 0 && (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No treatments recorded in this period.</div>
            )}
          </div>
        </ReportCard>
      </div>
    </div>
  );
};

export default WaterQualityReport;
