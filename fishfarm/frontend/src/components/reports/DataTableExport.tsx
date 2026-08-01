import React, { useState } from 'react';
import { ExportDataResult } from '../../types/reports.types';
import { downloadCSV } from '../../utils/csv';

interface Props {
  title: string;
  moduleName: string;
  onExport: () => Promise<ExportDataResult | null>;
}

const DataTableExport: React.FC<Props> = ({ title, moduleName, onExport }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await onExport();
      if (data) {
        downloadCSV(data.filename, data.headers, data.rows);
      }
    } catch (error) {
      console.error(`Failed to export ${moduleName}`, error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      marginBottom: '16px',
      transition: 'all 0.2s'
    }}
    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
    onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>📁</span>
        <h4 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 500 }}>{title}</h4>
      </div>
      <button
        onClick={handleExport}
        disabled={isExporting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#60a5fa',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          transition: 'all 0.2s',
          opacity: isExporting ? 0.6 : 1
        }}
        onMouseOver={e => !isExporting && (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)')}
        onMouseOut={e => !isExporting && (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)')}
      >
        <span>⬇️</span>
        {isExporting ? 'Exporting...' : 'CSV'}
      </button>
    </div>
  );
};

export default DataTableExport;
