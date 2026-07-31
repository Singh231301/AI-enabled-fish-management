import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { feedingApi } from '../../api/endpoints/feeding.api';
import { 
  FeedingOverview, 
  FeedingLog, 
  TodayFeedingStatus, 
  FeedingStats, 
  FeedingSchedule,
  FeedRecommendation
} from '../../types/feeding.types';
import toast from 'react-hot-toast';

// Components
import { FeedRecommendationCard } from '../../components/feeding/FeedRecommendationCard';
import { FeedingSummaryCards } from '../../components/feeding/FeedingSummaryCards';
import { FeedingTrendChart } from '../../components/feeding/FeedingTrendChart';
import { FeedingCalendar } from '../../components/feeding/FeedingCalendar';
import { FeedResponseChart } from '../../components/feeding/FeedResponseChart';
import { FeedingScheduleCard } from '../../components/feeding/FeedingScheduleCard';
import { FeedInventoryPanel } from '../../components/feeding/FeedInventoryPanel';
import { FCRDashboard } from '../../components/feeding/FCRDashboard';
import { QuickFeedModal } from '../../components/feeding/QuickFeedModal';
import { FeedingLogForm } from '../../components/feeding/FeedingLogForm';

import { 
  ArrowLeft, RefreshCw, Calendar as CalendarIcon, 
  BarChart2, FileText, Download, Plus, Search 
} from 'lucide-react';
import { FEED_TYPE_CONFIG, FISH_RESPONSE_CONFIG } from '../../utils/constants';

