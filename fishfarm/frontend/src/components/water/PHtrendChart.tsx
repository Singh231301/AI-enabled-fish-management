import React from 'react';
import { PHDataPoint } from '../../types/water.types';
import { PH_STATUS_CONFIG } from '../../utils/constants';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts';

interface PHtrendChartProps {
  phTrend: PHDataPoint[];
  isLoading: boolean;
  periodDays: number;
  onPeriodChange: (period: '7d' | '30d' | '90d' | 'all') => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PHDataPoint;
    const config = PH_STATUS_CONFIG[data.status];
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-400 text-sm mb-1">{data.displayDate}</p>
        {data.ph !== null ? (
          <>
            <p className="text-xl font-bold text-white mb-1">{data.ph.toFixed(2)}</p>
            <p className={`text-sm font-medium ${config?.color}`}>
              {config?.emoji} {config?.label}
            </p>
          </>
        ) : (
          <p className="text-slate-400 font-medium">No reading</p>
        )}
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || payload.ph === null) return null;
  
  let color = '#22c55e'; // default green
  let radius = 3;

  if (payload.ph < 7.0 || payload.ph > 8.5) {
    color = '#f59e0b'; // amber
    radius = 4;
  }
  if (payload.ph < 6.0 || payload.ph > 9.0) {
    color = '#ef4444'; // red
    radius = 5;
  }

  return (
    <circle cx={cx} cy={cy} r={radius} fill={color} stroke="#1e293b" strokeWidth={1} />
  );
};

export const PHtrendChart: React.FC<PHtrendChartProps> = ({
  phTrend,
  isLoading,
  periodDays,
  onPeriodChange
}) => {
  if (isLoading) {
    return <div className="h-64 w-full animate-pulse bg-slate-800 rounded-xl"></div>;
  }

  const validData = phTrend.filter(d => d.ph !== null);
  const avg = validData.length > 0 ? validData.reduce((acc, curr) => acc + curr.ph!, 0) / validData.length : 0;
  const max = validData.length > 0 ? Math.max(...validData.map(d => d.ph!)) : 0;
  const min = validData.length > 0 ? Math.min(...validData.map(d => d.ph!)) : 0;
  const inRange = validData.length > 0 ? validData.filter(d => d.ph! >= 7.0 && d.ph! <= 8.5).length : 0;
  const normalPct = validData.length > 0 ? (inRange / validData.length) * 100 : 0;

  return (
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span>📈 pH Trend</span>
        </h3>
        
        <div className="flex bg-slate-800 rounded-lg p-1 text-sm font-medium">
          {[{label: '7d', val: '7d'}, {label: '30d', val: '30d'}, {label: '90d', val: '90d'}, {label: 'All', val: 'all'}].map(p => (
            <button
              key={p.val}
              onClick={() => onPeriodChange(p.val as any)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                (periodDays === parseInt(p.val) || (periodDays > 90 && p.val === 'all'))
                  ? 'bg-sky-500/20 text-sky-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={phTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              stroke="#64748b" 
              tickMargin={10} 
              minTickGap={20}
            />
            <YAxis 
              domain={[5.5, 10]} 
              ticks={[6, 7, 7.5, 8, 8.5, 9, 9.5]}
              stroke="#64748b"
            />
            <Tooltip content={<CustomTooltip />} />
            
            <ReferenceArea y1={5.5} y2={6.0} fill="#ef4444" fillOpacity={0.08} />
            <ReferenceArea y1={6.0} y2={7.0} fill="#f59e0b" fillOpacity={0.08} />
            <ReferenceArea y1={7.0} y2={8.5} fill="#22c55e" fillOpacity={0.10} />
            <ReferenceArea y1={8.5} y2={9.0} fill="#f59e0b" fillOpacity={0.08} />
            <ReferenceArea y1={9.0} y2={10} fill="#ef4444" fillOpacity={0.08} />

            <ReferenceLine y={7.0} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={8.5} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={7.75} stroke="#4ade80" strokeDasharray="1 3" opacity={0.5} />

            <Line 
              type="monotone" 
              dataKey="ph" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              connectNulls={false}
              dot={<CustomDot />}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="text-slate-400">Avg pH: <span className="text-slate-200 font-medium">{avg > 0 ? avg.toFixed(2) : '-'}</span></div>
        <div className="text-slate-400">Highest: <span className="text-slate-200 font-medium">{max > 0 ? max.toFixed(2) : '-'}</span></div>
        <div className="text-slate-400">Lowest: <span className="text-slate-200 font-medium">{min > 0 ? min.toFixed(2) : '-'}</span></div>
        <div className="text-slate-400">In Range: <span className="text-slate-200 font-medium">{normalPct.toFixed(0)}%</span></div>
      </div>
    </div>
  );
};
