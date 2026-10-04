import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const NestleIndiaPayslip = ({
  company = {},
  employee = {},
  draft = {},
  isEditable = false,
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

  const slipStyle = {
    maxWidth: cfg.slipWidth ? `${cfg.slipWidth}px` : undefined,
    minHeight: cfg.slipMinHeight ? `${cfg.slipMinHeight}px` : undefined,
    fontSize: cfg.fontSizeScale ? `${cfg.fontSizeScale * 0.008}rem` : undefined,
    border: 'none',
    boxShadow: 'none',
  };

  // Standard Indian Currency Formatter with two decimal places (e.g. 168,129.00)
  const fmt = (num) => {
    if (num === undefined || num === null || num === '' || isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const monthName = draft.month || 'March';
  const yearVal = Number(draft.year) || 2025;

  // Safe helper to determine exact calendar days in any given month and year
  const getMonthCalendarInfo = (monthNameOrNum, year = 2025) => {
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
    let m = 2; // Default March
    if (typeof monthNameOrNum === 'string') {
      const clean = monthNameOrNum.trim().toLowerCase();
      if (monthMap[clean] !== undefined) {
        m = monthMap[clean];
      } else {
        const parsed = parseInt(clean, 10);
        m = !isNaN(parsed) && parsed >= 1 && parsed <= 12 ? parsed - 1 : 2;
      }
    } else if (typeof monthNameOrNum === 'number') {
      m = monthNameOrNum > 0 && monthNameOrNum <= 12 ? monthNameOrNum - 1 : 2;
    }
    const y = Number(year) || 2025;
    const days = new Date(y, m + 1, 0).getDate();
    return { days, monthIndex: m };
  };

  const { days: monthCalendarDays, monthIndex: parsedMonthIdx } = getMonthCalendarInfo(monthName, yearVal);

  const earnings = draft.earnings || [
    { label: 'Basic Salary', amount: 168129 },
    { label: 'House Rent Allowance', amount: 84065 },
    { label: 'Compensatory Allowance', amount: 55565 },
    { label: 'Transport Allowance', amount: 28500 },
  ];

  const deductions = draft.deductions || [
    { label: 'Income Tax', amount: 70040 },
    { label: 'Recreation Club GGN', amount: 150 },
    { label: 'Ee PF contribution', amount: 20175 },
  ];

  const grossEarnings = earnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const grossDeductions = deductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const netPay = Math.max(0, grossEarnings - grossDeductions);

  // Dynamic / Attendance metadata
  const empCode = employee?.empCode || dynamic.empCode || '10218436';
  const costCenter = dynamic.costCenter || employee?.department || 'Organised Trade';
  const companyName = company?.name || 'Nestle India Limited';
  const location = dynamic.location || company?.location || 'Gurgaon';
  const fullName = employee?.fullName || 'Vaibhav Gupta';
  const fatherName = dynamic.fatherName || employee?.fatherName || 'Mukesh Gupta';
  const designation = employee?.designation || dynamic.designation || 'Senior Key Accounts Manag';
  const bankName = dynamic.bankName || employee?.bankName || 'Kotak Mahindra Bank';
  const bankAccount = dynamic.bankAccount || employee?.bankAccount || '9449576305';
  
  const basicSalaryRate = dynamic.basicRate !== undefined && dynamic.basicRate !== '' 
    ? Number(dynamic.basicRate).toFixed(2) 
    : (earnings.find(e => /basic/i.test(e.label))?.amount !== undefined ? Number(earnings.find(e => /basic/i.test(e.label)).amount).toFixed(2) : '168129.00');

  const esiNo = dynamic.esiNo || '';
  const pfNo = dynamic.pfNo || dynamic.pfNumber || 'DL/4398/3127';

  // Compute dynamic attendance days according to month:
  // 30 days for Apr, Jun, Sep, Nov; 31 days for Jan, Mar, May, Jul, Aug, Oct, Dec; 28/29 for Feb
  const computeDisplayDays = () => {
    if (draft.workingDays !== undefined && draft.workingDays !== null && draft.workingDays !== '') {
      const wDays = Number(draft.workingDays);
      if ((wDays === 30 || wDays === 31) && wDays !== monthCalendarDays) {
        return monthCalendarDays;
      }
      if (wDays > 0 && wDays <= monthCalendarDays) {
        return wDays;
      }
    }
    if (dynamic.days !== undefined && dynamic.days !== null && dynamic.days !== '') {
      const dDays = Number(dynamic.days);
      if ((dDays === 30 || dDays === 31) && dDays !== monthCalendarDays) {
        return monthCalendarDays;
      }
      if (dDays > 0 && dDays <= monthCalendarDays) {
        return dDays;
      }
    }
    return monthCalendarDays;
  };

  const daysVal = Number(computeDisplayDays()).toFixed(2);
  const absenceVal = dynamic.absence !== undefined && dynamic.absence !== '' 
    ? Number(dynamic.absence).toFixed(2) 
    : (draft.lopDays !== undefined ? Number(draft.lopDays).toFixed(2) : '0.00');
  const suspensionVal = dynamic.suspension !== undefined ? Number(dynamic.suspension).toFixed(2) : '0.00';
  const leaveWoPay = dynamic.leaveWithoutPay !== undefined ? Number(dynamic.leaveWithoutPay).toFixed(2) : '0.00';
  const hoursWoPay = dynamic.hoursWithoutPay !== undefined ? Number(dynamic.hoursWithoutPay).toFixed(2) : '0.00';
  const nightShiftAllow = dynamic.nightShiftAllow !== undefined ? Number(dynamic.nightShiftAllow).toFixed(2) : '0.00';
  const natFestHol = dynamic.natFestHol !== undefined ? Number(dynamic.natFestHol).toFixed(2) : '0.00';
  const specialLeave = dynamic.specialLeave !== undefined ? Number(dynamic.specialLeave).toFixed(2) : '0.00';

  // Loans amount
  const loansAmt = dynamic.loans !== undefined ? dynamic.loans : '';

  // Cumulated (YTD) Earnings & Deductions
  const cumulatedMultiplier = dynamic.ytdMonths !== undefined ? Number(dynamic.ytdMonths) : 12;
  const defaultCumulatedEarnings = [
    { label: 'Basic Salary', amount: dynamic.cumBasic !== undefined ? Number(dynamic.cumBasic) : (earnings.find(e => /basic/i.test(e.label))?.amount ? earnings.find(e => /basic/i.test(e.label)).amount * cumulatedMultiplier : 2017548) },
    { label: 'House Rent Allowance', amount: dynamic.cumHra !== undefined ? Number(dynamic.cumHra) : (earnings.find(e => /house rent|hra/i.test(e.label))?.amount ? earnings.find(e => /house rent|hra/i.test(e.label)).amount * cumulatedMultiplier : 1008780) },
    { label: 'Compensatory Allowance', amount: dynamic.cumComp !== undefined ? Number(dynamic.cumComp) : (earnings.find(e => /compensatory/i.test(e.label))?.amount ? earnings.find(e => /compensatory/i.test(e.label)).amount * cumulatedMultiplier : 666780) },
    { label: 'Transport Allowance', amount: dynamic.cumTransport !== undefined ? Number(dynamic.cumTransport) : (earnings.find(e => /transport/i.test(e.label))?.amount ? earnings.find(e => /transport/i.test(e.label)).amount * cumulatedMultiplier : 342000) },
  ];

  const defaultCumulatedDeductions = [
    { label: 'Income Tax', amount: dynamic.cumTax !== undefined ? Number(dynamic.cumTax) : (deductions.find(d => /income tax/i.test(d.label))?.amount ? Math.round(deductions.find(d => /income tax/i.test(d.label)).amount * 17.05) : 1194227) },
    { label: 'Ee PF contribution', amount: dynamic.cumPf !== undefined ? Number(dynamic.cumPf) : (deductions.find(d => /pf/i.test(d.label))?.amount ? deductions.find(d => /pf/i.test(d.label)).amount * cumulatedMultiplier : 242100) },
    { label: 'Recreation Club GGN', amount: dynamic.cumClub !== undefined ? Number(dynamic.cumClub) : (deductions.find(d => /club/i.test(d.label))?.amount ? deductions.find(d => /club/i.test(d.label)).amount * cumulatedMultiplier : 1800) },
  ];

  const cumulatedEarnings = draft.cumulatedEarnings || defaultCumulatedEarnings;
  const cumulatedDeductions = draft.cumulatedDeductions || defaultCumulatedDeductions;

  // Tax Computation figures
  const annualGross = dynamic.annualGross !== undefined ? Number(dynamic.annualGross) : 5225152;
  const exemptionUs10 = dynamic.exemptionUs10 !== undefined ? Number(dynamic.exemptionUs10) : 255058.10;
  const deductionUs80 = dynamic.deductionUs80 !== undefined ? Number(dynamic.deductionUs80) : 467449.00;
  const totalTaxableIncome = dynamic.totalTaxableIncome !== undefined ? Number(dynamic.totalTaxableIncome) : (annualGross - exemptionUs10 - deductionUs80);
  const taxPayable = dynamic.taxPayable !== undefined ? Number(dynamic.taxPayable) : 1194227.00;
  const taxDeducted = dynamic.taxDeducted !== undefined ? Number(dynamic.taxDeducted) : 1194227.00;

  // Footer document watermark / verification token (e.g. ##40523418##.##.##PAYSLIP##31.03.2025##)
  const lastDay = monthCalendarDays;
  const monthNum = String(parsedMonthIdx + 1).padStart(2, '0');
  const footerWatermark = (dynamic.footerWatermark && !dynamic.footerWatermark.includes('PAYSLIP')) 
    ? dynamic.footerWatermark 
    : `##40523418##.##.##PAYSLIP##${String(lastDay).padStart(2, '0')}.${monthNum}.${yearVal}##`;

  // Provide 7 rows for comfortable balanced height
  const minRows = cfg.minTableRows !== undefined ? Number(cfg.minTableRows) : 7;
  const maxRows = Math.max(earnings.length, deductions.length, minRows);

  return (
    <div className="nestle-india-wrapper landscape-slip" id="nestle-pdf-sheet" style={slipStyle}>
      <div className="nestle-inner-container">
        
        {/* 1. MASTER HEADER META BOX (5 ROWS) */}
        <div className="nestle-meta-section">
          {/* Row 1 */}
          <div className="nestle-row nestle-row-1">
            <span className="nestle-col"><span className="nestle-lbl">CODE:</span> <span className="nestle-val">{empCode}</span></span>
            <span className="nestle-col"><span className="nestle-lbl">CC:</span><span className="nestle-val">{costCenter}</span></span>
            <span className="nestle-col nestle-month-year">{monthName} {yearVal}</span>
            <span className="nestle-col nestle-comp-name">{companyName}</span>
            <span className="nestle-col nestle-loc">{location}</span>
          </div>

          {/* Row 2 */}
          <div className="nestle-row nestle-row-2">
            <span className="nestle-col"><span className="nestle-lbl">NAME:</span> <span className="nestle-val">{fullName}</span></span>
            <span className="nestle-col nestle-father-col"><span className="nestle-lbl">FATHER'S NAME:</span><span className="nestle-val">{fatherName}</span></span>
          </div>

          {/* Row 3 */}
          <div className="nestle-row nestle-row-3">
            <span className="nestle-col"><span className="nestle-lbl">DESGN:</span><span className="nestle-val">{designation}</span></span>
            <span className="nestle-col"><span className="nestle-lbl">BANK:</span> <span className="nestle-val">{bankName}</span></span>
            <span className="nestle-col"><span className="nestle-lbl">BANK A/C:</span> <span className="nestle-val">{bankAccount}</span></span>
          </div>

          {/* Row 4 */}
          <div className="nestle-row nestle-row-4">
            <span className="nestle-col"><span className="nestle-lbl">BASIC:</span><span className="nestle-val">{basicSalaryRate}</span></span>
            <span className="nestle-col"><span className="nestle-lbl">ESI No:</span> <span className="nestle-val">{esiNo}</span></span>
            <span className="nestle-col"><span className="nestle-lbl">PF No:</span> <span className="nestle-val">{pfNo}</span></span>
            <span className="nestle-col">
              <span className="nestle-lbl">Days:</span>{' '}
              {isEditable ? (
                <input
                  type="text"
                  className="nestle-inline-input"
                  style={{ width: '52px', color: 'inherit' }}
                  value={daysVal}
                  onChange={(e) => onDaysChange && onDaysChange('workingDays', e.target.value)}
                />
              ) : (
                <span className="nestle-val">{daysVal}</span>
              )}
            </span>
            <span className="nestle-col">
              <span className="nestle-lbl">Absence:</span>{' '}
              {isEditable ? (
                <input
                  type="text"
                  className="nestle-inline-input"
                  style={{ width: '42px', color: 'inherit' }}
                  value={absenceVal}
                  onChange={(e) => onDaysChange && onDaysChange('lopDays', e.target.value)}
                />
              ) : (
                <span className="nestle-val">{absenceVal}</span>
              )}
            </span>
            <span className="nestle-col"><span className="nestle-lbl">Suspension:</span> <span className="nestle-val">{suspensionVal}</span></span>
          </div>

          {/* Row 5 */}
          <div className="nestle-row nestle-row-5">
            <span className="nestle-col"><span className="nestle-lbl">Leave w/o Pay:</span> <span className="nestle-val">{leaveWoPay}</span></span>
            <span className="nestle-col"><span className="nestle-lbl">Hours w/o Pay:</span> <span className="nestle-val">{hoursWoPay}</span></span>
            <span className="nestle-col"><span className="nestle-lbl">Night Shift Allow:</span> <span className="nestle-val">{nightShiftAllow}</span></span>
            <span className="nestle-col"><span className="nestle-lbl">Nat. Fest Hol:</span> <span className="nestle-val">{natFestHol}</span></span>
            <span className="nestle-col"><span className="nestle-lbl">Special Leave:</span> <span className="nestle-val">{specialLeave}</span></span>
          </div>
        </div>

        {/* 2. CURRENT MONTH EARNINGS AND DEDUCTIONS */}
        <div className="nestle-fin-section">
          {/* Earnings Column */}
          <div className="nestle-fin-col nestle-fin-left">
            <div className="nestle-col-heading">
              <span>EARNINGS:</span>
              {isEditable && onAddEarning && (
                <button
                  type="button"
                  className="nestle-add-btn"
                  onClick={onAddEarning}
                  title="Add Earning item"
                >
                  <Plus size={11} /> Add
                </button>
              )}
            </div>

            <div className="nestle-items-list">
              {Array.from({ length: maxRows }).map((_, idx) => {
                const item = earnings[idx];
                if (!item) {
                  return <div key={`ern-pad-${idx}`} className="nestle-empty-row">&nbsp;</div>;
                }
                return (
                  <div key={`ern-${idx}`} className="nestle-fin-row">
                    <span className="nestle-item-label">
                      {isEditable ? (
                        <input
                          type="text"
                          className="nestle-inline-input"
                          value={item.label}
                          onChange={(e) => onEarningChange && onEarningChange(idx, 'label', e.target.value)}
                        />
                      ) : (
                        item.label
                      )}
                    </span>
                    <span className="nestle-item-amt">
                      {isEditable ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <input
                            type="number"
                            className="nestle-inline-input nestle-amt-input"
                            value={item.amount}
                            onChange={(e) => onEarningChange && onEarningChange(idx, 'amount', e.target.value)}
                          />
                          {onDeleteEarning && (
                            <button
                              type="button"
                              className="nestle-del-btn"
                              onClick={() => onDeleteEarning(idx)}
                              title="Delete item"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      ) : (
                        fmt(item.amount)
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deductions Column */}
          <div className="nestle-fin-col nestle-fin-right">
            <div className="nestle-col-heading">
              <span>DEDUCTIONS:</span>
              {isEditable && onAddDeduction && (
                <button
                  type="button"
                  className="nestle-add-btn"
                  onClick={onAddDeduction}
                  title="Add Deduction item"
                >
                  <Plus size={11} /> Add
                </button>
              )}
            </div>

            <div className="nestle-items-list">
              {Array.from({ length: maxRows }).map((_, idx) => {
                const item = deductions[idx];
                if (!item) {
                  return <div key={`ded-pad-${idx}`} className="nestle-empty-row">&nbsp;</div>;
                }
                return (
                  <div key={`ded-${idx}`} className="nestle-fin-row">
                    <span className="nestle-item-label">
                      {isEditable ? (
                        <input
                          type="text"
                          className="nestle-inline-input"
                          value={item.label}
                          onChange={(e) => onDeductionChange && onDeductionChange(idx, 'label', e.target.value)}
                        />
                      ) : (
                        item.label
                      )}
                    </span>
                    <span className="nestle-item-amt">
                      {isEditable ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <input
                            type="number"
                            className="nestle-inline-input nestle-amt-input"
                            value={item.amount}
                            onChange={(e) => onDeductionChange && onDeductionChange(idx, 'amount', e.target.value)}
                          />
                          {onDeleteDeduction && (
                            <button
                              type="button"
                              className="nestle-del-btn"
                              onClick={() => onDeleteDeduction(idx)}
                              title="Delete item"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      ) : (
                        fmt(item.amount)
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. GROSS TOTALS ROW */}
        <div className="nestle-totals-section">
          <div className="nestle-tot-col nestle-fin-left">
            <span className="nestle-tot-lbl">GROSS EARNINGS:</span>
            <span className="nestle-tot-val">{fmt(grossEarnings)}</span>
          </div>
          <div className="nestle-tot-col nestle-fin-right">
            <span className="nestle-tot-lbl">GROSS DEDUCTIONS:</span>
            <span className="nestle-tot-val">{fmt(grossDeductions)}</span>
          </div>
        </div>

        {/* 4. LOANS & NET ROW */}
        <div className="nestle-net-section">
          <div className="nestle-net-col nestle-fin-left">
            <span className="nestle-tot-lbl">LOANS:</span>
            <span className="nestle-tot-val">{loansAmt ? fmt(loansAmt) : ''}</span>
          </div>
          <div className="nestle-net-col nestle-fin-right">
            <span className="nestle-tot-lbl">NET:</span>
            <span className="nestle-tot-val nestle-net-bold">{fmt(netPay)}</span>
          </div>
        </div>

        {/* 5. CUMULATED (YTD) SECTION */}
        <div className="nestle-cumulated-section">
          <div className="nestle-cum-col nestle-fin-left">
            <div className="nestle-col-heading">CUMULATED EARNINGS:</div>
            <div className="nestle-items-list">
              {cumulatedEarnings.map((item, idx) => (
                <div key={`cum-ern-${idx}`} className="nestle-fin-row">
                  <span className="nestle-item-label">{item.label}</span>
                  <span className="nestle-item-amt">{fmt(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="nestle-cum-col nestle-fin-right">
            <div className="nestle-col-heading">CUMULATED DEDUCTIONS:</div>
            <div className="nestle-items-list">
              {cumulatedDeductions.map((item, idx) => (
                <div key={`cum-ded-${idx}`} className="nestle-fin-row">
                  <span className="nestle-item-label">{item.label}</span>
                  <span className="nestle-item-amt">{fmt(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. TAX COMPUTATION SECTION */}
        <div className="nestle-tax-section">
          <div className="nestle-tax-col nestle-fin-left">
            <div className="nestle-col-heading">Tax Computation:</div>
            <div className="nestle-items-list">
              <div className="nestle-fin-row">
                <span className="nestle-item-label">Gross Salary</span>
                <span className="nestle-item-amt">{fmt(annualGross)}</span>
              </div>
              <div className="nestle-fin-row">
                <span className="nestle-item-label">Exemption U/S 10</span>
                <span className="nestle-item-amt">{fmt(exemptionUs10)}</span>
              </div>
              <div className="nestle-fin-row">
                <span className="nestle-item-label">Deduction u/s 80</span>
                <span className="nestle-item-amt">{fmt(deductionUs80)}</span>
              </div>
            </div>
          </div>

          <div className="nestle-tax-col nestle-fin-right">
            <div className="nestle-items-list" style={{ marginTop: '1.4rem' }}>
              <div className="nestle-fin-row">
                <span className="nestle-item-label">Total Income</span>
                <span className="nestle-item-amt">{fmt(totalTaxableIncome)}</span>
              </div>
              <div className="nestle-fin-row">
                <span className="nestle-item-label">Tax payable and surcharge</span>
                <span className="nestle-item-amt">{fmt(taxPayable)}</span>
              </div>
              <div className="nestle-fin-row">
                <span className="nestle-item-label">Tax Deducted</span>
                <span className="nestle-item-amt">{fmt(taxDeducted)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 7. WATERMARK REFERENCE FOOTER (Clean standalone text outside the box with no border) */}
      <div className="nestle-footer-ref">
        {footerWatermark}
      </div>
    </div>
  );
};
