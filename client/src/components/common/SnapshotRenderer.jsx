import React from 'react';
import { ClassicTabularPayslip } from '../templates/ClassicTabularPayslip';
import { HclCorporatePayslip } from '../templates/HclCorporatePayslip';
import { AiimsGovtPayslip } from '../templates/AiimsGovtPayslip';
import { ConcentrixDakshPayslip } from '../templates/ConcentrixDakshPayslip';
import { SushmaBuildtechPayslip } from '../templates/SushmaBuildtechPayslip';
import { DelhiPublicSchoolPayslip } from '../templates/DelhiPublicSchoolPayslip';
import { ResizableLogo } from './ResizableLogo';

export const SnapshotRenderer = ({
  payslip,
  company = null,
  isEditable = false,
  onEarningChange,
  onDeductionChange,
  onAddEarning,
  onDeleteEarning,
  onAddDeduction,
  onDeleteDeduction,
  onDaysChange,
  onSizeSaved,
  customLayoutConfig,
}) => {
  if (!payslip) return null;

  const tplKey =
    payslip?.snapshotData?.templateKey ||
    payslip?.snapshotData?.company?.templateKey ||
    company?.templateKey ||
    payslip?.templateKey ||
    'corporate_detailed';

  const companyId =
    payslip?.companyId?._id ||
    payslip?.companyId ||
    company?._id ||
    company?.companyId ||
    payslip?.snapshotData?.company?._id ||
    payslip?.snapshotData?.company?.companyId ||
    localStorage.getItem('salarymaker_active_company_id');

  const comp = {
    ...(company || {}),
    ...(payslip?.snapshotData?.company || {}),
    _id: companyId,
    companyId: companyId,
    dwpsCustomFields: (payslip?.snapshotData?.company?.dwpsCustomFields && payslip.snapshotData.company.dwpsCustomFields.length > 0)
      ? payslip.snapshotData.company.dwpsCustomFields
      : (company?.dwpsCustomFields || payslip?.snapshotData?.company?.dwpsCustomFields),
    dwpsMetaColumns: payslip?.snapshotData?.company?.dwpsMetaColumns !== undefined
      ? payslip.snapshotData.company.dwpsMetaColumns
      : (company?.dwpsMetaColumns !== undefined ? company.dwpsMetaColumns : 1),
  };

  const emp = payslip?.snapshotData?.employee || payslip?.employeeId || {};

  const layoutConfig = customLayoutConfig || {
    slipWidth: comp.slipWidth || 950,
    slipMinHeight: comp.slipMinHeight || 0,
    slipPadding: comp.slipPadding || 24,
    slipBorderWidth: comp.slipBorderWidth !== undefined ? comp.slipBorderWidth : 1,
    slipBorderStyle: comp.slipBorderStyle || 'solid',
    slipBorderColor: comp.slipBorderColor || '#000000',
    slipBorderRadius: comp.slipBorderRadius || 0,
    incomeDeductionHeight: comp.incomeDeductionHeight || 30,
    incomeDeductionMinHeight: comp.incomeDeductionMinHeight || 160,
    incomeColumnWidth: comp.incomeColumnWidth || 50,
    tableBorderWidth: comp.tableBorderWidth !== undefined ? comp.tableBorderWidth : 1,
    tableBorderStyle: comp.tableBorderStyle || 'solid',
    tableBorderColor: comp.tableBorderColor || '#000000',
    fontSizeScale: comp.fontSizeScale || 100,
    extraSpacerHeight: comp.extraSpacerHeight !== undefined ? comp.extraSpacerHeight : 0,
    minTableRows: comp.minTableRows !== undefined ? comp.minTableRows : 6,
    dwpsCustomFields: comp.dwpsCustomFields,
    dwpsMetaColumns: comp.dwpsMetaColumns,
  };

  const draftData = {
    month: payslip.month,
    year: payslip.year,
    payPeriod: payslip.payPeriod,
    paymentDate: payslip.paymentDate,
    workingDays: payslip.workingDays,
    paidDays: payslip.paidDays,
    lopDays: payslip.lopDays,
    earnings: payslip.earnings || [],
    deductions: payslip.deductions || [],
    grossEarnings: payslip.grossEarnings,
    totalDeductions: payslip.totalDeductions,
    netSalary: payslip.netSalary,
    netSalaryInWords: payslip.netSalaryInWords,
  };

  if (tplKey === 'aiims_govt_medical') {
    return (
      <AiimsGovtPayslip
        company={comp}
        employee={emp}
        layoutConfig={layoutConfig}
        draft={draftData}
        isEditable={isEditable}
        onEarningChange={onEarningChange}
        onDeductionChange={onDeductionChange}
        onAddEarning={onAddEarning}
        onDeleteEarning={onDeleteEarning}
        onAddDeduction={onAddDeduction}
        onDeleteDeduction={onDeleteDeduction}
        onDaysChange={onDaysChange}
        onSizeSaved={onSizeSaved}
      />
    );
  }

  if (tplKey === 'hcl_corporate_tech') {
    return (
      <HclCorporatePayslip
        company={comp}
        employee={emp}
        layoutConfig={layoutConfig}
        draft={draftData}
        isEditable={isEditable}
        onEarningChange={onEarningChange}
        onDeductionChange={onDeductionChange}
        onAddEarning={onAddEarning}
        onDeleteEarning={onDeleteEarning}
        onAddDeduction={onAddDeduction}
        onDeleteDeduction={onDeleteDeduction}
        onDaysChange={onDaysChange}
        onSizeSaved={onSizeSaved}
      />
    );
  }

  if (tplKey === 'classic_tabular') {
    return (
      <ClassicTabularPayslip
        company={comp}
        employee={emp}
        layoutConfig={layoutConfig}
        draft={draftData}
        isEditable={isEditable}
        onEarningChange={onEarningChange}
        onDeductionChange={onDeductionChange}
        onAddEarning={onAddEarning}
        onDeleteEarning={onDeleteEarning}
        onAddDeduction={onAddDeduction}
        onDeleteDeduction={onDeleteDeduction}
        onDaysChange={onDaysChange}
        onSizeSaved={onSizeSaved}
      />
    );
  }

  if (tplKey === 'concentrix_daksh') {
    return (
      <ConcentrixDakshPayslip
        company={comp}
        employee={emp}
        layoutConfig={layoutConfig}
        draft={draftData}
        isEditable={isEditable}
        onEarningChange={onEarningChange}
        onDeductionChange={onDeductionChange}
        onAddEarning={onAddEarning}
        onDeleteEarning={onDeleteEarning}
        onAddDeduction={onAddDeduction}
        onDeleteDeduction={onDeleteDeduction}
        onDaysChange={onDaysChange}
        onSizeSaved={onSizeSaved}
      />
    );
  }

  if (tplKey === 'sushma_buildtech') {
    return (
      <SushmaBuildtechPayslip
        company={comp}
        employee={emp}
        layoutConfig={layoutConfig}
        draft={draftData}
        isEditable={isEditable}
        onEarningChange={onEarningChange}
        onDeductionChange={onDeductionChange}
        onAddEarning={onAddEarning}
        onDeleteEarning={onDeleteEarning}
        onAddDeduction={onAddDeduction}
        onDeleteDeduction={onDeleteDeduction}
        onDaysChange={onDaysChange}
        onSizeSaved={onSizeSaved}
      />
    );
  }

  if (tplKey === 'delhi_public_school') {
    return (
      <DelhiPublicSchoolPayslip
        company={comp}
        employee={emp}
        layoutConfig={layoutConfig}
        draft={draftData}
        isEditable={isEditable}
        onEarningChange={onEarningChange}
        onDeductionChange={onDeductionChange}
        onAddEarning={onAddEarning}
        onDeleteEarning={onDeleteEarning}
        onAddDeduction={onAddDeduction}
        onDeleteDeduction={onDeleteDeduction}
        onDaysChange={onDaysChange}
        onSizeSaved={onSizeSaved}
      />
    );
  }

  // Standard Corporate Payslip View
  return (
    <div
      className={`payslip-sheet template-${tplKey}`}
      style={{
        maxWidth: layoutConfig.slipWidth ? `${layoutConfig.slipWidth}px` : undefined,
        minHeight: layoutConfig.slipMinHeight ? `${layoutConfig.slipMinHeight}px` : undefined,
        padding: layoutConfig.slipPadding ? `${layoutConfig.slipPadding}px` : undefined,
        borderWidth: layoutConfig.slipBorderWidth !== undefined ? `${layoutConfig.slipBorderWidth}px` : undefined,
        borderStyle: layoutConfig.slipBorderStyle || undefined,
        borderColor: layoutConfig.slipBorderColor || undefined,
        borderRadius: layoutConfig.slipBorderRadius !== undefined ? `${layoutConfig.slipBorderRadius}px` : undefined,
        fontSize: layoutConfig.fontSizeScale ? `${layoutConfig.fontSizeScale * 0.0085}rem` : undefined,
      }}
    >
      <div className="payslip-header">
        <div className="company-branding">
          <ResizableLogo
            company={comp}
            isEditable={isEditable}
            onSizeSaved={onSizeSaved}
          />
          <div>
            <h1 className="company-title">{comp.name || 'Company Name'}</h1>
            <p className="company-sub">{comp.fullAddress}</p>
            <p className="company-sub">
              GSTIN: {comp.gstin || 'N/A'} | PAN: {comp.pan || 'N/A'}
            </p>
          </div>
        </div>

        <div className="payslip-badge-box">
          <h2>SALARY SLIP</h2>
          <div className="pay-period-pill">{payslip.payPeriod}</div>
        </div>
      </div>

      <div className="payslip-meta-grid">
        <div className="meta-col">
          <div className="meta-row">
            <span className="meta-label">Employee ID:</span>
            <span className="meta-val">{emp.empCode}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Name:</span>
            <span className="meta-val highlight">{emp.fullName}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Designation:</span>
            <span className="meta-val">{emp.designation}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Department:</span>
            <span className="meta-val">{emp.department}</span>
          </div>
        </div>

        <div className="meta-col">
          {emp.dynamicFields?.panNumber && (
            <div className="meta-row">
              <span className="meta-label">PAN:</span>
              <span className="meta-val">{emp.dynamicFields.panNumber}</span>
            </div>
          )}
          {emp.dynamicFields?.uanNumber && (
            <div className="meta-row">
              <span className="meta-label">UAN:</span>
              <span className="meta-val">{emp.dynamicFields.uanNumber}</span>
            </div>
          )}
          {emp.dynamicFields?.bankAccount && (
            <div className="meta-row">
              <span className="meta-label">Bank A/C:</span>
              <span className="meta-val">{emp.dynamicFields.bankAccount}</span>
            </div>
          )}
          {emp.dynamicFields?.ifscCode && (
            <div className="meta-row">
              <span className="meta-label">IFSC:</span>
              <span className="meta-val">{emp.dynamicFields.ifscCode}</span>
            </div>
          )}
        </div>

        <div className="meta-col attendance-box">
          <div className="meta-row">
            <span className="meta-label">Working Days:</span>
            {isEditable ? (
              <input
                type="number"
                value={payslip.workingDays || 30}
                onChange={(e) => onDaysChange && onDaysChange('workingDays', e.target.value)}
                style={{ width: '60px', padding: '2px 4px', fontSize: '0.8rem', background: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }}
              />
            ) : (
              <span className="meta-val">{payslip.workingDays}</span>
            )}
          </div>
          <div className="meta-row">
            <span className="meta-label">Paid Days:</span>
            {isEditable ? (
              <input
                type="number"
                value={payslip.paidDays !== undefined ? payslip.paidDays : 30}
                onChange={(e) => onDaysChange && onDaysChange('paidDays', e.target.value)}
                style={{ width: '60px', padding: '2px 4px', fontSize: '0.8rem', background: '#1e293b', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }}
              />
            ) : (
              <span className="meta-val">{payslip.paidDays}</span>
            )}
          </div>
          <div className="meta-row">
            <span className="meta-label">LOP Leaves:</span>
            <span className="meta-val">{payslip.lopDays || 0}</span>
          </div>
        </div>
      </div>

      <div
        className="payslip-financials-grid"
        style={{
          gridTemplateColumns: `${layoutConfig.incomeColumnWidth}% ${100 - layoutConfig.incomeColumnWidth}%`,
        }}
      >
        <div
          className="financial-section earnings-section"
          style={{
            minHeight: layoutConfig.incomeDeductionMinHeight ? `${layoutConfig.incomeDeductionMinHeight}px` : undefined,
          }}
        >
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>EARNINGS</h3>
            {isEditable && onAddEarning && (
              <button
                type="button"
                onClick={onAddEarning}
                style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366f1', color: '#818cf8', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                + Add
              </button>
            )}
          </div>
          <table className="canvas-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount ({comp.currency || '₹'})</th>
              </tr>
            </thead>
            <tbody>
              {(payslip.earnings || []).map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {isEditable ? (
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => onEarningChange && onEarningChange(idx, 'label', e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px dotted #6366f1', color: 'inherit', fontSize: 'inherit' }}
                      />
                    ) : (
                      item.label
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {isEditable ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => onEarningChange && onEarningChange(idx, 'amount', e.target.value)}
                          style={{ width: '80px', textAlign: 'right', background: 'transparent', border: 'none', borderBottom: '1px dotted #6366f1', color: 'inherit', fontSize: 'inherit' }}
                        />
                        {onDeleteEarning && (
                          <button
                            type="button"
                            onClick={() => onDeleteEarning(idx)}
                            style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ) : (
                      Number(item.amount || 0).toLocaleString('en-IN')
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total Gross Earnings</strong></td>
                <td style={{ textAlign: 'right' }}>
                  <strong>{comp.currency || '₹'}{Number(payslip.grossEarnings || 0).toLocaleString('en-IN')}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          className="financial-section deductions-section"
          style={{
            minHeight: layoutConfig.incomeDeductionMinHeight ? `${layoutConfig.incomeDeductionMinHeight}px` : undefined,
          }}
        >
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>DEDUCTIONS</h3>
            {isEditable && onAddDeduction && (
              <button
                type="button"
                onClick={onAddDeduction}
                style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                + Add
              </button>
            )}
          </div>
          <table className="canvas-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount ({comp.currency || '₹'})</th>
              </tr>
            </thead>
            <tbody>
              {(payslip.deductions || []).map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {isEditable ? (
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => onDeductionChange && onDeductionChange(idx, 'label', e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px dotted #ef4444', color: 'inherit', fontSize: 'inherit' }}
                      />
                    ) : (
                      item.label
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {isEditable ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => onDeductionChange && onDeductionChange(idx, 'amount', e.target.value)}
                          style={{ width: '80px', textAlign: 'right', background: 'transparent', border: 'none', borderBottom: '1px dotted #ef4444', color: 'inherit', fontSize: 'inherit' }}
                        />
                        {onDeleteDeduction && (
                          <button
                            type="button"
                            onClick={() => onDeleteDeduction(idx)}
                            style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ) : (
                      Number(item.amount || 0).toLocaleString('en-IN')
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total Deductions</strong></td>
                <td style={{ textAlign: 'right' }}>
                  <strong>{comp.currency || '₹'}{Number(payslip.totalDeductions || 0).toLocaleString('en-IN')}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="net-salary-banner">
        <div className="net-label">NET TAKE-HOME SALARY</div>
        <div className="net-amount">
          {comp.currency || '₹'}{Number(payslip.netSalary || 0).toLocaleString('en-IN')}
        </div>
        {payslip.netSalaryInWords && (
          <div className="net-words">({payslip.netSalaryInWords})</div>
        )}
      </div>
    </div>
  );
};
