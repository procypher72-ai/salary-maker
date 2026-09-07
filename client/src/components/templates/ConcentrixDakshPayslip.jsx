import React from 'react';
import { ResizableLogo } from '../common/ResizableLogo';
import { SignatureStampBox } from '../common/SignatureStampBox';

// High-fidelity SVG Concentrix Brand Logo matching the original document
export const ConcentrixLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Concentric overlapping swooshes */}
      <path
        d="M20 50 A30 30 0 1 1 50 80 A30 30 0 0 1 20 50"
        stroke="#002b49"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 50 A22 22 0 1 1 50 72 A22 22 0 0 1 28 50"
        stroke="#0072ce"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 50 A14 14 0 1 1 50 64 A14 14 0 0 1 36 50"
        stroke="#00a3e0"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="50" cy="50" r="5" fill="#002b49" />
    </svg>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002b49', letterSpacing: '0.04em', lineHeight: 1 }}>
        CONCENTRIX
      </span>
    </div>
  </div>
);

export const ConcentrixDakshPayslip = ({
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
    padding: cfg.slipPadding ? `${cfg.slipPadding}px` : undefined,
    fontSize: cfg.fontSizeScale ? `${cfg.fontSizeScale * 0.008}rem` : undefined,
  };

  const innerBorderStyle = {
    borderWidth: cfg.slipBorderWidth !== undefined ? `${cfg.slipBorderWidth}px` : undefined,
    borderStyle: cfg.slipBorderStyle || undefined,
    borderColor: cfg.slipBorderColor || undefined,
    borderRadius: cfg.slipBorderRadius !== undefined ? `${cfg.slipBorderRadius}px` : undefined,
  };

  const rowMinHeight = cfg.incomeDeductionHeight ? `${cfg.incomeDeductionHeight}px` : undefined;
  const finTableMinHeight = cfg.incomeDeductionMinHeight ? `${cfg.incomeDeductionMinHeight}px` : undefined;

  // Formatter for numbers
  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-IN');
  };

  const monthName = draft.month || 'April';
  const yearVal = draft.year || 2025;

  const earnings = draft.earnings || [];
  const deductions = draft.deductions || [];
  const maxRows = Math.max(earnings.length, deductions.length, 5);

  const effectiveWorkDays = draft.paidDays !== undefined ? draft.paidDays : draft.workingDays !== undefined ? draft.workingDays : 30;
  const lopDays = draft.lopDays !== undefined ? draft.lopDays : 0;

  // Format joining date nicely
  const getJoiningDate = () => {
    if (dynamic.joiningDateStr) return dynamic.joiningDateStr;
    if (employee?.joiningDate) {
      const d = new Date(employee.joiningDate);
      if (!isNaN(d.getTime())) {
        const day = d.getDate();
        const month = d.toLocaleString('en-GB', { month: 'short' });
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
      }
    }
    return '10 Oct 2022';
  };

  return (
    <div className="concentrix-daksh-wrapper" id="concentrix-pdf-sheet" style={slipStyle}>
      
      {/* Outer Border Box Content */}
      <div className="cnx-inner-border" style={innerBorderStyle}>
        {/* 1. Header Box */}
        <div className="cnx-header-box">
          <div className="cnx-logo-col">
            <ResizableLogo
              company={company}
              isEditable={isEditable}
              fallbackLogo={<ConcentrixLogo />}
              onSizeSaved={onSizeSaved}
            />
          </div>

          <div className="cnx-company-info-col">
            <h1 className="cnx-company-title">
              {company?.name || 'CONCENTRIX DAKSH SERVICES INDIA PRIVATE LIMITED'}
            </h1>
            <div className="cnx-company-address">
              {company?.fullAddress || '1st Floor, Red Fort Capital Parsvnath Towers, Bhai Vir Singh Marg, Gole Market, Connaught Place, New Delhi110001, India'}
            </div>
            <div className="cnx-payslip-month">
              Payslip for the month of {monthName} {yearVal}
            </div>
          </div>
        </div>

        <div className="cnx-divider" />

        {/* 2. Employee Metadata 2-Column Grid */}
        <div className="cnx-meta-grid">
          {/* Left Column */}
          <div className="cnx-meta-col-left">
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">Name:</span>
              <span className="cnx-meta-val">{employee?.fullName || 'Pankaj Sharma'}</span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">Joining Date:</span>
              <span className="cnx-meta-val">{getJoiningDate()}</span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">Designation:</span>
              <span className="cnx-meta-val">{employee?.designation || 'Lead Business Analyst'}</span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">Department:</span>
              <span className="cnx-meta-val">{dynamic.department || employee?.department || 'Business Analysis'}</span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">Location:</span>
              <span className="cnx-meta-val">{dynamic.location || 'Chandigarh'}</span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">Effective Work Days:</span>
              <span className="cnx-meta-val">
                {isEditable ? (
                  <input
                    type="number"
                    className="cnx-canvas-input inline-num"
                    value={draft.paidDays !== undefined ? draft.paidDays : 30}
                    onChange={(e) => {
                      if (onDaysChange) onDaysChange('paidDays', e.target.value);
                    }}
                    style={{ width: '50px' }}
                  />
                ) : (
                  effectiveWorkDays
                )}
              </span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">LOP:</span>
              <span className="cnx-meta-val">
                {isEditable ? (
                  <input
                    type="number"
                    className="cnx-canvas-input inline-num"
                    value={draft.lopDays !== undefined ? draft.lopDays : 0}
                    onChange={(e) => {
                      if (onDaysChange) onDaysChange('lopDays', e.target.value);
                    }}
                    style={{ width: '50px' }}
                  />
                ) : (
                  lopDays
                )}
              </span>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="cnx-meta-sep" />

          {/* Right Column */}
          <div className="cnx-meta-col-right">
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">Employee No:</span>
              <span className="cnx-meta-val">{employee?.empCode || '306007'}</span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">Bank Name:</span>
              <span className="cnx-meta-val">{dynamic.bankName || 'SBI'}</span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">Bank Account No:</span>
              <span className="cnx-meta-val">{dynamic.bankAccount || '40777179100'}</span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">PAN Number:</span>
              <span className="cnx-meta-val">{dynamic.panNumber || 'NJSPS5596H'}</span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">PF No:</span>
              <span className="cnx-meta-val">{dynamic.pfNumber || 'PB/CHD/29780/38538'}</span>
            </div>
            <div className="cnx-meta-row">
              <span className="cnx-meta-label">PF UAN:</span>
              <span className="cnx-meta-val">{dynamic.uanNumber || '101719643567'}</span>
            </div>
          </div>
        </div>

        <div className="cnx-divider" />

        {/* 3. 5-Column Financial Matrix Table */}
        <div className="cnx-fin-table">
          {/* Header Row */}
          <div className="cnx-th-row">
            <div className="cnx-col cnx-ern-desc th-text">Earnings</div>
            <div className="cnx-col cnx-ern-full th-text">Full</div>
            <div className="cnx-col cnx-ern-act th-text">Actual</div>
            <div className="cnx-col cnx-ded-desc th-text">Deductions</div>
            <div className="cnx-col cnx-ded-act th-text">Actual</div>
          </div>

          <div className="cnx-divider-table" />

          {/* Data Rows */}
          <div className="cnx-tb-rows" style={{ minHeight: finTableMinHeight }}>
            {Array.from({ length: maxRows }).map((_, idx) => {
              const ern = earnings[idx];
              const ded = deductions[idx];

              return (
                <div key={idx} className="cnx-tb-row" style={{ minHeight: rowMinHeight }}>
                  {/* Earnings Description */}
                  <div className="cnx-col cnx-ern-desc">
                    {isEditable && ern ? (
                      <input
                        type="text"
                        className="cnx-canvas-input"
                        value={ern.label}
                        onChange={(e) => onEarningChange(idx, 'label', e.target.value)}
                      />
                    ) : (
                      ern?.label || ''
                    )}
                  </div>

                  {/* Earnings Full Amount */}
                  <div className="cnx-col cnx-ern-full">
                    {isEditable && ern ? (
                      <input
                        type="number"
                        className="cnx-canvas-input num-right"
                        value={ern.fullAmount !== undefined ? ern.fullAmount : ern.amount}
                        onChange={(e) => onEarningChange(idx, 'fullAmount', e.target.value)}
                      />
                    ) : (
                      ern ? formatAmount(ern.fullAmount !== undefined ? ern.fullAmount : ern.amount) : ''
                    )}
                  </div>

                  {/* Earnings Actual Amount */}
                  <div className="cnx-col cnx-ern-act">
                    {isEditable && ern ? (
                      <input
                        type="number"
                        className="cnx-canvas-input num-right"
                        value={ern.amount}
                        onChange={(e) => onEarningChange(idx, 'amount', e.target.value)}
                      />
                    ) : (
                      ern ? formatAmount(ern.amount) : ''
                    )}
                  </div>

                  {/* Deductions Description */}
                  <div className="cnx-col cnx-ded-desc">
                    {isEditable && ded ? (
                      <input
                        type="text"
                        className="cnx-canvas-input"
                        value={ded.label}
                        onChange={(e) => onDeductionChange(idx, 'label', e.target.value)}
                      />
                    ) : (
                      ded?.label || ''
                    )}
                  </div>

                  {/* Deductions Actual Amount */}
                  <div className="cnx-col cnx-ded-act">
                    {isEditable && ded ? (
                      <input
                        type="number"
                        className="cnx-canvas-input num-right"
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

          <div className="cnx-divider-table" />

          {/* Totals Row */}
          <div className="cnx-totals-row">
            <div className="cnx-col cnx-ern-desc bold">Total Earnings:INR.</div>
            <div className="cnx-col cnx-ern-full bold">
              {formatAmount(
                earnings.reduce((s, e) => s + (Number(e.fullAmount !== undefined ? e.fullAmount : e.amount) || 0), 0) || draft.grossEarnings
              )}
            </div>
            <div className="cnx-col cnx-ern-act bold">{formatAmount(draft.grossEarnings)}</div>
            <div className="cnx-col cnx-ded-desc bold">Total Deductions:INR.</div>
            <div className="cnx-col cnx-ded-act bold">{formatAmount(draft.totalDeductions)}</div>
          </div>

          <div className="cnx-divider-table" />

          {/* Net Pay Calculation Row */}
          <div className="cnx-netpay-section">
            <div className="cnx-netpay-line">
              <span className="cnx-netpay-label">Net Pay for the month ( Total Earnings - Total Deductions):</span>
              <span className="cnx-netpay-amount">{formatAmount(draft.netSalary)}</span>
            </div>
            <div className="cnx-netpay-words">
              ({draft.netSalaryInWords ? `${draft.netSalaryInWords}` : 'Rupees Only'})
            </div>
          </div>
        </div>
      </div>

      {/* Signature & Stamp Row */}
      {(company?.showSignature !== false || company?.showStamp !== false) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingRight: '12px' }}>
          <SignatureStampBox
            company={company}
            signatoryTitle={company?.signatoryName || 'Authorized Signatory'}
            signatorySubtitle={company?.signatoryDesignation || 'Human Resources Operations'}
            align="right"
          />
        </div>
      )}

      {/* 4. Footer Note */}
      <div className="cnx-footer-note">
        This is a system generated payslip and does not require signature unless officially stamped.
      </div>

    </div>
  );
};
