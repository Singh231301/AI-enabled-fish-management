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
import { GrowthAnalyticsReport } from '../../types/reports.types';
import ReportCard from './ReportCard';

interface Props {
  data: GrowthAnalyticsReport;
}

const GrowthAnalyticsChart: React.FC<Props> = ({ data }) => {
  // Combine chart data
  const combinedData = [];
  const maxDay = Math.max(
    ...data.chartData.actual.map(d => d.day),
    ...data.chartData.benchmark.map(d => d.day),
    ...data.chartData.predicted.map(d => d.day)
  );

  for (let i = 0; i <= maxDay; i++) {
    const actual = data.chartData.actual.find(d => d.day === i);
    const benchmark = data.chartData.benchmark.find(d => d.day === i);
    const predicted = data.chartData.predicted.find(d => d.day === i);

    if (actual || benchmark || predicted) {
      combinedData.push({
        day: i,
        actual: actual?.weight,
        benchmark: benchmark?.weight,
        predicted: predicted?.weight
      });
    }
  }

  const lastActualDay = data.chartData.actual.length > 0
    ? Math.max(...data.chartData.actual.map(d => d.day))
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Current Weight</div>
          <div style={{ color: '#f8fafc', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {data.currentWeight ? `${data.currentWeight.toFixed(2)}g` : 'N/A'}
          </div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Benchmark Weight</div>
          <div style={{ color: '#f8fafc', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {data.benchmarkWeight ? `${data.benchmarkWeight.toFixed(2)}g` : 'N/A'}
          </div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Growth Variance</div>
          <div style={{ 
            color: data.growthVariance === null ? '#f8fafc' : (data.growthVariance >= 0 ? '#10b981' : '#ef4444'), 
            fontSize: '1.8rem', 
            fontWeight: 'bold' 
          }}>
            {data.growthVariance !== null ? `${data.growthVariance > 0 ? '+' : ''}${data.growthVariance.toFixed(1)}%` : 'N/A'}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Avg Growth / Day</div>
          <div style={{ color: '#3b82f6', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {data.gramsPerDay.toFixed(2)}g
          </div>
        </div>
      </div>

      <ReportCard title="Growth Curve Analysis" icon="📈" delay={0.1}>
        <div style={{ height: '400px', width: '100%', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={combinedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8' }}
                label={{ value: 'Days Since Stocking', position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8' }}
                label={{ value: 'Weight (g)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(value: number) => [`${typeof value === 'number' ? value.toFixed(2) : value}g`, undefined]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {lastActualDay !== null && (
                <ReferenceLine x={lastActualDay} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#64748b' }} />
              )}
              
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual Weight" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                name="Benchmark Target" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                name="Predicted Growth" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ReportCard>
      
      {data.samples.length > 0 && (
        <ReportCard title="Recent Samples Data" icon="📋" delay={0.2}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>Age (Days)</th>
                  <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>Weight</th>
                  <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>Benchmark</th>
                  <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>Variance</th>
                  <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.samples.slice(0, 5).map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', color: '#f8fafc' }}>{new Date(s.sampleDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', color: '#e2e8f0' }}>{s.fishAgeDays}</td>
                    <td style={{ padding: '12px', color: '#f8fafc', fontWeight: 600 }}>{s.averageWeightGrams.toFixed(2)}g</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{s.benchmarkWeight ? `${s.benchmarkWeight.toFixed(2)}g` : '-'}</td>
                    <td style={{ 
                      padding: '12px', 
                      color: s.variancePercent === null ? '#94a3b8' : (s.variancePercent >= 0 ? '#10b981' : '#ef4444'),
                      fontWeight: 600
                    }}>
                      {s.variancePercent !== null ? `${s.variancePercent > 0 ? '+' : ''}${s.variancePercent.toFixed(1)}%` : '-'}
                    </td>
                    <td style={{ padding: '12px', color: '#3b82f6' }}>
                      {s.weeklyGrowthRate ? `${s.weeklyGrowthRate.toFixed(2)} g/week` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportCard>
      )}
    </div>
  );
};

export default GrowthAnalyticsChart;
