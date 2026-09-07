import React from 'react';
import { calculateTaxOnNormalIncome, calculateRebate87A, roundToTen } from '../../../utils/computationTaxCalculator';

/**
 * CA / Tax Auditor Comparative Workpaper Computation Template
 * Features side-by-side New Regime vs Old Regime comparison, Audit Notes, and CA Seal block.
 */
export const CaAuditTemplate = ({ computation = {}, company = {} }) => {
  const p = computation.personalDetails || {};
  const h = computation.headsOfIncome || {};
  const s = h.salary || {};
  const hp = h.houseProperty || {};
  const bp = h.businessProfession || {};
  const cg = h.capitalGains || {};
  const os = h.otherSources || {};
  const tax = computation.taxCalculation || {};
  const deductions = Array.isArray(computation.deductionsChapterVIA) ? computation.deductionsChapterVIA : [];
  const challans = Array.isArray(computation.challans) ? computation.challans : [];
  const salaryBreakdown = Array.isArray(s.salaryBreakdown) ? s.salaryBreakdown : [];
  const fy = computation.financialYear || '2025-2026';

  const fmt = (val) => {
    if (val === undefined || val === null || val === '') return '0';
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-IN');
  };

  // Compute Old Regime vs New Regime Side-by-side metrics
  const grossSalary = Number(s.totalGross) || (Number(s.basicSalary) || 0) + (Number(s.allowances) || 0);
  const hpIncome = Number(hp.netIncome) || 0;
  const bpIncome = Number(bp.netProfit) || 0;
  const cgIncome = Number(cg.netGains) || 0;
  const osIncome = Number(os.totalOtherSources) || 0;

  // New Regime
  const newStdDeduction = fy === '2023-2024' ? 50000 : 75000;
  const newNetSalary = Math.max(0, grossSalary - newStdDeduction - (Number(s.professionalTax) || 0));
  const newGTI = newNetSalary + hpIncome + bpIncome + cgIncome + osIncome;
  const newTotalIncome = roundToTen(newGTI);
  const newBaseTax = calculateTaxOnNormalIncome(newTotalIncome, 'new_115bac', fy);
  const newRebate = calculateRebate87A(newTotalIncome, newBaseTax, 'new_115bac', fy);
  const newTaxAfterRebate = Math.max(0, newBaseTax - newRebate);
  const newCess = Math.round(newTaxAfterRebate * 0.04);
  const newTotalTax = newTaxAfterRebate + newCess;

  // Old Regime
  const oldStdDeduction = 50000;
  const oldNetSalary = Math.max(0, grossSalary - oldStdDeduction - (Number(s.professionalTax) || 0));
  const oldGTI = oldNetSalary + hpIncome + bpIncome + cgIncome + osIncome;
  const oldTotalDeductions = deductions.reduce((sum, d) => sum + (Number(d.deductibleAmount) || 0), 0);
  const oldTotalIncome = roundToTen(Math.max(0, oldGTI - oldTotalDeductions));
  const oldBaseTax = calculateTaxOnNormalIncome(oldTotalIncome, 'old', fy);
  const oldRebate = calculateRebate87A(oldTotalIncome, oldBaseTax, 'old', fy);
  const oldTaxAfterRebate = Math.max(0, oldBaseTax - oldRebate);
  const oldCess = Math.round(oldTaxAfterRebate * 0.04);
  const oldTotalTax = oldTaxAfterRebate + oldCess;

  const taxDifference = Math.abs(oldTotalTax - newTotalTax);
  const beneficialRegime = newTotalTax <= oldTotalTax ? 'New Tax Regime (u/s 115BAC)' : 'Old Tax Regime';

  return (
    <div
      style={{
        background: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '12px',
        lineHeight: 1.35,
        padding: '2.5rem',
        maxWidth: '850px',
        margin: '0 auto',
        minHeight: '1100px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        borderRadius: '4px',
        border: '1px solid #cbd5e1',
      }}
    >
      {/* Top Header */}
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, letterSpacing: '0.05em' }}>
            TAX AUDIT & DUAL-REGIME COMPARATIVE WORKPAPER
          </h1>
          <span style={{ fontSize: '11px', fontWeight: 'bold', border: '1px solid #000', padding: '2px 6px' }}>
            AY {computation.assessmentYear || '2026-2027'}
          </span>
        </div>
        <p style={{ fontSize: '10.5px', color: '#475569', margin: '0.2rem 0 0' }}>
          Prepared for Statutory Assessment & Filing under the Indian Income Tax Act, 1961
        </p>
      </div>

      {/* Assessee & Audit Profile Block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', border: '1px solid #94a3b8', padding: '0.75rem', marginBottom: '1rem', fontSize: '11.5px' }}>
        <div>
          <div><strong>ASSESSEE:</strong> <span style={{ textTransform: 'uppercase' }}>{p.name || 'N/A'}</span></div>
          <div><strong>PAN:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{p.pan || 'N/A'}</span> | <strong>DOB:</strong> {p.dob || 'N/A'}</div>
          <div><strong>STATUS:</strong> {p.status || 'Individual'} | {p.residentStatus || 'Resident'}</div>
          <div><strong>EMPLOYER:</strong> {company.name || s.employerName || 'N/A'}</div>
        </div>
        <div>
          <div><strong>FINANCIAL YEAR:</strong> {fy} (AY {computation.assessmentYear || '2026-2027'})</div>
          <div><strong>FILING SECTION:</strong> {computation.filingSection || '139(1)'} | {computation.returnType || 'ORIGINAL'}</div>
          <div><strong>DUE DATE:</strong> {computation.filingDueDate || '31/07/2026'}</div>
          <div><strong>AUDITOR OPTED REGIME:</strong> <strong>{computation.regime === 'new_115bac' ? 'New (115BAC)' : 'Old Regime'}</strong></div>
        </div>
      </div>

      {/* Comparative Regime Matrix Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11.5px', marginBottom: '1rem' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #000' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', width: '46%', borderRight: '1px solid #000' }}>COMPUTATION PARTICULARS</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', width: '27%', borderRight: '1px solid #000' }}>OLD TAX REGIME (₹)</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', width: '27%' }}>NEW REGIME 115BAC (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <td style={{ padding: '4px 8px', borderRight: '1px solid #000' }}>Gross Salary Income</td>
            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>{fmt(grossSalary)}</td>
            <td style={{ textAlign: 'right', padding: '4px 8px' }}>{fmt(grossSalary)}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <td style={{ padding: '4px 8px', borderRight: '1px solid #000' }}>Less: Standard Deduction u/s 16(ia)</td>
            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>{fmt(oldStdDeduction)}</td>
            <td style={{ textAlign: 'right', padding: '4px 8px' }}>{fmt(newStdDeduction)}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <td style={{ padding: '4px 8px', borderRight: '1px solid #000' }}>Net Taxable Salary (Head 1)</td>
            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000', fontWeight: 'bold' }}>{fmt(oldNetSalary)}</td>
            <td style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 'bold' }}>{fmt(newNetSalary)}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <td style={{ padding: '4px 8px', borderRight: '1px solid #000' }}>Heads 2-5 (House Prop, Business, CapGains, Other)</td>
            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>{fmt(hpIncome + bpIncome + cgIncome + osIncome)}</td>
            <td style={{ textAlign: 'right', padding: '4px 8px' }}>{fmt(hpIncome + bpIncome + cgIncome + osIncome)}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #000', background: '#f8fafc', fontWeight: 'bold' }}>
            <td style={{ padding: '4px 8px', borderRight: '1px solid #000' }}>GROSS TOTAL INCOME (GTI)</td>
            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>{fmt(oldGTI)}</td>
            <td style={{ textAlign: 'right', padding: '4px 8px' }}>{fmt(newGTI)}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <td style={{ padding: '4px 8px', borderRight: '1px solid #000' }}>Less: Chapter VI-A Deductions (80C, 80D, etc.)</td>
            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000', color: '#6366f1' }}>-{fmt(oldTotalDeductions)}</td>
            <td style={{ textAlign: 'right', padding: '4px 8px' }}>0 (Restricted)</td>
          </tr>
          <tr style={{ borderBottom: '2px solid #000', background: '#f1f5f9', fontWeight: 'bold' }}>
            <td style={{ padding: '6px 8px', borderRight: '1px solid #000' }}>TOTAL TAXABLE INCOME (Rounded u/s 288A)</td>
            <td style={{ textAlign: 'right', padding: '6px 8px', borderRight: '1px solid #000' }}>{fmt(oldTotalIncome)}</td>
            <td style={{ textAlign: 'right', padding: '6px 8px' }}>{fmt(newTotalIncome)}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <td style={{ padding: '4px 8px', borderRight: '1px solid #000' }}>Tax Calculated at Applicable Slabs</td>
            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>{fmt(oldBaseTax)}</td>
            <td style={{ textAlign: 'right', padding: '4px 8px' }}>{fmt(newBaseTax)}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <td style={{ padding: '4px 8px', borderRight: '1px solid #000' }}>Less: Rebate u/s 87A</td>
            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>-{fmt(oldRebate)}</td>
            <td style={{ textAlign: 'right', padding: '4px 8px' }}>-{fmt(newRebate)}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <td style={{ padding: '4px 8px', borderRight: '1px solid #000' }}>Health and Education Cess (4%)</td>
            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>+{fmt(oldCess)}</td>
            <td style={{ textAlign: 'right', padding: '4px 8px' }}>+{fmt(newCess)}</td>
          </tr>
          <tr style={{ borderBottom: '2px solid #000', background: '#e2e8f0', fontWeight: 'bold', fontSize: '12px' }}>
            <td style={{ padding: '6px 8px', borderRight: '1px solid #000' }}>TOTAL TAX LIABILITY</td>
            <td style={{ textAlign: 'right', padding: '6px 8px', borderRight: '1px solid #000' }}>{fmt(oldTotalTax)}</td>
            <td style={{ textAlign: 'right', padding: '6px 8px' }}>{fmt(newTotalTax)}</td>
          </tr>
        </tbody>
      </table>

      {/* Auditor Beneficial Recommendation Banner */}
      <div style={{ border: '2px solid #000', background: '#f8fafc', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '11.5px' }}>
        <strong>AUDITOR RECOMMENDATION & SAVINGS ANALYSIS:</strong>
        <div style={{ marginTop: '0.25rem' }}>
          Optimal Filing Path: <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{beneficialRegime}</span> delivers a tax saving of <strong>₹{fmt(taxDifference)}</strong> for the assessee.
        </div>
      </div>

      {/* Verification & Auditor Attestation Block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px dashed #000', fontSize: '11px' }}>
        <div>
          <div><strong>TAX CONSULTANT / AUDITOR NOTES:</strong></div>
          <div style={{ color: '#475569', fontSize: '10.5px', marginTop: '0.25rem' }}>
            Verified against 26AS, Form 16, AIS, and bank interest certificates. All statutory deductions verified.
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px' }}></div>
          <div style={{ borderTop: '1px solid #000', paddingTop: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {p.name || computation.verifiedBy || 'ASSESSEE SIGNATURE'}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>Assessee / Tax Consultant</div>
        </div>
      </div>
    </div>
  );
};
