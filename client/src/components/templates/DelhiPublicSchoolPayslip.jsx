import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ResizableLogo } from '../common/ResizableLogo';
import dwpsLogoImg from '../../assets/dwps_logo.png';
import { dwpsLogoBase64 } from '../../assets/dwpsLogoBase64';

// Fallback high-resolution Delhi World Public School Logo extracted directly from official payslip
export const DwpsLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
    <img
      src={dwpsLogoBase64 || dwpsLogoImg}
      alt="Delhi World Public School Crest"
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  </div>
);

// Number to Indian Words Converter
function numberToIndianWords(num) {
  if (!num || isNaN(num) || num <= 0) return 'Rupees Zero Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + Math.floor(num)).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return `Rupees ${num} Only`;
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  
  const cleanStr = str.replace(/\s+/g, ' ').trim();
  return `Rupees ${cleanStr} Only`;
}

// Calculate Period String (e.g. Period 01/06/2023-30/06/2023)
function getPayPeriodString(monthName, yearVal) {
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  let mIdx = -1;
  if (typeof monthName === 'number') {
    mIdx = monthName - 1;
  } else if (typeof monthName === 'string') {
    const num = parseInt(monthName, 10);
    if (!isNaN(num) && num >= 1 && num <= 12) {
      mIdx = num - 1;
    } else {
      mIdx = monthNames.findIndex((m) => m.startsWith(monthName.trim().toLowerCase().slice(0, 3)));
    }
  }
  if (mIdx < 0 || mIdx > 11) mIdx = 5; // Default June

  const yr = Number(yearVal) || 2023;
  const pad = (n) => String(n).padStart(2, '0');
  const monthNum = pad(mIdx + 1);
  const lastDay = pad(new Date(yr, mIdx + 1, 0).getDate());

  return `(Period 01/${monthNum}/${yr}-${lastDay}/${monthNum}/${yr})`;
}

