import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FeedingPerformanceData } from '../../types/reports.types';
import ReportCard from './ReportCard';

interface Props {
  data: FeedingPerformanceData;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const FeedingAnalyticsReport: React.FC<Props> = ({ data }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Total Feed Used</div>
          <div style={{ color: '#f8fafc', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {data.totalFeedKg.toLocaleString()} kg
          </div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Avg Daily Feed</div>
          <div style={{ color: '#3b82f6', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {data.averageDailyGrams.toLocaleString()} g
          </div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Feeding Consistency</div>
          <div style={{ 
            color: data.feedingConsistencyPct >= 90 ? '#10b981' : (data.feedingConsistencyPct >= 75 ? '#f59e0b' : '#ef4444'), 
            fontSize: '1.8rem', 
            fontWeight: 'bold' 
          }}>
            {data.feedingConsistencyPct.toFixed(1)}%
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Avg Finish Time</div>
          <div style={{ color: '#8b5cf6', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {data.averageFinishMinutes ? `${data.averageFinishMinutes.toFixed(1)} min` : 'N/A'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Weekly Trend Chart */}
        <ReportCard title="Weekly Feeding Trend" icon="📊" delay={0.1}>
          <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.weeklyTrend}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend />
                <Bar dataKey="totalGrams" name="Total Feed (g)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>

        {/* Fish Response Pie Chart */}
        <ReportCard title="Fish Response Breakdown" icon="🐟" delay={0.2}>
          <div style={{ height: '300px', width: '100%', marginTop: '16px', display: 'flex' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.responseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="response"
                  label={(props: any) => {
                    const { cx, cy, midAngle, outerRadius, response, percentage } = props;
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 25;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill="#f8fafc" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                        {`${response} (${Math.round(percentage)}%)`}
                      </text>
                    );
                  }}
                  labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                >
                  {data.responseBreakdown.map((entry, index) => {
                    let color = COLORS[index % COLORS.length];
                    if (entry.response === 'EXCELLENT') color = '#10b981';
                    if (entry.response === 'GOOD') color = '#3b82f6';
                    if (entry.response === 'SLOW') color = '#f59e0b';
                    if (entry.response === 'POOR') color = '#ef4444';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <ReportCard title="Feed Types Used" icon="🍽️" delay={0.3}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.feedTypeBreakdown.map((type, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{type.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#94a3b8' }}>{(type.grams / 1000).toFixed(1)} kg</span>
                  <span style={{ 
                    background: 'rgba(59, 130, 246, 0.2)', 
                    color: '#60a5fa', 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {type.percentage.toFixed(1)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </ReportCard>

        <ReportCard title="Feeding Accuracy" icon="🎯" delay={0.4}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '4px solid #10b981', borderRadius: '4px' }}>
              <span style={{ color: '#e2e8f0' }}>On Target Days</span>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>{data.overUnderFeedingDays.onTarget}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
              <span style={{ color: '#e2e8f0' }}>Underfeeding Days</span>
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{data.overUnderFeedingDays.underfeeding}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
              <span style={{ color: '#e2e8f0' }}>Overfeeding Days</span>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{data.overUnderFeedingDays.overfeeding}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginTop: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Leftovers Observed</span>
              <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{data.leftoverFrequencyPct.toFixed(1)}% of time</span>
            </div>
          </div>
        </ReportCard>
      </div>
    </div>
  );
};

export default FeedingAnalyticsReport;
