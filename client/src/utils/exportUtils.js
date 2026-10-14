import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';

/**
 * Clean clone pre-processor for individual payslip sheets
 */
const sanitizeClonedDocument = (clonedDoc) => {
  // 1. Remove all non-print and edit-mode interactive badges & floating toolbars
  const noPrintSelectors = [
    '.no-print',
    '.preview-template-toolbar',
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
    '.haryana-edu-wrapper, #haryana-pdf-sheet, .nestle-india-wrapper, #nestle-pdf-sheet, .classic-tabular-wrapper, .payslip-sheet, .hcl-corporate-wrapper, .aiims-govt-wrapper, .concentrix-daksh-wrapper, .sushma-buildtech-wrapper, .dwps-payslip-wrapper, .kdk-zenit-paper, .ca-audit-paper, .modern-executive-paper'
  ).forEach((sheet) => {
    sheet.style.boxShadow = 'none';
    sheet.style.margin = '0 auto';
    sheet.style.width = '100%';
    sheet.style.maxWidth = '100%';
  });

  // Dedicated handling for Haryana Education Template
  clonedDoc.querySelectorAll('.haryana-edu-wrapper, #haryana-pdf-sheet').forEach((hSheet) => {
    hSheet.style.boxShadow = 'none';
    hSheet.style.margin = '0 auto';
    hSheet.style.width = '780px';
    hSheet.style.maxWidth = '780px';
    hSheet.style.padding = '0';
    hSheet.style.boxSizing = 'border-box';
  });

  // Dedicated handling for Nestle India Template: enforce single landscape page fit
  clonedDoc.querySelectorAll('.nestle-india-wrapper, #nestle-pdf-sheet').forEach((nSheet) => {
    nSheet.style.boxShadow = 'none';
    nSheet.style.margin = '0 auto';
    nSheet.style.padding = '0';
    nSheet.style.boxSizing = 'border-box';
    nSheet.style.pageBreakInside = 'avoid';
    nSheet.style.breakInside = 'avoid';
  });

  // Dedicated handling for New AIIMS Template: enforce exact A4 portrait dimensions
  clonedDoc.querySelectorAll('.new-aiims-wrapper').forEach((aiimsSheet) => {
    aiimsSheet.style.boxShadow = 'none';
    aiimsSheet.style.margin = '0 auto';
    aiimsSheet.style.width = '794px';
    aiimsSheet.style.minHeight = '1123px';
    aiimsSheet.style.height = '1123px';
    aiimsSheet.style.display = 'flex';
    aiimsSheet.style.flexDirection = 'column';
    aiimsSheet.style.boxSizing = 'border-box';
  });

  // Dedicated handling for Delhi World Public School Template: completely eliminate outside container borders
  clonedDoc.querySelectorAll('.dwps-payslip-wrapper, #dwps-pdf-sheet').forEach((dwpsSheet) => {
    dwpsSheet.style.boxShadow = 'none';
    dwpsSheet.style.border = 'none';
    dwpsSheet.style.outline = 'none';
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
        const isHaryana = input.closest('.haryana-edu-wrapper') || input.classList.contains('haryana-editable-num');
        if (isHaryana) {
          val = Math.round(num).toLocaleString('en-IN');
        } else {
          val = num.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
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
 * Collect all active CSS styles across the entire page
 */
const collectDocumentStyles = () => {
  let cssText = '';
  try {
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          for (const rule of rules) {
            cssText += rule.cssText + '\n';
          }
        }
      } catch (e) {
        // Cross-origin stylesheet access might be blocked, safely ignore
      }
    }
  } catch (err) {
    console.warn('Could not collect all stylesheets for vector PDF:', err);
  }
  return cssText;
};

/**
 * Server-Side Vector PDF Exporter (Puppeteer Headless Chrome)
 * Produces 100% digital, selectable, and editable vector text recognized by Adobe Acrobat, Nitro, etc.
 */
export const tryExportServerVectorPdf = async (elementOrId, filename = 'SalarySlip.pdf', options = {}) => {
  const rootElement = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!rootElement) {
    throw new Error('Element not found for Vector PDF export');
  }

  // Find all individual sheet elements within the target
  const selector = '.computation-page, .haryana-edu-wrapper, #haryana-pdf-sheet, .nestle-india-wrapper, #nestle-pdf-sheet, .dwps-payslip-wrapper, .new-aiims-wrapper, .classic-tabular-wrapper, .payslip-sheet, .hcl-corporate-wrapper, .aiims-govt-wrapper, .concentrix-daksh-wrapper, .sushma-buildtech-wrapper, .kdk-zenit-paper, .ca-audit-paper, .modern-executive-paper';
  let sheets = Array.from(rootElement.querySelectorAll(selector));
  if (sheets.length === 0) {
    sheets = rootElement.matches(selector) ? [rootElement] : [rootElement];
  } else {
    // Filter out nested sheets whose ancestor is already in sheets to prevent duplication
    sheets = sheets.filter((sheet, idx) => {
      return !sheets.some((otherSheet, otherIdx) => otherIdx !== idx && otherSheet.contains(sheet));
    });
  }

  // Detect landscape vs portrait
  const isLandscape =
    options.orientation === 'landscape' ||
    sheets.some((el) =>
      el.classList.contains('classic-tabular-wrapper') ||
      el.classList.contains('hcl-corporate-wrapper') ||
      el.classList.contains('nestle-india-wrapper') ||
      el.classList.contains('landscape-slip')
    );

  const orientation = options.orientation || (isLandscape ? 'landscape' : 'portrait');

  // Clone document to sanitize inputs and toolbars
  const clonedDoc = document.implementation.createHTMLDocument('PrintExport');
  const clonedBody = clonedDoc.body;
  const container = clonedDoc.createElement('div');
  container.className = 'vector-pdf-export-container';

  sheets.forEach((sheetEl) => {
    const clone = sheetEl.cloneNode(true);

    // Convert all images from live sheetEl to base64 Data URLs in the clone if not already data: URLs
    const liveImgs = sheetEl.querySelectorAll('img');
    const cloneImgs = clone.querySelectorAll('img');
    for (let idx = 0; idx < liveImgs.length && idx < cloneImgs.length; idx++) {
      const lImg = liveImgs[idx];
      const cImg = cloneImgs[idx];
      if (cImg && cImg.src && !cImg.src.startsWith('data:')) {
        try {
          if (lImg.complete && lImg.naturalWidth > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = lImg.naturalWidth;
            canvas.height = lImg.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(lImg, 0, 0);
            cImg.src = canvas.toDataURL('image/png');
          }
        } catch (e) {
          // Cross-origin or canvas read error, retain current src
        }
      }
    }

    const sheetWrapper = clonedDoc.createElement('div');
    sheetWrapper.className = 'vector-pdf-sheet-wrapper';
    sheetWrapper.appendChild(clone);
    container.appendChild(sheetWrapper);
  });
  clonedBody.appendChild(container);

  sanitizeClonedDocument(clonedDoc);

  const html = container.outerHTML;
  const docStyles = collectDocumentStyles();

  const additionalStyles = `
    @page {
      size: A4 ${orientation};
      margin: ${options.margin ? `${options.margin[0]}mm` : '8mm'};
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .vector-pdf-export-container {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .vector-pdf-sheet-wrapper {
      page-break-after: always !important;
      break-after: page !important;
      margin: 0 auto !important;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      width: 100% !important;
    }
    .vector-pdf-sheet-wrapper:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
  `;

  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '/api';
  const token = localStorage.getItem('salary_maker_token');

  const res = await fetch(`${API_BASE}/pdf/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      html,
      styles: docStyles + '\n' + additionalStyles,
      orientation,
      format: options.format || 'A4',
      filename,
      margin: options.margin ? {
        top: `${options.margin[0]}mm`,
        right: `${options.margin[1] || options.margin[0]}mm`,
        bottom: `${options.margin[2] || options.margin[0]}mm`,
        left: `${options.margin[3] || options.margin[0]}mm`,
      } : { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Server PDF generation failed with status ${res.status}`);
  }

  const blob = await res.blob();
  if (options.returnBlob) {
    return blob;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up safely with timer to prevent microtask errors from aborting and triggering fallback
  setTimeout(() => {
    try {
      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch (e) {
      // Ignore cleanup error
    }
  }, 1500);

  return true;
};

/**
 * Clean, high-fidelity PDF Exporter
 * Attempts Server-Side Vector PDF first (100% selectable and editable text in PDF editors).
 * Gracefully falls back to client-side jsPDF + html2canvas if server is unavailable.
 * @param {HTMLElement|string} elementOrId - The DOM element or its element ID to export
 * @param {string} filename - Desired filename
 * @param {object} options - Optional overrides (format, orientation, margins, forceCanvas)
 */
export const exportElementToPdf = async (elementOrId, filename = 'SalarySlip.pdf', options = {}) => {
  const rootElement = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!rootElement) {
    throw new Error('Element not found for PDF export');
  }

  // 1. Prioritize Server-Side Vector PDF (Real digital selectable & editable text)
  if (!options.forceCanvas) {
    try {
      const result = await tryExportServerVectorPdf(rootElement, filename, options);
      if (options.returnBlob && result instanceof Blob) {
        return result;
      }
      if (result) {
        return true; // Successfully exported via vector engine - stop here!
      }
    } catch (serverErr) {
      console.warn('Server vector PDF export unavailable, using client canvas fallback:', serverErr);
    }
  }

  // 2. Client-Side Fallback: jsPDF + html2canvas
  // Find all individual sheet elements within the target
  const selector = '.computation-page, .haryana-edu-wrapper, #haryana-pdf-sheet, .nestle-india-wrapper, #nestle-pdf-sheet, .dwps-payslip-wrapper, .new-aiims-wrapper, .classic-tabular-wrapper, .payslip-sheet, .hcl-corporate-wrapper, .aiims-govt-wrapper, .concentrix-daksh-wrapper, .sushma-buildtech-wrapper, .kdk-zenit-paper, .ca-audit-paper, .modern-executive-paper';
  let sheets = Array.from(rootElement.querySelectorAll(selector));

  if (sheets.length === 0) {
    if (rootElement.matches(selector)) {
      sheets = [rootElement];
    } else {
      // Check first child or fallback to root
      const firstChild = rootElement.querySelector(selector);
      sheets = firstChild ? [firstChild] : [rootElement];
    }
  } else {
    // Filter out nested sheets to avoid duplicate pages in fallback
    sheets = sheets.filter((sheet, idx) => {
      return !sheets.some((otherSheet, otherIdx) => otherIdx !== idx && otherSheet.contains(sheet));
    });
  }

  const targetElements = sheets;

  // Detect landscape vs portrait
  const isLandscape =
    options.orientation === 'landscape' ||
    targetElements.some((el) =>
      el.classList.contains('classic-tabular-wrapper') ||
      el.classList.contains('hcl-corporate-wrapper') ||
      el.classList.contains('nestle-india-wrapper') ||
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
  const margin = options.margin ? options.margin[0] : 7;
  const printableWidth = pageWidth - 2 * margin;
  const printableHeight = pageHeight - 2 * margin;

  for (let i = 0; i < targetElements.length; i++) {
    const sheetEl = targetElements[i];
    const isNewAiims = sheetEl.classList.contains('new-aiims-wrapper');
    const isHaryana = sheetEl.classList.contains('haryana-edu-wrapper') || sheetEl.id === 'haryana-pdf-sheet';
    const isComputation =
      options.multiPage ||
      sheetEl.classList.contains('kdk-zenit-paper') ||
      sheetEl.classList.contains('ca-audit-paper') ||
      sheetEl.classList.contains('modern-executive-paper') ||
      sheetEl.id === 'computation-sheet-preview' ||
      rootElement.id === 'computation-sheet-preview';

    const pageNum = i + 1;

    const canvas = await html2canvas(sheetEl, {
      scale: options.scale || (isComputation ? 2.2 : 2.5),
      useCORS: true,
      letterRendering: true,
      logging: false,
      scrollY: 0,
      windowWidth: isNewAiims ? 850 : isHaryana ? 820 : isComputation ? 850 : undefined,
      onclone: (clonedDoc) => {
        sanitizeClonedDocument(clonedDoc);
        if (targetElements.length > 1) {
          const aiimsSheets = Array.from(clonedDoc.querySelectorAll('.new-aiims-wrapper'));
          if (aiimsSheets[i]) {
            const footerText = aiimsSheets[i].querySelector('.new-aiims-footer-text');
            if (footerText) {
              footerText.textContent = `Page No. ${pageNum}`;
            }
          }
        }
      },
    });

    if (isComputation) {
      // Multi-page slicing for computation sheets: NEVER shrink width, paginate cleanly across pages!
      const pageHeightPx = Math.floor((printableHeight * canvas.width) / printableWidth);

      if (canvas.height <= pageHeightPx) {
        // Fits in 1 page
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const finalHeight = (canvas.height * printableWidth) / canvas.width;
        if (i > 0) pdf.addPage(options.format || 'a4', orientation);
        pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, finalHeight, undefined, 'FAST');
      } else {
        // Multi-page document (2 or more pages)
        let sourceY = 0;
        let pageSliceIdx = 0;

        while (sourceY < canvas.height) {
          const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          const pageCtx = pageCanvas.getContext('2d');

          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sliceHeight,
            0, 0, canvas.width, sliceHeight
          );

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
          const sliceHeightMm = (sliceHeight * printableWidth) / canvas.width;

          if (i > 0 || pageSliceIdx > 0) {
            pdf.addPage(options.format || 'a4', orientation);
          }

          pdf.addImage(pageImgData, 'JPEG', margin, margin, printableWidth, sliceHeightMm, undefined, 'FAST');

          sourceY += sliceHeight;
          pageSliceIdx++;
        }
      }
    } else {
      // Standard single-page fit for individual payslips
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const rawImgHeight = (canvas.height * printableWidth) / canvas.width;
      let finalWidth = printableWidth;
      let finalHeight = rawImgHeight;

      if (finalHeight > printableHeight) {
        finalHeight = printableHeight;
        finalWidth = (canvas.width * finalHeight) / canvas.height;
      }

      const xPos = margin + (printableWidth - finalWidth) / 2;
      const yPos = isNewAiims
        ? Math.max(margin, margin + (printableHeight - finalHeight) / 2)
        : isHaryana
        ? 12
        : (options.topMargin !== undefined ? options.topMargin : Math.max(margin, 8));

      if (i > 0) {
        pdf.addPage(options.format || 'a4', orientation);
      }

      pdf.addImage(imgData, 'JPEG', xPos, yPos, finalWidth, finalHeight, undefined, 'FAST');
    }
  }

  if (options.returnBlob) {
    return pdf.output('blob');
  }

  pdf.save(filename);
  return true;
};

