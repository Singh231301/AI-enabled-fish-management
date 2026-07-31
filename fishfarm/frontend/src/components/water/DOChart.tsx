import React from 'react';
import { DODataPoint, DOStats } from '../../types/water.types';
import { DO_STATUS_CONFIG } from '../../utils/constants';
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

interface DOChartProps {
  doTrend: DODataPoint[];
  doStats: DOStats;
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DODataPoint;
    const config = DO_STATUS_CONFIG[data.status];
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-400 text-sm mb-1">{data.displayDate}</p>
        {data.do !== null ? (
          <>
            <p className="text-xl font-bold text-white mb-1">{data.do.toFixed(1)} ppm</p>
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
  if (!cx || !cy || payload.do === null) return null;
  
  let color = '#38bdf8'; // sky-400 default
  let radius = 3;

  if (payload.do < 5) {
    color = '#fbbf24'; // amber-400
    radius = 4;
  }
  if (payload.do < 3) {
    color = '#f97316'; // orange-500
    radius = 4;
  }
  if (payload.do < 2) {
    color = '#ef4444'; // red-500
    radius = 5;
  }

  return (
    <circle cx={cx} cy={cy} r={radius} fill={color} stroke="#1e293b" strokeWidth={1} />
  );
};

export const DOChart: React.FC<DOChartProps> = ({
  doTrend,
  doStats,
  isLoading
}) => {
  if (isLoading) {
    return <div className="h-64 w-full animate-pulse bg-slate-800 rounded-xl"></div>;
  }

  if (doStats.count === 0) {
    return (
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-center flex flex-col items-center justify-center min-h-[250px]">
        <div className="text-4xl mb-3">💡</div>
        <h4 className="text-slate-200 font-medium mb-2">Dissolved oxygen monitoring not started yet.</h4>
        <p className="text-slate-400 text-sm max-w-sm mb-4">
          A basic DO meter costs ₹2,000-3,000 and can prevent mass fish mortality. Strongly recommended.
        </p>
        <div className="bg-slate-800 rounded p-3 text-xs text-left max-w-sm border border-slate-700">
          <span className="font-semibold text-slate-300 block mb-1">Manual proxy tip:</span>
          <span className="text-slate-400">If fish are gasping at surface between 5-7 AM, DO may be dangerously low.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
      <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-4">
        <span>⚡ Dissolved Oxygen</span>
      </h3>
      
      {doStats.criticalReadings > 0 && (
        <div className="mb-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-sm text-red-200 flex gap-3">
          <span className="text-xl">⚠️</span>
          <p>{doStats.criticalReadings} critical DO reading(s) recorded. Review dates and correlate with feeding behavior.</p>
        </div>
      )}

      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={doTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              stroke="#64748b" 
              tickMargin={10} 
              minTickGap={20}
            />
            <YAxis 
              domain={[0, 12]} 
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              stroke="#64748b"
            />
            <Tooltip content={<CustomTooltip />} />
            
            <ReferenceArea y1={0} y2={2} fill="#ef4444" fillOpacity={0.08} />
            <ReferenceArea y1={2} y2={3} fill="#f97316" fillOpacity={0.08} />
            <ReferenceArea y1={3} y2={5} fill="#f59e0b" fillOpacity={0.08} />
            <ReferenceArea y1={5} y2={7} fill="#22c55e" fillOpacity={0.08} />
            <ReferenceArea y1={7} y2={20} fill="#0ea5e9" fillOpacity={0.05} />

            <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} label={{ position: 'insideTopLeft', value: 'Danger (3)', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine y={5} stroke="#22c55e" strokeDasharray="3 3" opacity={0.5} label={{ position: 'insideTopLeft', value: 'Optimal min (5)', fill: '#22c55e', fontSize: 10 }} />

            <Line 
              type="monotone" 
              dataKey="do" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              connectNulls={false}
              dot={<CustomDot />}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
