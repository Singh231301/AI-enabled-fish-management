import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Droplets, TrendingUp, TrendingDown } from 'lucide-react';

interface FCRDashboardProps {
  fcr: number | null;
  fcrInterpretation: string;
  totalFeedKg: number;
  weightGainKg: number;
  currentBiomassKg: number;
  averageDailyGrams: number;
  isLoading: boolean;
}

export const FCRDashboard: React.FC<FCRDashboardProps> = ({
  fcr, fcrInterpretation, totalFeedKg, weightGainKg, currentBiomassKg, averageDailyGrams, isLoading
}) => {
  const [showUnderstanding, setShowUnderstanding] = useState(false);

  if (isLoading) {
    return <div className="bg-slate-800 animate-pulse rounded-xl h-80 border border-slate-700 w-full mb-6"></div>;
  }

  if (fcr === null) {
    return (
      <div className="bg-slate-900 rounded-xl border border-dashed border-slate-600 p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px] mb-6">
        <div className="w-14 h-14 bg-amber-900/30 text-amber-400 rounded-full flex items-center justify-center mb-4">
          <Droplets size={28} />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">FCR Calculation Pending</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-xs">
          More data is needed to calculate the Feed Conversion Ratio.
        </p>
        
        <div className="space-y-3 w-full max-w-xs text-sm text-left bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-3 text-green-400">
            ✅ <span>Fish stocked</span>
          </div>
          <div className={weightGainKg > 0 ? "flex items-center gap-3 text-green-400" : "flex items-center gap-3 text-amber-400"}>
            {weightGainKg > 0 ? '✅' : '❌'} <span>Growth sample recorded</span>
          </div>
          <div className={totalFeedKg > 0 ? "flex items-center gap-3 text-green-400" : "flex items-center gap-3 text-amber-400"}>
            {totalFeedKg > 0 ? '✅' : '❌'} <span>Feeding logs recorded</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">Log at least 7 days of feeding to see trends.</p>
      </div>
    );
  }

  // FCR Gauge Logic
  // 0 - 1.2 (Exc), 1.2 - 1.5 (Excl), 1.5 - 1.8 (Good), 1.8 - 2.2 (Avg), 2.2 - 3.0 (Poor)
  const getZoneColor = (val: number) => {
    if (val <= 1.2) return 'text-green-400';
    if (val <= 1.8) return 'text-sky-400';
    if (val <= 2.2) return 'text-amber-400';
    return 'text-red-400';
  };
  
  const fcrColor = getZoneColor(fcr);
  
  // Calculate position percentage (clamped 0.5 to 3.0)
  const minFcr = 0.5;
  const maxFcr = 3.0;
  const clampedFcr = Math.max(minFcr, Math.min(maxFcr, fcr));
  const markerPosition = ((clampedFcr - minFcr) / (maxFcr - minFcr)) * 100;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 shadow-lg h-full flex flex-col mb-6">
      <div className="mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-white font-bold flex items-center gap-2 text-lg">
          📊 Feed Conversion Ratio (FCR)
        </h3>
        <p className="text-sm text-slate-400 mt-1">How efficiently feed converts to fish biomass</p>
      </div>

      <div className="flex flex-col items-center justify-center mb-8">
        <div className={`text-6xl font-bold mb-2 tracking-tight ${fcrColor}`}>
          {fcr.toFixed(2)}
        </div>
        <div className={`text-sm font-medium px-3 py-1 rounded-full bg-slate-800 border ${fcrColor.replace('text', 'border')}`}>
          {fcrInterpretation.split('—')[0].trim()}
        </div>
        
        {/* Gauge Bar */}
        <div className="w-full max-w-sm mt-8 relative">
          <div className="h-4 flex rounded-full overflow-hidden w-full bg-slate-800">
            <div className="bg-green-500 h-full" style={{ width: '28%' }} title="Exceptional (<1.2)"></div>
            <div className="bg-sky-400 h-full" style={{ width: '24%' }} title="Good (1.2-1.8)"></div>
            <div className="bg-amber-400 h-full" style={{ width: '16%' }} title="Average (1.8-2.2)"></div>
            <div className="bg-red-500 h-full" style={{ width: '32%' }} title="Poor (>2.2)"></div>
          </div>
          
          {/* Marker */}
          <div className="absolute top-4 -translate-x-1/2 transition-all duration-1000" style={{ left: `${markerPosition}%` }}>
            <div className={`w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent ${fcrColor.replace('text', 'border-b')}`}></div>
          </div>
          
          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
            <span>0.5</span>
            <span>1.2</span>
            <span>1.8</span>
            <span>2.2</span>
            <span>3.0+</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
        <div>
          <div className="text-xs text-slate-400 mb-1">Feed Given</div>
          <div className="text-lg font-bold text-white">{totalFeedKg.toFixed(1)} kg</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Weight Gained</div>
          <div className="text-lg font-bold text-white">{weightGainKg.toFixed(1)} kg</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Current Biomass</div>
          <div className="text-lg font-bold text-white">{currentBiomassKg.toFixed(1)} kg</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Avg Daily Feed</div>
          <div className="text-lg font-bold text-white">{averageDailyGrams} g/day</div>
        </div>
        <div className="col-span-2 pt-3 border-t border-slate-700">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Formula Calculation</div>
          <div className="font-mono text-sm text-sky-300">
            {totalFeedKg.toFixed(1)}kg ÷ {weightGainKg.toFixed(1)}kg = {fcr.toFixed(2)}
          </div>
        </div>
      </div>

      {fcr > 1.8 && (
        <div className="bg-amber-900/20 border border-amber-700/50 p-4 rounded-xl mb-4">
          <h4 className="text-amber-400 font-semibold flex items-center gap-2 mb-2 text-sm">
            <TrendingDown size={16} /> To Improve FCR:
          </h4>
          <ul className="text-xs text-amber-200/80 space-y-1.5 list-disc pl-4">
            <li>Feed exactly the recommended quantity (avoid overfeeding).</li>
            <li>Check feed quality — use fresh, high-protein pellets.</li>
            <li>Remove leftover feed if observed consistently.</li>
            <li>Check dissolved oxygen — low DO reduces feed efficiency.</li>
          </ul>
        </div>
      )}

      <div className="mt-auto border-t border-slate-800 pt-3">
        <button 
          onClick={() => setShowUnderstanding(!showUnderstanding)}
          className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-300 font-medium"
        >
          <span className="flex items-center gap-1.5">💡 Understanding FCR</span>
          {showUnderstanding ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {showUnderstanding && (
          <div className="mt-3 bg-slate-800 rounded-lg p-3 text-xs text-slate-300 leading-relaxed">
            <p className="mb-2">
              A FCR of <strong className="text-white">{fcr.toFixed(2)}</strong> means your fish need <strong className="text-white">{fcr.toFixed(2)} kg</strong> of feed to gain 1 kg of weight.
            </p>
            <p>
              Pangasius benchmark: 1.5 – 1.8 <br/>
              {fcr <= 1.8 ? <span className="text-green-400">Your farm is performing within benchmark. ✅</span> : <span className="text-amber-400">Your FCR is above benchmark. Review feeding practices.</span>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
