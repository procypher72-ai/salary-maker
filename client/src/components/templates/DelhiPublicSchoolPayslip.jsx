import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ResizableLogo } from '../common/ResizableLogo';
import { SignatureStampBox } from '../common/SignatureStampBox';

const DEFAULT_DWPS_FIELDS = [
  { id: 'f_function', label: 'Function', key: 'functionRole', defaultValue: '' },
  { id: 'f_designation', label: 'Designation', key: 'designation', defaultValue: '' },
  { id: 'f_location', label: 'Location', key: 'location', defaultValue: '' },
  { id: 'f_bank_details', label: 'Bank Details', key: 'bankDetails', defaultValue: '' },
  { id: 'f_doj', label: 'Date of Joining', key: 'dateOfJoiningStr', defaultValue: '' },
];

const QUICK_FIELD_PRESETS = [
  { label: 'PAN Number', key: 'panNumber', defaultValue: '' },
  { label: 'PF Number', key: 'pfNumber', defaultValue: '' },
  { label: 'UAN Number', key: 'uanNumber', defaultValue: '' },
  { label: 'ESI Number', key: 'esiNumber', defaultValue: '' },
  { label: 'Bank A/C No', key: 'bankAccount', defaultValue: '' },
  { label: 'IFSC Code', key: 'ifscCode', defaultValue: '' },
  { label: 'Aadhar Number', key: 'aadharNumber', defaultValue: '' },
  { label: 'Employee Code', key: 'empCode', defaultValue: '' },
  { label: 'Department', key: 'department', defaultValue: '' },
];

// High-fidelity Jeyaar Polymer Full Logo (Emblem + Typography, 100% transparent vector)
export const JeyaarPolymerLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%', height: '100%', background: 'transparent' }}>
    <svg width="100%" height="100%" viewBox="0 0 340 76" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', maxHeight: '100%', maxWidth: '100%' }}>
      {/* Outer Cyan Halo / Trim on Swoosh */}
      <path
        d="M 64 14 C 45 6, 12 10, 8 32 C 4 56, 38 78, 72 74"
        stroke="#7dd3fc"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Main Coral-Red Dynamic Swoosh */}
      <path
        d="M 66 17 C 47 9, 17 12, 13 32 C 9 53, 38 76, 71 72 C 58 73, 24 57, 21 38 C 18 19, 47 15, 66 17 Z"
        fill="#dc2626"
      />
      <path
        d="M 64 16 C 45 8, 16 12, 13 32 C 9 50, 36 73, 69 70 C 70 70, 70 73, 68 73 C 33 76, 7 53, 11 31 C 15 10, 45 7, 64 15 Z"
        fill="#ef4444"
      />

      {/* JP Monogram (Sky Blue) */}
      <g fill="#38bdf8" fontFamily="'Arial Black', 'Montserrat', 'Segoe UI Black', 'Trebuchet MS', sans-serif" fontWeight="900">
        <text x="19" y="53" fontSize="34" letterSpacing="-2">J</text>
        <text x="38" y="53" fontSize="34" letterSpacing="-1">P</text>
      </g>

      {/* Company Name Typography in Coral-Red */}
      <text
        x="84"
        y="35"
        fill="#d9384a"
        fontFamily="'Arial Black', 'Montserrat', 'Segoe UI Black', 'Trebuchet MS', sans-serif"
        fontWeight="900"
        fontSize="21"
        letterSpacing="1.2"
      >
        JEYAAR POLYMER
      </text>
      <text
        x="84"
        y="62"
        fill="#d9384a"
        fontFamily="'Arial Black', 'Montserrat', 'Segoe UI Black', 'Trebuchet MS', sans-serif"
        fontWeight="900"
        fontSize="21"
        letterSpacing="1.2"
      >
        PVT. LTD
      </text>
    </svg>
  </div>
);

