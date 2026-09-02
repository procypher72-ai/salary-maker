import React from 'react';
import { ResizableLogo } from '../common/ResizableLogo';

// HCL Tech Branding Icon / Text matching PDF
export const HclBrandLogo = () => (
  <div style={{ textAlign: 'right' }}>
    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0056b3', letterSpacing: '-0.02em', lineHeight: 1 }}>
      HCLTech
    </div>
    <div style={{ fontSize: '0.65rem', color: '#111', fontWeight: 600, marginTop: '2px' }}>
      HCL Technologies Ltd.
    </div>
  </div>
);

export const HclCorporatePayslip = ({
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
}) => {
  const dynamic = employee?.dynamicFields || {};

  // Formatter for Indian Currency string (e.g. 1,59,030.00)
  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const monthName = draft.month || 'January';
  const yearVal = draft.year || 2026;
  const payPeriodString = draft.payPeriod || `01.01.${yearVal} to 31.01.${yearVal}`;

  const earnings = draft.earnings || [];
  const deductions = draft.deductions || [];

  // Derive Standard Salary line items from baseline or draft
  const standardItems = [
    { label: 'Basic Salary', amount: 87450 },
    { label: 'HRA', amount: 34980 },
    { label: 'Travel Allowance', amount: 22600 },
    { label: 'Holiday Allowance', amount: 9500 },
    { label: 'Food Wallet', amount: 4500 },
  ];
  const totalStandardSalary = standardItems.reduce((acc, curr) => acc + curr.amount, 0);

  const maxRows = Math.max(standardItems.length, earnings.length, deductions.length, 6);

  const daysWorked = draft.workingDays !== undefined ? draft.workingDays : 31;

  return (
    <div className="hcl-corporate-wrapper" id="hcl-pdf-sheet">
      
      {/* 1. Header Section */}
      <div className="hcl-header-box">
        <div className="hcl-header-center">
          <h1 className="hcl-main-title">Payslip for the Month of {monthName}-{yearVal}</h1>
          <div className="hcl-sub-period">Pay Period {payPeriodString.includes('to') ? payPeriodString : `01.${monthName}.${yearVal} to 31.${monthName}.${yearVal}`}</div>
          <div className="hcl-emp-title">{employee?.fullName || 'Hardeep Singh'}</div>
        </div>
        <div className="hcl-header-right">
          <ResizableLogo
            company={company}
            isEditable={isEditable}
            fallbackLogo={<HclBrandLogo />}
            onSizeSaved={onSizeSaved}
          />
        </div>
      </div>

      <div className="hcl-divider-line" />

      {/* 2. Metadata Grid (2 Columns with exact vertical line separation) */}
      <div className="hcl-meta-grid">
        {/* Left Column */}
        <div className="hcl-meta-col-left">
          <div className="hcl-meta-row">
            <span className="hcl-label">Employee ID</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">{employee?.empCode || 'S285679'}</span>
          </div>
          <div className="hcl-meta-row">
            <span className="hcl-label">Designation</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">{employee?.designation || 'Software Engineer'}</span>
          </div>
          <div className="hcl-meta-row">
            <span className="hcl-label">DOJ / Gender</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">{dynamic.dojGender || '01.11.2023 / Male'}</span>
          </div>
          <div className="hcl-meta-row">
            <span className="hcl-label">PAN No</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">{dynamic.panNumber || 'KEJPS3652M'}</span>
          </div>
          <div className="hcl-meta-row">
            <span className="hcl-label">PF / Pension No*</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">{dynamic.pfPensionNo || 'HIL EPF Trust-GN/GGN/5572/635481'}</span>
          </div>
          <div className="hcl-meta-row">
            <span className="hcl-label">UAN No</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">{dynamic.uanNumber || '100417097851'}</span>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hcl-meta-vertical-sep" />

        {/* Right Column */}
        <div className="hcl-meta-col-right">
          <div className="hcl-meta-row">
            <span className="hcl-label">Bank Name & Account No</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">{dynamic.bankNameAccount || 'BOI BANK 600810110006820'}</span>
          </div>
          <div className="hcl-meta-row">
            <span className="hcl-label">Location</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">{dynamic.location || 'Chandigarh'}</span>
          </div>
          <div className="hcl-meta-row">
            <span className="hcl-label">Department</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">{dynamic.department || employee?.department || 'IT'}</span>
          </div>
          <div className="hcl-meta-row">
            <span className="hcl-label">Band</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">{dynamic.band || 'S2'}</span>
          </div>
          <div className="hcl-meta-row">
            <span className="hcl-label">Days worked in month</span>
            <span className="hcl-colon">:</span>
            <span className="hcl-value">
              {isEditable ? (
                <input
                  type="number"
                  className="hcl-canvas-input"
                  value={draft.workingDays || 31}
                  onChange={(e) => onDaysChange('workingDays', e.target.value)}
                  style={{ width: '55px' }}
                />
              ) : (
                `${Number(daysWorked).toFixed(2)}`
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="hcl-divider-line" />

      {/* 3. Three-Column Financials Header */}
      <div className="hcl-table-header-grid">
        <div className="hcl-th-col std-desc">Standard Monthly Salary</div>
        <div className="hcl-th-col std-val">INR</div>
        <div className="hcl-th-col ern-desc">Earnings</div>
        <div className="hcl-th-col ern-val">INR</div>
        <div className="hcl-th-col ded-desc">Deductions</div>
        <div className="hcl-th-col ded-val">INR</div>
      </div>

      <div className="hcl-divider-line" />

      {/* 4. Financial Line Items Rows */}
      <div className="hcl-table-rows">
        {Array.from({ length: maxRows }).map((_, idx) => {
          const std = standardItems[idx];
          const ern = earnings[idx];
          const ded = deductions[idx];

          return (
            <div key={idx} className="hcl-table-row">
              {/* Standard Monthly Salary Column */}
              <div className="hcl-td-col std-desc">{std ? std.label : ''}</div>
              <div className="hcl-td-col std-val">{std ? formatAmount(std.amount) : ''}</div>

              {/* Actual Earnings Column */}
              <div className="hcl-td-col ern-desc">
                {isEditable && ern ? (
                  <input
                    type="text"
                    className="hcl-canvas-input"
                    value={ern.label}
                    onChange={(e) => onEarningChange(idx, 'label', e.target.value)}
                  />
                ) : (
                  ern?.label || ''
                )}
              </div>
              <div className="hcl-td-col ern-val">
                {isEditable && ern ? (
                  <input
                    type="number"
                    className="hcl-canvas-input num-right"
                    value={ern.amount}
                    onChange={(e) => onEarningChange(idx, 'amount', e.target.value)}
                  />
                ) : (
                  ern ? formatAmount(ern.amount) : ''
                )}
              </div>

              {/* Deductions Column */}
              <div className="hcl-td-col ded-desc">
                {isEditable && ded ? (
                  <input
                    type="text"
                    className="hcl-canvas-input"
                    value={ded.label}
                    onChange={(e) => onDeductionChange(idx, 'label', e.target.value)}
                  />
                ) : (
                  ded?.label || ''
                )}
              </div>
              <div className="hcl-td-col ded-val">
                {isEditable && ded ? (
                  <input
                    type="number"
                    className="hcl-canvas-input num-right"
                    value={ded.amount}
                    onChange={(e) => onDeductionChange(idx, 'amount', e.target.value)}
                  />
                ) : (
                  ded ? formatAmount(ded.amount) : ''
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hcl-divider-line" />

      {/* 5. Summary & Totals Rows */}
      <div className="hcl-totals-grid">
        <div className="hcl-tot-col std-desc bold">Total Standard Salary</div>
        <div className="hcl-tot-col std-val bold">{formatAmount(totalStandardSalary)}</div>
        <div className="hcl-tot-col ern-desc bold">Gross Earnings</div>
        <div className="hcl-tot-col ern-val bold">{formatAmount(draft.grossEarnings)}</div>
        <div className="hcl-tot-col ded-desc bold">Gross Deductions</div>
        <div className="hcl-tot-col ded-val bold">{formatAmount(draft.totalDeductions)}</div>
      </div>

      <div className="hcl-divider-line" />

      {/* 6. Net Pay Row */}
      <div className="hcl-netpay-grid">
        <div className="hcl-net-blank" />
        <div className="hcl-net-label bold">Net Pay</div>
        <div className="hcl-net-val bold">{formatAmount(draft.netSalary)}</div>
      </div>

      <div className="hcl-divider-line" />

      {/* 7. Bottom Disclaimer */}
      <div className="hcl-footer-text">
        *This is a computer generated payslip and doesn't require signature or any company seal.
      </div>

    </div>
  );
};
