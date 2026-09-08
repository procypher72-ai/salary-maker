import React from 'react';
import { ResizableLogo } from '../common/ResizableLogo';
import { SignatureStampBox } from '../common/SignatureStampBox';

// HCL Tech Branding Icon / Text matching Original PDF
export const HclBrandLogo = () => (
  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', whiteSpace: 'nowrap' }}>
    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0056b3', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
      HCLTech
    </div>
    <div style={{ fontSize: '0.62rem', color: '#000000', fontWeight: 600, marginTop: '2px', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
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
  layoutConfig = null,
}) => {
  const dynamic = employee?.dynamicFields || {};
  const cfg = layoutConfig || company || {};

  const slipStyle = {
    maxWidth: cfg.slipWidth ? `${cfg.slipWidth}px` : undefined,
    minHeight: cfg.slipMinHeight ? `${cfg.slipMinHeight}px` : undefined,
    fontSize: cfg.fontSizeScale ? `${cfg.fontSizeScale * 0.0075}rem` : undefined,
  };

  // Formatter for Indian Currency string (e.g. 1,59,030.00)
  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num) || num === '') return '0.00';
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
  const defaultStandardItems = [
    { label: 'Basic Salary', amount: 87450 },
    { label: 'HRA', amount: 34980 },
    { label: 'Travel Allowance', amount: 22600 },
    { label: 'Holiday Allowance', amount: 9500 },
    { label: 'Food Wallet', amount: 4500 },
  ];

  let standardItems = draft.standardItems || dynamic.standardSalaryItems;
  if (!standardItems || standardItems.length === 0) {
    const nonVariableEarnings = earnings.filter(
      (e) => !/incentive|bonus|variable|arrear|one-time|reimbursement/i.test(e.label || '')
    );
    if (nonVariableEarnings.length > 0) {
      standardItems = nonVariableEarnings;
    } else {
      standardItems = defaultStandardItems;
    }
  }

  const totalStandardSalary = standardItems.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  const minRows = cfg.minTableRows !== undefined ? Number(cfg.minTableRows) : 6;
  const maxRows = Math.max(standardItems.length, earnings.length, deductions.length, minRows);
  const extraSpacer = Number(cfg.extraSpacerHeight) || 0;
  const rowHeightStyle = cfg.incomeDeductionHeight ? { height: `${cfg.incomeDeductionHeight}px` } : undefined;
  const daysWorked = draft.workingDays !== undefined ? draft.workingDays : 31;

  // Helper to get formatted DOJ / Gender
  const getDojGender = () => {
    if (dynamic.dojGender) return dynamic.dojGender;
    const doj = employee?.joiningDate
      ? new Date(employee.joiningDate).toLocaleDateString('en-GB').replace(/\//g, '.')
      : '01.11.2023';
    const gender = dynamic.gender || 'Male';
    return `${doj} / ${gender}`;
  };

  return (
    <div className="hcl-corporate-wrapper landscape-slip" id="hcl-pdf-sheet" style={slipStyle}>
      
      {/* 1. Main Unified Table (Guarantees zero gaps and perfectly joined lines) */}
      <table className="hcl-table-sheet">
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '13.33%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '13.33%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '13.34%' }} />
        </colgroup>
        <tbody>
          
          {/* HEADER ROW */}
          <tr>
            <td colSpan={6} className="hcl-cell-header">
              <div className="hcl-header-content">
                <div className="hcl-header-center">
                  <div className="hcl-main-title">Payslip for the Month of {monthName}-{yearVal}</div>
                  <div className="hcl-sub-period">
                    Pay Period {payPeriodString.includes('to') ? payPeriodString : `01.${monthName}.${yearVal} to 31.${monthName}.${yearVal}`}
                  </div>
                  <div className="hcl-emp-title">{employee?.fullName || 'Hardeep Singh'}</div>
                </div>
                <div className="hcl-header-right">
                  <ResizableLogo
                    company={company}
                    isEditable={isEditable}
                    fallbackLogo={<HclBrandLogo />}
                    onSizeSaved={onSizeSaved}
                    defaultPosition="right"
                  />
                </div>
              </div>
            </td>
          </tr>

          {/* METADATA ROW (2 Equal Columns with middle vertical divider) */}
          <tr>
            <td colSpan={3} className="hcl-cell-meta-left">
              <table className="hcl-meta-subtable">
                <tbody>
                  <tr>
                    <td className="hcl-meta-lbl">Employee ID</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">{employee?.empCode || 'S285679'}</td>
                  </tr>
                  <tr>
                    <td className="hcl-meta-lbl">Designation</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">{employee?.designation || 'Software Engineer'}</td>
                  </tr>
                  <tr>
                    <td className="hcl-meta-lbl">DOJ / Gender</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">{getDojGender()}</td>
                  </tr>
                  <tr>
                    <td className="hcl-meta-lbl">PAN No</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">{dynamic.panNumber || employee?.pan || 'KEJPS3652M'}</td>
                  </tr>
                  <tr>
                    <td className="hcl-meta-lbl">PF / Pension No*</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">{dynamic.pfPensionNo || employee?.pfNumber || 'HIL EPF Trust-GN/GGN/5572/635481'}</td>
                  </tr>
                  <tr>
                    <td className="hcl-meta-lbl">UAN No</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">{dynamic.uanNumber || employee?.uan || '100417097851'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td colSpan={3} className="hcl-cell-meta-right">
              <table className="hcl-meta-subtable">
                <tbody>
                  <tr>
                    <td className="hcl-meta-lbl">Bank Name & Account No</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">
                      {dynamic.bankNameAccount ||
                        (employee?.bankName ? `${employee.bankName} ${employee.bankAccountNo || ''}` : 'BOI BANK 600810110006820')}
                    </td>
                  </tr>
                  <tr>
                    <td className="hcl-meta-lbl">Location</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">{dynamic.location || 'Chandigarh'}</td>
                  </tr>
                  <tr>
                    <td className="hcl-meta-lbl">Department</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">{dynamic.department || employee?.department || 'IT'}</td>
                  </tr>
                  <tr>
                    <td className="hcl-meta-lbl">Band</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">{dynamic.band || 'S2'}</td>
                  </tr>
                  <tr>
                    <td className="hcl-meta-lbl">Days worked in month</td>
                    <td className="hcl-meta-colon">:</td>
                    <td className="hcl-meta-val">
                      {isEditable ? (
                        <input
                          type="number"
                          className="hcl-plain-input"
                          value={draft.workingDays !== undefined ? draft.workingDays : 31}
                          onChange={(e) => onDaysChange && onDaysChange('workingDays', e.target.value)}
                          style={{ width: '45px' }}
                        />
                      ) : (
                        `${Number(daysWorked).toFixed(2)}`
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* FINANCIAL TABLE HEADERS */}
          <tr className="hcl-tr-fin-header">
            <th className="hcl-th-col hcl-th-std-lbl">Standard Monthly Salary</th>
            <th className="hcl-th-col hcl-th-std-inr">INR</th>
            <th className="hcl-th-col hcl-th-ern-lbl">Earnings</th>
            <th className="hcl-th-col hcl-th-ern-inr">INR</th>
            <th className="hcl-th-col hcl-th-ded-lbl">Deductions</th>
            <th className="hcl-th-col hcl-th-ded-inr">INR</th>
          </tr>

          {/* FINANCIAL LINE ITEM ROWS */}
          {Array.from({ length: maxRows }).map((_, idx) => {
            const std = standardItems[idx];
            const ern = earnings[idx];
            const ded = deductions[idx];

            return (
              <tr key={idx} className="hcl-tr-fin-body" style={rowHeightStyle}>
                {/* Standard Monthly Salary */}
                <td className="hcl-td-col hcl-td-std-lbl">{std ? std.label : ''}</td>
                <td className="hcl-td-col hcl-td-std-inr">{std ? formatAmount(std.amount) : ''}</td>

                {/* Earnings */}
                <td className="hcl-td-col hcl-td-ern-lbl">
                  {isEditable && ern ? (
                    <input
                      type="text"
                      className="hcl-plain-input"
                      value={ern.label}
                      onChange={(e) => onEarningChange && onEarningChange(idx, 'label', e.target.value)}
                    />
                  ) : (
                    ern?.label || ''
                  )}
                </td>
                <td className="hcl-td-col hcl-td-ern-inr">
                  {isEditable && ern ? (
                    <input
                      type="number"
                      className="hcl-plain-input text-right"
                      value={ern.amount}
                      onChange={(e) => onEarningChange && onEarningChange(idx, 'amount', e.target.value)}
                    />
                  ) : (
                    ern ? formatAmount(ern.amount) : ''
                  )}
                </td>

                {/* Deductions */}
                <td className="hcl-td-col hcl-td-ded-lbl">
                  {isEditable && ded ? (
                    <input
                      type="text"
                      className="hcl-plain-input"
                      value={ded.label}
                      onChange={(e) => onDeductionChange && onDeductionChange(idx, 'label', e.target.value)}
                    />
                  ) : (
                    ded?.label || ''
                  )}
                </td>
                <td className="hcl-td-col hcl-td-ded-inr">
                  {isEditable && ded ? (
                    <input
                      type="number"
                      className="hcl-plain-input text-right"
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

          {/* EXTRA BOTTOM WHITE SPACE SPACER ROW */}
          {extraSpacer > 0 && (
            <tr className="hcl-tr-spacer" style={{ height: `${extraSpacer}px` }}>
              <td className="hcl-td-col hcl-td-std-lbl"></td>
              <td className="hcl-td-col hcl-td-std-inr"></td>
              <td className="hcl-td-col hcl-td-ern-lbl"></td>
              <td className="hcl-td-col hcl-td-ern-inr"></td>
              <td className="hcl-td-col hcl-td-ded-lbl"></td>
              <td className="hcl-td-col hcl-td-ded-inr"></td>
            </tr>
          )}

          {/* TOTALS ROW */}
          <tr className="hcl-tr-totals">
            <td className="hcl-td-col hcl-tot-std-lbl">Total Standard Salary</td>
            <td className="hcl-td-col hcl-tot-std-inr">{formatAmount(totalStandardSalary)}</td>
            <td className="hcl-td-col hcl-tot-ern-lbl">Gross Earnings</td>
            <td className="hcl-td-col hcl-tot-ern-inr">{formatAmount(draft.grossEarnings)}</td>
            <td className="hcl-td-col hcl-tot-ded-lbl">Gross Deductions</td>
            <td className="hcl-td-col hcl-tot-ded-inr">{formatAmount(draft.totalDeductions)}</td>
          </tr>

          {/* NET PAY ROW */}
          <tr className="hcl-tr-netpay">
            <td colSpan={4} className="hcl-net-blank-cell"></td>
            <td className="hcl-td-col hcl-net-lbl">Net Pay</td>
            <td className="hcl-td-col hcl-net-inr">{formatAmount(draft.netSalary)}</td>
          </tr>
        </tbody>
      </table>

      {/* Optional Signature & Stamp (rendered only if explicitly enabled in company preferences) */}
      {company?.showSignature === true && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 12px 2px' }}>
          <SignatureStampBox
            company={company}
            signatoryTitle={company?.signatoryName || 'Authorized Signatory'}
            signatorySubtitle={company?.signatoryDesignation || 'Head of HR'}
            align="right"
          />
        </div>
      )}

      {/* FOOTER DISCLAIMER */}
      <div className="hcl-footer-text">
        *This is a computer generated payslip and doesn't require signature or any company seal.
      </div>

    </div>
  );
};
