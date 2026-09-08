import React from 'react';
import { ResizableLogo } from '../common/ResizableLogo';
import { SignatureStampBox } from '../common/SignatureStampBox';
import g20LogoImg from '../../assets/g20-india-logo.png';

// High-fidelity SVG AIIMS Circular Seal Logo matching original PDF
export const AiimsEmblemLogo = () => (
  <svg width="78" height="78" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="70" cy="62" r="58" stroke="#0a2540" strokeWidth="3" fill="#ffffff" />
    <circle cx="70" cy="62" r="52" stroke="#0a2540" strokeWidth="1.2" fill="none" />
    <circle cx="70" cy="62" r="38" stroke="#0a2540" strokeWidth="1.5" fill="none" />

    {/* Outer Circular Ring Text */}
    <path id="aiimsTopTextArc" d="M 24,62 A 46,46 0 0,1 116,62" fill="none" />
    <text fontSize="7.5" fill="#0a2540" fontWeight="bold" fontFamily="'Times New Roman', serif">
      <textPath href="#aiimsTopTextArc" startOffset="50%" textAnchor="middle">
        भारतीय आयुर्विज्ञान संस्थान
      </textPath>
    </text>

    <path id="aiimsBottomTextArc" d="M 116,62 A 46,46 0 0,1 24,62" fill="none" />
    <text fontSize="6.2" fill="#0a2540" fontWeight="bold" fontFamily="'Times New Roman', serif">
      <textPath href="#aiimsBottomTextArc" startOffset="50%" textAnchor="middle">
        ALL INDIA INSTITUTE OF MEDICAL SCIENCES
      </textPath>
    </text>

    {/* Central Caduceus / Staff & Snake Emblem */}
    <path d="M70 28 L70 94" stroke="#0a2540" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="70" cy="27" r="4" fill="#0a2540" />
    
    {/* Intertwining Serpent Curves */}
    <path d="M52 40 C68 32, 72 48, 70 54 C68 60, 52 66, 70 74 C88 82, 70 92, 70 92" stroke="#0a2540" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M88 40 C72 32, 68 48, 70 54 C72 60, 88 66, 70 74 C52 82, 70 92, 70 92" stroke="#0a2540" strokeWidth="2.5" fill="none" strokeLinecap="round" />

    {/* Sanskrit Motto Banner at Bottom */}
    <text x="70" y="130" fontSize="8.5" textAnchor="middle" fill="#0a2540" fontFamily="'Times New Roman', serif" fontWeight="bold">
      शरीरमाद्यं खलु धर्मसाधनम्
    </text>
  </svg>
);

