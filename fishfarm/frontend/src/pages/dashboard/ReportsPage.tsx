import React, { useState, useEffect, useRef } from 'react';
import { pondApi } from '../../api/endpoints/pond.api';
import { PondWithCounts } from '../../types/pond.types';
import { PondSelector } from '../../components/pond/PondSelector';
import { reportsApi } from '../../api/endpoints/reports.api';
import { ReportPeriod, FullFarmReport } from '../../types/reports.types';
import DateRangeSelector from '../../components/reports/DateRangeSelector';
import FarmScorecardReport from '../../components/reports/FarmScorecardReport';
import HarvestReadinessReport from '../../components/reports/HarvestReadinessReport';
import GrowthAnalyticsChart from '../../components/reports/GrowthAnalyticsChart';
import FeedingAnalyticsReport from '../../components/reports/FeedingAnalyticsReport';
import WaterQualityReport from '../../components/reports/WaterQualityReport';
import PerformanceTimelineChart from '../../components/reports/PerformanceTimelineChart';
import ReportExportToolbar from '../../components/reports/ReportExportToolbar';
import DataTableExport from '../../components/reports/DataTableExport';
import PrintableReport from '../../components/reports/PrintableReport';

const ReportsPage: React.FC = () => {
  const [selectedPondId, setSelectedPondId] = useState<string | null>(null);
  const [ponds, setPonds] = useState<PondWithCounts[]>([]);
  const [activeTab, setActiveTab] = useState<'scorecard' | 'harvest' | 'growth' | 'feeding' | 'water' | 'timeline' | 'exports'>('scorecard');
  const [period, setPeriod] = useState<ReportPeriod>('last_30_days');
  
  const defaultEnd = new Date().toISOString().split('T')[0];
  const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<FullFarmReport | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  
  const selectedPond = ponds.find((p: PondWithCounts) => p.id === selectedPondId);

  useEffect(() => {
    const fetchPonds = async () => {
      try {
        const res = await pondApi.getUserPonds();
        setPonds(res.data);
        if (res.data.length > 0 && !selectedPondId) {
          setSelectedPondId(res.data[0].id);
        }
      } catch (error) {
        console.error("Failed to load ponds", error);
      }
    };
    fetchPonds();
  }, []);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!selectedPondId) return;
      setIsLoading(true);
      try {
        const data = await reportsApi.getFullFarmReport(selectedPondId, period, startDate, endDate);
        setReportData(data);
      } catch (error) {
        console.error("Failed to load reports data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [selectedPondId, period, startDate, endDate]);

  const handlePdfExport = async () => {
    setIsExportingPdf(true);
    // Give state time to update so PDF generator sees it
    setTimeout(() => {
      window.print();
      setIsExportingPdf(false);
    }, 500);
  };

  const handleCsvExport = (module: string) => async () => {
    if (!selectedPondId) return null;
    return await reportsApi.exportData(selectedPondId, module, period, startDate, endDate);
  };

  if (!selectedPondId) {
    return (
      <div style={{ padding: '24px', color: '#f8fafc' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <div className="w-72">
            <PondSelector 
              selectedPondId={selectedPondId} 
              onSelect={setSelectedPondId}
              ponds={ponds}
              onCreateNew={() => {}}
            />
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', textAlign: 'center', borderRadius: '16px', marginTop: '24px' }}>
          <h3>Please select a pond</h3>
          <p style={{ color: '#94a3b8' }}>Select a pond from the dropdown to view its reports and analytics.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'scorecard', label: 'Farm Scorecard', icon: '🏆' },
    { id: 'timeline', label: 'Timeline', icon: '📈' },
    { id: 'growth', label: 'Growth', icon: '🐟' },
    { id: 'feeding', label: 'Feeding', icon: '🍽️' },
    { id: 'water', label: 'Water Quality', icon: '💧' },
    { id: 'harvest', label: 'Harvest Readiness', icon: '⚖️' },
    { id: 'exports', label: 'Data Exports', icon: '⬇️' }
  ];

  return (
    <div style={{ padding: '24px', color: '#f8fafc', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="no-print flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Reports & Analytics
          </h1>
          <p style={{ margin: 0, color: '#94a3b8' }}>Comprehensive data insights for {selectedPond?.name}</p>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="w-72">
            <PondSelector 
              selectedPondId={selectedPondId} 
              onSelect={setSelectedPondId}
              ponds={ponds}
              onCreateNew={() => {}}
            />
          </div>
          <ReportExportToolbar 
            onExportPdf={handlePdfExport} 
            onExportCsv={handleCsvExport('all')}
            isExportingPdf={isExportingPdf}
          />
        </div>
      </div>

      <div className="no-print" style={{ marginBottom: '24px' }}>
        <DateRangeSelector 
          period={period}
          onPeriodChange={setPeriod}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      <div className="no-print" style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '32px', 
        overflowX: 'auto',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: '1rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => {
              if (activeTab !== tab.id) e.currentTarget.style.color = '#cbd5e1';
            }}
            onMouseOut={e => {
              if (activeTab !== tab.id) e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={printRef} className={isExportingPdf ? 'printable-report' : ''}>
        {isLoading && !reportData ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>🔄</div>
            Loading report data...
          </div>
        ) : reportData ? (
          <PrintableReport 
            reportTitle={`Farm Report: ${selectedPond?.name}`} 
            generatedAt={reportData.generatedAt}
          >
            {activeTab === 'scorecard' && <FarmScorecardReport data={reportData.scorecard} />}
            {activeTab === 'timeline' && <PerformanceTimelineChart data={reportData.timeline} />}
            {activeTab === 'growth' && <GrowthAnalyticsChart data={reportData.growthAnalytics} />}
            {activeTab === 'feeding' && <FeedingAnalyticsReport data={reportData.feedingAnalytics} />}
            {activeTab === 'water' && <WaterQualityReport data={reportData.waterQuality} />}
            {activeTab === 'harvest' && <HarvestReadinessReport data={reportData.harvestReadiness} />}
            {activeTab === 'exports' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#f8fafc' }}>Download CSV Data</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Download raw data for specific modules for further analysis in Excel or other tools.</p>
                  
                  <DataTableExport title="Full Farm Backup" moduleName="all" onExport={handleCsvExport('all')} />
                  <DataTableExport title="Feeding Logs" moduleName="feeding" onExport={handleCsvExport('feeding')} />
                  <DataTableExport title="Water Quality Logs" moduleName="water" onExport={handleCsvExport('water')} />
                  <DataTableExport title="Mortality Records" moduleName="mortality" onExport={handleCsvExport('mortality')} />
                  <DataTableExport title="Growth Samples" moduleName="growth" onExport={handleCsvExport('growth')} />
                  <DataTableExport title="Financial Transactions" moduleName="financials" onExport={handleCsvExport('financials')} />
                  <DataTableExport title="Inventory Usage" moduleName="inventory" onExport={handleCsvExport('inventory')} />
                </div>
              </div>
            )}
          </PrintableReport>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
            Failed to load report data.
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
