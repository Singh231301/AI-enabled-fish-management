import React, { useState } from 'react';
import { DailyFeedTotal, WeeklyFeedTotal, FeedRecommendation } from '../../types/feeding.types';
import { ComposedChart, BarChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface FeedingTrendChartProps {
  dailyTrend: DailyFeedTotal[];
  weeklyTrend: WeeklyFeedTotal[];
  averageDailyGrams: number;
  recommendation: FeedRecommendation | null;
  isLoading: boolean;
  period?: '7d' | '30d' | '90d' | 'all';
  onPeriodChange?: (period: '7d' | '30d' | '90d' | 'all') => void;
  showAllControls?: boolean;
}

export const FeedingTrendChart: React.FC<FeedingTrendChartProps> = ({
  dailyTrend, weeklyTrend, averageDailyGrams, recommendation, isLoading, period = '30d', onPeriodChange, showAllControls = true
}) => {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  if (isLoading) {
    return <div className="bg-slate-800 animate-pulse rounded-xl h-72 border border-slate-700 w-full mb-6"></div>;
  }

  // Calculate 7-day moving average for daily trend
  const dailyWithMA = dailyTrend.map((day, i, arr) => {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      sum += arr[j].totalGrams;
      count++;
    }
    return {
      ...day,
      movingAvg: count > 0 ? Math.round(sum / count) : 0,
      shortDate: day.date.substring(5) // MM-DD
    };
  });

  const CustomDailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm z-50">
          <p className="text-white font-medium mb-1 border-b border-slate-700 pb-1">{data.displayDate}</p>
          <div className="flex justify-between gap-4 mt-1">
            <span className="text-slate-400">Total Fed:</span>
            <span className="font-bold text-sky-400">{data.totalGrams}g</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Sessions:</span>
            <span className="text-white">{data.sessions}</span>
          </div>
          {data.responses && data.responses.length > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Responses:</span>
              <span className="text-white">{data.responses.join(', ')}</span>
            </div>
          )}
          {data.hasLeftover && (
            <div className="mt-1 text-amber-400 text-xs font-medium bg-amber-900/30 px-2 py-1 rounded inline-block">
              ⚠️ Leftover observed
            </div>
          )}
          {recommendation && (
            <div className="mt-1 pt-1 border-t border-slate-800 text-xs text-slate-400 flex justify-between gap-2">
              <span>Target: {recommendation.totalDailyGrams}g</span>
              <span className={data.totalGrams >= recommendation.totalDailyGrams * 0.9 ? 'text-green-400' : 'text-amber-400'}>
                {Math.round((data.totalGrams / recommendation.totalDailyGrams) * 100)}%
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomWeeklyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm z-50">
          <p className="text-white font-medium mb-1 border-b border-slate-700 pb-1">{data.week}</p>
          <div className="flex justify-between gap-4 mt-1">
            <span className="text-slate-400">Total Fed:</span>
            <span className="font-bold text-sky-400">{(data.totalGrams / 1000).toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Daily Avg:</span>
            <span className="text-white">{Math.round(data.avgGramsPerDay)}g</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Days Fed:</span>
            <span className="text-white">{data.daysWithFeeding} / 7</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-slate-800 gap-3">
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setView('daily')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'daily' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            📅 Daily
          </button>
          <button 
            onClick={() => setView('weekly')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'weekly' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            📆 Weekly
          </button>
        </div>

        {showAllControls && view === 'daily' && onPeriodChange && (
          <div className="flex bg-slate-800 p-1 rounded-lg self-end sm:self-auto">
            {(['7d', '30d', '90d', 'all'] as const).map(p => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${period === p ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CHART AREA */}
      <div className="p-4 w-full" style={{ height: '300px' }}>
        {view === 'daily' ? (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={dailyWithMA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="shortDate" stroke="#475569" fontSize={10} tickMargin={8} minTickGap={20} />
              <YAxis stroke="#475569" fontSize={10} tickFormatter={(v) => `${v}g`} />
              <Tooltip content={<CustomDailyTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
              
              {recommendation && (
                <ReferenceLine 
                  y={recommendation.totalDailyGrams} 
                  stroke="#4ade80" 
                  strokeDasharray="5 5" 
                  label={{ position: 'insideTopLeft', value: 'Target', fill: '#4ade80', fontSize: 10 }}
                />
              )}

              <Bar dataKey="totalGrams" radius={[3, 3, 0, 0]} maxBarSize={40}>
                {dailyWithMA.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.totalGrams === 0 ? '#7f1d1d40' : entry.hasLeftover ? '#f59e0b' : '#0ea5e9'} 
                  />
                ))}
              </Bar>

              <Line 
                type="monotone" 
                dataKey="movingAvg" 
                stroke="#ffffff90" 
                strokeWidth={1.5} 
                strokeDasharray="4 4"
                dot={false}
                activeDot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="week" tickFormatter={(v) => v.split(' ')[0] + ' ' + v.split(' ')[1]} stroke="#475569" fontSize={10} tickMargin={8} />
              <YAxis stroke="#475569" fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomWeeklyTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
              
              {recommendation && (
                <ReferenceLine 
                  y={recommendation.totalDailyGrams * 7} 
                  stroke="#4ade80" 
                  strokeDasharray="5 5" 
                  label={{ position: 'insideTopLeft', value: 'Wk Target', fill: '#4ade80', fontSize: 10 }}
                />
              )}

              <Bar dataKey="totalGrams" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* FOOTER STATS */}
      {view === 'daily' && (
        <div className="bg-slate-800 p-3 flex justify-between text-xs text-slate-400 border-t border-slate-700">
          <div>Avg: <span className="text-white font-medium">{averageDailyGrams}g/day</span></div>
          {recommendation && (
            <div className={averageDailyGrams >= recommendation.totalDailyGrams * 0.9 ? 'text-green-400' : 'text-amber-400'}>
              {Math.round((averageDailyGrams / recommendation.totalDailyGrams) * 100)}% of target
            </div>
          )}
        </div>
      )}
    </div>
  );
};
