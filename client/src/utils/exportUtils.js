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
    '.classic-tabular-wrapper, .payslip-sheet, .hcl-corporate-wrapper, .aiims-govt-wrapper, .concentrix-daksh-wrapper, .sushma-buildtech-wrapper, .dwps-payslip-wrapper'
  );
  const element = innerSheet || rootElement;

  // Detect if target element contains classic_tabular, hcl_corporate, or landscape slip
  const isLandscape =
    options.orientation === 'landscape' ||
    element.classList.contains('classic-tabular-wrapper') ||
    element.classList.contains('hcl-corporate-wrapper') ||
    element.classList.contains('landscape-slip') ||
    element.querySelector('.classic-tabular-wrapper') !== null ||
    element.querySelector('.hcl-corporate-wrapper') !== null ||
    element.querySelector('.landscape-slip') !== null;

  const orientation = options.orientation || (isLandscape ? 'landscape' : 'portrait');
  const margins = options.margin || (isLandscape ? [10, 8, 10, 8] : [8, 8, 8, 8]);

  const opt = {
    margin: margins,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: options.scale || 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // 1. Remove all non-print and edit-mode interactive badges & floating toolbars
        const noPrintSelectors = [
          '.no-print',
          '.logo-size-pill',
          '.logo-resize-drag-handle',
          '.logo-move-pin',
          '.btn-remove-earning',
          '.btn-remove-deduction',
          '.btn-add-line',
          '.btn-toggle-expand',
          '.mobile-scroll-hint',
        ].join(', ');

        clonedDoc.querySelectorAll(noPrintSelectors).forEach((el) => {
          el.remove();
        });

        // 2. Remove interactive outline styles on editable logo containers
        clonedDoc.querySelectorAll('.resizable-logo-container').forEach((el) => {
          el.style.border = 'none';
          el.style.boxShadow = 'none';
          el.style.outline = 'none';
        });

        // 3. Remove outer container shadows & force single sheet page-break-inside avoid
        const payslipSheet = clonedDoc.querySelector(
          '.classic-tabular-wrapper, .payslip-sheet, .hcl-corporate-wrapper, .aiims-govt-wrapper, .concentrix-daksh-wrapper, .sushma-buildtech-wrapper, .dwps-payslip-wrapper'
        );
        if (payslipSheet) {
          payslipSheet.style.boxShadow = 'none';
          payslipSheet.style.margin = '0 auto';
          payslipSheet.style.pageBreakInside = 'avoid';
          payslipSheet.style.breakInside = 'avoid';
        }

        // 4. Convert all input elements into clean, crisp typography spans
        clonedDoc.querySelectorAll('input, select, textarea').forEach((input) => {
          if (input.type === 'file' || input.type === 'hidden') {
            input.remove();
            return;
          }

          const span = clonedDoc.createElement('span');
          let val = input.value || '';
          
          // Format numeric inputs nicely if needed
          if (input.type === 'number' && val !== '') {
            const num = Number(val);
            if (!isNaN(num)) {
              val = num.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            }
          }

          span.textContent = val;
          span.className = input.className;
          span.style.cssText = input.style.cssText;
          span.style.border = 'none';
          span.style.background = 'transparent';
          span.style.outline = 'none';
          span.style.boxShadow = 'none';
          span.style.fontFamily = 'inherit';
          span.style.fontSize = 'inherit';
          span.style.color = '#000000';
          span.style.lineHeight = 'inherit';

          const isRight =
            input.classList.contains('text-right') ||
            input.classList.contains('num-right') ||
            input.style.textAlign === 'right';

          span.style.display = isRight ? 'block' : 'inline-block';
          span.style.textAlign = isRight ? 'right' : 'inherit';

          if (input.parentNode) {
            input.parentNode.replaceChild(span, input);
          }
        });
      },
    },
    jsPDF: {
      unit: 'mm',
      format: options.format || 'a4',
      orientation,
    },
    pagebreak: options.pagebreak || { mode: ['css', 'legacy'] },
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
