import React, { useState } from 'react';
import { ExportDataResult } from '../../types/reports.types';
import { downloadCSV } from '../../utils/csv';

interface ReportExportToolbarProps {
  onExportPdf: () => void;
  onExportCsv: () => Promise<ExportDataResult | null>;
  isExportingPdf?: boolean;
}

const ReportExportToolbar: React.FC<ReportExportToolbarProps> = ({
  onExportPdf,
  onExportCsv,
  isExportingPdf = false
}) => {
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const handleCsvExport = async () => {
    setIsExportingCsv(true);
    try {
      const data = await onExportCsv();
      if (data) {
        downloadCSV(data.filename, data.headers, data.rows);
      }
    } catch (error) {
      console.error("Failed to export CSV", error);
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    }}>
      <button
        onClick={onExportPdf}
        disabled={isExportingPdf}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#fca5a5',
          cursor: isExportingPdf ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          transition: 'all 0.2s',
          opacity: isExportingPdf ? 0.6 : 1
        }}
        onMouseOver={e => !isExportingPdf && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
        onMouseOut={e => !isExportingPdf && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
      >
        <span>📄</span>
        {isExportingPdf ? 'Generating PDF...' : 'Export PDF'}
      </button>

      <button
        onClick={handleCsvExport}
        disabled={isExportingCsv}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '12px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#6ee7b7',
          cursor: isExportingCsv ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          transition: 'all 0.2s',
          opacity: isExportingCsv ? 0.6 : 1
        }}
        onMouseOver={e => !isExportingCsv && (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)')}
        onMouseOut={e => !isExportingCsv && (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)')}
      >
        <span>📊</span>
        {isExportingCsv ? 'Preparing CSV...' : 'Export Data (CSV)'}
      </button>
    </div>
  );
};

export default ReportExportToolbar;