export const DelhiPublicSchoolPayslip = ({
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
  const dynamic = employee?.dynamicFields instanceof Map
    ? Object.fromEntries(employee.dynamicFields)
    : (employee?.dynamicFields || {});
  const cfg = layoutConfig || company || {};

  const slipStyle = {
    maxWidth: cfg.slipWidth ? `${cfg.slipWidth}px` : '794px',
    minHeight: cfg.slipMinHeight && cfg.slipMinHeight > 0 ? `${cfg.slipMinHeight}px` : undefined,
    padding: cfg.slipPadding && cfg.slipPadding !== 24 ? `${cfg.slipPadding}px` : undefined,
    fontSize: cfg.fontSizeScale ? `${cfg.fontSizeScale * 0.0082}rem` : undefined,
    pageBreakInside: 'avoid',
    breakInside: 'avoid',
    border: 'none',
    outline: 'none',
  };

  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num) || num === '') return '0';
    return Number(num).toLocaleString('en-IN');
  };

  let monthName = draft.month;
  let yearVal = draft.year;

  // If month or year not explicitly provided, try extracting from payPeriod (e.g. "February 2020")
  if ((!monthName || !yearVal) && draft.payPeriod) {
    const parts = draft.payPeriod.trim().split(/\s+/);
    if (parts.length >= 2 && isNaN(parts[0]) && !isNaN(parts[1])) {
      if (!monthName) monthName = parts[0];
      if (!yearVal) yearVal = Number(parts[1]);
    }
  }

  monthName = monthName || 'June';
  yearVal = yearVal || 2023;

  // Format month name nicely (e.g. "February", "June")
  const standardMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  let standardMIdx = -1;
  if (typeof monthName === 'number') {
    standardMIdx = monthName - 1;
  } else if (typeof monthName === 'string') {
    const num = parseInt(monthName, 10);
    if (!isNaN(num) && num >= 1 && num <= 12) {
      standardMIdx = num - 1;
    } else {
      standardMIdx = standardMonthNames.findIndex((m) => m.toLowerCase().startsWith(monthName.trim().toLowerCase().slice(0, 3)));
    }
  }
  const displayMonth = (standardMIdx >= 0 && standardMIdx <= 11) ? standardMonthNames[standardMIdx] : monthName;

  // Only use draft.payPeriod if it's already an explicit date range like "(Period 01/06/2023-30/06/2023)"
  // NEVER use raw month/year strings (e.g. "February 2020") as periodStr to prevent duplicate month text
  let periodStr = '';
  if (draft.payPeriod && (draft.payPeriod.includes('Period') || draft.payPeriod.includes('/'))) {
    periodStr = draft.payPeriod.trim();
    if (!periodStr.startsWith('(') && periodStr.includes('Period')) {
      periodStr = `(${periodStr})`;
    }
  } else {
    periodStr = getPayPeriodString(monthName, yearVal);
  }

  const baseSal = employee?.baselineSalary || {};
  const defaultBasic = (baseSal.basicPay !== undefined && baseSal.basicPay !== '' && !isNaN(baseSal.basicPay))
    ? Number(baseSal.basicPay)
    : 40000;
  const defaultDa = (baseSal.specialAllowance !== undefined && baseSal.specialAllowance !== '' && !isNaN(baseSal.specialAllowance))
    ? Number(baseSal.specialAllowance)
    : ((baseSal.da !== undefined && baseSal.da !== '' && !isNaN(baseSal.da)) ? Number(baseSal.da) : 20000);
  const defaultHra = (baseSal.hra !== undefined && baseSal.hra !== '' && !isNaN(baseSal.hra))
    ? Number(baseSal.hra)
    : 6400;
  const defaultMed = (baseSal.medicalAllowance !== undefined && baseSal.medicalAllowance !== '' && !isNaN(baseSal.medicalAllowance))
    ? Number(baseSal.medicalAllowance)
    : 500;

  const defaultPf = (baseSal.pfDeduction !== undefined && baseSal.pfDeduction !== '' && !isNaN(baseSal.pfDeduction))
    ? Number(baseSal.pfDeduction)
    : 7200;
  const defaultTax = (baseSal.tds !== undefined && baseSal.tds !== '' && !isNaN(baseSal.tds))
    ? Number(baseSal.tds)
    : 5000;
  const defaultPt = (baseSal.professionalTax !== undefined && baseSal.professionalTax !== '' && !isNaN(baseSal.professionalTax))
    ? Number(baseSal.professionalTax)
    : 200;

  const earnings = draft.earnings && draft.earnings.length > 0 ? draft.earnings : [
    { label: 'Basic', amount: defaultBasic },
    { label: 'Dearness Allowance', amount: defaultDa },
    { label: 'House Rent Allowance', amount: defaultHra },
    { label: 'Medical Allowance', amount: defaultMed },
  ];

  const deductions = draft.deductions && draft.deductions.length > 0 ? draft.deductions : [
    { label: 'Provident Fund', amount: defaultPf },
    { label: 'Income Tax', amount: defaultTax },
    { label: 'Proffessional Tax', amount: defaultPt },
  ];

  // Total Calculations
  const calculatedTotalEarnings = earnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const calculatedTotalDeductions = deductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const calculatedNetSalary = calculatedTotalEarnings - calculatedTotalDeductions;

  const totalEarningsDisplay = draft.grossEarnings !== undefined ? draft.grossEarnings : calculatedTotalEarnings;
  const totalDeductionsDisplay = draft.totalDeductions !== undefined ? draft.totalDeductions : calculatedTotalDeductions;
  const netSalaryDisplay = draft.netSalary !== undefined ? draft.netSalary : calculatedNetSalary;

  const wordsDisplay = draft.netSalaryInWords || numberToIndianWords(netSalaryDisplay);

  // Metadata Values
  const employeeName = (employee?.fullName || dynamic.name || 'SUNAINA SHARMA').toUpperCase();
  const accountNo = employee?.bankAccount || dynamic.accountNo || dynamic.bankAccount || '38570100006930';

  const getDateOfJoining = () => {
    if (dynamic.dateOfJoiningStr) return dynamic.dateOfJoiningStr;
    const dateSource = dynamic.joiningDate || employee?.joiningDate;
    if (dateSource) {
      const d = new Date(dateSource);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return String(dateSource);
    }
    return '21/10/2021';
  };

  const getBankDetails = () => {
    if (dynamic.bankDetails) return dynamic.bankDetails;
    if (employee?.bankName) {
      return `${employee.bankName}${employee?.ifscCode ? `(IFSC Code: ${employee.ifscCode})` : ''}`;
    }
    return 'BANK OF BARODA(IFSC Code: BARB0VJASHT)';
  };

  const bankAddress = dynamic.bankAddress || dynamic.location || employee?.location || 'KANNOD ROAD, ASHTA, DIST.SEHORE, ASHTA - 466116';
  const postingOffice = (dynamic.postingOffice || company?.name || 'DELHI WORLD PUBLIC SCHOOL, ASHTA').toUpperCase();
  const designation = (employee?.designation || dynamic.designation || 'PRINCIPAL').toUpperCase();
  const empId = employee?.empCode || dynamic.empId || '4417';
  const panNo = (employee?.panNumber || employee?.pan || dynamic.panNo || dynamic.panNumber || 'MKRPK2843N').toUpperCase();

  const schoolName = company?.name || 'Delhi World Public School';
  const schoolAddress = company?.fullAddress || company?.address || 'Shujalpur Road Ashta, Dist. Sehore (M.P)';

  const workingDaysVal = draft.paidDays !== undefined
    ? String(draft.paidDays)
    : (draft.workingDays !== undefined ? String(draft.workingDays) : '30');

  // Editable local state for metadata overrides
  const [metaOverrides, setMetaOverrides] = useState({
    name: employeeName,
    accountNo: accountNo,
    joiningDate: getDateOfJoining(),
    bankDetails: getBankDetails(),
    bankAddress: bankAddress,
    postingOffice: postingOffice,
    designation: designation,
    empId: empId,
    panNo: panNo,
    workingDays: workingDaysVal,
  });

  useEffect(() => {
    setMetaOverrides((prev) => ({
      ...prev,
      name: employeeName,
      accountNo: accountNo,
      joiningDate: getDateOfJoining(),
      bankDetails: getBankDetails(),
      bankAddress: bankAddress,
      postingOffice: postingOffice,
      designation: designation,
      empId: empId,
      panNo: panNo,
      workingDays: workingDaysVal,
    }));
  }, [
    employeeName,
    accountNo,
    employee?.joiningDate,
    dynamic.dateOfJoiningStr,
    dynamic.bankDetails,
    postingOffice,
    designation,
    empId,
    panNo,
    workingDaysVal,
  ]);

  const handleMetaChange = (key, val) => {
    setMetaOverrides((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="dwps-payslip-wrapper" id="dwps-pdf-sheet" style={slipStyle}>
      {/* 1. Header with Crest on Left and Centered School Branding */}
      <div className="dwps-header-section">
        <div className="dwps-logo-holder">
          <ResizableLogo
            company={company}
            isEditable={isEditable}
            fallbackLogo={<DwpsLogo />}
            defaultWidth={56}
            defaultHeight={54}
            onSizeSaved={onSizeSaved}
          />
        </div>

        <div className="dwps-school-title-box">
          <h1 className="dwps-school-name">{schoolName}</h1>
          <div className="dwps-school-subline">{schoolAddress}</div>
          <div className="dwps-payslip-for-row">
            <strong>Pay Slip</strong> for the month of {displayMonth} {yearVal} {periodStr}
          </div>
        </div>
      </div>

      {/* 2. Employee Metadata (2 Columns Side-by-Side with aligned colons) */}
      <div className="dwps-meta-section">
        {/* Left Column */}
        <div className="dwps-meta-col">
          <div className="dwps-meta-row">
            <span className="dwps-meta-label">Name</span>
            <span className="dwps-meta-colon">:</span>
            {isEditable ? (
              <input
                type="text"
                className="dwps-canvas-input dwps-meta-value-input"
                value={metaOverrides.name}
                onChange={(e) => handleMetaChange('name', e.target.value)}
              />
            ) : (
              <span className="dwps-meta-value">{metaOverrides.name}</span>
            )}
          </div>

          <div className="dwps-meta-row">
            <span className="dwps-meta-label">Account No.</span>
            <span className="dwps-meta-colon">:</span>
            {isEditable ? (
              <input
                type="text"
                className="dwps-canvas-input dwps-meta-value-input"
                value={metaOverrides.accountNo}
                onChange={(e) => handleMetaChange('accountNo', e.target.value)}
              />
            ) : (
              <span className="dwps-meta-value">{metaOverrides.accountNo}</span>
            )}
          </div>

          <div className="dwps-meta-row">
            <span className="dwps-meta-label">Joining Date</span>
            <span className="dwps-meta-colon">:</span>
            {isEditable ? (
              <input
                type="text"
                className="dwps-canvas-input dwps-meta-value-input"
                value={metaOverrides.joiningDate}
                onChange={(e) => handleMetaChange('joiningDate', e.target.value)}
              />
            ) : (
              <span className="dwps-meta-value">{metaOverrides.joiningDate}</span>
            )}
          </div>

          <div className="dwps-meta-row">
            <span className="dwps-meta-label">Bank Details</span>
            <span className="dwps-meta-colon">:</span>
            {isEditable ? (
              <input
                type="text"
                className="dwps-canvas-input dwps-meta-value-input"
                value={metaOverrides.bankDetails}
                onChange={(e) => handleMetaChange('bankDetails', e.target.value)}
              />
            ) : (
              <span className="dwps-meta-value">{metaOverrides.bankDetails}</span>
            )}
          </div>

          {/* Subline under Bank Details */}
          <div className="dwps-meta-subvalue">
            {isEditable ? (
              <input
                type="text"
                className="dwps-canvas-input dwps-meta-value-input"
                value={metaOverrides.bankAddress}
                onChange={(e) => handleMetaChange('bankAddress', e.target.value)}
              />
            ) : (
              metaOverrides.bankAddress
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="dwps-meta-col">
          <div className="dwps-meta-row">
            <span className="dwps-meta-label">Posting Office</span>
            <span className="dwps-meta-colon">:</span>
            {isEditable ? (
              <input
                type="text"
                className="dwps-canvas-input dwps-meta-value-input"
                value={metaOverrides.postingOffice}
                onChange={(e) => handleMetaChange('postingOffice', e.target.value)}
              />
            ) : (
              <span className="dwps-meta-value">{metaOverrides.postingOffice}</span>
            )}
          </div>

          <div className="dwps-meta-row">
            <span className="dwps-meta-label">Designation</span>
            <span className="dwps-meta-colon">:</span>
            {isEditable ? (
              <input
                type="text"
                className="dwps-canvas-input dwps-meta-value-input"
                value={metaOverrides.designation}
                onChange={(e) => handleMetaChange('designation', e.target.value)}
              />
            ) : (
              <span className="dwps-meta-value">{metaOverrides.designation}</span>
            )}
          </div>

          <div className="dwps-meta-row">
            <span className="dwps-meta-label">Emp ID</span>
            <span className="dwps-meta-colon">:</span>
            {isEditable ? (
              <input
                type="text"
                className="dwps-canvas-input dwps-meta-value-input"
                value={metaOverrides.empId}
                onChange={(e) => handleMetaChange('empId', e.target.value)}
              />
            ) : (
              <span className="dwps-meta-value">{metaOverrides.empId}</span>
            )}
          </div>

          <div className="dwps-meta-row">
            <span className="dwps-meta-label">PAN No</span>
            <span className="dwps-meta-colon">:</span>
            {isEditable ? (
              <input
                type="text"
                className="dwps-canvas-input dwps-meta-value-input"
                value={metaOverrides.panNo}
                onChange={(e) => handleMetaChange('panNo', e.target.value)}
              />
            ) : (
              <span className="dwps-meta-value">{metaOverrides.panNo}</span>
            )}
          </div>

          <div className="dwps-meta-row">
            <span className="dwps-meta-label">Working Days</span>
            <span className="dwps-meta-colon">:</span>
            {isEditable ? (
              <input
                type="text"
                className="dwps-canvas-input dwps-meta-value-input"
                value={metaOverrides.workingDays !== undefined ? metaOverrides.workingDays : workingDaysVal}
                onChange={(e) => {
                  const val = e.target.value;
                  handleMetaChange('workingDays', val);
                  if (onDaysChange) {
                    onDaysChange('paidDays', val);
                  }
                }}
              />
            ) : (
              <span className="dwps-meta-value">{metaOverrides.workingDays !== undefined ? metaOverrides.workingDays : workingDaysVal}</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Financial Table (Earnings & Deductions with center vertical dividing line) */}
      <table className="dwps-fin-table">
        <thead>
          <tr>
            <th className="dwps-th-ern">Earnings</th>
            <th className="dwps-th-ded">Deductions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {/* Earnings Item List Box */}
            <td className="dwps-td-ern-box">
              <div className="dwps-items-list">
                {earnings.map((ern, idx) => (
                  <div key={idx} className="dwps-item-line">
                    {isEditable ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <input
                          type="text"
                          className="dwps-canvas-input dwps-item-name"
                          style={{ flex: 1 }}
                          value={ern.label}
                          onChange={(e) => onEarningChange && onEarningChange(idx, 'label', e.target.value)}
                        />
                        {onDeleteEarning && (
                          <button
                            type="button"
                            className="btn-remove-earning no-print"
                            onClick={() => onDeleteEarning(idx)}
                            title="Remove Earning"
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '10px', padding: '0 2px' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="dwps-item-name">{ern.label}</span>
                    )}

                    {isEditable ? (
                      <input
                        type="number"
                        className="dwps-canvas-input dwps-item-amount"
                        style={{ width: '85px', textAlign: 'right' }}
                        value={ern.amount}
                        onChange={(e) => onEarningChange && onEarningChange(idx, 'amount', e.target.value)}
                      />
                    ) : (
                      <span className="dwps-item-amount">{formatAmount(ern.amount)}</span>
                    )}
                  </div>
                ))}

                {isEditable && onAddEarning && (
                  <div className="no-print" style={{ paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={onAddEarning}
                      style={{
                        fontSize: '10px',
                        color: '#15803d',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        padding: '2px 0',
                      }}
                    >
                      + Add Earning
                    </button>
                  </div>
                )}
              </div>
            </td>

            {/* Deductions Item List Box */}
            <td className="dwps-td-ded-box">
              <div className="dwps-items-list">
                {deductions.map((ded, idx) => (
                  <div key={idx} className="dwps-item-line">
                    {isEditable ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <input
                          type="text"
                          className="dwps-canvas-input dwps-item-name"
                          style={{ flex: 1 }}
                          value={ded.label}
                          onChange={(e) => onDeductionChange && onDeductionChange(idx, 'label', e.target.value)}
                        />
                        {onDeleteDeduction && (
                          <button
                            type="button"
                            className="btn-remove-deduction no-print"
                            onClick={() => onDeleteDeduction(idx)}
                            title="Remove Deduction"
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '10px', padding: '0 2px' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="dwps-item-name">{ded.label}</span>
                    )}

                    {isEditable ? (
                      <input
                        type="number"
                        className="dwps-canvas-input dwps-item-amount"
                        style={{ width: '85px', textAlign: 'right' }}
                        value={ded.amount}
                        onChange={(e) => onDeductionChange && onDeductionChange(idx, 'amount', e.target.value)}
                      />
                    ) : (
                      <span className="dwps-item-amount">{formatAmount(ded.amount)}</span>
                    )}
                  </div>
                ))}

                {isEditable && onAddDeduction && (
                  <div className="no-print" style={{ paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={onAddDeduction}
                      style={{
                        fontSize: '10px',
                        color: '#b91c1c',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        padding: '2px 0',
                      }}
                    >
                      + Add Deduction
                    </button>
                  </div>
                )}
              </div>
            </td>
          </tr>

          {/* Gross Salary & Total Deductions Row */}
          <tr className="dwps-totals-row">
            <td className="dwps-td-gross">
              Gross Salary: {formatAmount(totalEarningsDisplay)}
            </td>
            <td className="dwps-td-tot-ded">
              Total Deductions: {formatAmount(totalDeductionsDisplay)}
            </td>
          </tr>

          {/* Net Salary Row */}
          <tr className="dwps-net-salary-row">
            <td colSpan={2}>
              Net Salary: {formatAmount(netSalaryDisplay)}
            </td>
          </tr>

          {/* Amount In Words Row */}
          <tr className="dwps-in-words-row">
            <td colSpan={2}>
              In words: {wordsDisplay}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 4. Footer Note */}
      <div className="dwps-footer-note">
        General Note: Generated from the database, does not require signature
      </div>

      {/* 5. Optional Authorized Signatory (Rendered ONLY if specifically enabled in company settings) */}
      {company?.showSignature === true && Boolean(company?.signatureUrl) && (
        <div className="dwps-footer-section no-print-override" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '180px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#000000', marginBottom: '4px' }}>
              {schoolName}
            </div>
            <img
              src={company.signatureUrl}
              alt="Authorized Signature"
              style={{
                maxHeight: company?.signatureHeight ? `${company.signatureHeight}px` : '42px',
                maxWidth: company?.signatureWidth ? `${company.signatureWidth}px` : '140px',
                objectFit: 'contain',
              }}
            />
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#000000', marginTop: '4px' }}>
              {company?.signatoryName || 'Authorized Signatory'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
