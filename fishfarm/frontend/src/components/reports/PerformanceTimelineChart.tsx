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
  ComposedChart,
  Bar
} from 'recharts';
import { FarmTimelineData } from '../../types/reports.types';
import ReportCard from './ReportCard';

interface Props {
  data: FarmTimelineData;
}

const PerformanceTimelineChart: React.FC<Props> = ({ data }) => {
  // We need to merge all these timeline series into a single array grouped by date
  // to feed into Recharts properly.
  const dateMap = new Map<string, any>();

  const addToMap = (date: string, key: string, value: any) => {
    // Standardize date string (e.g. from ISO to YYYY-MM-DD for matching)
    const dateStr = date.split('T')[0];
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, { date: dateStr });
    }
    dateMap.get(dateStr)[key] = value;
  };

  data.feedingByDay.forEach(d => addToMap(d.date, 'feedGrams', d.totalGrams));
  data.mortalityByDay.forEach(d => addToMap(d.date, 'deadCount', d.deadCount));
  data.waterReadingsByDay.forEach(d => addToMap(d.date, 'phValue', d.phValue));
  data.expensesByDay.forEach(d => addToMap(d.date, 'expense', d.total));
  data.salesByDay.forEach(d => addToMap(d.date, 'revenue', d.revenue));

  // Convert to array and sort by date
  const chartData = Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Format dates for display
  const displayData = chartData.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      <ReportCard title="Daily Farm Operations" icon="📅" delay={0}>
        <div style={{ height: '400px', width: '100%', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayData}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="displayDate" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              
              {/* Left Y Axis for Feeding (grams) */}
              <YAxis yAxisId="left" stroke="#3b82f6" orientation="left" tick={{ fill: '#3b82f6', fontSize: 12 }} />
              {/* Right Y Axis for Mortality (count) */}
              <YAxis yAxisId="right" stroke="#ef4444" orientation="right" tick={{ fill: '#ef4444', fontSize: 12 }} />
              {/* Hidden Y Axis for pH to scale it separately */}
              <YAxis yAxisId="ph" hide domain={[4, 10]} />
              
              <Tooltip 
                contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              
              <Bar yAxisId="left" dataKey="feedGrams" name="Feed Used (g)" fill="rgba(59, 130, 246, 0.6)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="deadCount" name="Mortality (count)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="ph" type="monotone" dataKey="phValue" name="pH Reading" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ReportCard>

      <ReportCard title="Financial Timeline (Cashflow)" icon="💸" delay={0.1}>
        <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayData}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="displayDate" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              
              <Tooltip 
                contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              
              <Bar dataKey="expense" name="Expenses (₹)" fill="rgba(239, 68, 68, 0.7)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue (₹)" fill="rgba(16, 185, 129, 0.7)" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ReportCard>
    </div>
  );
};

export default PerformanceTimelineChart;
