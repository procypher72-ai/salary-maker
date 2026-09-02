import React from 'react';
import { ResizableLogo } from '../common/ResizableLogo';
import g20LogoImg from '../../assets/g20-india-logo.png';

// SVG AIIMS Circular Seal Logo matching PDF top-left
export const AiimsEmblemLogo = () => (
  <svg width="68" height="68" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="54" stroke="#0a2540" strokeWidth="4" fill="#ffffff" />
    <circle cx="60" cy="60" r="48" stroke="#0a2540" strokeWidth="1.5" fill="none" />
    {/* Inner caduceus / snake & staff representation */}
    <path d="M60 22 L60 98" stroke="#0a2540" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="60" cy="22" r="5" fill="#0a2540" />
    <path d="M42 38 Q60 28 78 38 Q60 52 42 66 Q60 80 78 66" stroke="#0a2540" strokeWidth="3" fill="none" />
    <path d="M78 38 Q60 28 42 38 Q60 52 78 66 Q60 80 42 66" stroke="#0a2540" strokeWidth="3" fill="none" />
    <text x="60" y="112" fontSize="9" textAnchor="middle" fill="#0a2540" fontFamily="sans-serif" fontWeight="bold">
      शरीरमाद्यं खलु धर्मसाधनम्
    </text>
  </svg>
);

