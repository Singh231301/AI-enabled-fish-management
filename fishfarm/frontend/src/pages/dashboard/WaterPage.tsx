import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pondApi } from '../../api/endpoints/pond.api';
import { waterApi } from '../../api/endpoints/water.api';
import { Pond } from '../../types/pond.types';
import { WaterQualityStats, WaterQualityLog, WaterTreatmentLog, WaterAlert } from '../../types/water.types';
import { PHGauge } from '../../components/water/PHGauge';
import { PHtrendChart } from '../../components/water/PHtrendChart';
import { DOChart } from '../../components/water/DOChart';
import { WaterColorTimeline } from '../../components/water/WaterColorTimeline';
import { WaterQualityLogForm } from '../../components/water/WaterQualityLogForm';
import { WaterTreatmentForm } from '../../components/water/WaterTreatmentForm';
import { WaterStatusBadge } from '../../components/water/WaterStatusBadge';
import { WATER_COLOR_CONFIG, WATER_SMELL_CONFIG, CHEMICAL_TYPE_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Plus, TestTube2, AlertTriangle, CloudRain, Droplets, Info } from 'lucide-react';
import { format } from 'date-fns';

export const WaterPage: React.FC = () => {
  const { user } = useAuth();
  
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<string>('');
  
  const [stats, setStats] = useState<WaterQualityStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<WaterQualityLog[]>([]);
  const [recentTreatments, setRecentTreatments] = useState<WaterTreatmentLog[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  
  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WaterQualityLog | undefined>(undefined);
  const [selectedTreatment, setSelectedTreatment] = useState<WaterTreatmentLog | undefined>(undefined);

  useEffect(() => {
    fetchPonds();
  }, []);

  useEffect(() => {
    if (selectedPondId) {
      fetchWaterData(selectedPondId, period);
    }
  }, [selectedPondId, period]);

  const fetchPonds = async () => {
    try {
      const res = await pondApi.getUserPonds();
      if (res.success && res.data.length > 0) {
        setPonds(res.data);
        setSelectedPondId(res.data[0].id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Failed to load ponds');
      setIsLoading(false);
    }
  };

  const fetchWaterData = async (pondId: string, currentPeriod: '7d' | '30d' | '90d' | 'all') => {
    setIsLoading(true);
    try {
      const [statsRes, logsRes, treatmentsRes] = await Promise.all([
        waterApi.getWaterStats(pondId, currentPeriod),
        waterApi.getWaterQualityLogs(pondId, { page: 1, limit: 10 }),
        waterApi.getTreatmentLogs(pondId, { page: 1, limit: 5 })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (logsRes.success) setRecentLogs(logsRes.data);
      if (treatmentsRes.success) setRecentTreatments(treatmentsRes.data);
    } catch (error) {
      toast.error('Failed to load water data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogSuccess = (log: WaterQualityLog) => {
    setIsLogModalOpen(false);
    setSelectedLog(undefined);
    fetchWaterData(selectedPondId, period);
  };

  const handleTreatmentSuccess = (treatment: WaterTreatmentLog) => {
    setIsTreatmentModalOpen(false);
    setSelectedTreatment(undefined);
    fetchWaterData(selectedPondId, period);
  };

  const deleteLog = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this water reading?")) return;
    try {
      const res = await waterApi.deleteWaterQualityLog(id, selectedPondId);
      if (res.success) {
        toast.success("Log deleted");
        fetchWaterData(selectedPondId, period);
      }
    } catch (error) {
      toast.error("Failed to delete log");
    }
  };

  const deleteTreatment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this treatment record?")) return;
    try {
      const res = await waterApi.deleteWaterTreatment(id, selectedPondId);
      if (res.success) {
        toast.success("Treatment deleted");
        fetchWaterData(selectedPondId, period);
      }
    } catch (error) {
      toast.error("Failed to delete treatment");
    }
  };

  const getAlertIcon = (type: string) => {
    if (type === 'danger') return <AlertTriangle className="text-red-500" />;
    if (type === 'warning') return <AlertTriangle className="text-amber-500" />;
    return <Info className="text-sky-500" />;
  };

  if (ponds.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-slate-900 rounded-xl border border-slate-800">
        <Droplets size={64} className="text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Ponds Found</h2>
        <p className="text-slate-400 max-w-md text-center mb-6">
          You need to add a pond before you can manage water quality.
        </p>
      </div>
    );
  }

  const selectedPond = ponds.find(p => p.id === selectedPondId);
  const previousPH = stats?.phTrend.length! > 1 ? stats?.phTrend[stats.phTrend.length - 2]?.ph : undefined;

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER & POND SELECTOR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Droplets className="text-sky-400" /> Water Quality Management
          </h1>
          <p className="text-slate-400 mt-1">Monitor pH, DO, and log chemical treatments.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <select
            value={selectedPondId}
            onChange={(e) => setSelectedPondId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {ponds.map(pond => (
              <option key={pond.id} value={pond.id}>{pond.name}</option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <button 
              onClick={() => { setSelectedLog(undefined); setIsLogModalOpen(true); }}
              className="flex-1 sm:flex-none bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-900/20"
            >
              <TestTube2 size={18} />
              <span>Log Reading</span>
            </button>
            <button 
              onClick={() => { setSelectedTreatment(undefined); setIsTreatmentModalOpen(true); }}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>Treatment</span>
            </button>
          </div>
        </div>
      </div>

      {/* ALERTS (AI Recommendations) */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <div className="space-y-3">
          {stats.alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                alert.type === 'danger' ? 'bg-red-900/20 border-red-500/50' : 
                alert.type === 'warning' ? 'bg-amber-900/20 border-amber-500/50' : 
                'bg-sky-900/20 border-sky-500/50'
              }`}
            >
              <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <h4 className={`font-bold ${
                  alert.type === 'danger' ? 'text-red-400' : 
                  alert.type === 'warning' ? 'text-amber-400' : 
                  'text-sky-400'
                }`}>{alert.title}</h4>
                <p className="text-sm text-slate-300 mt-1">{alert.message}</p>
                {alert.action && (
                  <button 
                    onClick={() => {
                      if (alert.category === 'treatment') {
                        setIsTreatmentModalOpen(true);
                      } else {
                        setIsLogModalOpen(true);
                      }
                    }}
                    className={`mt-3 text-xs font-medium px-3 py-1.5 rounded-md ${
                      alert.type === 'danger' ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 
                      alert.type === 'warning' ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 
                      'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'
                    }`}
                  >
                    {alert.action}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEASONAL ADVICE */}
      {stats?.seasonalAdvice && (
        <div className="bg-gradient-to-r from-sky-900/40 to-slate-900 p-5 rounded-xl border border-sky-800/50 shadow-md">
          <div className="flex items-start gap-4">
            <div className="bg-sky-900/50 p-3 rounded-lg border border-sky-700/50 hidden sm:block">
              <CloudRain className="text-sky-400 w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-white">{stats.seasonalAdvice.season} Season Guide</h3>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">{stats.seasonalAdvice.months}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h4 className="text-sm font-semibold text-sky-400 mb-2 border-b border-sky-900/50 pb-1">Expected Conditions</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li><span className="text-slate-500">Temp:</span> {stats.seasonalAdvice.tempRange}</li>
                    <li><span className="text-slate-500">pH:</span> {stats.seasonalAdvice.phTendency}</li>
                    <li><span className="text-slate-500">DO Risk:</span> <span className={stats.seasonalAdvice.doRisk === 'HIGH' ? 'text-red-400 font-bold' : ''}>{stats.seasonalAdvice.doRisk}</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-400 mb-2 border-b border-amber-900/50 pb-1">Recommended Actions</h4>
                  <ul className="text-sm text-slate-300 space-y-1 list-disc pl-4">
                    {stats.seasonalAdvice.actions.slice(0, 3).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PHGauge 
            phValue={stats?.phStats?.latest ?? null} 
            phStatus={stats?.latestPHStatus ?? 'NO_DATA'}
            isLoading={isLoading}
            previousPH={previousPH}
          />
        </div>
        <div className="lg:col-span-2">
          <PHtrendChart 
            phTrend={stats?.phTrend ?? []} 
            isLoading={isLoading} 
            periodDays={stats?.periodDays ?? 30}
            onPeriodChange={setPeriod}
          />
        </div>
      </div>

      {/* DASHBOARD CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DOChart 
          doTrend={stats?.doTrend ?? []}
          doStats={stats?.doStats ?? { count: 0 } as any}
          isLoading={isLoading}
        />
        <WaterColorTimeline 
          logs={recentLogs}
          colorFrequency={stats?.colorFrequency ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* RECENT READINGS & TREATMENTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* RECENT LOGS */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Recent Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 bg-slate-800/50 uppercase border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">pH</th>
                  <th className="px-4 py-3">DO</th>
                  <th className="px-4 py-3">Color</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length > 0 ? (
                  recentLogs.map(log => (
                    <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {format(new Date(log.logDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        {log.phValue !== null ? (
                          <span className={`font-bold ${
                            log.phValue < 6.0 || log.phValue > 9.0 ? 'text-red-400' :
                            log.phValue < 7.0 || log.phValue > 8.5 ? 'text-amber-400' :
                            'text-green-400'
                          }`}>
                            {log.phValue.toFixed(2)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {log.dissolvedOxygenPpm !== null ? `${log.dissolvedOxygenPpm} ppm` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          {WATER_COLOR_CONFIG[log.waterColor]?.emoji} 
                          <span className="hidden sm:inline">{WATER_COLOR_CONFIG[log.waterColor]?.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setSelectedLog(log); setIsLogModalOpen(true); }} className="text-sky-400 hover:text-sky-300 px-2 py-1">Edit</button>
                        <button onClick={() => deleteLog(log.id)} className="text-red-400 hover:text-red-300 px-2 py-1 ml-2">Del</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No water quality logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT TREATMENTS */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Treatment History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 bg-slate-800/50 uppercase border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Chemical</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Reason</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTreatments.length > 0 ? (
                  recentTreatments.map(treatment => (
                    <tr key={treatment.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {format(new Date(treatment.treatmentDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-slate-200">{CHEMICAL_TYPE_CONFIG[treatment.chemicalType]?.emoji} {treatment.chemicalName}</span>
                          {treatment.phAfter && (
                            <span className="text-[10px] text-green-400">Success: pH {treatment.phAfter}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">
                        {treatment.quantityKg} kg
                      </td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[150px] hidden sm:table-cell">
                        {treatment.reason}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setSelectedTreatment(treatment); setIsTreatmentModalOpen(true); }} className="text-sky-400 hover:text-sky-300 px-2 py-1">Edit</button>
                        <button onClick={() => deleteTreatment(treatment.id)} className="text-red-400 hover:text-red-300 px-2 py-1 ml-2">Del</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No treatments logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {selectedPond && (
        <WaterQualityLogForm
          isOpen={isLogModalOpen}
          pondId={selectedPondId}
          existingLog={selectedLog}
          onSuccess={handleLogSuccess}
          onCancel={() => setIsLogModalOpen(false)}
        />
      )}

      {selectedPond && stats?.limeRecommendation && (
        <WaterTreatmentForm
          isOpen={isTreatmentModalOpen}
          pondId={selectedPondId}
          pondAreaAcres={selectedPond.areaAcres}
          limeRecommendation={stats.limeRecommendation}
          existingTreatment={selectedTreatment}
          currentPH={stats.phStats?.latest ?? null}
          onSuccess={handleTreatmentSuccess}
          onCancel={() => setIsTreatmentModalOpen(false)}
        />
      )}

    </div>
  );
};
