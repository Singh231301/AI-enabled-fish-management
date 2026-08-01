import React from 'react';
import { HarvestReadinessReport as IHarvestReadinessReport } from '../../types/reports.types';
import ReportCard from './ReportCard';

interface Props {
  data: IHarvestReadinessReport;
}

const HarvestReadinessReport: React.FC<Props> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return '#10b981';
      case 'CONCERN': return '#f59e0b';
      case 'ACTION_NEEDED': return '#ef4444';
      case 'NOT_READY': return '#64748b';
      default: return '#3b82f6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'CONCERN': return '⚠️';
      case 'ACTION_NEEDED': return '🚨';
      case 'NOT_READY': return '⏳';
      default: return '🔍';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <ReportCard title="Readiness Status" icon="🎯" delay={0}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', height: '100%' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: `conic-gradient(${data.isReadyToHarvest ? '#10b981' : '#3b82f6'} ${data.readinessPercent}%, rgba(255,255,255,0.1) ${data.readinessPercent}%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{Math.round(data.readinessPercent)}%</span>
              </div>
            </div>
            <h3 style={{ margin: 0, color: data.isReadyToHarvest ? '#10b981' : '#f8fafc' }}>
              {data.isReadyToHarvest ? 'Ready to Harvest! 🎉' : 'Growing in Progress'}
            </h3>
            {data.daysToHarvest !== null && !data.isReadyToHarvest && (
              <p style={{ margin: '8px 0 0 0', color: '#94a3b8' }}>Est. {data.daysToHarvest} days remaining</p>
            )}
          </div>
        </ReportCard>

        <ReportCard title="Harvest Estimates" icon="⚖️" delay={0.1}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Estimated Total Harvest</span>
              <span style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '1.1rem' }}>{data.estimatedHarvestKg.toLocaleString()} kg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Current Avg. Weight</span>
              <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{data.currentWeight ? `${data.currentWeight}g` : 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Target Weight</span>
              <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{data.targetWeight}g</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Estimated Survival</span>
              <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{data.estimatedAlive.toLocaleString()} fish</span>
            </div>
          </div>
        </ReportCard>
      </div>

      <ReportCard title="Financial Scenarios" icon="💰" delay={0.2}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>Scenario</th>
                <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>Price/kg</th>
                <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>Est. Revenue</th>
                <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>Est. Profit</th>
                <th style={{ padding: '12px', color: '#94a3b8', fontWeight: 500 }}>ROI</th>
              </tr>
            </thead>
            <tbody>
              {data.scenarios.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', color: '#f8fafc' }}>{s.label}</td>
                  <td style={{ padding: '12px', color: '#f8fafc' }}>₹{s.pricePerKg}</td>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: 600 }}>₹{s.revenue.toLocaleString()}</td>
                  <td style={{ padding: '12px', color: s.profit >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                    ₹{s.profit.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', color: '#f8fafc' }}>{s.roi.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportCard>

      <ReportCard title="Readiness Checklist" icon="📋" delay={0.3}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {data.checklist.map((item, i) => (
            <div key={i} style={{ 
              background: 'rgba(255,255,255,0.03)', 
              padding: '16px', 
              borderRadius: '12px',
              borderLeft: `4px solid ${getStatusColor(item.status)}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{item.item}</span>
                <span style={{ fontSize: '1.2rem' }} title={item.status}>{getStatusIcon(item.status)}</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{item.value}</div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#60a5fa' }}>💡 Recommendation</h4>
          <p style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.5 }}>{data.recommendation}</p>
        </div>
      </ReportCard>
    </div>
  );
};

export default HarvestReadinessReport;
