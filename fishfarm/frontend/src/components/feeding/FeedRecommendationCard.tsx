import React, { useState } from 'react';
import { FeedRecommendation, TodayFeedingStatus, FeedingSchedule } from '../../types/feeding.types';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeedRecommendationCardProps {
  recommendation: FeedRecommendation | null;
  todayStatus: TodayFeedingStatus;
  schedule: FeedingSchedule | null;
  fishAgeDays: number;
  onLogFeeding: () => void;
  isLoading: boolean;
}

export const FeedRecommendationCard: React.FC<FeedRecommendationCardProps> = ({
  recommendation,
  todayStatus,
  schedule,
  onLogFeeding,
  isLoading
}) => {
  const [showRationale, setShowRationale] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-slate-800 animate-pulse rounded-xl h-48 border border-slate-700 w-full mb-6"></div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-amber-400 font-bold text-lg flex items-center gap-2">
            <AlertCircle size={20} /> Stock Fish First
          </h3>
          <p className="text-amber-200/80 text-sm mt-1">You need to record fish stocking before you can get feeding recommendations.</p>
        </div>
        <Link to="/fish" className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium whitespace-nowrap">
          Go to Fish Tracking →
        </Link>
      </div>
    );
  }

  const { totalDailyGrams, perSessionGrams, feedRatePercent } = recommendation;
  const todayGrams = todayStatus.totalFedGrams || 0;
  const todaySessions = todayStatus.feedingCount || 0;
  const fedToday = todaySessions > 0;
  const { lastFeedTime } = todayStatus;
  const feedsPerDay = schedule?.feedsPerDay || 2;

  // Next feeding countdown estimate (rough logic based on schedule)
  let nextFeedingText = "";
  if (schedule) {
    const currentHour = new Date().getHours();
    const morningHour = schedule.morningTime ? parseInt(schedule.morningTime.split(':')[0]) : null;
    const eveningHour = schedule.eveningTime ? parseInt(schedule.eveningTime.split(':')[0]) : null;

    if (morningHour !== null && currentHour < morningHour) {
      nextFeedingText = `Next: Morning at ${schedule.morningTime}`;
    } else if (eveningHour !== null && currentHour < eveningHour) {
      nextFeedingText = `Next: Evening at ${schedule.eveningTime}`;
    } else if (morningHour !== null) {
      nextFeedingText = `Next: Tomorrow Morning at ${schedule.morningTime}`;
    }
  }

  const progressPercent = Math.min(100, Math.round((todayGrams / totalDailyGrams) * 100));
  let progressColor = "bg-amber-500";
  if (progressPercent >= 50) progressColor = "bg-sky-500";
  if (progressPercent >= 100) progressColor = "bg-green-500";

  return (
    <div className="bg-gradient-to-r from-sky-900/40 to-slate-800 rounded-xl border border-sky-700/40 mb-6 overflow-hidden">
      <div className="p-5 flex flex-col md:flex-row gap-6">
        
        {/* LEFT SECTION: Today's Status */}
        <div className="flex-1 md:border-r md:border-slate-700/50 pr-4">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">Today's Status</h3>
          
          {fedToday ? (
            <div>
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <CheckCircle2 size={24} />
                <span className="font-bold text-lg">Fed {todaySessions}x today</span>
              </div>
              <p className="text-white text-2xl font-bold mb-3">{todayGrams}g <span className="text-sm font-normal text-slate-400">fed total</span></p>
              
              <div className="mb-1 text-xs text-slate-300 flex justify-between">
                <span>{todayGrams}g / {totalDailyGrams}g recommended</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${progressColor} transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
              </div>
              
              {lastFeedTime && (
                <p className="text-xs text-slate-400 mt-3">
                  Last feed: {lastFeedTime}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 h-full">
              <span className="text-4xl animate-pulse mb-2">🐟</span>
              <p className="text-amber-400 font-bold">Not fed yet today</p>
            </div>
          )}
        </div>

        {/* MIDDLE SECTION: Recommendation */}
        <div className="flex-1 md:border-r md:border-slate-700/50 pr-4 text-center md:text-left flex flex-col justify-center">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Recommended Today</h3>
          
          <div className="text-5xl font-bold text-white mb-2 tracking-tight">
            {totalDailyGrams}<span className="text-2xl text-slate-400 ml-1">g</span>
          </div>
          
          <p className="text-sky-300 font-medium mb-3">
            Per session: {perSessionGrams}g × {feedsPerDay} feeds
          </p>
          
          <div>
            <span className="inline-block px-2.5 py-1 rounded bg-sky-900/50 text-sky-200 text-xs font-semibold border border-sky-700/50">
              {feedRatePercent}% of body weight
            </span>
          </div>
        </div>

        {/* RIGHT SECTION: Actions + Schedule */}
        <div className="flex-1 flex flex-col justify-center">
          <button 
            onClick={onLogFeeding}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-900/20 transition-all mb-4 text-lg"
          >
            Log Feeding
          </button>
          
          {schedule ? (
            <div className="bg-slate-800/50 rounded-lg p-3 text-sm border border-slate-700/50">
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">🌅 Morning</span>
                <span className="text-white font-medium">{schedule.morningTime || 'Not set'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">🌆 Evening</span>
                <span className="text-white font-medium">{schedule.eveningTime || 'Not set'}</span>
              </div>
              {nextFeedingText && (
                <div className="text-sky-400 text-xs text-center font-medium mt-2 pt-2 border-t border-slate-700">
                  {nextFeedingText}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-sm">
              <button className="text-sky-400 hover:text-sky-300 font-medium underline-offset-4 hover:underline">
                Set feeding schedule →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM BAR: Rationale */}
      <div className="border-t border-sky-800/30 bg-slate-900/40 p-3 px-5">
        <button 
          onClick={() => setShowRationale(!showRationale)}
          className="flex items-center gap-1.5 text-xs text-sky-300/80 hover:text-sky-300 font-medium w-full text-left"
        >
          💡 Why this amount? 
          {showRationale ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {showRationale && (
          <div className="mt-2 bg-slate-800/80 rounded-lg p-3 text-sm text-slate-300 border border-slate-700">
            {recommendation.rationale}
          </div>
        )}
      </div>
    </div>
  );
};
