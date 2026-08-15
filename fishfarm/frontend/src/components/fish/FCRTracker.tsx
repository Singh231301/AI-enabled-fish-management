import React from 'react';
import { GrowthSummary } from '../../types/fish.types';
import { Scale } from 'lucide-react';

interface FCRTrackerProps {
  growthSummary: GrowthSummary;
}

export const FCRTracker: React.FC<FCRTrackerProps> = ({ growthSummary }) => {
  const { fcr } = growthSummary;

  return (
    <div className="bg-slate-800 p-6 rounded-lg  border border-slate-700 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <Scale className="w-5 h-5 text-indigo-500 mr-2" />
        <h3 className="text-lg font-bold text-white">Feed Conversion Ratio</h3>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {fcr !== null ? (
          <>
            <div className="text-5xl font-bold text-indigo-600 mb-2">
              {fcr.toFixed(2)}
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              kg of feed required to produce 1 kg of fish biomass. Lower is better.
            </p>
            
            <div className="mt-6 w-full bg-slate-700 rounded-lg p-3 text-sm text-slate-300">
              <div className="flex justify-between mb-1">
                <span>Excellent</span>
                <span>{'< 1.2'}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Good</span>
                <span>{'1.2 - 1.5'}</span>
              </div>
              <div className="flex justify-between">
                <span>Needs Improvement</span>
                <span>{'> 1.5'}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-500 flex flex-col items-center">
            <span className="text-3xl font-light mb-2">N/A</span>
            <p className="text-sm">Feeding data required to calculate FCR.</p>
            <p className="text-xs mt-1 text-slate-500 italic">(Available in Phase 3)</p>
          </div>
        )}
      </div>
    </div>
  );
};
