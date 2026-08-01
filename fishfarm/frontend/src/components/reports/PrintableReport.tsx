import React from 'react';

interface PrintableReportProps {
  children: React.ReactNode;
  reportTitle: string;
  generatedAt: string;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ children, reportTitle, generatedAt }) => {
  return (
    <div className="printable-report">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-report, .printable-report * {
            visibility: visible;
          }
          .printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          
          /* Override glassmorphism for print */
          .printable-report [style*="background: rgba"] {
            background: transparent !important;
            border: 1px solid #ccc !important;
            color: black !important;
          }
          
          /* Hide non-print elements */
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="print-header no-print" style={{ display: 'none' }}>
        <h1 style={{ color: 'black' }}>{reportTitle}</h1>
        <p style={{ color: '#666' }}>Generated on: {new Date(generatedAt).toLocaleString()}</p>
        <hr style={{ borderColor: '#ccc' }} />
      </div>

      {children}
    </div>
  );
};

export default PrintableReport;