// G20 Emblem using downloaded asset image
export const G20Logo = () => (
  <div style={{ textAlign: 'center', minWidth: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img
      src={g20LogoImg}
      alt="G20 India"
      style={{
        maxHeight: '62px',
        maxWidth: '90px',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  </div>
);

export const AiimsGovtPayslip = ({
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

  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-IN');
  };

  const monthName = draft.month || 'September';
  const yearVal = draft.year || 2025;
  const reportTimeText = dynamic.reportDateTime || `02-Mar-${new Date().getFullYear()}&11:28 AM`;

  const earnings = draft.earnings || [];
  const deductions = draft.deductions || [];
  const maxRows = Math.max(earnings.length, deductions.length, 10);

  return (
    <div className="aiims-govt-wrapper" id="aiims-pdf-sheet">
      
      {/* 1. Header with AIIMS Emblem, Address & G20 Logo */}
      <div className="aiims-header-box">
        <div className="aiims-header-left">
          <ResizableLogo
            company={company}
            isEditable={isEditable}
            fallbackLogo={<AiimsEmblemLogo />}
            onSizeSaved={onSizeSaved}
          />
        </div>

        <div className="aiims-header-center">
          <h1 className="aiims-main-title">{company?.name || 'All India Institute Of Medical Sciences'}</h1>
          <div className="aiims-address-line">Sri Aurobindo Marg, Ansari</div>
          <div className="aiims-address-line">Nagar, Ansari Nagar East New Delhi,</div>
          <div className="aiims-address-line">Delhi-110029</div>
          <div className="aiims-payslip-month">Pay Slip : {monthName} {yearVal}</div>
        </div>

        <div className="aiims-header-right">
          <ResizableLogo
            company={company}
            fieldPrefix="secondaryLogo"
            isEditable={isEditable}
            fallbackLogo={<G20Logo />}
            onSizeSaved={onSizeSaved}
          />
        </div>
      </div>

      {/* 2. Report Date & Timestamp Line */}
      <div className="aiims-report-timestamp">
        Report Date: {reportTimeText}
      </div>

      {/* 3. Employee Metadata 4-Column Boxed Grid */}
      <div className="aiims-meta-boxed-grid">
        {/* Row 1 */}
        <div className="aiims-meta-cell-label">Employee Code</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{employee?.empCode || 'E0400345'}</div>
        
        <div className="aiims-meta-cell-label right-side">Employee Name</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{employee?.fullName || 'AMITESH KUMAR YADAV'}</div>

        {/* Row 2 */}
        <div className="aiims-meta-cell-label">Current Designation</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{employee?.designation || 'Senior Programmer'}</div>
        
        <div className="aiims-meta-cell-label right-side">Current Department</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{dynamic.department || employee?.department || 'IT'}</div>

        {/* Row 3 */}
        <div className="aiims-meta-cell-label">Dealing Office</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{dynamic.dealingOffice || 'Faculty Cell'}</div>
        
        <div className="aiims-meta-cell-label right-side">PAN Number</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{dynamic.panNumber || 'AKLPY8113F'}</div>

        {/* Row 4 */}
        <div className="aiims-meta-cell-label">Pay Details</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{dynamic.payDetails || 'Level 10(15600 - 5400 - 39100)'}</div>
        
        <div className="aiims-meta-cell-label right-side">Old Salary Code</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{dynamic.oldSalaryCode || 'JHN163'}</div>

        {/* Row 5 */}
        <div className="aiims-meta-cell-label">Bank Account No.</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{dynamic.bankAccount || '20457116529'}</div>
        
        <div className="aiims-meta-cell-label right-side">PFMS-NO</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{dynamic.pfmsNo || 'VAININ00359313'}</div>

        {/* Row 6 */}
        <div className="aiims-meta-cell-label">Bank Name</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{dynamic.bankName || 'SBI'}</div>
        
        <div className="aiims-meta-cell-label right-side">IFSC Code</div>
        <div className="aiims-meta-cell-colon">:</div>
        <div className="aiims-meta-cell-val">{dynamic.ifscCode || 'SBIN00033211'}</div>
      </div>

      {/* 4. Financials Two-Column Boxed Table */}
      <div className="aiims-fin-table">
        {/* Table Header */}
        <div className="aiims-fin-header-row">
          <div className="aiims-fin-th-earning-desc">Salary Details</div>
          <div className="aiims-fin-th-earning-amt">Rs.</div>
          <div className="aiims-fin-th-deduction-desc">Deductions/Recoveries</div>
          <div className="aiims-fin-th-deduction-amt">Rs.</div>
        </div>

        {/* Line Items */}
        <div className="aiims-fin-rows">
          {Array.from({ length: maxRows }).map((_, idx) => {
            const ern = earnings[idx];
            const ded = deductions[idx];

            return (
              <div key={idx} className="aiims-fin-row">
                {/* Earning Label */}
                <div className="aiims-fin-td-earning-desc">
                  {isEditable && ern ? (
                    <input
                      type="text"
                      className="aiims-canvas-input"
                      value={ern.label}
                      onChange={(e) => onEarningChange(idx, 'label', e.target.value)}
                    />
                  ) : (
                    ern?.label || ''
                  )}
                </div>

                {/* Earning Amount */}
                <div className="aiims-fin-td-earning-amt">
                  {isEditable && ern ? (
                    <input
                      type="number"
                      className="aiims-canvas-input num-right"
                      value={ern.amount}
                      onChange={(e) => onEarningChange(idx, 'amount', e.target.value)}
                    />
                  ) : (
                    ern ? formatAmount(ern.amount) : ''
                  )}
                </div>

                {/* Deduction Label */}
                <div className="aiims-fin-td-deduction-desc">
                  {isEditable && ded ? (
                    <input
                      type="text"
                      className="aiims-canvas-input"
                      value={ded.label}
                      onChange={(e) => onDeductionChange(idx, 'label', e.target.value)}
                    />
                  ) : (
                    ded?.label || ''
                  )}
                </div>

                {/* Deduction Amount */}
                <div className="aiims-fin-td-deduction-amt">
                  {isEditable && ded ? (
                    <input
                      type="number"
                      className="aiims-canvas-input num-right"
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

        {/* Totals Summary Row */}
        <div className="aiims-fin-totals-row">
          <div className="aiims-tot-label">Gross Salary</div>
          <div className="aiims-tot-val">Rs. {formatAmount(draft.grossEarnings)}</div>
          <div className="aiims-tot-label">Total(Deductions + Recoveries)</div>
          <div className="aiims-tot-val">Rs. {formatAmount(draft.totalDeductions)}</div>
        </div>
      </div>

      {/* 5. Net Pay in Words & Figures Bottom Line */}
      <div className="aiims-netpay-bottom-box">
        <strong>Net Pay Rs. {formatAmount(draft.netSalary)} ({draft.netSalaryInWords || 'Ninety Nine Thousand One Hundred Thirty Two Only'})</strong>
      </div>

    </div>
  );
};
