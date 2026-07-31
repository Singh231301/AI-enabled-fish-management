import React from 'react';
import { PHStatus } from '../../types/water.types';
import { PH_STATUS_CONFIG } from '../../utils/constants';

interface PHGaugeProps {
  phValue: number | null;
  phStatus: PHStatus;
  isLoading: boolean;
  previousPH?: number | null;
}

export const PHGauge: React.FC<PHGaugeProps> = ({ phValue, phStatus, isLoading, previousPH }) => {
  if (isLoading) {
    return <div className="h-40 w-full animate-pulse bg-slate-800 rounded-xl"></div>;
  }

  const getPosition = (val: number) => {
    // 0 to 14 mapped to 0% to 100%
    return Math.max(0, Math.min(100, (val / 14) * 100));
  };

  const needlePosition = phValue !== null ? getPosition(phValue) : 50;

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-100 mb-6 flex justify-between items-center">
        <span>🧪 pH Level</span>
      </h3>

      <div className="relative pt-12 pb-8">
        {/* Value Display */}
        <div className="absolute top-0 w-full flex justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-white drop-shadow-md">
              {phValue !== null ? phValue.toFixed(2) : '?'}
            </div>
            {previousPH !== undefined && previousPH !== null && phValue !== null && (
              <div className={`text-sm mt-1 font-medium ${phValue > previousPH ? 'text-amber-400' : phValue < previousPH ? 'text-sky-400' : 'text-slate-400'}`}>
                {phValue > previousPH ? '↑' : phValue < previousPH ? '↓' : ''} vs last ({previousPH.toFixed(2)})
              </div>
            )}
          </div>
        </div>

        {/* Gradient Bar */}
        <div className="relative h-6 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-red-500 overflow-hidden shadow-inner">
          {/* Optimal Zone Highlight */}
          <div 
            className="absolute top-0 bottom-0 bg-green-500" 
            style={{ left: `${getPosition(7.0)}%`, right: `${100 - getPosition(8.5)}%` }}
          />
        </div>

        {/* Needle */}
        {phValue !== null && (
          <div 
            className="absolute top-10 -ml-3 w-6 h-10 transition-all duration-700 ease-in-out z-10"
            style={{ left: `${needlePosition}%` }}
          >
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-white filter drop-shadow-lg" />
          </div>
        )}

        {/* Scale Marks */}
        <div className="absolute top-[88px] w-full flex justify-between text-xs text-slate-400 font-medium px-1">
          <span>0</span>
          <span>7</span>
          <span>14</span>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        {phValue !== null ? (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${PH_STATUS_CONFIG[phStatus].bgColor} ${PH_STATUS_CONFIG[phStatus].color}`}>
            <span>{PH_STATUS_CONFIG[phStatus].emoji}</span>
            <span>{PH_STATUS_CONFIG[phStatus].label}</span>
          </span>
        ) : (
          <div className="text-center text-slate-400 text-sm">
            <p>No pH reading recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
