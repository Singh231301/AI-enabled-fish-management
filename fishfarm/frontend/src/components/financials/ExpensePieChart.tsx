import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryBreakdown } from '../../types/financials.types';
import { EXPENSE_CATEGORY_CONFIG } from '../../utils/constants';

interface ExpensePieChartProps {
  data: CategoryBreakdown[];
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-800/50 rounded-lg">
        No expense data available for this period.
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: (EXPENSE_CATEGORY_CONFIG as any)[item.category]?.label || item.label,
    value: item.total,
    color: getTailwindColorHex((EXPENSE_CATEGORY_CONFIG as any)[item.category]?.color || 'text-slate-400')
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `₹${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#f8fafc' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Helper to map tailwind text classes to hex colors for Recharts
function getTailwindColorHex(colorClass: string): string {
  const colorMap: Record<string, string> = {
    'text-sky-400': '#38bdf8',
    'text-amber-400': '#fbbf24',
    'text-purple-400': '#c084fc',
    'text-slate-400': '#94a3b8',
    'text-orange-400': '#fb923c',
    'text-stone-400': '#a8a29e',
    'text-blue-400': '#60a5fa',
    'text-gray-400': '#9ca3af',
  };
  return colorMap[colorClass] || '#94a3b8';
}
