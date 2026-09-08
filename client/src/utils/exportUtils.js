import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Clean clone pre-processor for individual payslip sheets
 */
const sanitizeClonedDocument = (clonedDoc) => {
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
    '.html2pdf__page-break',
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

  // 3. Remove shadows and force clean margins
  clonedDoc.querySelectorAll(
    '.classic-tabular-wrapper, .payslip-sheet, .hcl-corporate-wrapper, .aiims-govt-wrapper, .concentrix-daksh-wrapper, .sushma-buildtech-wrapper, .dwps-payslip-wrapper'
  ).forEach((payslipSheet) => {
    payslipSheet.style.boxShadow = 'none';
    payslipSheet.style.margin = '0 auto';
    payslipSheet.style.maxWidth = '100%';
  });

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
};

/**
 * Clean, high-fidelity PDF Exporter using jsPDF + html2canvas
 * Guaranteed: 1 Payslip = Exactly 1 Page in the PDF (No accidental splitting or overflow)
 * @param {HTMLElement|string} elementOrId - The DOM element or its element ID to export
 * @param {string} filename - Desired filename
 * @param {object} options - Optional overrides (format, orientation, margins)
 */
export const exportElementToPdf = async (elementOrId, filename = 'SalarySlip.pdf', options = {}) => {
  const rootElement = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!rootElement) {
    throw new Error('Element not found for PDF export');
  }

  // Find all individual sheet elements within the target
  const selector = '.dwps-payslip-wrapper, .classic-tabular-wrapper, .payslip-sheet, .hcl-corporate-wrapper, .aiims-govt-wrapper, .concentrix-daksh-wrapper, .sushma-buildtech-wrapper';
  let sheets = Array.from(rootElement.querySelectorAll(selector));

  if (sheets.length === 0) {
    if (rootElement.matches(selector)) {
      sheets = [rootElement];
    } else {
      // Check first child or fallback to root
      const firstChild = rootElement.querySelector(selector);
      sheets = firstChild ? [firstChild] : [rootElement];
    }
  }

  const targetElements = sheets;

  // Detect landscape vs portrait
  const isLandscape =
    options.orientation === 'landscape' ||
    targetElements.some((el) =>
      el.classList.contains('classic-tabular-wrapper') ||
      el.classList.contains('hcl-corporate-wrapper') ||
      el.classList.contains('landscape-slip')
    );

  const orientation = options.orientation || (isLandscape ? 'landscape' : 'portrait');
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: options.format || 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = options.margin ? options.margin[0] : 6;
  const printableWidth = pageWidth - 2 * margin;
  const printableHeight = pageHeight - 2 * margin;

  for (let i = 0; i < targetElements.length; i++) {
    const sheetEl = targetElements[i];

    const canvas = await html2canvas(sheetEl, {
      scale: options.scale || 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      scrollY: 0,
      onclone: (clonedDoc) => {
        sanitizeClonedDocument(clonedDoc);
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Calculate aspect ratio so the slip fits cleanly within printable area
    const rawImgHeight = (canvas.height * printableWidth) / canvas.width;
    let finalWidth = printableWidth;
    let finalHeight = rawImgHeight;

    if (finalHeight > printableHeight) {
      finalHeight = printableHeight;
      finalWidth = (canvas.width * finalHeight) / canvas.height;
    }

    const xPos = margin + (printableWidth - finalWidth) / 2;
    // Align cleanly to the top of the A4 page (default 8mm top margin)
    const yPos = options.topMargin !== undefined ? options.topMargin : Math.max(margin, 8);

    if (i > 0) {
      pdf.addPage(options.format || 'a4', orientation);
    }

    pdf.addImage(imgData, 'JPEG', xPos, yPos, finalWidth, finalHeight, undefined, 'FAST');
  }

  pdf.save(filename);
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