// G20 Emblem using downloaded asset image
export const G20Logo = () => (
  <div style={{ textAlign: 'center', minWidth: '75px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img
      src={g20LogoImg}
      alt="G20 India"
      style={{
        maxHeight: '65px',
        maxWidth: '95px',
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
  layoutConfig = null,
}) => {
  const dynamic = employee?.dynamicFields || {};
  const cfg = layoutConfig || company || {};

  const slipStyle = {
    maxWidth: cfg.slipWidth ? `${cfg.slipWidth}px` : undefined,
    minHeight: cfg.slipMinHeight ? `${cfg.slipMinHeight}px` : undefined,
    padding: cfg.slipPadding ? `${cfg.slipPadding}px` : undefined,
    border: (cfg.slipBorderWidth && cfg.slipBorderWidth > 0 && cfg.slipBorderWidth !== 1)
      ? `${cfg.slipBorderWidth}px ${cfg.slipBorderStyle || 'solid'} ${cfg.slipBorderColor || '#000000'}`
      : 'none',
    borderRadius: cfg.slipBorderRadius !== undefined ? `${cfg.slipBorderRadius}px` : undefined,
    fontSize: cfg.fontSizeScale ? `${cfg.fontSizeScale * 0.0084}rem` : undefined,
  };

  const rowMinHeight = cfg.incomeDeductionHeight ? `${cfg.incomeDeductionHeight}px` : undefined;
  const finTableMinHeight = cfg.incomeDeductionMinHeight ? `${cfg.incomeDeductionMinHeight}px` : undefined;

  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-IN');
  };

  const formatText = (text) => {
    if (!text) return '';
    const trimmed = String(text).trim();
    if (trimmed === 'AMITESHKUMARYADAV') return 'AMITESH KUMAR YADAV';
    if (trimmed === 'SeniorProgrammer') return 'Senior Programmer';
    if (trimmed === 'FacultyCell') return 'Faculty Cell';
    return trimmed;
  };

  const monthName = draft.month || 'September';
  const yearVal = draft.year || 2025;
  const reportTimeText = dynamic.reportDateTime || `02-Mar-${new Date().getFullYear()}&11:28 AM`;

  const minRows = cfg.minTableRows !== undefined ? Number(cfg.minTableRows) : 10;
  const earnings = draft.earnings || [];
  const deductions = draft.deductions || [];
  const maxRows = Math.max(earnings.length, deductions.length, minRows);
  const extraSpacer = Number(cfg.extraSpacerHeight) || 0;

  return (
    <div className="aiims-govt-wrapper" id="aiims-pdf-sheet" style={slipStyle}>
      
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

      {/* 3. Employee Metadata Table with exact solid borders */}
      <table className="aiims-meta-table">
        <tbody>
          {/* Row 1 */}
          <tr>
            <td className="meta-lbl">Employee Code</td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(employee?.empCode) || 'E0400345'}</td>
            <td className="meta-lbl v-divider">Employee Name</td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(employee?.fullName) || 'AMITESH KUMAR YADAV'}</td>
          </tr>

          {/* Row 2 */}
          <tr>
            <td className="meta-lbl">
              Current<br />Designation
            </td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(employee?.designation) || 'Senior Programmer'}</td>
            <td className="meta-lbl v-divider">
              Current<br />Department
            </td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(dynamic.department || employee?.department) || 'IT'}</td>
          </tr>

          {/* Row 3 */}
          <tr>
            <td className="meta-lbl">Dealing Office</td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(dynamic.dealingOffice) || 'Faculty Cell'}</td>
            <td className="meta-lbl v-divider">PAN Number</td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(dynamic.panNumber) || 'AKLPY8113F'}</td>
          </tr>

          {/* Row 4 */}
          <tr>
            <td className="meta-lbl">Pay Details</td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(dynamic.payDetails) || 'Level 10(15600 - 5400 - 39100)'}</td>
            <td className="meta-lbl v-divider">Old Salary Code</td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(dynamic.oldSalaryCode) || 'JHN163'}</td>
          </tr>

          {/* Row 5 */}
          <tr>
            <td className="meta-lbl">Bank Account No.</td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(dynamic.bankAccount) || '20457116529'}</td>
            <td className="meta-lbl v-divider">PFMS-NO</td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(dynamic.pfmsNo) || 'VAININ00359313'}</td>
          </tr>

          {/* Row 6 */}
          <tr>
            <td className="meta-lbl">Bank Name</td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(dynamic.bankName) || 'SBI'}</td>
            <td className="meta-lbl v-divider">IFSC Code</td>
            <td className="meta-colon">:</td>
            <td className="meta-val">{formatText(dynamic.ifscCode) || 'SBIN00033211'}</td>
          </tr>
        </tbody>
      </table>

      {/* 4. Financials Continuous Table with Solid Center Dividing Line */}
      <table className="aiims-fin-table" style={{ minHeight: finTableMinHeight }}>
        <thead>
          {/* Header Row 1: Section Titles */}
          <tr className="aiims-fin-head-main">
            <th colSpan="2" className="th-center v-divider">Salary Details</th>
            <th colSpan="2" className="th-center">Deductions/Recoveries</th>
          </tr>
          {/* Header Row 2: Rs. Sub-headers */}
          <tr className="aiims-fin-head-sub">
            <th className="th-desc-blank"></th>
            <th className="th-rs v-divider">Rs.</th>
            <th className="th-desc-blank"></th>
            <th className="th-rs">Rs.</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, idx) => {
            const ern = earnings[idx];
            const ded = deductions[idx];

            return (
              <tr key={idx} className="aiims-item-row" style={{ height: rowMinHeight }}>
                {/* Earning Label */}
                <td className="td-desc">
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
                </td>

                {/* Earning Amount */}
                <td className="td-amt v-divider">
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
                </td>

                {/* Deduction Label */}
                <td className="td-desc">
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
                </td>

                {/* Deduction Amount */}
                <td className="td-amt">
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
                </td>
              </tr>
            );
          })}

          {/* Extra bottom white space spacer */}
          {extraSpacer > 0 && (
            <tr className="aiims-spacer-row" style={{ height: `${extraSpacer}px` }}>
              <td className="td-desc"></td>
              <td className="td-amt v-divider"></td>
              <td className="td-desc"></td>
              <td className="td-amt"></td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="aiims-totals-row">
            <td className="tot-lbl">Gross Salary</td>
            <td className="tot-val v-divider">
              <span className="tot-rs-prefix">Rs.</span> {formatAmount(draft.grossEarnings)}
            </td>
            <td className="tot-lbl">Total(Deductions +Recoveries)</td>
            <td className="tot-val">
              <span className="tot-rs-prefix">Rs.</span> {formatAmount(draft.totalDeductions)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 5. Net Pay in Words & Figures Bottom Line */}
      <div className="aiims-netpay-bottom-box">
        <strong>Net Pay Rs. {formatAmount(draft.netSalary)} ({draft.netSalaryInWords || 'Ninety Nine Thousand One Hundred Thirty Two Only'})</strong>
      </div>

      {/* Signature & Stamp Area */}
      {(company?.showSignature !== false || company?.showStamp !== false) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px', paddingRight: '10px' }}>
          <SignatureStampBox
            company={company}
            signatoryTitle={company?.signatoryName || 'Drawing & Disbursing Officer (DDO)'}
            signatorySubtitle={company?.signatoryDesignation || 'Finance & Accounts Division, AIIMS'}
            align="right"
          />
        </div>
      )}

    </div>
  );
};
