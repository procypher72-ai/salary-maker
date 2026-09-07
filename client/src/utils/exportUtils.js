import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

/**
 * Clean, high-fidelity PDF Exporter using html2pdf
 * @param {HTMLElement|string} elementOrId - The DOM element or its element ID to export
 * @param {string} filename - Desired filename
 * @param {object} options - Optional overrides (format, orientation, margins)
 */
export const exportElementToPdf = async (elementOrId, filename = 'SalarySlip.pdf', options = {}) => {
  const rootElement = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!rootElement) {
    throw new Error('Element not found for PDF export');
  }

  // Find inner payslip sheet if root is a scroll wrapper
  const innerSheet = rootElement.querySelector(
    '.classic-tabular-wrapper, .payslip-sheet, .hcl-corporate-wrapper, .aiims-govt-wrapper, .concentrix-daksh-wrapper, .sushma-buildtech-wrapper'
  );
  const element = innerSheet || rootElement;

  // Detect if target element contains classic_tabular or landscape slip
  const isLandscape =
    options.orientation === 'landscape' ||
    element.classList.contains('classic-tabular-wrapper') ||
    element.classList.contains('landscape-slip') ||
    element.querySelector('.classic-tabular-wrapper') !== null ||
    element.querySelector('.landscape-slip') !== null;

  const orientation = options.orientation || (isLandscape ? 'landscape' : 'portrait');
  const margins = options.margin || (isLandscape ? [10, 8, 10, 8] : [10, 10, 10, 10]);

  const opt = {
    margin: margins,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      scrollY: 0,
    },
    jsPDF: {
      unit: 'mm',
      format: options.format || 'a4',
      orientation,
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  return html2pdf().set(opt).from(element).save();
};

/**
 * Export data array to Excel Workbook (.xlsx)
 * @param {Array<object>} data - Array of row objects
 * @param {string} fileName - File name without or with extension
 * @param {string} sheetName - Sheet tab name
 */
export const exportToExcel = (data = [], fileName = 'PayrollReport.xlsx', sheetName = 'Report') => {
  if (!data || data.length === 0) {
    throw new Error('No data available to export to Excel');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const finalName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, finalName);
};

/**
 * Export data array to CSV file
 * @param {Array<object>} data - Array of row objects
 * @param {string} fileName - File name
 */
export const exportToCsv = (data = [], fileName = 'Report.csv') => {
  if (!data || data.length === 0) {
    throw new Error('No data available to export to CSV');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
