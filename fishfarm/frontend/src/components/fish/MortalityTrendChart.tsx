import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MortalitySummary } from '../../types/fish.types';

interface MortalityTrendChartProps {
  mortalitySummary: MortalitySummary;
}

export const MortalityTrendChart: React.FC<MortalityTrendChartProps> = ({ mortalitySummary }) => {
  const { dailyTrend } = mortalitySummary;

  if (dailyTrend.length === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg  border border-slate-700 flex items-center justify-center h-80">
        <p className="text-slate-400">No mortality data in the last 30 days.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg  border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">Mortality Trend (Last 30 Days)</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dailyTrend}
            margin={{ top: 5, right: 10, left: -20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }} 
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#F3F4F6' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              formatter={(value: number) => [`${value} Dead`, 'Mortality']}
            />
            <Bar 
              dataKey="deadCount" 
              fill="#EF4444" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
