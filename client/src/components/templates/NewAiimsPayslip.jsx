import React from 'react';
import { ResizableLogo } from '../common/ResizableLogo';
import aiimsLogoOfficial from '../../assets/aiims-logo-official.png';
import g20OfficialLogo from '../../assets/g20-official-logo.png';
import aiimsSealWatermark from '../../assets/aiims-seal-watermark.png';

export const NewAiimsPayslip = ({
  company = {},
  employee = {},
  draft = {},
  isEditable = false,
  pageNumber = 1,
  onEarningChange,
  onDeductionChange,
  onAddEarning,
  onDeleteEarning,
  onAddDeduction,
  onDeleteDeduction,
  onDaysChange,
  onSizeSaved,
  layoutConfig = null,
}) => {
  const dynamic = employee?.dynamicFields || {};
  const cfg = layoutConfig || company || {};

  // Strict A4 portrait baseline: 794px width, 1123px height
  const resolvedWidth = (cfg.slipWidth && cfg.slipWidth >= 700 && cfg.slipWidth <= 880) ? cfg.slipWidth : 794;
  const resolvedMinHeight = (cfg.slipMinHeight && cfg.slipMinHeight >= 900) ? cfg.slipMinHeight : 1123;

  const slipStyle = {
    width: `${resolvedWidth}px`,
    maxWidth: '100%',
    minHeight: `${resolvedMinHeight}px`,
    padding: cfg.slipPadding ? `${cfg.slipPadding}px` : undefined,
    border: (cfg.slipBorderWidth && cfg.slipBorderWidth > 0 && cfg.slipBorderWidth !== 1)
      ? `${cfg.slipBorderWidth}px ${cfg.slipBorderStyle || 'solid'} ${cfg.slipBorderColor || '#000000'}`
      : undefined,
    borderRadius: cfg.slipBorderRadius !== undefined ? `${cfg.slipBorderRadius}px` : undefined,
    fontSize: cfg.fontSizeScale ? `${(cfg.fontSizeScale / 100) * 13.5}px` : undefined,
  };

  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num) || num === '') return '0';
    return Number(num).toLocaleString('en-IN');
  };

  /**
   * Masks sensitive security fields showing only the last 4 characters and prefixing all preceding characters with '*'
   * Example: 'CTEPC1404J' -> '******1404J'
   * Example: '2452350688' -> '******0688'
   * Example: '52433124529541' -> '**********9541'
   * Example: 'SBIN0001536' -> '*******1536'
   * Example: '1148' -> '***1148'
   */
  const maskSecurityField = (val, fallback = '') => {
    const raw = val !== undefined && val !== null && String(val).trim() !== '' ? String(val).trim() : String(fallback || '').trim();
    if (!raw) return '';
    // If it is already masked (contains '*'), return directly
    if (raw.includes('*')) return raw;
    // If length is greater than 4, show last 4 chars and mask all preceding chars with '*'
    if (raw.length > 4) {
      const visible = raw.slice(-4);
      const maskedPart = '*'.repeat(raw.length - 4);
      return `${maskedPart}${visible}`;
    }
    // If length <= 4, prefix with '***' to match original format (e.g. '***1148')
    return `***${raw}`;
  };

  // Helper to determine exact days in any given month and year
  const getDaysInMonth = (monthNameOrNum, year = 2026) => {
    if (!monthNameOrNum) return 30;
    const monthMap = {
      january: 0, jan: 0,
      february: 1, feb: 1,
      march: 2, mar: 2,
      april: 3, apr: 3,
      may: 4,
      june: 5, jun: 5,
      july: 6, jul: 6,
      august: 7, aug: 7,
      september: 8, sep: 8, sept: 8,
      october: 9, oct: 9,
      november: 10, nov: 10,
      december: 11, dec: 11
    };
    let m = monthNameOrNum;
    if (typeof m === 'string') {
      const clean = m.trim().toLowerCase();
      if (monthMap[clean] !== undefined) {
        m = monthMap[clean];
      } else {
        const parsed = parseInt(clean, 10);
        m = !isNaN(parsed) ? parsed - 1 : 5;
      }
    } else if (typeof m === 'number') {
      m = m > 0 && m <= 12 ? m - 1 : m;
    }
    const y = Number(year) || 2026;
    return new Date(y, m + 1, 0).getDate();
  };

  const monthName = draft.month || 'June';
  const yearVal = draft.year || 2026;
  const daysInThisMonth = getDaysInMonth(monthName, yearVal);

  // Dynamically calculate displayed salary days matching the exact days in the month (e.g. July 31, Aug 31, Feb 28/29)
  const computeSalaryDays = () => {
    if (draft.paidDays !== undefined && draft.paidDays !== null && draft.paidDays !== '') {
      const numPaid = Number(draft.paidDays);
      const numWork = draft.workingDays !== undefined ? Number(draft.workingDays) : undefined;
      // If user entered custom loss-of-pay / partial days (paidDays < workingDays), respect user's value
      if (numWork !== undefined && numPaid < numWork) {
        return numPaid;
      }
      // If paidDays was the legacy default 30 but this month has 31 or 28/29 days, adapt to actual month days
      if (numPaid === 30 && daysInThisMonth !== 30 && (!numWork || numWork === 30)) {
        return daysInThisMonth;
      }
      return numPaid;
    }
    if (draft.workingDays !== undefined && draft.workingDays !== null && draft.workingDays !== '') {
      const numWork = Number(draft.workingDays);
      if (numWork === 30 && daysInThisMonth !== 30) {
        return daysInThisMonth;
      }
      return numWork;
    }
    return daysInThisMonth;
  };

  const currentSalaryDays = computeSalaryDays();
  const reportTimeText = dynamic.reportDateTime || `24-Jul-${yearVal}&11:48 PM`;

  // Default earnings breakdown matching June 2026 PDF
  const earnings = (draft.earnings && draft.earnings.length > 0)
    ? draft.earnings
    : [
        { label: 'Basic', amount: 95500 },
        { label: 'Dearness Allowance', amount: 57300 },
        { label: 'House Rent Allowance', amount: 28650 },
        { label: 'Transport Allowance', amount: 7200 },
        { label: 'DA ON TPT', amount: 4320 },
        { label: 'ICU Allowance', amount: 1360 },
        { label: 'Tool Allowance', amount: 540 },
        { label: 'Uniform Allowance', amount: 2250 },
        { label: 'Nursing Allowance', amount: 9000 },
      ];

  // Default deductions breakdown matching June 2026 PDF
  const deductions = (draft.deductions && draft.deductions.length > 0)
    ? draft.deductions
    : [
        { label: 'Emp Health Scheme', amount: 650 },
        { label: 'Emp Insurance Scheme', amount: 100 },
        { label: 'General Provided Fund-A/C:G-11148', amount: 25000 },
        { label: 'Income Tax', amount: 25155 },
        { label: 'Society Recovery 7791.0', amount: 28730 },
      ];

  const minRows = cfg.minTableRows !== undefined ? Number(cfg.minTableRows) : 10;
  const maxRows = Math.max(earnings.length, deductions.length, minRows);

  const calculatedGross = earnings.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  const calculatedDeductions = deductions.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  const grossVal = draft.grossEarnings !== undefined ? draft.grossEarnings : calculatedGross;
  const dedVal = draft.totalDeductions !== undefined ? draft.totalDeductions : calculatedDeductions;
  const netVal = draft.netSalary !== undefined ? draft.netSalary : (grossVal - dedVal);

  const fallbackAiimsLogo = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img
        src={aiimsLogoOfficial}
        alt="AIIMS New Delhi"
        style={{
          width: '132px',
          height: 'auto',
          maxHeight: '52px',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );

  const fallbackG20Logo = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <img
        src={g20OfficialLogo}
        alt="G20 India 2023"
        style={{
          width: '78px',
          height: 'auto',
          maxHeight: '85px',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );

  return (
    <div className="new-aiims-wrapper" id="aiims-pdf-sheet" style={slipStyle}>
      {/* Background Circular AIIMS Seal Watermark at 10% Opacity */}
      <div className="new-aiims-watermark-container">
        <img
          src={aiimsSealWatermark}
          alt=""
          className="new-aiims-watermark-img"
        />
      </div>

      {/* Header with AIIMS Official Emblem, Addresses & G20 Emblem */}
      <div className="new-aiims-header-container">
        <div className="new-aiims-header-top-row">
          <div className="new-aiims-header-left">
            <ResizableLogo
              company={company}
              isEditable={isEditable}
              fallbackLogo={fallbackAiimsLogo}
              onSizeSaved={onSizeSaved}
            />
          </div>

          <div className="new-aiims-header-center">
            <h1 className="new-aiims-title">{company?.name || 'All India Institute of Medical Sciences'}</h1>
            <div className="new-aiims-subtitle">{company?.fullAddress || 'Ansari Nagar East'}</div>
            <div className="new-aiims-phone">Tel. No. : {company?.phone || '011 2658 8500'}</div>
          </div>

          <div className="new-aiims-header-right">
            <ResizableLogo
              company={company}
              fieldPrefix="secondaryLogo"
              isEditable={isEditable}
              fallbackLogo={fallbackG20Logo}
              onSizeSaved={onSizeSaved}
            />
          </div>
        </div>

        <div className="new-aiims-payslip-tag">
          Pay Slip : {monthName} {yearVal}
        </div>
      </div>

      {/* Report Date & Time Line */}
      <div className="new-aiims-timestamp-bar">
        Date: {reportTimeText}
      </div>

      {/* 8-Row Employee Metadata Box */}
      <table className="new-aiims-meta-grid">
        <tbody>
          {/* Row 1 */}
          <tr>
            <td className="meta-cell-lbl">Employee Code</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val meta-v-divider">{employee?.empCode || 'E0000195'}</td>
            <td className="meta-cell-lbl">Employee Name</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val">{employee?.fullName || 'Mrs. Paramjit Kaur'}</td>
          </tr>

          {/* Row 2 */}
          <tr>
            <td className="meta-cell-lbl">Current Designation</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val multiline meta-v-divider">{employee?.designation || 'Assistant Nursing Superintendent'}</td>
            <td className="meta-cell-lbl">Current Department</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val">{dynamic.department || employee?.department || 'IRCH'}</td>
          </tr>

          {/* Row 3 */}
          <tr>
            <td className="meta-cell-lbl">Dealing Office</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val multiline meta-v-divider">{dynamic.dealingOffice || 'Dr. BR Ambedkar Institute Rotary Cancer Hospital'}</td>
            <td className="meta-cell-lbl">PAN Number</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val">{maskSecurityField(dynamic.panNumber || employee?.panNumber || employee?.pan, '******098R')}</td>
          </tr>

          {/* Row 4 */}
          <tr>
            <td className="meta-cell-lbl">Pay Details</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val multiline meta-v-divider">{dynamic.payDetails || 'Level 10(15600 - 5400 - 39100)'}</td>
            <td className="meta-cell-lbl">Old Salary Code</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val">{dynamic.oldSalaryCode || 'IR75475'}</td>
          </tr>

          {/* Row 5 */}
          <tr>
            <td className="meta-cell-lbl">Bank Account No.</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val meta-v-divider">{maskSecurityField(dynamic.bankAccount || employee?.bankAccount || employee?.accountNumber || employee?.bankAccountNumber, '*******0688')}</td>
            <td className="meta-cell-lbl">PFMS-NO</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val">{maskSecurityField(dynamic.pfmsNo || employee?.pfmsNo, '**********9541')}</td>
          </tr>

          {/* Row 6 */}
          <tr>
            <td className="meta-cell-lbl">Bank Name</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val meta-v-divider">{dynamic.bankName || 'STATE BANK OF INDIA'}</td>
            <td className="meta-cell-lbl">IFSC Code</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val">{maskSecurityField(dynamic.ifscCode || employee?.ifscCode || employee?.bankIfsc, '*******1536')}</td>
          </tr>

          {/* Row 7 */}
          <tr>
            <td className="meta-cell-lbl">Date Of Next Increment</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val meta-v-divider">{dynamic.nextIncrementDate || '01/JUL/2026'}</td>
            <td className="meta-cell-lbl">PRAN No/GPF No</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val">{maskSecurityField(dynamic.pranGpfNo || dynamic.gpfNumber || employee?.pranNumber || employee?.pfNumber, '***1148')}</td>
          </tr>

          {/* Row 8 */}
          <tr>
            <td className="meta-cell-lbl">No Of Salary Days</td>
            <td className="meta-cell-colon">:</td>
            <td className="meta-cell-val meta-v-divider">
              {isEditable && onDaysChange ? (
                <input
                  type="number"
                  className="new-aiims-canvas-input"
                  value={currentSalaryDays}
                  onChange={(e) => onDaysChange('paidDays', e.target.value)}
                  style={{ width: '50px' }}
                />
              ) : (
                currentSalaryDays
              )}
            </td>
            <td className="meta-cell-lbl"></td>
            <td className="meta-cell-colon"></td>
            <td className="meta-cell-val"></td>
          </tr>
        </tbody>
      </table>

      {/* Financial Table with Open Rows & Solid Dividing Lines */}
      <table className="new-aiims-fin-table">
        <thead>
          {/* Header Row 1: Section Headings */}
          <tr className="new-aiims-fin-head-main">
            <th colSpan="2" className="th-side-left">Salary Details</th>
            <th colSpan="2" className="th-side-right">Deductions/Recoveries</th>
          </tr>
          {/* Header Row 2: Rs. Sub-headers */}
          <tr className="new-aiims-fin-head-sub">
            <th className="th-desc"></th>
            <th className="th-rs th-div-center">Rs.</th>
            <th className="th-desc"></th>
            <th className="th-rs">Rs.</th>
          </tr>
        </thead>
        <tbody className="new-aiims-fin-body">
          {Array.from({ length: maxRows }).map((_, idx) => {
            const ern = earnings[idx];
            const ded = deductions[idx];

            return (
              <tr key={idx} className="new-aiims-data-row">
                {/* Earning Label */}
                <td className="td-desc">
                  {isEditable && ern ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="text"
                        className="new-aiims-canvas-input"
                        value={ern.label}
                        onChange={(e) => onEarningChange && onEarningChange(idx, 'label', e.target.value)}
                      />
                      {onDeleteEarning && (
                        <button
                          type="button"
                          className="no-print btn-del-subtle"
                          onClick={() => onDeleteEarning(idx)}
                          title="Delete line"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    ern?.label || ''
                  )}
                </td>

                {/* Earning Amount */}
                <td className="td-amt td-div-center">
                  {isEditable && ern ? (
                    <input
                      type="number"
                      className="new-aiims-canvas-input text-right"
                      value={ern.amount}
                      onChange={(e) => onEarningChange && onEarningChange(idx, 'amount', e.target.value)}
                    />
                  ) : (
                    ern ? formatAmount(ern.amount) : ''
                  )}
                </td>

                {/* Deduction Label */}
                <td className="td-desc">
                  {isEditable && ded ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="text"
                        className="new-aiims-canvas-input"
                        value={ded.label}
                        onChange={(e) => onDeductionChange && onDeductionChange(idx, 'label', e.target.value)}
                      />
                      {onDeleteDeduction && (
                        <button
                          type="button"
                          className="no-print btn-del-subtle"
                          onClick={() => onDeleteDeduction(idx)}
                          title="Delete line"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    ded?.label || ''
                  )}
                </td>

                {/* Deduction Amount */}
                <td className="td-amt">
                  {isEditable && ded ? (
                    <input
                      type="number"
                      className="new-aiims-canvas-input text-right"
                      value={ded.amount}
                      onChange={(e) => onDeductionChange && onDeductionChange(idx, 'amount', e.target.value)}
                    />
                  ) : (
                    ded ? formatAmount(ded.amount) : ''
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="new-aiims-totals-row">
            <td className="tot-lbl">Gross Salary</td>
            <td className="tot-val td-div-center">
              <span className="tot-prefix">Rs.</span> {formatAmount(grossVal)}
            </td>
            <td className="tot-lbl">Total(Deductions + Recoveries)</td>
            <td className="tot-val">
              <span className="tot-prefix">Rs.</span> {formatAmount(dedVal)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Action buttons in editable mode */}
      {isEditable && (onAddEarning || onAddDeduction) && (
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 2px' }}>
          {onAddEarning && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onAddEarning({ label: 'Allowance', amount: 0 })}
            >
              + Add Earning Item
            </button>
          )}
          {onAddDeduction && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onAddDeduction({ label: 'Recovery', amount: 0 })}
            >
              + Add Deduction Item
            </button>
          )}
        </div>
      )}

      {/* Net Pay in Words & Figures */}
      <div className="new-aiims-netpay-line">
        Net Pay Rs.  {formatAmount(netVal)} ({draft.netSalaryInWords || 'One Lakh Twenty Six Thousand Four Hundred Eighty Five  Rupees Only'})
      </div>

      {/* Page Footer Box */}
      <div className="new-aiims-footer-box">
        <div className="new-aiims-footer-rule"></div>
        <div className="new-aiims-footer-text">Page No. {pageNumber || draft.pageNumber || 1}</div>
        <div className="new-aiims-footer-rule"></div>
      </div>
    </div>
  );
};
