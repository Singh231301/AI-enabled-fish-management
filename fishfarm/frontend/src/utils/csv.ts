/**
 * Utility functions for generating and downloading CSV files.
 */

export const generateCSV = (headers: string[], rows: any[][]): string => {
  const processCell = (cell: any) => {
    let cellString = cell === null || cell === undefined ? '' : String(cell);
    // Escape double quotes
    cellString = cellString.replace(/"/g, '""');
    // Wrap in quotes if it contains comma, newline, or double quotes
    if (cellString.search(/("|,|\n)/g) >= 0) {
      cellString = `"${cellString}"`;
    }
    return cellString;
  };

  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.map(processCell).join(','));
  
  // Add data rows
  for (const row of rows) {
    csvRows.push(row.map(processCell).join(','));
  }
  
  return csvRows.join('\n');
};

export const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
  const csvContent = generateCSV(headers, rows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
