import React from 'react';
import { ResizableLogo } from '../common/ResizableLogo';

// SVG Sun Logo matching the PDF top-left icon
export const SunLogo = () => (
  <svg width="46" height="46" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="18" fill="#e67e22" stroke="#d35400" strokeWidth="2" />
    <circle cx="50" cy="50" r="12" fill="#f39c12" />
    {/* Sun rays */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
      <line
        key={i}
        x1="50"
        y1="50"
        x2={50 + 38 * Math.cos((deg * Math.PI) / 180)}
        y2={50 + 38 * Math.sin((deg * Math.PI) / 180)}
        stroke="#e67e22"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    ))}
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
}) => {
  const dynamic = employee?.dynamicFields || {};

  // Formatted numbers helper
  const fmt = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00';
    return Number(num).toFixed(2);
  };

  const earnings = draft.earnings || [];
  const deductions = draft.deductions || [];
  const maxRows = Math.max(earnings.length, deductions.length, 5);

  const monthUpper = (draft.month || 'JANUARY').toUpperCase();
  const yearVal = draft.year || 2026;
  const payPeriodText = `PAYSLIP FOR ${monthUpper} ${yearVal}`;

  const workingDays = draft.workingDays !== undefined ? draft.workingDays : 31;
  const paidDays = draft.paidDays !== undefined ? draft.paidDays : 31;
  const lopDays = draft.lopDays !== undefined ? draft.lopDays : 0;

  // Build dynamic metadata lines from template.requiredFields or default schema
  const defaultMetaSchema = [
    { key: 'empNo', label: 'EMP NO', fallback: employee?.empCode || '51410' },
    { key: 'name', label: 'NAME', fallback: String(employee?.fullName || 'HARWINDER SINGH').toUpperCase() },
    { key: 'company', label: 'COMPANY', fallback: company?.name || 'Arunima Constructions Private Limited' },
    { key: 'vertical', label: 'VERTICAL', fallback: dynamic.vertical || employee?.department || 'Survey' },
    { key: 'designation', label: 'DESIGNATION', fallback: employee?.designation || 'Land Surveyor' },
    { key: 'dempDoj', label: 'DEMP DOJ', fallback: dynamic.dempDoj || (employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : '01/11/2023') },
    { key: 'location', label: 'LOCATION', fallback: dynamic.location || 'Chandigarh' },
    { key: 'bankName', label: 'BANK NAME', fallback: dynamic.bankName || 'BOI BANK' },
    { key: 'bankAccount', label: 'A/C NO', fallback: dynamic.bankAccount || '600810110006756' },
    { key: 'gender', label: 'GENDER', fallback: dynamic.gender || 'M' },
    { key: 'panNumber', label: 'EMP PAN', fallback: dynamic.panNumber || 'NQBPS8394P' },
    { key: 'pfNumber', label: 'PF_NO', fallback: dynamic.pfNumber || 'PB/CHD/29780/38554' },
    { key: 'uanNumber', label: 'UAN', fallback: dynamic.uanNumber || '101719643698' },
  ];

  // If template has requiredFields, map them dynamically
  const activeFields = template?.requiredFields && template.requiredFields.length > 0
    ? template.requiredFields.map((f) => {
        let val = dynamic[f.key];
        if (val === undefined || val === '') {
          if (f.key === 'empNo' || f.key === 'empCode') val = employee?.empCode || '51410';
          else if (f.key === 'name' || f.key === 'fullName') val = String(employee?.fullName || 'HARWINDER SINGH').toUpperCase();
          else if (f.key === 'company') val = company?.name || 'Arunima Constructions Private Limited';
          else if (f.key === 'designation') val = employee?.designation || 'Land Surveyor';
          else if (f.key === 'vertical' || f.key === 'department') val = dynamic.vertical || employee?.department || 'Survey';
          else if (f.key === 'dempDoj' || f.key === 'doj') val = dynamic.dempDoj || (employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : '01/11/2023');
          else if (f.key === 'location') val = dynamic.location || 'Chandigarh';
          else if (f.key === 'bankName') val = dynamic.bankName || 'BOI BANK';
          else if (f.key === 'bankAccount') val = dynamic.bankAccount || '600810110006756';
          else if (f.key === 'gender') val = dynamic.gender || 'M';
          else if (f.key === 'panNumber') val = dynamic.panNumber || 'NQBPS8394P';
          else if (f.key === 'pfNumber') val = dynamic.pfNumber || 'PB/CHD/29780/38554';
          else if (f.key === 'uanNumber') val = dynamic.uanNumber || '101719643698';
          else val = f.placeholder || f.defaultValue || '';
        }
        return {
          key: f.key,
          label: f.label,
          value: val,
        };
      })
    : defaultMetaSchema.map((f) => ({
        key: f.key,
        label: f.label,
        value: f.fallback,
      }));

  const midPoint = Math.ceil(activeFields.length / 2);
  const leftColFields = activeFields.slice(0, midPoint);
  const rightColFields = activeFields.slice(midPoint);

  return (
    <div className="classic-tabular-wrapper" id="classic-pdf-sheet">
      
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

      {/* 2. Dynamic Employee Metadata Two-Column Grid */}
      <div className="ct-meta-grid">
        {/* Left Column */}
        <div className="ct-meta-col">
          {leftColFields.map((field) => (
            <div className="ct-meta-line" key={field.key}>
              <span className="ct-meta-key">{field.label}</span>
              <span className="ct-meta-val">:{field.value}</span>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="ct-meta-col">
          {rightColFields.map((field) => (
            <div className="ct-meta-line" key={field.key}>
              <span className="ct-meta-key">{field.label}</span>
              <span className="ct-meta-val">:{field.value}</span>
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
        <div className="ct-col-earn-arr">ARREAR(+/-)</div>
        <div className="ct-col-ded-desc">DEDUCTIONS</div>
        <div className="ct-col-ded-cur">CURRENT MONTH</div>
      </div>

      <div className="ct-divider" />

      {/* 4. Financial Table Rows */}
      <div className="ct-fin-rows">
        {Array.from({ length: maxRows }).map((_, idx) => {
          const earn = earnings[idx];
          const ded = deductions[idx];

          return (
            <div key={idx} className="ct-fin-row">
              {/* Earnings side */}
              <div className="ct-col-earn-desc">
                {isEditable && earn ? (
                  <input
                    type="text"
                    className="ct-inline-input"
                    value={earn.label}
                    onChange={(e) => onEarningChange(idx, 'label', e.target.value)}
                  />
                ) : (
                  earn?.label || ''
                )}
              </div>
              <div className="ct-col-earn-rate">
                {earn ? fmt(earn.rate || earn.amount) : ''}
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
                    value={ded.label}
                    onChange={(e) => onDeductionChange(idx, 'label', e.target.value)}
                  />
                ) : (
                  ded?.label || ''
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

      <div className="ct-divider" />

      {/* 5. Gross Totals Row */}
      <div className="ct-totals-row">
        <div className="ct-col-earn-desc bold">GROSS EARNINGS</div>
        <div className="ct-col-earn-rate"></div>
        <div className="ct-col-earn-cur bold">{fmt(draft.grossEarnings)}</div>
        <div className="ct-col-earn-arr bold">{fmt(0)}</div>
        <div className="ct-col-ded-desc bold">| TOTAL DEDUCTIONS</div>
        <div className="ct-col-ded-cur bold">{fmt(draft.totalDeductions)}</div>
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
        ({String(draft.netSalaryInWords || 'RUPEES ONLY').toUpperCase()})
      </div>

      <div className="ct-divider" />
      <div className="ct-divider" style={{ marginTop: '3px' }} />

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
        <div className="ct-day-col">{fmt(0)}</div>
        <div className="ct-day-sep">|</div>
        <div className="ct-day-col">{fmt(0)}</div>
        <div className="ct-day-sep">|</div>
        <div className="ct-day-col">{fmt(paidDays)}</div>
      </div>

      <div className="ct-divider" />

      {/* 9. Bottom Computer Generated Note */}
      <div className="ct-footer-note">
        *This is a computer generated payslip and does not require signature.
      </div>

    </div>
  );
};
