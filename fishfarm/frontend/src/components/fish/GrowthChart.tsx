import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GrowthSummary } from '../../types/fish.types';

interface GrowthChartProps {
  growthSummary: GrowthSummary;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ growthSummary }) => {
  const { chartData } = growthSummary;

  if (chartData.combined.length === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg  border border-slate-700 flex items-center justify-center h-80">
        <p className="text-slate-400">Not enough data to display growth chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg  border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">Growth vs Benchmark</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData.combined}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              label={{ value: 'Fish Age (Days)', position: 'insideBottom', offset: -15, fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              label={{ value: 'Weight (grams)', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              formatter={(value: number) => [`${typeof value === 'number' ? value.toFixed(2) : value}g`, undefined]}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line 
              type="monotone" 
              name="Benchmark Weight"
              dataKey="benchmarkWeight" 
              stroke="#9CA3AF" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
            <Line 
              type="monotone" 
              name="Actual Weight"
              dataKey="actualWeight" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
