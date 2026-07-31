import React from 'react';
import { GrowthSummary } from '../../types/fish.types';
import { Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';

interface BenchmarkComparisonProps {
  growthSummary: GrowthSummary;
}

export const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({ growthSummary }) => {
  const { latestSample, estimatedHarvestDate, gramsPerDay } = growthSummary;

  if (!latestSample) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Benchmark Comparison</h3>
        <p className="text-gray-500 text-sm">No growth samples recorded yet.</p>
      </div>
    );
  }

  const { variancePercent, averageWeightGrams, benchmarkWeight, fishAgeWeeks } = latestSample;
  
  const isAhead = variancePercent !== null && variancePercent > 0;
  const isBehind = variancePercent !== null && variancePercent < 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Benchmark Comparison</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Actual Weight (Week {Math.floor(fishAgeWeeks)})</p>
          <p className="text-2xl font-bold text-gray-900">{averageWeightGrams}g</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Benchmark Expected</p>
          <p className="text-2xl font-bold text-gray-900">{benchmarkWeight ? `${benchmarkWeight}g` : 'N/A'}</p>
        </div>
      </div>

      {variancePercent !== null && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isAhead ? 'bg-green-50 border-green-200 text-green-800' : 
          isBehind && variancePercent < -15 ? 'bg-red-50 border-red-200 text-red-800' : 
          'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center font-semibold mb-1">
            <Target className="w-5 h-5 mr-2" />
            {isAhead ? 'Ahead of Benchmark' : isBehind ? 'Behind Benchmark' : 'On Track'}
          </div>
          <p className="text-sm">
            Current weight is <span className="font-bold">{Math.abs(variancePercent).toFixed(1)}% {isAhead ? 'higher' : 'lower'}</span> than the standard benchmark for this age.
          </p>
        </div>
      )}

      {estimatedHarvestDate && (
        <div className="flex items-start">
          <Calendar className="w-10 h-10 text-blue-500 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Estimated Harvest</h4>
            <p className="text-sm text-gray-600 mb-1">
              Target 700g on <span className="font-bold text-gray-900">{format(new Date(estimatedHarvestDate), 'MMM d, yyyy')}</span>
            </p>
            {gramsPerDay && (
              <p className="text-xs text-gray-500">Current growth rate: {gramsPerDay.toFixed(1)}g / day</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