export const FeedingPage: React.FC = () => {
  const { pondId } = useParams<{ pondId: string }>();
  
  // Data State
  const [overview, setOverview] = useState<FeedingOverview | null>(null);
  const [logs, setLogs] = useState<FeedingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  
  // UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs'>('dashboard');
  const [isQuickFeedOpen, setIsQuickFeedOpen] = useState(false);
  const [isFullFormOpen, setIsFullFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FeedingLog | undefined>(undefined);
  
  const loadData = useCallback(async (showRefresh = false) => {
    if (!pondId) return;
    if (showRefresh) setIsRefreshing(true);
    else if (!overview) setIsLoading(true);

    try {
      const res = await feedingApi.getFeedingOverview(pondId);
      setOverview(res.data);
      setLogs(res.data.recentLogs);
      
      // If period is not 30d (which is what overview returns), we need to fetch stats separately
      if (period !== '30d') {
        const statsRes = await feedingApi.getFeedingStats(pondId, period);
        setOverview(prev => prev ? { ...prev, stats: statsRes.data } : null);
      }
    } catch (error) {
      toast.error("Failed to load feeding data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [pondId, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePeriodChange = async (newPeriod: '7d' | '30d' | '90d' | 'all') => {
    if (!pondId || !overview) return;
    setPeriod(newPeriod);
    try {
      setIsRefreshing(true);
      const res = await feedingApi.getFeedingStats(pondId, newPeriod);
      setOverview({ ...overview, stats: res.data });
    } catch (e) {
      toast.error("Failed to update period");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!pondId) return;
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        await feedingApi.deleteFeedingLog(id, pondId);
        toast.success("Log deleted");
        loadData(true);
      } catch (e) {
        toast.error("Failed to delete");
      }
    }
  };

  if (!pondId) return <div className="p-6 text-white text-center">Invalid Pond ID</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/pond" className="text-sky-400 hover:text-sky-300 flex items-center gap-2 mb-2 text-sm font-medium w-fit">
            <ArrowLeft size={16} /> Back to Pond Profile
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">Feeding Management</h1>
            {isRefreshing && <RefreshCw size={20} className="text-slate-400 animate-spin" />}
          </div>
          <p className="text-slate-400 mt-1">Track feed consumption, analyze FCR, and optimize growth.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsQuickFeedOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 shadow-sm flex items-center gap-2 transition-all"
          >
            ⚡ Quick Feed
          </button>
          <button 
            onClick={() => {
              setEditingLog(undefined);
              setIsFullFormOpen(true);
            }}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg shadow-md shadow-sky-900/20 flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Detailed Log
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'dashboard' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <BarChart2 size={16} /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'logs' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <FileText size={16} /> Log History
        </button>
      </div>

      {/* CONTENT: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <FeedRecommendationCard 
            recommendation={overview?.stats.recommendation || null}
            todayStatus={overview?.todayStatus || { fedToday: false, feedingCount: 0, totalFedGrams: 0, lastFeedTime: null, lastFeedResponse: null, logs: [] }}
            schedule={overview?.schedule || null}
            fishAgeDays={overview?.stats.periodDays || 0}
            onLogFeeding={() => setIsQuickFeedOpen(true)}
            isLoading={isLoading}
          />

          <FeedingSummaryCards stats={overview?.stats!} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <FeedingTrendChart 
                dailyTrend={overview?.stats.dailyTrend || []}
                weeklyTrend={overview?.stats.weeklyTrend || []}
                averageDailyGrams={overview?.stats.averageDailyGrams || 0}
                recommendation={overview?.stats.recommendation || null}
                isLoading={isLoading}
                period={period}
                onPeriodChange={handlePeriodChange}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeedResponseChart 
                  responseBreakdown={overview?.stats.responseBreakdown || []}
                  dailyTrend={overview?.stats.dailyTrend || []}
                  isLoading={isLoading}
                />
                <FeedingCalendar 
                  dailyTrend={overview?.stats.dailyTrend || []}
                  currentMonth={new Date()}
                  onDayClick={(date) => {
                    // Pre-fill date and open form
                    // This is a nice-to-have, maybe just switch to logs tab and filter by date
                    setActiveTab('logs');
                  }}
                  isLoading={isLoading}
                />
              </div>
            </div>

            <div className="space-y-6">
              <FCRDashboard 
                fcr={overview?.stats.fcr || null}
                fcrInterpretation={overview?.stats.fcrInterpretation || ''}
                totalFeedKg={overview?.stats.totalFeedKg || 0}
                weightGainKg={overview?.stats.weightGainKg || 0}
                currentBiomassKg={overview?.stats.currentBiomassKg || 0}
                averageDailyGrams={overview?.stats.averageDailyGrams || 0}
                isLoading={isLoading}
              />
              
              <FeedingScheduleCard 
                pondId={pondId}
                schedule={overview?.schedule || null}
                onUpdate={(newSchedule) => {
                  if (overview) setOverview({...overview, schedule: newSchedule});
                }}
              />
              
              <FeedInventoryPanel 
                pondId={pondId}
                currentStats={overview?.stats!}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-sky-400" /> Feeding History
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="date"
                  className="pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Type / Brand</th>
                  <th className="px-6 py-4 font-medium text-right">Quantity</th>
                  <th className="px-6 py-4 font-medium">Response</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading logs...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <FileText size={32} className="text-slate-600 mb-3" />
                        <p>No feeding logs recorded yet.</p>
                        <button 
                          onClick={() => setIsFullFormOpen(true)}
                          className="mt-4 text-sky-400 hover:text-sky-300 font-medium"
                        >
                          Record your first feeding →
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map(log => {
                    const typeConfig = FEED_TYPE_CONFIG[log.feedType];
                    const resConfig = FISH_RESPONSE_CONFIG[log.fishResponse];
                    
                    return (
                      <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-white">{new Date(log.feedDate).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">{log.feedTime || '--:--'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>{typeConfig.emoji}</span>
                            <span className={typeConfig.color}>{typeConfig.label}</span>
                          </div>
                          {log.feedBrand && <div className="text-xs text-slate-500 mt-0.5">{log.feedBrand}</div>}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-white">
                          {log.quantityGrams} <span className="text-xs font-normal text-slate-500">g</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${resConfig.bgColor} ${resConfig.color} border border-transparent`}>
                            {resConfig.emoji} {resConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs max-w-xs">
                          {log.leftoverObserved ? (
                            <span className="text-amber-400 font-medium bg-amber-900/30 px-2 py-0.5 rounded inline-block mb-1">⚠️ Leftover</span>
                          ) : (
                            <span className="text-green-400 font-medium bg-green-900/30 px-2 py-0.5 rounded inline-block mb-1">✅ Clean</span>
                          )}
                          {log.finishTimeMinutes && <div className="text-slate-400">Finished in {log.finishTimeMinutes}m</div>}
                          {log.notes && <div className="text-slate-400 truncate mt-1" title={log.notes}>📝 {log.notes}</div>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setEditingLog(log);
                              setIsFullFormOpen(true);
                            }}
                            className="text-sky-400 hover:text-sky-300 font-medium text-sm mr-3"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-slate-500 hover:text-red-400 font-medium text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {logs.length > 0 && overview?.recentLogsPagination && overview.recentLogsPagination.totalPages > 1 && (
             <div className="p-4 border-t border-slate-800 flex justify-center bg-slate-900/50">
               <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700">
                 Load More Logs
               </button>
             </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <QuickFeedModal
        isOpen={isQuickFeedOpen}
        onClose={() => setIsQuickFeedOpen(false)}
        pondId={pondId}
        recommendation={overview?.stats.recommendation || null}
        onSuccess={() => loadData(true)}
        onOpenFullForm={() => setIsFullFormOpen(true)}
      />

      {isFullFormOpen && (
        <FeedingLogForm
          isOpen={isFullFormOpen}
          pondId={pondId}
          recommendation={overview?.stats.recommendation || null}
          existingLog={editingLog}
          onSuccess={() => {
            setIsFullFormOpen(false);
            loadData(true);
          }}
          onCancel={() => setIsFullFormOpen(false)}
        />
      )}
    </div>
  );
};