export const DwpsLogo = JeyaarPolymerLogo;


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
    maxWidth: cfg.slipWidth ? `${cfg.slipWidth}px` : '860px',
    minHeight: cfg.slipMinHeight && cfg.slipMinHeight > 0 ? `${cfg.slipMinHeight}px` : undefined,
    padding: cfg.slipPadding && cfg.slipPadding !== 24 ? `${cfg.slipPadding}px` : '0px',
    borderWidth: cfg.slipBorderWidth !== undefined ? `${cfg.slipBorderWidth}px` : '1px',
    borderStyle: cfg.slipBorderStyle || 'solid',
    borderColor: cfg.slipBorderColor || '#000000',
    borderRadius: cfg.slipBorderRadius !== undefined ? `${cfg.slipBorderRadius}px` : '0px',
    fontSize: cfg.fontSizeScale ? `${cfg.fontSizeScale * 0.0082}rem` : undefined,
    pageBreakInside: 'avoid',
    breakInside: 'avoid',
  };

  const rowMinHeight = cfg.incomeDeductionHeight ? `${cfg.incomeDeductionHeight}px` : undefined;

  // Number Formatter (plain integer or formatted amount)
  const formatAmount = (num) => {
    if (num === undefined || num === null || isNaN(num) || num === '') return '0';
    return Number(num).toLocaleString('en-IN');
  };

  const monthName = draft.month || 'April';
  const yearVal = draft.year || 2022;
  const payPeriodDisplay = `Pay Slip for ${monthName}, ${yearVal}`;

  const baseSal = employee?.baselineSalary || {};
  const defaultBasic = (baseSal.basicPay !== undefined && baseSal.basicPay !== '' && !isNaN(baseSal.basicPay))
    ? Number(baseSal.basicPay)
    : 20000;
  const defaultDa = (baseSal.specialAllowance !== undefined && baseSal.specialAllowance !== '' && !isNaN(baseSal.specialAllowance))
    ? Number(baseSal.specialAllowance)
    : ((baseSal.da !== undefined && baseSal.da !== '' && !isNaN(baseSal.da)) ? Number(baseSal.da) : 10000);
  const defaultHra = (baseSal.hra !== undefined && baseSal.hra !== '' && !isNaN(baseSal.hra))
    ? Number(baseSal.hra)
    : 20000;
  const defaultPt = (baseSal.professionalTax !== undefined && baseSal.professionalTax !== '' && !isNaN(baseSal.professionalTax))
    ? Number(baseSal.professionalTax)
    : 212;

  const earnings = draft.earnings && draft.earnings.length > 0 ? draft.earnings : [
    { label: 'Basic', amount: defaultBasic },
    { label: 'D.A', amount: defaultDa },
    { label: 'H.R.A', amount: defaultHra },
  ];
  const deductions = draft.deductions && draft.deductions.length > 0 ? draft.deductions : [
    { label: 'Professsional Tax', amount: defaultPt },
  ];
  const maxRows = Math.max(earnings.length, deductions.length);
  const extraSpacer = Number(cfg.extraSpacerHeight) || 0;

  // Total Calculations
  const calculatedTotalEarnings = earnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const calculatedTotalDeductions = deductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const calculatedNetSalary = calculatedTotalEarnings - calculatedTotalDeductions;

  const totalEarningsDisplay = draft.grossEarnings !== undefined ? draft.grossEarnings : calculatedTotalEarnings;
  const totalDeductionsDisplay = draft.totalDeductions !== undefined ? draft.totalDeductions : calculatedTotalDeductions;
  const netSalaryDisplay = draft.netSalary !== undefined ? draft.netSalary : calculatedNetSalary;

  // Metadata Fields
  const employeeName = String(employee?.fullName || dynamic.name || 'SUNAINA SHARMA').toUpperCase();
  
  const getBankDetails = () => {
    if (dynamic.bankDetails) return dynamic.bankDetails;
    const parts = [];
    if (dynamic.bankAccount || employee?.bankAccount) parts.push(dynamic.bankAccount || employee?.bankAccount);
    if (dynamic.bankName || employee?.bankName) parts.push(dynamic.bankName || employee?.bankName);
    if (dynamic.bankBranch || dynamic.location || employee?.location) parts.push(dynamic.bankBranch || dynamic.location || employee?.location);
    if (parts.length > 0) return parts.join(', ');
    return '';
  };

  const getDateOfJoining = () => {
    if (dynamic.dateOfJoiningStr) return dynamic.dateOfJoiningStr;
    if (dynamic.joiningDate) {
      const d = new Date(dynamic.joiningDate);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
    if (employee?.joiningDate) {
      const d = new Date(employee.joiningDate);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return String(employee.joiningDate);
    }
    return '';
  };

  // Custom Metadata Fields Configuration & Dynamic Synchronization
  const sanitizeFields = (rawFields) => {
    if (!Array.isArray(rawFields) || rawFields.length === 0) {
      const initial = [...DEFAULT_DWPS_FIELDS];
      if (dynamic.panNumber || employee?.pan || employee?.panNumber) {
        initial.push({ id: 'f_pan', label: 'PAN Number', key: 'panNumber', defaultValue: '' });
      }
      if (dynamic.pfNumber || employee?.pfNumber) {
        initial.push({ id: 'f_pf', label: 'PF Number', key: 'pfNumber', defaultValue: '' });
      }
      if (dynamic.uanNumber || employee?.uanNumber) {
        initial.push({ id: 'f_uan', label: 'UAN Number', key: 'uanNumber', defaultValue: '' });
      }
      if (dynamic.esiNumber || employee?.esiNumber) {
        initial.push({ id: 'f_esi', label: 'ESI Number', key: 'esiNumber', defaultValue: '' });
      }
      return initial;
    }
    return rawFields.map((f) => {
      let defVal = f.defaultValue !== undefined && f.defaultValue !== null ? f.defaultValue : (f.customValue || '');
      // Clear legacy dummy placeholders
      if (defVal === 'Principal' && (f.key === 'designation' || f.label === 'Designation')) defVal = '';
      if (defVal === 'Ashta' && (f.key === 'location' || f.label === 'Location')) defVal = '';
      if (defVal === '21/10/2021' && (f.key === 'dateOfJoiningStr' || f.key === 'doj' || f.label === 'Date of Joining')) defVal = '';
      if (defVal === '38570100006930,Bank of Baroda,Ashta' && (f.key === 'bankDetails' || f.label === 'Bank Details')) defVal = '';
      return {
        ...f,
        defaultValue: defVal,
      };
    });
  };

  const configuredFields = cfg.dwpsCustomFields || company?.dwpsCustomFields;
  const [fields, setFields] = useState(() => sanitizeFields(configuredFields));

  useEffect(() => {
    const cf = cfg.dwpsCustomFields || company?.dwpsCustomFields;
    if (Array.isArray(cf) && cf.length > 0) {
      setFields(sanitizeFields(cf));
    }
  }, [company?.dwpsCustomFields, cfg.dwpsCustomFields]);

  const configuredColumns = cfg.dwpsMetaColumns !== undefined
    ? Number(cfg.dwpsMetaColumns)
    : (company?.dwpsMetaColumns !== undefined ? Number(company.dwpsMetaColumns) : 1);
  const [metaColumns, setMetaColumns] = useState(configuredColumns);

  useEffect(() => {
    const col = cfg.dwpsMetaColumns !== undefined
      ? Number(cfg.dwpsMetaColumns)
      : (company?.dwpsMetaColumns !== undefined ? Number(company.dwpsMetaColumns) : 1);
    setMetaColumns(col);
  }, [company?.dwpsMetaColumns, cfg.dwpsMetaColumns]);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [customFieldLabel, setCustomFieldLabel] = useState('');

  const persistFields = async (newFields) => {
    setFields(newFields);
    const targetCompanyId =
      company?._id ||
      company?.companyId ||
      localStorage.getItem('salarymaker_active_company_id');

    if (targetCompanyId) {
      try {
        await api.updateCompany(targetCompanyId, { dwpsCustomFields: newFields });
      } catch (e) {
        console.error('Failed to save DWPS custom metadata fields:', e);
      }
    }
    if (onSizeSaved) {
      onSizeSaved({ dwpsCustomFields: newFields });
    }
  };

  const handleToggleColumns = async (colNum) => {
    setMetaColumns(colNum);
    const targetCompanyId =
      company?._id ||
      company?.companyId ||
      localStorage.getItem('salarymaker_active_company_id');

    if (targetCompanyId) {
      try {
        await api.updateCompany(targetCompanyId, { dwpsMetaColumns: colNum });
      } catch (e) {
        console.error('Failed to save DWPS meta columns:', e);
      }
    }
    if (onSizeSaved) {
      onSizeSaved({ dwpsMetaColumns: colNum });
    }
  };

  const handleMoveField = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const updated = [...fields];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    persistFields(updated);
  };

  const handleAddPreset = (preset) => {
    const existing = fields.find((f) => f.key === preset.key || f.label.toLowerCase() === preset.label.toLowerCase());
    if (existing) {
      setShowAddMenu(false);
      return;
    }
    const initialVal =
      preset.key === 'department'
        ? (employee?.department || dynamic.department || preset.defaultValue || '')
        : (employee?.[preset.key] || dynamic[preset.key] || preset.defaultValue || '');

    const newField = {
      id: 'f_' + Date.now(),
      label: preset.label,
      key: preset.key,
      defaultValue: initialVal,
    };
    const updated = [...fields, newField];
    persistFields(updated);
    setShowAddMenu(false);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customFieldLabel.trim()) return;
    const label = customFieldLabel.trim();
    const key = label.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const newField = {
      id: 'f_' + Date.now(),
      label: label,
      key: key,
      defaultValue: '',
    };
    const updated = [...fields, newField];
    persistFields(updated);
    setCustomFieldLabel('');
    setShowAddMenu(false);
  };

  const handleRemoveField = (idx) => {
    const updated = fields.filter((_, i) => i !== idx);
    persistFields(updated);
  };

  const handleFieldChange = (idx, prop, val) => {
    const updated = fields.map((f, i) => (i === idx ? { ...f, [prop]: val } : f));
    persistFields(updated);
  };

  const getFieldValue = (field) => {
    // 1. If user set an explicit non-empty defaultValue (e.g. customized Department), prioritize it!
    if (
      field.defaultValue !== undefined &&
      field.defaultValue !== null &&
      String(field.defaultValue).trim() !== '' &&
      !(field.defaultValue === 'Principal' && (field.key === 'designation' || field.label === 'Designation')) &&
      !(field.defaultValue === 'Ashta' && (field.key === 'location' || field.label === 'Location')) &&
      !(field.defaultValue === '21/10/2021' && (field.key === 'dateOfJoiningStr' || field.key === 'doj' || field.label === 'Date of Joining')) &&
      !(field.defaultValue === '38570100006930,Bank of Baroda,Ashta' && (field.key === 'bankDetails' || field.label === 'Bank Details'))
    ) {
      return String(field.defaultValue);
    }

    const k = (field.key || field.label || '').toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

    // 2. Check real employee profile & dynamicFields
    let empVal = null;
    if (k === 'function' || k === 'functionrole') {
      empVal = dynamic.functionRole || dynamic.function || employee?.department;
    } else if (k === 'designation') {
      empVal = dynamic.designation || employee?.designation;
    } else if (k === 'location') {
      empVal = dynamic.location || employee?.location;
    } else if (k === 'bankdetails') {
      const bd = getBankDetails();
      if (bd) empVal = bd;
    } else if (k === 'dateofjoining' || k === 'doj' || k === 'joiningdate' || k === 'dateofjoiningstr') {
      const doj = getDateOfJoining();
      if (doj) empVal = doj;
    } else if (k === 'pannumber' || k === 'pan' || k === 'panno') {
      empVal = dynamic.panNumber || dynamic.pan || employee?.pan || employee?.panNumber;
    } else if (k === 'pfnumber' || k === 'pf' || k === 'pfno' || k === 'providentfund') {
      empVal = dynamic.pfNumber || dynamic.pf || employee?.pfNumber;
    } else if (k === 'uannumber' || k === 'uan' || k === 'uanno') {
      empVal = dynamic.uanNumber || dynamic.uan || employee?.uanNumber;
    } else if (k === 'esinumber' || k === 'esi' || k === 'esic' || k === 'esino') {
      empVal = dynamic.esiNumber || dynamic.esi || employee?.esiNumber;
    } else if (k === 'bankaccount' || k === 'accountnumber' || k === 'bankac' || k === 'bankacno') {
      empVal = dynamic.bankAccount || employee?.bankAccount;
    } else if (k === 'ifsccode' || k === 'ifsc') {
      empVal = dynamic.ifscCode || employee?.ifscCode;
    } else if (k === 'aadharnumber' || k === 'aadhar' || k === 'aadharno') {
      empVal = dynamic.aadharNumber || dynamic.aadhar || employee?.aadharNumber;
    } else if (k === 'empcode' || k === 'employeecode' || k === 'empid') {
      empVal = employee?.empCode || dynamic.empCode;
    } else if (k === 'department') {
      empVal = employee?.department || dynamic.department;
    } else {
      empVal = dynamic[field.key] || dynamic[field.label] || employee?.[field.key] || employee?.[field.label];
    }

    if (empVal !== undefined && empVal !== null && String(empVal).trim() !== '') {
      return String(empVal);
    }

    // 3. Fallback dummy placeholders (only when previewing template without employee)
    if (k === 'function' || k === 'functionrole') return 'Management';
    if (k === 'designation') return 'Principal';
    if (k === 'location') return 'Ashta';
    if (k === 'bankdetails') return '38570100006930,Bank of Baroda,Ashta';
    if (k === 'dateofjoining' || k === 'doj' || k === 'joiningdate' || k === 'dateofjoiningstr') return '21/10/2021';

    return '';
  };

  const schoolName = company?.name || 'Delhi World Public School, Ashta';
  const schoolAddress = company?.fullAddress || company?.address || 'Shujalpur Road Ashta, Dist. Sehore (M.P)';
  const hasCustomAddress = Boolean(company?.fullAddress || company?.address);
  const schoolPinCode = company?.pinCode
    ? (schoolAddress.includes(company.pinCode) ? '' : `Pin Code - ${company.pinCode}`)
    : (hasCustomAddress ? '' : 'Pin Code - 466116');

  return (
    <div className="dwps-payslip-wrapper" id="dwps-pdf-sheet" style={slipStyle}>
      {/* 1. Header with Crest on Left and Centered School Branding */}
      <div
        className="dwps-header-section"
        style={{
          minHeight: `${Math.max(68, (Number(company?.logoHeight) || 55) + 16)}px`,
        }}
      >
        <div className="dwps-logo-holder">
          <ResizableLogo
            company={company}
            isEditable={isEditable}
            fallbackLogo={<DwpsLogo />}
            defaultWidth={220}
            defaultHeight={55}
            onSizeSaved={onSizeSaved}
          />
        </div>

        <div className="dwps-school-title-box">
          <h1 className="dwps-school-name">{schoolName}</h1>
          <div className="dwps-school-subline">{schoolAddress}</div>
          {schoolPinCode ? <div className="dwps-school-pincode">{schoolPinCode}</div> : null}
        </div>
      </div>

      {/* 2. Full-Width Pay Slip Month Subheader */}
      <div className="dwps-payslip-for-row">
        {payPeriodDisplay}
      </div>

      {/* 3. Full-Width Employee Name Row */}
      <div className="dwps-emp-name-row">
        {employeeName}
      </div>

      {/* 4. Employee Metadata Aligned List */}
      <div
        className={`dwps-meta-section ${metaColumns === 2 ? 'two-cols' : ''}`}
        style={metaColumns === 2 ? {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: '1.5rem',
          rowGap: '0.28rem',
        } : undefined}
      >
        {fields.map((field, idx) => {
          const val = getFieldValue(field);
          return (
            <div className="dwps-meta-row" key={field.id || idx}>
              {isEditable ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                  {/* Reorder Buttons */}
                  <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleMoveField(idx, -1)}
                      disabled={idx === 0}
                      title="Move Up"
                      style={{
                        background: idx === 0 ? '#f8fafc' : '#e2e8f0',
                        color: idx === 0 ? '#cbd5e1' : '#334155',
                        border: 'none',
                        borderRadius: '2px',
                        fontSize: '7px',
                        lineHeight: '8px',
                        padding: '1px 3px',
                        cursor: idx === 0 ? 'default' : 'pointer',
                      }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveField(idx, 1)}
                      disabled={idx === fields.length - 1}
                      title="Move Down"
                      style={{
                        background: idx === fields.length - 1 ? '#f8fafc' : '#e2e8f0',
                        color: idx === fields.length - 1 ? '#cbd5e1' : '#334155',
                        border: 'none',
                        borderRadius: '2px',
                        fontSize: '7px',
                        lineHeight: '8px',
                        padding: '1px 3px',
                        cursor: idx === fields.length - 1 ? 'default' : 'pointer',
                      }}
                    >
                      ▼
                    </button>
                  </div>

                  <input
                    type="text"
                    className="dwps-canvas-input"
                    style={{ width: metaColumns === 2 ? '100px' : '130px', fontWeight: 700, padding: '2px 4px', fontSize: '11px', flexShrink: 0 }}
                    value={field.label}
                    onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                  />
                  <span className="dwps-meta-colon">:</span>
                  <input
                    type="text"
                    className="dwps-canvas-input"
                    style={{ flex: 1, minWidth: '40px', padding: '2px 4px', fontSize: '11px' }}
                    value={field.defaultValue !== undefined && field.defaultValue !== '' ? field.defaultValue : (val || '')}
                    placeholder="Enter value"
                    onChange={(e) => handleFieldChange(idx, 'defaultValue', e.target.value)}
                  />
                  <button
                    type="button"
                    className="no-print"
                    onClick={() => handleRemoveField(idx)}
                    title="Remove Field"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '11px',
                      padding: '2px 4px',
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <span className="dwps-meta-label" style={metaColumns === 2 ? { width: '105px' } : undefined}>
                    {field.label}
                  </span>
                  <span className="dwps-meta-colon">:</span>
                  <span className="dwps-meta-value">{val}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {isEditable && (
        <div className="no-print" style={{ padding: '0 1.25rem 0.6rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-add-meta-field"
              onClick={() => setShowAddMenu(!showAddMenu)}
              style={{
                background: '#f0fdf4',
                color: '#15803d',
                border: '1px dashed #86efac',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              + Add Field (PAN, PF, UAN...)
            </button>

            {showAddMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                  zIndex: 9999,
                  padding: '8px',
                  minWidth: '220px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', padding: '4px 6px', textTransform: 'uppercase' }}>
                  Quick Presets
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2px', maxHeight: '180px', overflowY: 'auto' }}>
                  {QUICK_FIELD_PRESETS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handleAddPreset(p)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '5px 8px',
                        fontSize: '11px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#1e293b',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', margin: '6px 0', paddingTop: '6px' }}>
                  <form onSubmit={handleAddCustom} style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      className="dwps-canvas-input"
                      placeholder="Custom label..."
                      value={customFieldLabel}
                      onChange={(e) => setCustomFieldLabel(e.target.value)}
                      style={{ flex: 1, fontSize: '11px', padding: '3px 6px' }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Add
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* 1-Col vs 2-Col Layout Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '3px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', padding: '0 4px', textTransform: 'uppercase' }}>
              Layout:
            </span>
            <button
              type="button"
              onClick={() => handleToggleColumns(1)}
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: metaColumns === 1 ? 700 : 500,
                color: metaColumns === 1 ? '#0f172a' : '#64748b',
                background: metaColumns === 1 ? '#ffffff' : 'transparent',
                border: metaColumns === 1 ? '1px solid #cbd5e1' : 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: metaColumns === 1 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              1 Column
            </button>
            <button
              type="button"
              onClick={() => handleToggleColumns(2)}
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: metaColumns === 2 ? 700 : 500,
                color: metaColumns === 2 ? '#0f172a' : '#64748b',
                background: metaColumns === 2 ? '#ffffff' : 'transparent',
                border: metaColumns === 2 ? '1px solid #cbd5e1' : 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: metaColumns === 2 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              2 Columns (Side-by-Side)
            </button>
          </div>
        </div>
      )}

        {/* 5. Four-Column Bordered Financial Grid Table */}
        <table className="dwps-fin-table">
          <thead>
            <tr>
              <th className="dwps-th-ern">Earning</th>
              <th className="dwps-th-ern-amt">Amount</th>
              <th className="dwps-th-ded">Deduction</th>
              <th className="dwps-th-ded-amt">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_, idx) => {
              const ern = earnings[idx];
              const ded = deductions[idx];

              return (
                <tr key={idx} style={{ height: rowMinHeight }}>
                  {/* Earning Description */}
                  <td className="dwps-td-ern">
                    {isEditable && ern ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="text"
                          className="dwps-canvas-input"
                          value={ern.label}
                          onChange={(e) => onEarningChange && onEarningChange(idx, 'label', e.target.value)}
                        />
                        {onDeleteEarning && (
                          <button
                            type="button"
                            className="btn-remove-earning no-print"
                            onClick={() => onDeleteEarning(idx)}
                            title="Remove Earning"
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '10px' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      ern?.label || ''
                    )}
                  </td>

                  {/* Earning Amount */}
                  <td className="dwps-td-ern-amt">
                    {isEditable && ern ? (
                      <input
                        type="number"
                        className="dwps-canvas-input num-right"
                        value={ern.amount}
                        onChange={(e) => onEarningChange && onEarningChange(idx, 'amount', e.target.value)}
                      />
                    ) : (
                      ern ? formatAmount(ern.amount) : ''
                    )}
                  </td>

                  {/* Deduction Description */}
                  <td className="dwps-td-ded">
                    {isEditable && ded ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="text"
                          className="dwps-canvas-input"
                          value={ded.label}
                          onChange={(e) => onDeductionChange && onDeductionChange(idx, 'label', e.target.value)}
                        />
                        {onDeleteDeduction && (
                          <button
                            type="button"
                            className="btn-remove-deduction no-print"
                            onClick={() => onDeleteDeduction(idx)}
                            title="Remove Deduction"
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '10px' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      ded?.label || ''
                    )}
                  </td>

                  {/* Deduction Amount */}
                  <td className="dwps-td-ded-amt">
                    {isEditable && ded ? (
                      <input
                        type="number"
                        className="dwps-canvas-input num-right"
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

            {/* In editable mode: Add Row Buttons */}
            {isEditable && (
              <tr className="no-print">
                <td colSpan={2} style={{ padding: '4px 8px', background: '#f8fafc' }}>
                  {onAddEarning && (
                    <button
                      type="button"
                      onClick={onAddEarning}
                      className="btn-add-line"
                      style={{ fontSize: '11px', color: '#15803d', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + Add Earning
                    </button>
                  )}
                </td>
                <td colSpan={2} style={{ padding: '4px 8px', background: '#f8fafc' }}>
                  {onAddDeduction && (
                    <button
                      type="button"
                      onClick={onAddDeduction}
                      className="btn-add-line"
                      style={{ fontSize: '11px', color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + Add Deduction
                    </button>
                  )}
                </td>
              </tr>
            )}

            {/* Extra Spacer if configured */}
            {extraSpacer > 0 && (
              <tr style={{ height: `${extraSpacer}px` }}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            )}

            {/* Total Earning & Total Deduction Row */}
            <tr className="dwps-totals-row">
              <td className="dwps-td-total-ern-label">Total Earning:</td>
              <td className="dwps-td-total-ern-val">{formatAmount(totalEarningsDisplay)}</td>
              <td className="dwps-td-total-ded-label">Total Deduction</td>
              <td className="dwps-td-total-ded-val">{formatAmount(totalDeductionsDisplay)}</td>
            </tr>

            {/* Net Amount Row */}
            <tr className="dwps-net-row">
              <td colSpan={2} className="dwps-td-empty-left"></td>
              <td className="dwps-td-net-label">Net Amount</td>
              <td className="dwps-td-net-val">{formatAmount(netSalaryDisplay)}</td>
            </tr>
          </tbody>
        </table>

        {/* 6. Amount in Words Section */}
        <div className="dwps-words-section">
          <div className="dwps-words-title">Amount (in words)</div>
          <div className="dwps-words-text">
            {draft.netSalaryInWords || 'Fourty nine thousand seven hunderd and eighty eighty only.'}
          </div>
        </div>

        {/* 7. Footer / School Signatory (Rendered ONLY if enabled in company settings AND signature is uploaded) */}
        {company?.showSignature === true && Boolean(company?.signatureUrl) && (
          <div className="dwps-footer-section">
            <div className="dwps-signatory-container">
              <div className="dwps-footer-school-name">{schoolName}</div>
              
              <div className="dwps-signature-image-box">
                <img
                  src={company.signatureUrl}
                  alt="Authorized Signature"
                  style={{
                    maxHeight: company?.signatureHeight ? `${company.signatureHeight}px` : '48px',
                    maxWidth: company?.signatureWidth ? `${company.signatureWidth}px` : '150px',
                    objectFit: 'contain',
                  }}
                />
              </div>

              <div className="dwps-authorized-sign-text">
                {company?.signatoryName || 'Authorized Signature:'}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
