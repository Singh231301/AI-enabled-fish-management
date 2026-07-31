import React, { useState } from 'react';
import { ResponseBreakdown, DailyFeedTotal } from '../../types/feeding.types';
import { FISH_RESPONSE_CONFIG } from '../../utils/constants';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

interface FeedResponseChartProps {
  responseBreakdown: ResponseBreakdown[];
  dailyTrend?: DailyFeedTotal[];
  isLoading: boolean;
  showBothViews?: boolean;
  showTrendLine?: boolean;
}

export const FeedResponseChart: React.FC<FeedResponseChartProps> = ({
  responseBreakdown, dailyTrend = [], isLoading, showBothViews = false, showTrendLine = false
}) => {
  const [view, setView] = useState<'breakdown' | 'trend'>('breakdown');

  if (isLoading) {
    return <div className="bg-slate-800 animate-pulse rounded-xl h-64 border border-slate-700 w-full mb-6"></div>;
  }

  // Calculate Health Score
  const weights: Record<string, number> = {
    EXCELLENT: 5, GOOD: 4, FAIR: 3, POOR: 2, REFUSED: 1
  };
  
  let totalScore = 0;
  let totalLogs = 0;
  responseBreakdown.forEach(b => {
    totalScore += (weights[b.response] || 0) * b.count;
    totalLogs += b.count;
  });
  
  const healthScore = totalLogs > 0 ? (totalScore / totalLogs) : 0;
  
  // Interpretation
  let interpretation = "Keep logging feeding sessions to get an overall score.";
  if (totalLogs > 0) {
    if (healthScore >= 4.5) interpretation = "🌟 Excellent! Fish are consistently eager to feed.";
    else if (healthScore >= 3.5) interpretation = "✅ Good feeding behavior overall.";
    else if (healthScore >= 2.5) interpretation = "⚠️ Mixed responses. Review water quality on poor days.";
    else interpretation = "🚨 Frequent poor responses. Check water quality and fish health.";
  }

  // Trend Data for chart
  const trendData = dailyTrend.map(d => {
    let dayScore = null;
    if (d.responses.length > 0) {
      const s = d.responses.reduce((sum, r) => sum + (weights[r] || 0), 0);
      dayScore = s / d.responses.length;
    }
    return {
      date: d.date.substring(5), // MM-DD
      displayDate: d.displayDate,
      score: dayScore
    };
  }).filter(d => d.score !== null);

  const CustomTrendTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl text-xs z-50">
          <p className="text-white font-medium mb-1">{data.displayDate}</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Score:</span>
            <span className="font-bold text-sky-400">{data.score.toFixed(1)} / 5.0</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-400 bg-green-500';
    if (score >= 3.5) return 'text-sky-400 bg-sky-500';
    if (score >= 2.5) return 'text-amber-400 bg-amber-500';
    if (score >= 1.5) return 'text-orange-400 bg-orange-500';
    return 'text-red-400 bg-red-500';
  };

  const colorClass = getScoreColor(healthScore).split(' ')[0];
  const bgClass = getScoreColor(healthScore).split(' ')[1];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-slate-800">
        <h3 className="text-white font-bold flex items-center gap-2">🐟 Fish Response Quality</h3>
        
        {(showBothViews || showTrendLine) && dailyTrend.length > 0 && (
          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setView('breakdown')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === 'breakdown' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Bars
            </button>
            <button 
              onClick={() => setView('trend')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === 'trend' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Trend
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col justify-center">
        {view === 'breakdown' ? (
          <>
            <div className="space-y-4 mb-6">
              {['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'REFUSED'].map(key => {
                const config = FISH_RESPONSE_CONFIG[key as keyof typeof FISH_RESPONSE_CONFIG];
                const data = responseBreakdown.find(b => b.response === key);
                const percent = data ? Math.round(data.percentage) : 0;
                const count = data ? data.count : 0;
                
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-24 flex items-center gap-1.5 text-sm font-medium text-slate-300">
                      <span>{config.emoji}</span> {config.label}
                    </div>
                    <div className="flex-grow bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className={`h-full ${config.bgColor.replace('/20', '')}`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="w-24 text-right text-xs text-slate-400">
                      <span className="font-bold text-slate-300 mr-1">{percent}%</span> 
                      ({count})
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center">
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Overall Health Score</div>
              <div className={`text-3xl font-bold mb-2 ${colorClass}`}>
                {healthScore.toFixed(1)} <span className="text-lg text-slate-500">/ 5.0</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mb-3 max-w-xs mx-auto overflow-hidden">
                <div className={`h-full ${bgClass}`} style={{ width: `${(healthScore / 5) * 100}%` }}></div>
              </div>
              <p className="text-sm text-slate-300">{interpretation}</p>
            </div>
          </>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickMargin={8} minTickGap={20} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#475569" fontSize={10} />
                <Tooltip content={<CustomTrendTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
                
                <ReferenceArea y1={3.5} y2={5} fill="#4ade80" fillOpacity={0.05} />
                <ReferenceArea y1={1} y2={2.5} fill="#ef4444" fillOpacity={0.05} />

                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#38bdf8" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#38bdf8', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: '#38bdf8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
