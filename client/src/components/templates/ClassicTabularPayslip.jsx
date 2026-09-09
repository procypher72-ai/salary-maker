import React from 'react';
import { ResizableLogo } from '../common/ResizableLogo';

// SVG Sun Logo matching the PDF top-left icon (Arunima Sunburst)
export const SunLogo = () => (
  <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="16" stroke="#e67e22" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="12" fill="#f39c12" />
    {/* Stylized monogram A inside sun */}
    <path
      d="M44 57L50 42L56 57M46 52H54"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 24 Sun rays */}
    {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg, i) => {
      const isLong = i % 2 === 0;
      const innerR = 19;
      const outerR = isLong ? 39 : 33;
      const rad = (deg * Math.PI) / 180;
      return (
        <line
          key={i}
          x1={50 + innerR * Math.cos(rad)}
          y1={50 + innerR * Math.sin(rad)}
          x2={50 + outerR * Math.cos(rad)}
          y2={50 + outerR * Math.sin(rad)}
          stroke="#e67e22"
          strokeWidth={isLong ? '1.8' : '1.2'}
          strokeLinecap="round"
        />
      );
    })}
  </svg>
);

export const ClassicTabularPayslip = ({
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
  template = null,
  layoutConfig = null,
}) => {
  const dynamic = employee?.dynamicFields || {};

  // Formatted numbers helper (always with .00)
  const fmt = (num) => {
    if (num === undefined || num === null || isNaN(num) || num === '') return '0.00';
    return Number(num).toFixed(2);
  };

  // Label normalizer to match Original PDF labels
  const cleanLabel = (label) => {
    if (!label) return '';
    const map = {
      'Basic Salary': 'Basic',
      'House Rent Allowance (HRA)': 'House Rent Allowance',
      'Special Allowance': 'Other Allowance',
      'Conveyance Allowance': 'Leave Travel Allowance',
      'Medical Allowance': 'Performance Bonus',
      'Provident Fund (PF)': 'Provident Fund',
      'Professional Tax (PT)': 'Professional Tax',
      'Income Tax / TDS': 'Income Tax',
      'Income Tax (TDS)': 'Income Tax',
    };
    return map[label] || label;
  };

  const cfg = layoutConfig || company || {};
  const minRows = cfg.minTableRows !== undefined ? Number(cfg.minTableRows) : 5;
  const earnings = draft.earnings || [];
  const deductions = draft.deductions || [];
  const maxRows = Math.max(earnings.length, deductions.length, minRows);
  const extraSpacer = Number(cfg.extraSpacerHeight) || 0;
  const rowHeightStyle = cfg.incomeDeductionHeight ? { minHeight: `${cfg.incomeDeductionHeight}px` } : undefined;

  const monthUpper = (draft.month || 'JANUARY').toUpperCase();
  const yearVal = draft.year || 2026;
  const payPeriodText = `PAYSLIP FOR ${monthUpper} ${yearVal}`;

  const workingDays = draft.workingDays !== undefined ? draft.workingDays : 31;
  const paidDays = draft.paidDays !== undefined ? draft.paidDays : 31;
  const lopDays = draft.lopDays !== undefined ? draft.lopDays : 0;
  const lopReversal = draft.lopReversal !== undefined ? draft.lopReversal : 0;
  const arrearDays = draft.arrearDays !== undefined ? draft.arrearDays : 0;

  // Exact 2-Column Monospace Metadata Matching Original PDF (Image 2)
  const leftColFields = [
    { key: 'empNo', label: 'EMP NO', value: dynamic.empNo || employee?.empCode || '51410' },
    { key: 'name', label: 'NAME', value: String(dynamic.name || employee?.fullName || 'HARWINDER SINGH').toUpperCase() },
    { key: 'company', label: 'COMPANY', value: dynamic.company || company?.name || 'Arunima Constructions Private Limited' },
    { key: 'vertical', label: 'VERTICAL', value: dynamic.vertical || employee?.department || 'Survey' },
    { key: 'designation', label: 'DESIGNATION', value: dynamic.designation || employee?.designation || 'Land Surveyor' },
    { key: 'dempDoj', label: 'DEMP DOJ', value: dynamic.dempDoj || (employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : '01/11/2023') },
    { key: 'location', label: 'LOCATION', value: dynamic.location || 'Chandigarh' },
  ];

  const rightColFields = [
    { key: 'bankName', label: 'BANK NAME', value: dynamic.bankName || 'BOI BANK' },
    { key: 'bankAccount', label: 'A/C NO', value: dynamic.bankAccount || '600810110006756' },
    { key: 'gender', label: 'GENDER', value: dynamic.gender || 'M' },
    { key: 'panNumber', label: 'EMP PAN', value: dynamic.panNumber || 'NQBPS8394P' },
    { key: 'pfNumber', label: 'PF_NO', value: dynamic.pfNumber || 'PB/CHD/29780/38554' },
    { key: 'uanNumber', label: 'UAN', value: dynamic.uanNumber || '101719643698' },
  ];

  return (
    <div className="classic-tabular-wrapper landscape-slip" id="classic-pdf-sheet">
      <div className="ct-content-area">
        {/* 1. Header: Logo + Company Name + PAYSLIP FOR MONTH YEAR */}
        <div className="ct-header">
          <div className="ct-logo-box">
            <ResizableLogo
              company={company}
              isEditable={isEditable}
              fallbackLogo={<SunLogo />}
              onSizeSaved={onSizeSaved}
            />
          </div>
          <div className="ct-company-info">
            <div className="ct-company-name">{company?.name || 'Arunima Constructions Private Limited'}</div>
            <div className="ct-payslip-title">{payPeriodText}</div>
          </div>
        </div>

        <div className="ct-divider" />

        {/* 2. Employee Metadata Two-Column Grid */}
        <div className="ct-meta-grid">
          {/* Left Column (7 rows) */}
          <div className="ct-meta-col ct-meta-left">
            {leftColFields.map((field) => (
              <div className="ct-meta-line" key={field.key}>
                <span className="ct-meta-key">{field.label}</span>
                <span className="ct-meta-colon">:</span>
                <span className="ct-meta-val">{field.value}</span>
              </div>
            ))}
          </div>

          {/* Right Column (6 rows) */}
          <div className="ct-meta-col ct-meta-right">
            {rightColFields.map((field) => (
              <div className="ct-meta-line" key={field.key}>
                <span className="ct-meta-key">{field.label}</span>
                <span className="ct-meta-colon">:</span>
                <span className="ct-meta-val">{field.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ct-divider" />

        {/* 3. Financial Table Header */}
        <div className="ct-fin-table-header">
          <div className="ct-col-earn-desc">EARNINGS</div>
          <div className="ct-col-earn-rate">RATE</div>
          <div className="ct-col-earn-cur">CURRENT MONTH</div>
          <div className="ct-col-earn-arr">ARREAR (+/-)</div>
          <div className="ct-col-ded-desc">DEDUCTIONS</div>
          <div className="ct-col-ded-cur">CURRENT MONTH</div>
        </div>

        <div className="ct-divider" />

        {/* 4. Financial Table Rows */}
        <div className="ct-fin-rows">
          {Array.from({ length: maxRows }).map((_, idx) => {
            const earn = earnings[idx];
            const ded = deductions[idx];
            const displayEarnLabel = earn ? cleanLabel(earn.label) : '';
            const displayDedLabel = ded ? cleanLabel(ded.label) : '';

            // Rates logic
            let rateVal = '';
            if (earn) {
              if (earn.rate !== undefined && earn.rate !== null && earn.rate !== '') {
                rateVal = fmt(earn.rate);
              } else if (displayEarnLabel === 'Performance Bonus') {
                rateVal = fmt(0);
              } else {
                rateVal = fmt(earn.amount);
              }
            }

            return (
              <div key={idx} className="ct-fin-row" style={rowHeightStyle}>
                {/* Earnings side */}
                <div className="ct-col-earn-desc">
                  {isEditable && earn ? (
                    <input
                      type="text"
                      className="ct-inline-input"
                      value={displayEarnLabel}
                      onChange={(e) => onEarningChange(idx, 'label', e.target.value)}
                    />
                  ) : (
                    displayEarnLabel
                  )}
                </div>
                <div className="ct-col-earn-rate">
                  {rateVal}
                </div>
                <div className="ct-col-earn-cur">
                  {isEditable && earn ? (
                    <input
                      type="number"
                      className="ct-inline-input num-right"
                      value={earn.amount}
                      onChange={(e) => onEarningChange(idx, 'amount', e.target.value)}
                    />
                  ) : (
                    earn ? fmt(earn.amount) : ''
                  )}
                </div>
                <div className="ct-col-earn-arr">
                  {earn ? fmt(earn.arrear || 0) : ''}
                </div>

                {/* Deductions side */}
                <div className="ct-col-ded-desc">
                  {isEditable && ded ? (
                    <input
                      type="text"
                      className="ct-inline-input"
                      value={displayDedLabel}
                      onChange={(e) => onDeductionChange(idx, 'label', e.target.value)}
                    />
                  ) : (
                    displayDedLabel
                  )}
                </div>
                <div className="ct-col-ded-cur">
                  {isEditable && ded ? (
                    <input
                      type="number"
                      className="ct-inline-input num-right"
                      value={ded.amount}
                      onChange={(e) => onDeductionChange(idx, 'amount', e.target.value)}
                    />
                  ) : (
                    ded ? fmt(ded.amount) : ''
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* EXTRA BOTTOM WHITE SPACE SPACER */}
        {extraSpacer > 0 && <div className="ct-bottom-spacer" style={{ height: `${extraSpacer}px` }} />}

        <div className="ct-divider" />

        {/* 5. Gross Totals Row */}
        <div className="ct-totals-row">
          <div className="ct-col-earn-desc">GROSS EARNINGS</div>
          <div className="ct-col-earn-rate"></div>
          <div className="ct-col-earn-cur">{fmt(draft.grossEarnings)}</div>
          <div className="ct-col-earn-arr">{fmt(0)}</div>
          <div className="ct-col-ded-desc">| TOTAL DEDUCTIONS</div>
          <div className="ct-col-ded-cur">{fmt(draft.totalDeductions)}</div>
        </div>

        <div className="ct-divider" />

        {/* 6. Net Pay Row */}
        <div className="ct-net-row">
          <span className="ct-net-label">NET PAY</span>
          <span className="ct-net-val">{fmt(draft.netSalary)}</span>
        </div>

        <div className="ct-divider" />

        {/* 7. Amount in Words Row */}
        <div className="ct-words-row">
          ({String(draft.netSalaryInWords || 'RUPEES ONE LAKH FIFTY THREE THOUSAND THREE HUNDRED TWENTY THREE ONLY').toUpperCase()})
        </div>

        {/* Double divider before attendance table */}
        <div className="ct-divider" />
        <div className="ct-divider" style={{ marginTop: '6px' }} />

        {/* 8. Attendance & Days Grid */}
        <div className="ct-days-header">
          <div className="ct-day-col">CALENDAR DAYS</div>
          <div className="ct-day-sep">|</div>
          <div className="ct-day-col">LOSS OF PAY</div>
          <div className="ct-day-sep">|</div>
          <div className="ct-day-col">LOP REVERSAL</div>
          <div className="ct-day-sep">|</div>
          <div className="ct-day-col">ARREAR DAYS</div>
          <div className="ct-day-sep">|</div>
          <div className="ct-day-col">DAYS PAYABLE</div>
        </div>

        <div className="ct-divider" />

        <div className="ct-days-values">
          <div className="ct-day-col">{fmt(workingDays)}</div>
          <div className="ct-day-sep">|</div>
          <div className="ct-day-col">{fmt(lopDays)}</div>
          <div className="ct-day-sep">|</div>
          <div className="ct-day-col">{fmt(lopReversal)}</div>
          <div className="ct-day-sep">|</div>
          <div className="ct-day-col">{fmt(arrearDays)}</div>
          <div className="ct-day-sep">|</div>
          <div className="ct-day-col">{fmt(paidDays)}</div>
        </div>

        <div className="ct-divider" />

        {/* 9. Bottom Computer Generated Note */}
        <div className="ct-footer-note">
          *This is a computer generated payslip and doesn't require signature or any company seal.
        </div>
      </div>
    </div>
  );
};
