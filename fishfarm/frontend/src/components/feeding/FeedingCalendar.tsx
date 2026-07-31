import React, { useState } from 'react';
import { DailyFeedTotal } from '../../types/feeding.types';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday,
  subMonths,
  addMonths,
  isFuture
} from 'date-fns';

interface FeedingCalendarProps {
  dailyTrend: DailyFeedTotal[];
  currentMonth: Date;
  onDayClick: (date: string) => void;
  isLoading: boolean;
}

export const FeedingCalendar: React.FC<FeedingCalendarProps> = ({
  dailyTrend, currentMonth: initialMonth, onDayClick, isLoading
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialMonth));

  if (isLoading) {
    return <div className="bg-slate-800 animate-pulse rounded-xl h-80 border border-slate-700 w-full mb-6"></div>;
  }

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => {
    if (!isFuture(addMonths(currentMonth, 1))) {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "yyyy-MM-dd";
  const rows = [];
  let days = [];
  let day = startDate;

  // Build trend map for fast lookup
  const trendMap = new Map(dailyTrend.map(t => [t.date, t]));

  let daysFedThisMonth = 0;
  let totalGramsThisMonth = 0;
  let currentStreak = 0;
  let tempStreak = 0;
  let maxGramsDay = { date: '', grams: 0 };
  let validDaysInMonth = 0; // days up to today

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const formattedDate = format(cloneDay, dateFormat);
      const isCurrentMonth = isSameMonth(cloneDay, monthStart);
      const isDayFuture = isFuture(cloneDay) && !isToday(cloneDay);
      const isDayToday = isToday(cloneDay);
      
      const dayData = trendMap.get(formattedDate);
      
      if (isCurrentMonth && !isDayFuture) {
        validDaysInMonth++;
        if (dayData && dayData.totalGrams > 0) {
          daysFedThisMonth++;
          totalGramsThisMonth += dayData.totalGrams;
          tempStreak++;
          if (dayData.totalGrams > maxGramsDay.grams) {
            maxGramsDay = { date: formattedDate, grams: dayData.totalGrams };
          }
        } else {
          currentStreak = tempStreak;
          tempStreak = 0;
        }
      }

      // Determine cell color
      let bgColor = 'bg-slate-800 opacity-30';
      if (!isDayFuture && isCurrentMonth) {
        if (!dayData || dayData.totalGrams === 0) {
          bgColor = 'bg-red-900/40 hover:bg-red-900/60';
        } else if (dayData.sessions === 1) {
          bgColor = 'bg-sky-700/60 hover:bg-sky-700/80';
        } else if (dayData.sessions === 2) {
          bgColor = 'bg-sky-500/80 hover:bg-sky-500';
        } else if (dayData.sessions >= 3) {
          bgColor = 'bg-sky-400 hover:bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]';
        }
      }

      days.push(
        <div
          key={cloneDay.toISOString()}
          onClick={() => (!isDayFuture ? onDayClick(formattedDate) : null)}
          title={dayData ? `${formattedDate} — ${dayData.totalGrams}g (${dayData.sessions} sessions)` : formattedDate}
          className={`
            relative w-8 h-8 sm:w-10 sm:h-10 rounded-md m-0.5 sm:m-1 cursor-pointer transition-all flex items-center justify-center
            ${!isDayCurrentMonth ? 'opacity-20 pointer-events-none' : ''}
            ${isDayFuture ? 'opacity-20 pointer-events-none bg-slate-800' : bgColor}
            ${isDayToday ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}
          `}
        >
          <span className="text-[10px] sm:text-xs font-medium text-white/50">{format(cloneDay, 'd')}</span>
          {dayData?.hasLeftover && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
          )}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="flex justify-center" key={day.toISOString()}>
        {days}
      </div>
    );
    days = [];
  }
  
  if (tempStreak > currentStreak && isCurrentMonth) currentStreak = tempStreak;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-slate-800">
        <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-white font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button 
          onClick={nextMonth} 
          disabled={isSameMonth(currentMonth, new Date())}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* CALENDAR BODY */}
      <div className="p-4 overflow-x-auto flex flex-col items-center">
        <div className="flex justify-center text-xs font-medium text-slate-500 mb-2 w-full max-w-[400px]">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
             <div key={day} className="w-8 sm:w-10 m-0.5 sm:m-1 text-center">{day}</div>
          ))}
        </div>
        <div className="flex flex-col items-center">
          {rows}
        </div>

        {/* LEGEND */}
        <div className="flex flex-wrap justify-center items-center gap-3 mt-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-900/40"></div> Not Fed</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-sky-700/60"></div> 1x</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-sky-500/80"></div> 2x</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-sky-400 shadow-[0_0_4px_rgba(56,189,248,0.5)]"></div> 3x+</div>
          <div className="flex items-center gap-1.5 ml-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Leftover</div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="bg-slate-800 p-4 border-t border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-xs text-slate-400 mb-1">Days Fed</p>
          <p className="text-lg font-semibold text-white">
            {daysFedThisMonth} <span className="text-sm text-slate-500">/ {validDaysInMonth}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Total Feed</p>
          <p className="text-lg font-semibold text-white">{(totalGramsThisMonth / 1000).toFixed(1)} kg</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Daily Avg</p>
          <p className="text-lg font-semibold text-white">
            {daysFedThisMonth > 0 ? Math.round(totalGramsThisMonth / daysFedThisMonth) : 0} g
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Current Streak</p>
          <p className="text-lg font-semibold text-orange-400 flex items-center justify-center gap-1">
            {currentStreak} {currentStreak > 0 ? '🔥' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};