/**
 * Export multiple elements into a single merged PDF document.
 * Each element is captured with its correct aspect ratio, geometry, and orientation,
 * and seamlessly stitched into a unified multi-page PDF catalog via pdf-lib.
 *
 * @param {Array<{ id: string, name?: string }|string>} items - List of element IDs or config objects
 * @param {string} filename - Merged PDF output filename
 * @param {object} options - Progress and abort hooks
 */
export const exportMultipleElementsToMergedPdf = async (
  items = [],
  filename = 'All_Salary_Templates_Catalog.pdf',
  options = {}
) => {
  if (!items || items.length === 0) {
    throw new Error('No items provided for merged PDF export');
  }

  const mergedPdf = await PDFDocument.create();
  let mergedPageCount = 0;

  for (let i = 0; i < items.length; i++) {
    if (options.shouldAbort && options.shouldAbort()) {
      break;
    }

    const item = items[i];
    const elementId = typeof item === 'string' ? item : (item.id || item.elementId);
    const itemName = typeof item === 'object' && item.name ? item.name : `Template ${i + 1}`;

    if (options.onProgress) {
      options.onProgress(i + 1, items.length, itemName);
    }

    const targetEl = document.getElementById(elementId);
    if (!targetEl) {
      console.warn(`Element #${elementId} not found in DOM, skipping from merged PDF.`);
      continue;
    }

    try {
      const pdfBlob = await exportElementToPdf(targetEl, `${itemName}.pdf`, {
        ...options,
        returnBlob: true,
      });

      if (pdfBlob && pdfBlob instanceof Blob) {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        mergedPageCount += copiedPages.length;
      }
    } catch (err) {
      console.warn(`Failed to export/merge "${itemName}":`, err);
    }

    // Gentle pause so the browser UI thread can breathe & update progress indicators
    await new Promise((r) => setTimeout(r, 120));
  }

  if (mergedPageCount === 0) {
    throw new Error('Could not generate any template pages for the merged PDF.');
  }

  const mergedPdfBytes = await mergedPdf.save();
  const finalBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(finalBlob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    try {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {}
  }, 2000);

  return { success: true, pageCount: mergedPageCount };
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
