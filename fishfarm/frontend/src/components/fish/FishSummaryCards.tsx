import React from 'react';
import { FishOverview } from '../../types/fish.types';
import { Fish, Skull, Activity, TrendingUp } from 'lucide-react';

interface FishSummaryCardsProps {
  overview: FishOverview;
}

export const FishSummaryCards: React.FC<FishSummaryCardsProps> = ({ overview }) => {
  const { mortalitySummary, growthSummary } = overview;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center text-gray-500 mb-2">
          <Fish className="w-5 h-5 mr-2 text-blue-500" />
          <h3 className="text-sm font-medium">Total Stocked</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">{mortalitySummary.totalStocked.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-1">Est. Alive: {mortalitySummary.estimatedAlive.toLocaleString()}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center text-gray-500 mb-2">
          <Activity className="w-5 h-5 mr-2 text-green-500" />
          <h3 className="text-sm font-medium">Survival Rate</h3>
        </div>
        <div className="flex items-end">
          <p className="text-2xl font-bold text-gray-900">{mortalitySummary.survivalRate.toFixed(1)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className={`h-1.5 rounded-full ${mortalitySummary.survivalRate > 90 ? 'bg-green-500' : mortalitySummary.survivalRate > 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(100, Math.max(0, mortalitySummary.survivalRate))}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center text-gray-500 mb-2">
          <Skull className="w-5 h-5 mr-2 text-red-500" />
          <h3 className="text-sm font-medium">Total Mortality</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">{mortalitySummary.totalMortality.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-1">Today: <span className="text-red-600 font-medium">{mortalitySummary.todayMortality}</span></p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center text-gray-500 mb-2">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
          <h3 className="text-sm font-medium">Current Avg Weight</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {growthSummary.latestSample ? `${growthSummary.latestSample.averageWeightGrams}g` : '-'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {growthSummary.latestSample && growthSummary.latestSample.variancePercent !== null ? (
            growthSummary.latestSample.variancePercent >= 0 
              ? <span className="text-green-600">+{growthSummary.latestSample.variancePercent.toFixed(1)}% vs benchmark</span>
              : <span className="text-red-600">{growthSummary.latestSample.variancePercent.toFixed(1)}% vs benchmark</span>
          ) : 'No samples recorded'}
        </p>
      </div>
    </div>
  );
};
