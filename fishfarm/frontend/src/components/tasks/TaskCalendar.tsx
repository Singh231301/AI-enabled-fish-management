import React, { useState, useEffect } from 'react';
import { CalendarDay, Task } from '../../types/tasks.types';
import { tasksApi } from '../../api/endpoints/tasks.api';
import { format, startOfWeek, addDays, getDay, isSameMonth, isToday, isPast } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface TaskCalendarProps {
  onTaskClick: (task: Task) => void;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCalendar = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await tasksApi.getCalendar(year, month);
      if (response.success) {
        setCalendarData(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate complete grid
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDayOfWeek = getDay(startDate);
  
  // Pad beginning of month
  const paddedDays: (CalendarDay | null)[] = Array(startDayOfWeek).fill(null);
  
  // Add actual days
  calendarData.forEach(day => {
    paddedDays.push(day);
  });
  
  // Pad end of month
  const totalSlots = Math.ceil(paddedDays.length / 7) * 7;
  while (paddedDays.length < totalSlots) {
    paddedDays.push(null);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-slate-800 rounded-xl  border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-lg font-bold text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())} 
            className="px-3 py-1 text-sm font-medium hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            Today
          </button>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-800/50/50">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-900 gap-px">
        {isLoading && paddedDays.length === 0 ? (
          <div className="col-span-7 p-12 text-center text-slate-400">Loading calendar...</div>
        ) : (
          paddedDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="bg-slate-800/50/50 min-h-[120px]"></div>;
            }

            const dateObj = new Date(day.date);
            const isCurrentMonth = isSameMonth(dateObj, currentDate);
            const today = isToday(dateObj);

            return (
              <div 
                key={day.date} 
                className={`bg-slate-800 min-h-[120px] p-2 hover:bg-slate-800/50 transition-colors flex flex-col ${!isCurrentMonth ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${today ? 'bg-sky-500 text-white ' : 'text-slate-300'}`}>
                    {dateObj.getDate()}
                  </span>
                  <div className="flex gap-1">
                    {day.hasOverdue && <div className="w-2 h-2 rounded-full bg-red-500" title="Overdue tasks"></div>}
                    {day.hasDueToday && !day.hasOverdue && <div className="w-2 h-2 rounded-full bg-blue-500" title="Due today"></div>}
                    {day.hasCompleted && day.pendingCount === 0 && <div className="w-2 h-2 rounded-full bg-green-500" title="All completed"></div>}
                  </div>
                </div>

                <div className="flex-1 space-y-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                  {day.tasks.slice(0, 4).map(task => (
                    <div 
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`text-xs px-1.5 py-1 rounded truncate cursor-pointer transition-colors ${
                        task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20 line-through opacity-70' :
                        task.status === 'OVERDUE' || (task.status === 'PENDING' && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))) ? 'bg-red-50 text-red-700 hover:bg-red-500/20 border border-red-100' :
                        'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-blue-100'
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {day.tasks.length > 4 && (
                    <div className="text-xs text-center text-slate-400 font-medium py-1 bg-slate-800/50 rounded">
                      +{day.tasks.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
