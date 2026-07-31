import React, { useState } from 'react';
import { WaterQualityLog, ColorFrequency } from '../../types/water.types';
import { WATER_COLOR_CONFIG } from '../../utils/constants';

interface WaterColorTimelineProps {
  logs: WaterQualityLog[];
  colorFrequency: ColorFrequency[];
  isLoading: boolean;
}

export const WaterColorTimeline: React.FC<WaterColorTimelineProps> = ({
  logs,
  colorFrequency,
  isLoading
}) => {
  const [showGuide, setShowGuide] = useState(false);

  if (isLoading) {
    return <div className="h-64 w-full animate-pulse bg-slate-800 rounded-xl"></div>;
  }

  const timelineLogs = [...logs]
    .filter(l => l.waterColor)
    .sort((a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime())
    .slice(-30);

  const getTrendObservation = () => {
    if (timelineLogs.length < 14) return null;
    const last7 = timelineLogs.slice(-7);
    const prev7 = timelineLogs.slice(-14, -7);
    
    const riskScore = (color: string) => {
      const risk = WATER_COLOR_CONFIG[color]?.risk;
      if (risk === 'GOOD') return 1;
      if (risk === 'MODERATE') return 2;
      return 3;
    };

    const avgLast7 = last7.reduce((s, l) => s + riskScore(l.waterColor), 0) / 7;
    const avgPrev7 = prev7.reduce((s, l) => s + riskScore(l.waterColor), 0) / 7;

    if (avgLast7 > avgPrev7 + 0.2) return { text: "⚠️ Water color trending darker recently", class: "text-amber-400" };
    if (avgLast7 < avgPrev7 - 0.2) return { text: "✅ Water color improving", class: "text-green-400" };
    return { text: "✅ Water color has been consistent", class: "text-slate-400" };
  };

  const trend = getTrendObservation();

  return (
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span>💧 Water Color History</span>
        </h3>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs text-sky-400 hover:text-sky-300 font-medium"
        >
          {showGuide ? "Hide Guide" : "What does each color mean?"}
        </button>
      </div>

      {showGuide && (
        <div className="mb-6 bg-slate-800 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border border-slate-700">
          {Object.entries(WATER_COLOR_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="mt-0.5">{config.emoji}</span>
              <div>
                <span className="font-semibold text-slate-200">{config.label}:</span>{' '}
                <span className="text-slate-400">{config.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FREQUENCY BARS */}
      {colorFrequency.length > 0 ? (
        <div className="space-y-3 mb-8">
          {colorFrequency.map((cf) => {
            const config = WATER_COLOR_CONFIG[cf.waterColor];
            if (!config) return null;
            return (
              <div key={cf.waterColor} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-slate-300 truncate" title={config.label}>
                  {config.label}
                </div>
                <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${cf.percentage}%`,
                      backgroundColor: cf.waterColor === 'CLEAR' ? '#bae6fd' :
                                       cf.waterColor === 'LIGHT_GREEN' ? '#4ade80' :
                                       cf.waterColor === 'DARK_GREEN' ? '#15803d' :
                                       cf.waterColor === 'BROWN' ? '#b45309' :
                                       cf.waterColor === 'CLOUDY' ? '#94a3b8' : '#0f172a'
                    }}
                  />
                </div>
                <div className="w-12 text-right text-xs text-slate-400">
                  {cf.percentage.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-slate-400 text-sm mb-6">No color readings available.</div>
      )}

      {/* TIMELINE */}
      {timelineLogs.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Last 30 Readings (Oldest → Newest)</h4>
          <div className="flex flex-wrap gap-1">
            {timelineLogs.map((log) => {
              const config = WATER_COLOR_CONFIG[log.waterColor];
              const dateObj = new Date(log.logDate);
              const dateStr = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}`;
              return (
                <div 
                  key={log.id} 
                  className="w-6 h-6 rounded-sm relative group cursor-pointer"
                  style={{
                    backgroundColor: log.waterColor === 'CLEAR' ? '#bae6fd' :
                                     log.waterColor === 'LIGHT_GREEN' ? '#4ade80' :
                                     log.waterColor === 'DARK_GREEN' ? '#15803d' :
                                     log.waterColor === 'BROWN' ? '#b45309' :
                                     log.waterColor === 'CLOUDY' ? '#94a3b8' : '#0f172a',
                    border: log.waterColor === 'BLACK' ? '1px solid #475569' : 'none'
                  }}
                  title={`${dateStr} — ${config?.label}`}
                >
                  <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-slate-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap z-10 border border-slate-700 shadow-xl">
                    {dateStr}: {config?.label}
                  </div>
                </div>
              );
            })}
          </div>
          
          {trend && (
            <div className={`mt-3 text-sm font-medium ${trend.class}`}>
              {trend.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
