import React from 'react';
import { ResizableLogo } from '../common/ResizableLogo';
import { SignatureStampBox } from '../common/SignatureStampBox';

// High-fidelity SVG Sushma Brand Logo matching the original document
export const SushmaLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <svg width="48" height="42" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3 curved swooshes in blue/cyan */}
      <path
        d="M10 65 Q25 45 45 40 Q25 50 15 70 Z"
        fill="#0284c7"
      />
      <path
        d="M20 50 Q45 25 75 18 Q50 32 30 58 Z"
        fill="#0369a1"
      />
      <path
        d="M32 38 Q65 10 95 5 Q70 20 48 45 Z"
        fill="#38bdf8"
      />
      <path
        d="M10 68 L60 68"
        stroke="#0369a1"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
    <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0369a1', letterSpacing: '0.02em', lineHeight: 1 }}>
      SUSHMA
    </span>
  </div>
);

export const SushmaBuildtechPayslip = ({
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
    borderWidth: cfg.slipBorderWidth !== undefined ? `${cfg.slipBorderWidth}px` : undefined,
    borderStyle: cfg.slipBorderStyle || undefined,
    borderColor: cfg.slipBorderColor || undefined,
    borderRadius: cfg.slipBorderRadius !== undefined ? `${cfg.slipBorderRadius}px` : undefined,
    fontSize: cfg.fontSizeScale ? `${cfg.fontSizeScale * 0.008}rem` : undefined,
  };

  const rowMinHeight = cfg.incomeDeductionHeight ? `${cfg.incomeDeductionHeight}px` : undefined;

  // Formatter for Indian Currency string
  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-IN');
  };

  const monthName = draft.month || 'August';
  const yearVal = draft.year || 2025;
  const monthShort = monthName.substring(0, 3);

  const minRows = cfg.minTableRows !== undefined ? Number(cfg.minTableRows) : 6;
  const earnings = draft.earnings || [];
  const deductions = draft.deductions || [];
  const maxRows = Math.max(earnings.length, deductions.length, minRows);
  const extraSpacer = Number(cfg.extraSpacerHeight) || 0;

  const standardDays = dynamic.standardDays !== undefined ? Number(dynamic.standardDays).toFixed(2) : draft.workingDays !== undefined ? Number(draft.workingDays).toFixed(2) : '31.00';
  const lwopDays = dynamic.lwopDays !== undefined ? Number(dynamic.lwopDays).toFixed(2) : draft.lopDays !== undefined ? Number(draft.lopDays).toFixed(2) : '0.00';
  const daysWorked = dynamic.daysWorked !== undefined ? Number(dynamic.daysWorked).toFixed(2) : draft.paidDays !== undefined ? Number(draft.paidDays).toFixed(2) : '31.00';

  const getJoiningDate = () => {
    if (dynamic.dateOfJoiningStr) return dynamic.dateOfJoiningStr;
    if (employee?.joiningDate) {
      const d = new Date(employee.joiningDate);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleString('en-GB', { month: 'long' });
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
      }
    }
    return '01 June 2020';
  };

  return (
    <div className="sushma-buildtech-wrapper" id="sushma-pdf-sheet" style={slipStyle}>
      
      {/* 1. Top Header: Logo on Left, Company Address on Right */}
      <div className="sushma-header-box">
        <div className="sushma-logo-box">
          <ResizableLogo
            company={company}
            isEditable={isEditable}
            fallbackLogo={<SushmaLogo />}
            onSizeSaved={onSizeSaved}
          />
        </div>

        <div className="sushma-address-box">
          <div className="sushma-company-name">
            {company?.name || 'Sushma Buildtech Limited'}
          </div>
          <div className="sushma-address-line">B-107, First Floor, Business</div>
          <div className="sushma-address-line">Complex at Elante Mall, Industrial</div>
          <div className="sushma-address-line">Area-1,Chandigarh-160002</div>
        </div>
      </div>

      {/* 2. Teal Month Header Banner */}
      <div className="sushma-month-banner">
        <span>Payslip for : {monthShort} {yearVal}</span>
      </div>

      {/* 3. Employee Metadata 4-Column Boxed Grid Table */}
      <table className="sushma-meta-table">
        <tbody>
          <tr>
            <td className="sushma-meta-label">Employee Code</td>
            <td className="sushma-meta-val">{employee?.empCode || dynamic.employeeCode || 'S10187'}</td>
            <td className="sushma-meta-label">UAN Number</td>
            <td className="sushma-meta-val">{dynamic.uanNumber || '101719643698'}</td>
          </tr>
          <tr>
            <td className="sushma-meta-label">Employee Name</td>
            <td className="sushma-meta-val">{String(employee?.fullName || 'SURJEET SINGH').toUpperCase()}</td>
            <td className="sushma-meta-label">PF Number</td>
            <td className="sushma-meta-val">{dynamic.pfNumber || 'PB/CHD/29780/38554'}</td>
          </tr>
          <tr>
            <td className="sushma-meta-label">Date of Joining</td>
            <td className="sushma-meta-val">{getJoiningDate()}</td>
            <td className="sushma-meta-label">ESIC Number</td>
            <td className="sushma-meta-val">{dynamic.esicNumber || ''}</td>
          </tr>
          <tr>
            <td className="sushma-meta-label">Designation</td>
            <td className="sushma-meta-val">{employee?.designation || 'Sales Analyst'}</td>
            <td className="sushma-meta-label">Bank Account Number</td>
            <td className="sushma-meta-val">{dynamic.bankAccount || '600810110006815'}</td>
          </tr>
          <tr>
            <td className="sushma-meta-label">Department</td>
            <td className="sushma-meta-val">{String(dynamic.department || employee?.department || 'SALES OPERATION').toUpperCase()}</td>
            <td className="sushma-meta-label">IFSC Code</td>
            <td className="sushma-meta-val">{dynamic.ifscCode || 'BKID0006791'}</td>
          </tr>
          <tr>
            <td className="sushma-meta-label">Grade</td>
            <td className="sushma-meta-val">{dynamic.grade || '28'}</td>
            <td className="sushma-meta-label">Standard Days</td>
            <td className="sushma-meta-val">
              {isEditable ? (
                <input
                  type="number"
                  className="sushma-canvas-input"
                  value={draft.workingDays !== undefined ? draft.workingDays : 31}
                  onChange={(e) => {
                    if (onDaysChange) onDaysChange('workingDays', e.target.value);
                  }}
                  style={{ width: '55px' }}
                />
              ) : (
                standardDays
              )}
            </td>
          </tr>
          <tr>
            <td className="sushma-meta-label">Location</td>
            <td className="sushma-meta-val">{dynamic.location || 'Chandigarh'}</td>
            <td className="sushma-meta-label">LWOP Days</td>
            <td className="sushma-meta-val">
              {isEditable ? (
                <input
                  type="number"
                  className="sushma-canvas-input"
                  value={draft.lopDays !== undefined ? draft.lopDays : 0}
                  onChange={(e) => {
                    if (onDaysChange) onDaysChange('lopDays', e.target.value);
                  }}
                  style={{ width: '55px' }}
                />
              ) : (
                lwopDays
              )}
            </td>
          </tr>
          <tr>
            <td className="sushma-meta-label">PAN Number</td>
            <td className="sushma-meta-val">{dynamic.panNumber || 'FWUPS9092F'}</td>
            <td className="sushma-meta-label">Days Worked</td>
            <td className="sushma-meta-val">
              {isEditable ? (
                <input
                  type="number"
                  className="sushma-canvas-input"
                  value={draft.paidDays !== undefined ? draft.paidDays : 31}
                  onChange={(e) => {
                    if (onDaysChange) onDaysChange('paidDays', e.target.value);
                  }}
                  style={{ width: '55px' }}
                />
              ) : (
                daysWorked
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 4. Financials 5-Column Table */}
      <table className="sushma-fin-table">
        <thead>
          <tr>
            <th className="sushma-th-ern-desc">Earnings</th>
            <th className="sushma-th-ern-rate">Standard Rate</th>
            <th className="sushma-th-ern-amt">Amount</th>
            <th className="sushma-th-ded-desc">Deductions</th>
            <th className="sushma-th-ded-amt">Amount</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, idx) => {
            const ern = earnings[idx];
            const ded = deductions[idx];

            return (
              <tr key={idx} className="sushma-fin-tr" style={{ height: rowMinHeight }}>
                {/* Earning Label */}
                <td className="sushma-td-ern-desc">
                  {isEditable && ern ? (
                    <input
                      type="text"
                      className="sushma-canvas-input"
                      value={ern.label}
                      onChange={(e) => onEarningChange(idx, 'label', e.target.value)}
                    />
                  ) : (
                    ern?.label || ''
                  )}
                </td>

                {/* Standard Rate */}
                <td className="sushma-td-ern-rate">
                  {isEditable && ern ? (
                    <input
                      type="number"
                      className="sushma-canvas-input num-right"
                      value={ern.rate !== undefined ? ern.rate : (ern.label.toLowerCase().includes('bonus') ? '' : ern.amount)}
                      onChange={(e) => onEarningChange(idx, 'rate', e.target.value)}
                    />
                  ) : (
                    ern ? (ern.rate !== undefined ? formatAmount(ern.rate) : (ern.label.toLowerCase().includes('bonus') ? '' : formatAmount(ern.amount))) : ''
                  )}
                </td>

                {/* Earning Amount */}
                <td className="sushma-td-ern-amt">
                  {isEditable && ern ? (
                    <input
                      type="number"
                      className="sushma-canvas-input num-right"
                      value={ern.amount}
                      onChange={(e) => onEarningChange(idx, 'amount', e.target.value)}
                    />
                  ) : (
                    ern ? formatAmount(ern.amount) : ''
                  )}
                </td>

                {/* Deduction Label */}
                <td className="sushma-td-ded-desc">
                  {isEditable && ded ? (
                    <input
                      type="text"
                      className="sushma-canvas-input"
                      value={ded.label}
                      onChange={(e) => onDeductionChange(idx, 'label', e.target.value)}
                    />
                  ) : (
                    ded?.label || ''
                  )}
                </td>

                {/* Deduction Amount */}
                <td className="sushma-td-ded-amt">
                  {isEditable && ded ? (
                    <input
                      type="number"
                      className="sushma-canvas-input num-right"
                      value={ded.amount}
                      onChange={(e) => onDeductionChange(idx, 'amount', e.target.value)}
                    />
                  ) : (
                    ded ? formatAmount(ded.amount) : ''
                  )}
                </td>
              </tr>
            );
          })}

            {/* Extra bottom white space spacer */}
            {extraSpacer > 0 && (
              <tr className="sushma-spacer-row" style={{ height: `${extraSpacer}px` }}>
                <td className="sushma-td-ern-desc"></td>
                <td className="sushma-td-ern-rate"></td>
                <td className="sushma-td-ern-amt"></td>
                <td className="sushma-td-ded-desc"></td>
                <td className="sushma-td-ded-amt"></td>
              </tr>
            )}

          {/* Gross Earnings & Deductions Row */}
          <tr className="sushma-totals-row">
            <td colSpan={2} className="sushma-gross-label bold">Gross Earning</td>
            <td className="sushma-gross-amt bold">{formatAmount(draft.grossEarnings)}</td>
            <td className="sushma-gross-ded-label bold">Gross Deduction</td>
            <td className="sushma-gross-ded-amt bold">{formatAmount(draft.totalDeductions)}</td>
          </tr>

          {/* Net Pay Row */}
          <tr className="sushma-netpay-row">
            <td className="sushma-net-title bold">Net Pay</td>
            <td className="sushma-net-amt bold">{formatAmount(draft.netSalary)}</td>
            <td colSpan={3} className="sushma-net-words bold">
              ({draft.netSalaryInWords ? `${draft.netSalaryInWords}` : 'Rupees Only'})
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signature & Stamp Row */}
      {(company?.showSignature !== false || company?.showStamp !== false) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingRight: '12px' }}>
          <SignatureStampBox
            company={company}
            signatoryTitle={company?.signatoryName || 'Authorized Signatory'}
            signatorySubtitle={company?.signatoryDesignation || 'Head of HR & Admin'}
            align="right"
          />
        </div>
      )}

      {/* 5. Remarks & Computer Generated Note */}
      <div className="sushma-remarks-section">
        <div className="sushma-remarks-title bold">Remarks:</div>
        <div className="sushma-disclaimer">
          *This is a computer generated payslip and doesn't require signature or any company seal.
        </div>
      </div>

    </div>
  );
};
