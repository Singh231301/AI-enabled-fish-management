import React from 'react';
import { WeatherData } from '../../types/dashboard.types';
import { Cloud, Droplets, Wind, Umbrella, RefreshCw } from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  isLoading: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 w-full animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="w-24 h-16 bg-slate-700 rounded-lg"></div>
          <div className="w-32 h-24 bg-slate-700 rounded-lg"></div>
        </div>
        <div className="w-full h-16 bg-slate-700 rounded-lg mb-4"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-20 bg-slate-700 rounded-lg"></div>
          <div className="flex-1 h-20 bg-slate-700 rounded-lg"></div>
          <div className="flex-1 h-20 bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 w-full flex flex-col items-center justify-center min-h-[300px]">
        <Cloud size={48} className="text-slate-500 mb-4" />
        <h3 className="text-lg font-medium text-slate-300">Weather unavailable</h3>
        <p className="text-sm text-slate-400 mt-1 mb-4 text-center">Could not fetch weather data for your location.</p>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-200 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { current, forecast, pondImpact } = weather;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-5 border border-slate-600 w-full shadow-lg shadow-black/20">
      {/* TOP SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl drop-shadow-md">{current.weatherEmoji}</div>
          <div>
            <div className="text-3xl font-bold text-white tracking-tight">{Math.round(current.temperature)}°C</div>
            <div className="text-slate-300 font-medium">{current.weatherDescription}</div>
            <div className="text-sm text-slate-400 mt-0.5">Feels {current.feelsLike}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-slate-800/50 p-3 rounded-xl border border-slate-600/50">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-sky-400" />
            <div>
              <div className="text-xs text-slate-400 uppercase">Humidity</div>
              <div className="text-sm font-medium text-white">{current.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind size={16} className="text-teal-400" />
            <div>
              <div className="text-xs text-slate-400 uppercase">Wind</div>
              <div className="text-sm font-medium text-white">{current.windSpeed} km/h</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Umbrella size={16} className="text-indigo-400" />
            <div>
              <div className="text-xs text-slate-400 uppercase">Rain</div>
              <div className="text-sm font-medium text-white">{current.precipitation} mm</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Cloud size={16} className="text-slate-400" />
            <div>
              <div className="text-xs text-slate-400 uppercase">Cloud</div>
              <div className="text-sm font-medium text-white">{current.cloudCover}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* POND IMPACT SECTION */}
      <div className="bg-slate-700/50 rounded-lg p-3.5 mb-5 border border-slate-600/50">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
          <span>🐟</span> Pond Impact
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed">
          {pondImpact}
        </p>
      </div>

      {/* 3-DAY FORECAST */}
      <div className="grid grid-cols-3 gap-2">
        {forecast.map((day, idx) => (
          <div key={idx} className="bg-slate-700/50 hover:bg-slate-700 transition-colors rounded-lg p-2.5 text-center border border-slate-600/30">
            <div className="text-xs font-medium text-slate-300 mb-1">{day.date}</div>
            <div className="text-2xl mb-1.5 drop-shadow-sm">{day.weatherEmoji}</div>
            <div className="text-sm font-bold text-white">
              {Math.round(day.maxTemp)}° <span className="text-slate-400 text-xs font-normal">/ {Math.round(day.minTemp)}°</span>
            </div>
            {day.precipitationSum > 0 && (
              <div className="text-[10px] text-sky-400 mt-0.5 font-medium">
                {day.precipitationSum}mm
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
