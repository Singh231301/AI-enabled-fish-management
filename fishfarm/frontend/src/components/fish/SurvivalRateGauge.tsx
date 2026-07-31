import React from 'react';
import { MortalitySummary } from '../../types/fish.types';

interface SurvivalRateGaugeProps {
  mortalitySummary: MortalitySummary;
}

export const SurvivalRateGauge: React.FC<SurvivalRateGaugeProps> = ({ mortalitySummary }) => {
  const { survivalRate } = mortalitySummary;
  const clampedRate = Math.min(100, Math.max(0, survivalRate));
  
  // SVG Circle calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedRate / 100) * circumference;
  
  let colorClass = 'text-red-500';
  if (clampedRate > 90) colorClass = 'text-green-500';
  else if (clampedRate > 80) colorClass = 'text-yellow-500';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center">
      <h3 className="text-lg font-bold text-gray-900 mb-6 self-start">Survival Rate</h3>
      
      <div className="relative flex items-center justify-center mb-4">
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClass} transition-all duration-1000 ease-in-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{clampedRate.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-2">
        <p>Estimated Alive: <span className="font-semibold text-gray-700">{mortalitySummary.estimatedAlive.toLocaleString()}</span></p>
        <p>Total Stocked: {mortalitySummary.totalStocked.toLocaleString()}</p>
      </div>
    </div>
  );
};
