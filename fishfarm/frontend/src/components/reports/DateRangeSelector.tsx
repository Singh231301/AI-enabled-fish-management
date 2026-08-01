import React from 'react';
import { ReportPeriod } from '../../types/reports.types';

interface DateRangeSelectorProps {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  const periods: { value: ReportPeriod; label: string }[] = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'current_year', label: 'This Year' },
    { value: 'all_time', label: 'All Time' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: 'rgba(255, 255, 255, 0.03)',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {periods.map(p => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: period === p.value ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              background: period === p.value ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: period === p.value ? 'bold' : 'normal',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.2)',
                color: 'white',
                colorScheme: 'dark'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#a0aec0' }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.2)',
                color: 'white',
                colorScheme: 'dark'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
