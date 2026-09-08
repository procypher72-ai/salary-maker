import React, { useState, useMemo } from 'react';
import { SnapshotRenderer } from './SnapshotRenderer';
import { exportElementToPdf } from '../../utils/exportUtils';
import {
  X,
  Download,
  Printer,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  Loader2,
  Sparkles,
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

export const BulkPayslipViewerModal = ({
  isOpen,
  onClose,
  payslips = [],
  employee = null, // Optional: if pre-filtered for a single employee
  company = null,
}) => {
  if (!isOpen) return null;

  // Range State
  const [fromMonth, setFromMonth] = useState('January');
  const [fromYear, setFromYear] = useState(currentYear);
  const [toMonth, setToMonth] = useState('June');
  const [toYear, setToYear] = useState(currentYear);

  // Quick Presets: 'custom' | 'last3' | 'last6' | 'h1' | 'h2' | 'fy' | 'all'
  const [preset, setPreset] = useState('h1'); // default to Jan - Jun (first 6 months)

  // View Mode: 'scroll' (all stacked for PDF/print) vs 'paginated' (one slip at a time with page switcher)
  const [viewMode, setViewMode] = useState('scroll');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Apply Quick Preset handler
  const handleApplyPreset = (pKey) => {
    setPreset(pKey);
    const yr = currentYear;
    if (pKey === 'h1') {
      setFromMonth('January');
      setFromYear(yr);
      setToMonth('June');
      setToYear(yr);
    } else if (pKey === 'h2') {
      setFromMonth('July');
      setFromYear(yr);
      setToMonth('December');
      setToYear(yr);
    } else if (pKey === 'last3') {
      setFromMonth('April');
      setFromYear(yr);
      setToMonth('June');
      setToYear(yr);
    } else if (pKey === 'last6') {
      setFromMonth('January');
      setFromYear(yr);
      setToMonth('June');
      setToYear(yr);
    } else if (pKey === 'fy') {
      setFromMonth('April');
      setFromYear(yr);
      setToMonth('March');
      setToYear(yr + 1);
    } else if (pKey === 'all') {
      setFromMonth('January');
      setFromYear(yr - 2);
      setToMonth('December');
      setToYear(yr + 1);
    }
  };

  // Chronological Month Value Helper: year * 12 + monthIndex
  const getMonthVal = (mName, yNum) => {
    const idx = MONTHS.indexOf(mName);
    return Number(yNum) * 12 + (idx >= 0 ? idx : 0);
  };

  // Filter & Chronologically Sort matching salary slips
  const filteredSlips = useMemo(() => {
    const fromVal = getMonthVal(fromMonth, fromYear);
    const toVal = getMonthVal(toMonth, toYear);
    const minVal = Math.min(fromVal, toVal);
    const maxVal = Math.max(fromVal, toVal);

    return payslips
      .filter((slip) => {
        // If employee filter is provided, match empCode / ID
        if (employee) {
          const empCode = slip.snapshotData?.employee?.empCode || slip.employeeId?.empCode || slip.employeeId;
          const targetCode = employee.empCode || employee._id;
          if (empCode && targetCode && empCode !== targetCode && slip.employeeId?._id !== employee._id) {
            return false;
          }
        }

        const sVal = getMonthVal(slip.month, slip.year);
        return sVal >= minVal && sVal <= maxVal;
      })
      .sort((a, b) => {
        const valA = getMonthVal(a.month, a.year);
        const valB = getMonthVal(b.month, b.year);
        return valA - valB; // Chronological order
      });
  }, [payslips, employee, fromMonth, fromYear, toMonth, toYear]);

  // Aggregate Financial Statistics across the range
  const summaryStats = useMemo(() => {
    let grossTotal = 0;
    let dedTotal = 0;
    let netTotal = 0;

    filteredSlips.forEach((s) => {
      grossTotal += Number(s.grossEarnings) || 0;
      dedTotal += Number(s.totalDeductions) || 0;
      netTotal += Number(s.netSalary) || 0;
    });

    const currencySymbol =
      filteredSlips[0]?.snapshotData?.company?.currency ||
      company?.currency ||
      '₹';

    return {
      count: filteredSlips.length,
      grossTotal,
      dedTotal,
      netTotal,
      currencySymbol,
    };
  }, [filteredSlips, company]);

  // Export Combined Multi-Page PDF
  const handleExportCombinedPdf = async () => {
    if (filteredSlips.length === 0) return;
    setIsExportingPdf(true);
    try {
      const empName =
        employee?.fullName ||
        filteredSlips[0]?.snapshotData?.employee?.fullName ||
        'SalarySlips';
      const cleanEmpName = empName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanEmpName}_SalarySlips_${fromMonth}${fromYear}_to_${toMonth}${toYear}_Combined.pdf`;

      // Temporarily switch view mode to scroll to ensure all pages are rendered into DOM for exporter
      const previousMode = viewMode;
      setViewMode('scroll');

      // Small tick for DOM reflow
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Auto-detect if slips are landscape
      const targetEl = document.getElementById('bulk-payslips-multi-pdf-target');
      const isLandscape = targetEl?.querySelector('.classic-tabular-wrapper, .hcl-corporate-wrapper, .landscape-slip') !== null;

      await exportElementToPdf('bulk-payslips-multi-pdf-target', filename, {
        margin: isLandscape ? [8, 8, 8, 8] : [8, 8, 8, 8],
        orientation: isLandscape ? 'landscape' : 'portrait',
      });

      setViewMode(previousMode);
    } catch (err) {
      console.error('Failed to export multi-page PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  const empDisplayName =
    employee?.fullName ||
    (filteredSlips[0]?.snapshotData?.employee?.fullName ? filteredSlips[0]?.snapshotData?.employee?.fullName : 'Selected Employee');

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="modal-content glass-panel"
        style={{
          maxWidth: '1150px',
          width: '96vw',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          overflow: 'hidden',
        }}
      >
        {/* 1. Modal Top Header */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  Bulk Salary Slips & Consolidated PDF Exporter
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Employee: <strong style={{ color: 'var(--accent-cyan)' }}>{empDisplayName}</strong> • Company: {company?.name || 'Active Company'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div
              style={{
                display: 'inline-flex',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '6px',
                padding: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('scroll')}
                className={`btn btn-sm ${viewMode === 'scroll' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                title="Continuous Multi-Page Scroll View"
              >
                <Layers size={13} />
                <span>Multi-Page View</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('paginated');
                  setCurrentPageIndex(0);
                }}
                className={`btn btn-sm ${viewMode === 'paginated' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                title="Single Slip Step-By-Step View"
              >
                <span>Single Page</span>
              </button>
            </div>

            {/* Combined PDF Download Button */}
            <button
              type="button"
              onClick={handleExportCombinedPdf}
              disabled={isExportingPdf || filteredSlips.length === 0}
              className="btn btn-primary btn-sm"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)',
                fontWeight: 700,
              }}
              id="download-bulk-combined-pdf-btn"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>Merging & Generating PDF ({filteredSlips.length} Slips)...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download Combined PDF ({filteredSlips.length} Months)</span>
                </>
              )}
            </button>

            {/* Print All Button */}
            <button
              type="button"
              onClick={handlePrintAll}
              disabled={filteredSlips.length === 0}
              className="btn btn-secondary btn-sm"
            >
              <Printer size={14} />
              <span>Print All</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: '6px',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. Date Range Filter & Preset Bar */}
        <div
          className="no-print"
          style={{
            padding: '0.85rem 1rem',
            background: 'rgba(15, 23, 42, 0.7)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.85rem',
          }}
        >
          {/* Custom Month Range Pickers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} /> Month Range:
            </span>

            {/* From Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From:</span>
              <select
                value={fromMonth}
                onChange={(e) => {
                  setFromMonth(e.target.value);
                  setPreset('custom');
                }}
                className="form-select"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', width: 'auto' }}
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={fromYear}
                onChange={(e) => {
                  setFromYear(Number(e.target.value));
                  setPreset('custom');
                }}
                className="form-select"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', width: 'auto' }}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>

            {/* To Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>To:</span>
              <select
                value={toMonth}
                onChange={(e) => {
                  setToMonth(e.target.value);
                  setPreset('custom');
                }}
                className="form-select"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', width: 'auto' }}
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={toYear}
                onChange={(e) => {
                  setToYear(Number(e.target.value));
                  setPreset('custom');
                }}
                className="form-select"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', width: 'auto' }}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Range:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('h1')}
              className={`btn btn-sm ${preset === 'h1' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
            >
              Jan – Jun (H1)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('h2')}
              className={`btn btn-sm ${preset === 'h2' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
            >
              Jul – Dec (H2)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('last3')}
              className={`btn btn-sm ${preset === 'last3' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
            >
              Last 3 Mo
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('fy')}
              className={`btn btn-sm ${preset === 'fy' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
            >
              Full FY (Apr–Mar)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('all')}
              className={`btn btn-sm ${preset === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
            >
              All Slips
            </button>
          </div>
        </div>

        {/* 3. Cumulative Financial Summary Strip */}
        <div
          className="no-print"
          style={{
            padding: '0.65rem 1rem',
            background: 'rgba(99, 102, 241, 0.08)',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--accent-cyan)' }} />
              <span>
                Matching Slips: <strong style={{ color: '#fff' }}>{summaryStats.count} Month(s)</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={15} style={{ color: 'var(--accent-emerald)' }} />
              <span>
                Total Gross:{' '}
                <strong style={{ color: 'var(--accent-emerald)' }}>
                  {summaryStats.currencySymbol}{summaryStats.grossTotal.toLocaleString('en-IN')}
                </strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CreditCard size={15} style={{ color: '#fb7185' }} />
              <span>
                Total Deductions:{' '}
                <strong style={{ color: '#fb7185' }}>
                  {summaryStats.currencySymbol}{summaryStats.dedTotal.toLocaleString('en-IN')}
                </strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={15} style={{ color: 'var(--accent-cyan)' }} />
              <span>
                Cumulative Net Take-Home:{' '}
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                  {summaryStats.currencySymbol}{summaryStats.netTotal.toLocaleString('en-IN')}
                </strong>
              </span>
            </div>
          </div>

          {/* Paginated Navigation Controls if single page mode */}
          {viewMode === 'paginated' && filteredSlips.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentPageIndex === 0}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.15rem 0.4rem' }}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {currentPageIndex + 1} of {filteredSlips.length} ({filteredSlips[currentPageIndex]?.payPeriod})
              </span>
              <button
                type="button"
                onClick={() => setCurrentPageIndex((prev) => Math.min(filteredSlips.length - 1, prev + 1))}
                disabled={currentPageIndex >= filteredSlips.length - 1}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.15rem 0.4rem' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* 4. Canvas Body Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 1rem',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          className="bulk-payslips-scroll-container"
        >
          {filteredSlips.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                color: 'var(--text-muted)',
              }}
            >
              <FileText size={42} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                No Salary Slips Found for this Range
              </h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                No generated salary slips matched {fromMonth} {fromYear} to {toMonth} {toYear}. Try adjusting the month range above.
              </p>
            </div>
          ) : (
            /* Multi-Page PDF & Print Target Wrapper */
            <div
              id="bulk-payslips-multi-pdf-target"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2.5rem',
              }}
            >
              {viewMode === 'scroll' ? (
                filteredSlips.map((slip, idx) => (
                  <div
                    key={slip._id || idx}
                    className="bulk-slip-sheet-item"
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      pageBreakAfter: idx < filteredSlips.length - 1 ? 'always' : 'auto',
                      breakAfter: idx < filteredSlips.length - 1 ? 'page' : 'auto',
                    }}
                  >
                    <SnapshotRenderer payslip={slip} isEditable={false} />

                    {/* Dedicated html2pdf page break marker */}
                    {idx < filteredSlips.length - 1 && (
                      <div
                        className="html2pdf__page-break"
                        style={{
                          height: '0px',
                          width: '100%',
                          pageBreakAfter: 'always',
                          breakAfter: 'page',
                        }}
                      />
                    )}
                  </div>
                ))
              ) : (
                /* Paginated View */
                filteredSlips[currentPageIndex] && (
                  <div
                    className="bulk-slip-sheet-item"
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <SnapshotRenderer payslip={filteredSlips[currentPageIndex]} isEditable={false} />
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
