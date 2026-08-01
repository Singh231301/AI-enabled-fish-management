import React, { useMemo } from 'react';
import { TransactionWithItem } from '../../types/inventory.types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

interface StockUsageChartProps {
  transactions: TransactionWithItem[];
  days?: number;
}

export const StockUsageChart: React.FC<StockUsageChartProps> = ({ transactions, days = 30 }) => {
  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();
    const today = new Date();
    
    // Initialize last N days with 0
    for (let i = days - 1; i >= 0; i--) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
      dataMap.set(dateStr, 0);
    }
    
    // Sum usage transactions (USAGE and WASTAGE)
    transactions.forEach(tx => {
      if (tx.transactionType === 'USAGE' || tx.transactionType === 'WASTAGE') {
        const dateStr = tx.transactionDate.split('T')[0];
        if (dataMap.has(dateStr)) {
          dataMap.set(dateStr, (dataMap.get(dateStr) || 0) + tx.quantity);
        }
      }
    });

    return Array.from(dataMap.entries()).map(([dateStr, amount]) => ({
      date: format(parseISO(dateStr), 'dd MMM'),
      amount
    }));
  }, [transactions, days]);

  return (
    <div className="bg-white rounded-2xl border p-6">
      <h3 className="font-semibold text-slate-800 mb-6">Stock Usage Trend (Last {days} Days)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
              formatter={(value: number) => [`${value} units`, 'Used']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorUsage)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
