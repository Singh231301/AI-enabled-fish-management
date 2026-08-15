import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/endpoints/dashboard.api';
import * as financialsApi from '../api/endpoints/financials.api';
import { DashboardData } from '../types/dashboard.types';
import { FinancialStats } from '../types/financials.types';
import { 
  Plus, 
  RefreshCw, 
  Droplets, 
  Scale, 
  Activity, 
  IndianRupee,
  CheckSquare,
  AlertTriangle,
  Calendar,
  UtensilsCrossed,
  Fish
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { AlertBanner } from '../components/common/AlertBanner';
import { WeatherWidget } from '../components/dashboard/WeatherWidget';
import { AIBriefingPanel } from '../components/dashboard/AIBriefingPanel';
import { PondSummaryCard } from '../components/dashboard/PondSummaryCard';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { QuickLogModal } from '../components/dashboard/QuickLogModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPondId, setSelectedPondId] = useState<string | null>(null);
  const [ponds, setPonds] = useState<any[]>([]);
  
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogType, setQuickLogType] = useState<'feeding' | 'mortality'>('feeding');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Format helpers
  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  const getFishAgeLabel = (date: string | null) => {
    if (!date) return 'Unknown';
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
    return `${diff} days`;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const storedPondId = localStorage.getItem('fishfarm_selected_pond');
        const res = await api.get('/ponds');
        if (res.data.success && res.data.data.length > 0) {
          setPonds(res.data.data);
          let pondIdToUse = res.data.data[0].id;
          if (storedPondId && res.data.data.find((p: any) => p.id === storedPondId)) {
            pondIdToUse = storedPondId;
          }
          setSelectedPondId(pondIdToUse);
          localStorage.setItem('fishfarm_selected_pond', pondIdToUse);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        setIsLoading(false);
        setError('Failed to load ponds');
      }
    };
    init();
  }, []);

  const loadDashboard = async (pondId: string, silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const [result, stats] = await Promise.all([
        dashboardApi.getDashboard(pondId),
        financialsApi.getFinancialStats(pondId, 'all').catch(() => null)
      ]);
      if (result.success) {
        setDashboardData(result.data);
        setFinancialStats(stats);
        setLastRefreshed(new Date());
      } else {
        setError(result.message || 'Failed to load dashboard');
        toast.error('Failed to load dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      toast.error('Failed to load dashboard');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPondId) {
      loadDashboard(selectedPondId);
    }
    const interval = setInterval(() => {
      if (selectedPondId) loadDashboard(selectedPondId, true);
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [selectedPondId]);

  const handlePondChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedPondId(id);
    localStorage.setItem('fishfarm_selected_pond', id);
  };

  if (ponds.length === 0 && !isLoading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full text-center">
        <div className="text-7xl mb-4 drop-shadow-lg">🐟</div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to FishFarm Manager!</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          Set up your first pond to get started with tracking and analytics.
        </p>
        <button 
          onClick={() => navigate('/pond')}
          className="bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20 text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          <span>Create Pond</span>
        </button>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-3xl justify-center">
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex-1 flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2.5 rounded-lg text-indigo-400"><Activity size={20} /></div>
            <div className="font-medium text-slate-200">Track fish growth</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex-1 flex items-center gap-3">
            <div className="bg-blue-500/20 p-2.5 rounded-lg text-blue-400"><Droplets size={20} /></div>
            <div className="font-medium text-slate-200">Monitor water quality</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex-1 flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2.5 rounded-lg text-emerald-400"><IndianRupee size={20} /></div>
            <div className="font-medium text-slate-200">Manage finances</div>
          </div>
        </div>
      </div>
    );
  }

  // Helper variables for data
  const data = dashboardData;
  const basicStats = data?.basicStats;
  const totalInvested = financialStats?.totalExpenses ?? basicStats?.totalInvested ?? 0;
  const currentMonthExpense = financialStats?.currentMonthExpenses ?? basicStats?.currentMonthExpense ?? 0;
  const netProfitLoss = financialStats?.netProfitLoss ?? basicStats?.netProfitLoss ?? 0;
  const netProfitLossPercent = totalInvested > 0 ? Math.round(Math.abs((netProfitLoss / totalInvested) * 100)) : 0;
  const todayMortality = basicStats?.todayMortality || 0;
  const phValue = data?.latestWater?.phValue;
  const phStatus = data?.latestWater?.phStatus || 'unknown';
  const overdueCount = data?.taskCounts?.overdueCount || 0;
  const fedToday = data?.todayFeeding?.fedToday;
  const currentHour = new Date().getHours();
  
  // Alert conditions
  const showMortalityAlert = todayMortality >= 5 && !dismissedAlerts.includes('mortality');
  const showPhAlert = phStatus === 'critical' && !dismissedAlerts.includes('ph');
  const showOverdueAlert = overdueCount > 0 && !dismissedAlerts.includes('overdue');
  const showFeedingAlert = !fedToday && (basicStats?.fishAgeDays || 0) > 0 && currentHour >= 10 && !dismissedAlerts.includes('feeding');

  const openLogModal = (type: 'feeding' | 'mortality') => {
    setQuickLogType(type);
    setIsQuickLogOpen(true);
  };

  return (
    <div className="max-w-screen-xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* ROW 0 — PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            {ponds.length > 0 && (
              <select 
                value={selectedPondId || ''}
                onChange={handlePondChange}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
              >
                {ponds.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Good {currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening'}, {user?.fullName?.split(' ')[0] || 'User'}! 👋
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => selectedPondId && loadDashboard(selectedPondId)}
            className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors group"
            title="Refresh dashboard"
          >
            <RefreshCw size={18} className={`group-hover:text-white ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          
          <button 
            onClick={() => openLogModal('feeding')}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 font-medium rounded-lg text-sm transition-colors shadow-sm shadow-sky-500/5"
          >
            <Plus size={16} /> Log Feeding
          </button>
          <button 
            onClick={() => openLogModal('mortality')}
            className="flex items-center gap-1.5 px-4 py-2 bg-transparent hover:bg-red-500/10 border border-red-500 text-red-400 font-medium rounded-lg text-sm transition-colors"
          >
            <AlertTriangle size={16} /> Log Mortality
          </button>
        </div>
      </div>

      {error && (
        <AlertBanner type="danger" title="Error" message={error} onAction={() => selectedPondId && loadDashboard(selectedPondId)} actionLabel="Retry" />
      )}

      {/* ROW 1 — ALERT BANNERS */}
      {!isLoading && (
        <div className="space-y-3">
          {showMortalityAlert && (
            <AlertBanner 
              type="danger" title="High Mortality Alert" 
              message={`${todayMortality} fish died today. Check dissolved oxygen immediately.`}
              actionLabel="View Fish Logs" onAction={() => navigate('/fish')}
              onDismiss={() => setDismissedAlerts(prev => [...prev, 'mortality'])}
            />
          )}
          {showPhAlert && (
            <AlertBanner 
              type="danger" title="Critical pH Level" 
              message={`pH is at ${phValue}. Immediate action required.`}
              actionLabel="View Water Quality" onAction={() => navigate('/water')}
              onDismiss={() => setDismissedAlerts(prev => [...prev, 'ph'])}
            />
          )}
          {showOverdueAlert && (
            <AlertBanner 
              type="warning" title={`${overdueCount} Tasks Overdue`}
              message="Complete pending tasks to keep your farm on track."
              actionLabel="View Tasks" onAction={() => navigate('/tasks')}
              onDismiss={() => setDismissedAlerts(prev => [...prev, 'overdue'])}
            />
          )}
          {showFeedingAlert && (
            <AlertBanner 
              type="info" title="Feeding Not Logged Today" 
              message="Remember to feed your fish and log the activity."
              actionLabel="Log Now" onAction={() => openLogModal('feeding')}
              onDismiss={() => setDismissedAlerts(prev => [...prev, 'feeding'])}
            />
          )}
        </div>
      )}

      {/* ROW 2 — PRIMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Fish Alive"
          value={formatNumber(basicStats?.estimatedAlive || 0)}
          subtitle={`Survival rate: ${basicStats?.survivalRate?.toFixed(1) || 0}%`}
          icon={Fish}
          iconBgColor="bg-sky-500/20"
          iconColor="text-sky-400"
          isLoading={isLoading}
          trend={{ value: 100, label: 'vs starting qty', positive: true }} // simplified for demo
        />
        
        <StatCard
          title="Fish Age"
          value={getFishAgeLabel(basicStats?.stockingDate || null)}
          subtitle={basicStats?.stockingDate ? `Stocked: ${new Date(basicStats.stockingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Not stocked'}
          icon={Calendar}
          iconBgColor="bg-purple-500/20"
          iconColor="text-purple-400"
          isLoading={isLoading}
          badge={
            (basicStats?.fishAgeDays || 0) < 30 ? { label: "Fingerling", variant: 'info' } :
            (basicStats?.fishAgeDays || 0) < 90 ? { label: "Growing", variant: 'success' } :
            { label: "Matured", variant: 'warning' }
          }
        />

        <StatCard
          title="Total Invested"
          value={formatCurrency(totalInvested)}
          subtitle={`${formatCurrency(currentMonthExpense)} this month`}
          icon={IndianRupee}
          iconBgColor="bg-amber-500/20"
          iconColor="text-amber-400"
          isLoading={isLoading}
          trend={{ 
            value: netProfitLossPercent,
            label: 'net P&L', 
            positive: netProfitLoss >= 0 
          }}
        />

        <StatCard
          title="Estimated Biomass"
          value={`${basicStats?.estimatedBiomassKg?.toFixed(1) || 0} kg`}
          subtitle={basicStats?.latestAvgWeightGrams ? `${basicStats.latestAvgWeightGrams}g avg weight` : (basicStats?.fishAgeDays || 0) > 0 ? `Estimated by age (${basicStats?.fishAgeDays} days)` : 'No sample yet'}
          icon={Scale}
          iconBgColor="bg-green-500/20"
          iconColor="text-green-400"
          isLoading={isLoading}
          trend={
            data?.computed.weightVsBenchmarkPercent !== null && data?.computed.weightVsBenchmarkPercent !== undefined
              ? {
                  value: Math.abs(Math.round(data.computed.weightVsBenchmarkPercent)),
                  label: 'vs expected',
                  positive: data.computed.weightVsBenchmarkPercent >= 0
                }
              : undefined
          }
        />
      </div>

      {/* ROW 3 — SECONDARY STAT CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Feeding"
          value={data?.todayFeeding?.fedToday ? `${data.todayFeeding.totalFedGrams}g` : 'Not Fed'}
          subtitle={data?.todayFeeding?.fedToday ? `Fed ${data.todayFeeding.feedingCount} time(s) today` : 'Tap to log feeding'}
          icon={UtensilsCrossed}
          iconBgColor={data?.todayFeeding?.fedToday ? "bg-green-500/20" : "bg-slate-700"}
          iconColor={data?.todayFeeding?.fedToday ? "text-green-400" : "text-slate-400"}
          onClick={() => openLogModal('feeding')}
          isLoading={isLoading}
        />

        <StatCard
          title="Water Quality"
          value={data?.latestWater ? `pH ${data.latestWater.phValue}` : 'No Reading'}
          subtitle={data?.latestWater ? `${data.latestWater.phStatus} · ${data.latestWater.daysSinceLastReading} days ago` : 'No data yet'}
          icon={Droplets}
          iconBgColor={
            data?.latestWater?.phStatus === 'normal' ? "bg-blue-500/20" :
            data?.latestWater?.phStatus === 'low' ? "bg-amber-500/20" :
            data?.latestWater?.phStatus === 'critical' ? "bg-red-500/20" : "bg-slate-700"
          }
          iconColor={
            data?.latestWater?.phStatus === 'normal' ? "text-blue-400" :
            data?.latestWater?.phStatus === 'low' ? "text-amber-400" :
            data?.latestWater?.phStatus === 'critical' ? "text-red-400" : "text-slate-400"
          }
          onClick={() => navigate('/water')}
          isLoading={isLoading}
        />

        <StatCard
          title="Tasks"
          value={`${data?.taskCounts?.dueTodayCount || 0} due today`}
          subtitle={overdueCount > 0 ? `${overdueCount} overdue` : 'All on track'}
          icon={CheckSquare}
          iconBgColor={overdueCount > 0 ? "bg-red-500/20" : "bg-green-500/20"}
          iconColor={overdueCount > 0 ? "text-red-400" : "text-green-400"}
          onClick={() => navigate('/tasks')}
          isLoading={isLoading}
        />

        <StatCard
          title="Mortality Today"
          value={todayMortality > 0 ? `${todayMortality} fish` : 'None ✓'}
          subtitle={`Total: ${basicStats?.totalMortality || 0} since stocking`}
          icon={AlertTriangle}
          iconBgColor={todayMortality >= 5 ? "bg-red-500/20" : todayMortality > 0 ? "bg-amber-500/20" : "bg-green-500/20"}
          iconColor={todayMortality >= 5 ? "text-red-400" : todayMortality > 0 ? "text-amber-400" : "text-green-400"}
          onClick={() => openLogModal('mortality')}
          isLoading={isLoading}
        />
      </div>

      {/* ROW 4 — MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          
          {/* Sub-row A: Mini charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col h-[230px]">
              <h3 className="text-sm font-semibold text-white mb-3">📉 7-Day Mortality Trend</h3>
              <div className="flex-1 w-full">
                {isLoading ? (
                  <div className="w-full h-full bg-slate-700/50 animate-pulse rounded-lg"></div>
                ) : data?.mortalityTrend?.every(d => d.deadCount === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <CheckSquare size={24} className="mb-2 text-green-500/50" />
                    <p className="text-sm text-green-400/80">No mortality this week 🎉</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.mortalityTrend || []}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis hide={true} />
                      <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', padding: '4px 8px', fontSize: '12px' }} />
                      <Bar dataKey="deadCount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col h-[230px]">
              <h3 className="text-sm font-semibold text-white mb-3">🍽️ 7-Day Feed Given</h3>
              <div className="flex-1 w-full">
                {isLoading ? (
                  <div className="w-full h-full bg-slate-700/50 animate-pulse rounded-lg"></div>
                ) : data?.feedingTrend?.every(d => d.totalGrams === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <UtensilsCrossed size={24} className="mb-2 opacity-30" />
                    <p className="text-sm">No feeding logged this week</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.feedingTrend || []}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis hide={true} />
                      <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', padding: '4px 8px', fontSize: '12px' }} />
                      <Bar dataKey="totalGrams" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Sub-row B: AI Briefing */}
          <AIBriefingPanel 
            pondId={selectedPondId} 
            fishAgeDays={basicStats?.fishAgeDays || 0}
            species={basicStats?.species || null}
            basicStats={basicStats || {} as any}
          />

          {/* Sub-row C: Recent Activity */}
          <RecentActivityFeed activities={data?.recentActivity || []} isLoading={isLoading} />
          
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          
          <WeatherWidget weather={data?.weather || null} isLoading={isLoading} />
          
          <PondSummaryCard pond={data?.pond as any} basicStats={basicStats as any} isLoading={isLoading} />
          
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-3">📦 Inventory Alerts</h3>
            {isLoading ? (
              <div className="h-16 bg-slate-700/50 rounded animate-pulse"></div>
            ) : data?.lowStock && data.lowStock.length > 0 ? (
              <div className="space-y-2">
                {data.lowStock.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{item.itemName}</div>
                      <div className="text-xs text-slate-400">{item.currentQuantity} {item.unit}</div>
                    </div>
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-red-500/30">Low Stock</span>
                  </div>
                ))}
                <button onClick={() => navigate('/inventory')} className="text-xs text-sky-400 font-medium hover:text-sky-300 mt-2 block w-full text-left">Manage Inventory &rarr;</button>
              </div>
            ) : (
              <div className="text-sm text-green-400">✓ All inventory levels OK</div>
            )}
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-3">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => openLogModal('feeding')} className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-center transition-colors">
                <UtensilsCrossed size={18} className="mx-auto text-sky-400 mb-1.5" />
                <span className="text-xs font-medium text-slate-200">Log Feeding</span>
              </button>
              <button onClick={() => openLogModal('mortality')} className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-center transition-colors">
                <AlertTriangle size={18} className="mx-auto text-red-400 mb-1.5" />
                <span className="text-xs font-medium text-slate-200">Log Mortality</span>
              </button>
              <button onClick={() => navigate('/water')} className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-center transition-colors">
                <Droplets size={18} className="mx-auto text-blue-400 mb-1.5" />
                <span className="text-xs font-medium text-slate-200">Check Water</span>
              </button>
              <button onClick={() => navigate('/tasks')} className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-center transition-colors">
                <CheckSquare size={18} className="mx-auto text-emerald-400 mb-1.5" />
                <span className="text-xs font-medium text-slate-200">Add Task</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-3">💰 This Month's Spending</h3>
            {isLoading ? (
              <div className="h-24 bg-slate-700/50 rounded animate-pulse"></div>
            ) : data?.monthlyExpenses && data.monthlyExpenses.length > 0 ? (
              <div>
                <div className="space-y-2 mb-3">
                  {data.monthlyExpenses.map((exp, idx) => {
                    const colorMap: Record<string, string> = {
                      FEED: 'bg-sky-400', FINGERLINGS: 'bg-purple-400', CHEMICALS_LIME: 'bg-green-400', 
                      EQUIPMENT: 'bg-amber-400', LABOR: 'bg-orange-400', FENCING_INFRASTRUCTURE: 'bg-yellow-400', 
                      TRANSPORT: 'bg-blue-400', MISCELLANEOUS: 'bg-slate-400'
                    };
                    const colorClass = colorMap[exp.category] || 'bg-slate-400';
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                          <span className="text-slate-300">{exp.label}</span>
                        </div>
                        <span className="font-medium text-slate-200">{formatCurrency(exp.total)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-white">Total: {formatCurrency(currentMonthExpense)}</span>
                  <button onClick={() => navigate('/financials')} className="text-xs text-sky-400 hover:text-sky-300 font-medium">View All &rarr;</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">No expenses recorded this month</div>
            )}
          </div>
          
        </div>
      </div>

      {/* ROW 5 — FEED RECOMMENDATION BOX */}
      {!isLoading && (basicStats?.fishAgeDays || 0) > 0 && (
        <div className="bg-gradient-to-r from-sky-900/40 to-slate-800 rounded-xl p-5 border border-sky-700/50 flex flex-col md:flex-row gap-5 items-center">
          <div className="flex-1 flex items-center gap-4">
            <UtensilsCrossed size={36} className="text-sky-400 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white">Today's Feeding Recommendation</h3>
              <p className="text-sm text-sky-200/70 mt-0.5">Based on fish age, biomass, and season</p>
            </div>
          </div>
          
          <div className="flex-1 text-center md:border-l md:border-r border-sky-700/50 md:px-6">
            <div className="text-3xl font-bold text-sky-400 mb-1">{data?.computed.recommendedFeedGrams}g</div>
            <div className="text-xs font-medium uppercase tracking-wider text-sky-200/70 mb-1.5">Recommended per day</div>
            <div className="text-xs text-slate-300">Split into 2 sessions: {Math.round((data?.computed.recommendedFeedGrams || 0)/2)}g each</div>
            <div className="text-xs text-slate-400 mt-0.5">Morning (7-8 AM) and Evening (4-5 PM)</div>
          </div>
          
          <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right">
            {data?.computed.expectedWeightGrams && (
              <>
                <div className="text-sm text-slate-300 mb-1">Expected weight at {basicStats?.fishAgeDays} days: <span className="font-semibold text-white">{data.computed.expectedWeightGrams}g</span></div>
                {basicStats?.latestAvgWeightGrams ? (
                  <div className="text-sm text-slate-300 mb-3">
                    Your fish: <span className="font-semibold text-white">{basicStats.latestAvgWeightGrams}g</span>
                    {data.computed.weightVsBenchmarkPercent !== null && (
                      <div className={`text-xs mt-1 font-medium ${data.computed.weightVsBenchmarkPercent >= 0 ? 'text-green-400' : 'text-amber-400'}`}>
                        {data.computed.weightVsBenchmarkPercent >= 0 ? '↑' : '↓'} {Math.abs(Math.round(data.computed.weightVsBenchmarkPercent))}% {data.computed.weightVsBenchmarkPercent >= 0 ? 'ahead of' : 'behind'} benchmark
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-amber-400 mb-3">Log a growth sample to track progress</div>
                )}
                <button onClick={() => navigate('/feeding')} className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium rounded-lg transition-colors">
                  View Full Feeding Plan
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM FOOTER */}
      <div className="flex justify-center items-center gap-2 pt-4 opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-xs text-slate-400">
          Dashboard data as of {lastRefreshed?.toLocaleTimeString()}
        </span>
        <button onClick={() => selectedPondId && loadDashboard(selectedPondId)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
          <RefreshCw size={12} />
        </button>
      </div>

      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        type={quickLogType}
        pondId={selectedPondId}
        onSuccess={() => selectedPondId && loadDashboard(selectedPondId)}
      />
    </div>
  );
};
