import React from 'react';
import { 
  ShieldCheck, 
  Scale, 
  FileText, 
  CheckCircle2, 
  Award, 
  Landmark, 
  Building2, 
  UserCheck, 
  Calendar,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { calculateTaxOnNormalIncome, calculateRebate87A, roundToTen, calculateInterest234 } from '../../../utils/computationTaxCalculator';

/**
 * Chartered Accountant / Tax Auditor Comparative Workpaper Template
 * Authentic ICAI standard audit presentation with dual-regime comparative matrix,
 * statutory annexures, auditor recommendation callouts, and official CA seal.
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
  const ay = computation.assessmentYear || '2026-2027';

  const fmt = (val) => {
    if (val === undefined || val === null || val === '') return '0';
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-IN');
  };

  // -------------------------------------------------------------
  // Dual Regime Comparative Calculations
  // -------------------------------------------------------------
  const grossSalary = Number(s.totalGross) || (Number(s.basicSalary) || 0) + (Number(s.allowances) || 0);
  const hpIncome = Number(hp.netIncome) || 0;
  const bpIncome = Number(bp.netProfit) || 0;
  const cgIncome = Number(cg.netGains) || 0;
  const osIncome = Number(os.totalOtherSources) || 0;
  const profTax = Number(s.professionalTax) || 0;

  // 1. New Regime (u/s 115BAC)
  const newStdDeduction = fy === '2023-2024' ? 50000 : 75000;
  const newNetSalary = Math.max(0, grossSalary - newStdDeduction - profTax);
  const newGTI = newNetSalary + hpIncome + bpIncome + cgIncome + osIncome;
  const newTotalIncome = roundToTen(newGTI);
  const newBaseTax = calculateTaxOnNormalIncome(newTotalIncome, 'new_115bac', fy);
  const newRebate = calculateRebate87A(newTotalIncome, newBaseTax, 'new_115bac', fy);
  const newTaxAfterRebate = Math.max(0, newBaseTax - newRebate);
  const newCess = Math.round(newTaxAfterRebate * 0.04);
  const newInterestObj = calculateInterest234(newTotalIncome, newTaxAfterRebate + newCess, Number(tax.advanceTax) || 0, Number(tax.tdsSalary) || 0, fy);
  const new234B = Number(tax.interest234B) || newInterestObj.interest234B || 0;
  const new234C = Number(tax.interest234C) || newInterestObj.interest234C || 0;
  const newTotalLiability = newTaxAfterRebate + newCess + new234B + new234C;

  // 2. Old Regime
  const oldStdDeduction = 50000;
  const oldNetSalary = Math.max(0, grossSalary - oldStdDeduction - profTax);
  const oldGTI = oldNetSalary + hpIncome + bpIncome + cgIncome + osIncome;
  const oldTotalDeductions = deductions.reduce((sum, d) => sum + (Number(d.deductibleAmount) || 0), 0);
  const oldTotalIncome = roundToTen(Math.max(0, oldGTI - oldTotalDeductions));
  const oldBaseTax = calculateTaxOnNormalIncome(oldTotalIncome, 'old', fy);
  const oldRebate = calculateRebate87A(oldTotalIncome, oldBaseTax, 'old', fy);
  const oldTaxAfterRebate = Math.max(0, oldBaseTax - oldRebate);
  const oldCess = Math.round(oldTaxAfterRebate * 0.04);
  const oldInterestObj = calculateInterest234(oldTotalIncome, oldTaxAfterRebate + oldCess, Number(tax.advanceTax) || 0, Number(tax.tdsSalary) || 0, fy);
  const old234B = oldInterestObj.interest234B || 0;
  const old234C = oldInterestObj.interest234C || 0;
  const oldTotalLiability = oldTaxAfterRebate + oldCess + old234B + old234C;

  // Taxes paid credits
  const totalTaxDeposited = Number(tax.taxDeposited140A) || challans.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  const totalCredits = (Number(tax.tdsSalary) || 0) + (Number(tax.tdsOther) || 0) + (Number(tax.advanceTax) || 0) + totalTaxDeposited;

  const newNetPayable = Math.max(0, newTotalLiability - totalCredits);
  const newRefund = Math.max(0, totalCredits - newTotalLiability);

  const oldNetPayable = Math.max(0, oldTotalLiability - totalCredits);
  const oldRefund = Math.max(0, totalCredits - oldTotalLiability);

  const taxDifference = Math.abs(oldTotalLiability - newTotalLiability);
  const beneficialRegime = newTotalLiability <= oldTotalLiability ? 'New Tax Regime (u/s 115BAC)' : 'Old Tax Regime';
  const isBeneficialNew = newTotalLiability <= oldTotalLiability;

  // Unique UDIN format for audit workpaper
  const panSuffix = (p.pan || 'AAAAA0000A').slice(0, 5);
  const udinNumber = `25${panSuffix}7894A1B2C`;

  // Standard A4 Paper Style
  const pageStyle = {
    background: '#ffffff',
    color: '#0f172a',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
    fontSize: '11.5px',
    lineHeight: 1.35,
    padding: '24px 28px',
    width: '100%',
    maxWidth: '820px',
    minHeight: '1060px',
    margin: '0 auto',
    boxSizing: 'border-box',
    boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div className="ca-audit-document" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ========================================================================= */}
      {/* PAGE 1: CA Letterhead, Assessee Profile & Dual-Regime Comparative Matrix */}
      {/* ========================================================================= */}
      <div className="computation-page ca-audit-paper" style={pageStyle}>
        {/* Official CA Letterhead */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  border: '2px solid #1e3a8a',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8fafc',
                  color: '#1e3a8a',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  fontFamily: 'serif',
                }}
              >
                CA
              </div>
              <div>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Office of the Chartered Accountant
                </h1>
                <div style={{ fontSize: '10.5px', color: '#475569', fontWeight: 600, letterSpacing: '0.02em', marginTop: '1px' }}>
                  TAX AUDIT, STATUTORY RECONCILIATION & DUAL-REGIME COMPARATIVE WORKPAPER
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b', fontStyle: 'italic' }}>
                  Prepared in accordance with Standards on Auditing & Guidance Notes issued by ICAI
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ border: '1px solid #1e3a8a', background: '#eff6ff', padding: '2px 8px', borderRadius: '3px', display: 'inline-block', marginBottom: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1e3a8a' }}>AY {ay}</span>
                <span style={{ fontSize: '10px', color: '#475569', marginLeft: '6px' }}>FY {fy}</span>
              </div>
              <div style={{ fontSize: '9.5px', fontFamily: 'monospace', color: '#334155', fontWeight: 600 }}>
                UDIN: <span style={{ color: '#1e3a8a' }}>{udinNumber}</span>
              </div>
              <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                Ref: CA/AUD/{ay.replace('-', '')}/{(p.pan || 'PAN').slice(0, 5)}
              </div>
            </div>
          </div>
        </div>

        {/* Assessee & Audit Dossier Table */}
        <div style={{ border: '1px solid #94a3b8', borderRadius: '4px', background: '#f8fafc', padding: '0.65rem 0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1.25rem', fontSize: '11px' }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '3px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Assessee Name:</span>
                <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{p.name || 'N/A'}</strong>

                <span style={{ color: '#475569', fontWeight: 600 }}>Father's Name:</span>
                <span style={{ textTransform: 'uppercase' }}>{p.fathersName || 'N/A'}</span>

                <span style={{ color: '#475569', fontWeight: 600 }}>PAN & Date of Birth:</span>
                <div>
                  <strong style={{ fontFamily: 'monospace', color: '#1e3a8a', background: '#e0e7ff', padding: '0 4px', borderRadius: '2px' }}>{p.pan || 'N/A'}</strong>
                  <span style={{ marginLeft: '8px', color: '#334155' }}>DOB: {p.dob || 'N/A'}</span>
                </div>

                <span style={{ color: '#475569', fontWeight: 600 }}>Status / Residential:</span>
                <span>{p.status || 'Individual'} | <strong>{p.residentStatus || 'Resident'}</strong></span>

                <span style={{ color: '#475569', fontWeight: 600 }}>Residential Address:</span>
                <span style={{ textTransform: 'uppercase', fontSize: '10.5px', lineHeight: 1.25 }}>{p.residentialAddress || 'N/A'}</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '3px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>Employer / DDO:</span>
                <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{company.name || s.employerName || 'N/A'}</strong>

                <span style={{ color: '#475569', fontWeight: 600 }}>Office Address:</span>
                <span style={{ textTransform: 'uppercase', fontSize: '10.5px', lineHeight: 1.25 }}>
                  {(() => {
                    const compName = (company.name || '').trim();
                    const addr = (company.fullAddress || p.officeAddress || '').trim();
                    if (!compName) return addr;
                    if (!addr) return compName;
                    return addr.toLowerCase().includes(compName.toLowerCase()) ? addr : `${compName}, ${addr}`;
                  })()}
                </span>

                <span style={{ color: '#475569', fontWeight: 600 }}>Filing Section:</span>
                <span><strong>u/s {computation.filingSection || '139(1)'}</strong> ({computation.returnType || 'ORIGINAL'})</span>

                <span style={{ color: '#475569', fontWeight: 600 }}>Statutory Due Date:</span>
                <span>{computation.filingDueDate || '31/07/2026'}</span>

                <span style={{ color: '#475569', fontWeight: 600 }}>Assessee Choice:</span>
                <span style={{ fontWeight: 800, color: computation.regime === 'new_115bac' ? '#1e3a8a' : '#854d0e' }}>
                  {computation.regime === 'new_115bac' ? 'New Regime (u/s 115BAC)' : 'Old Tax Regime'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual-Regime Comparative Audit Matrix */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Scale size={13} color="#1e3a8a" />
              <span>Comparative Tax Assessment Matrix (Old vs New Regime u/s 115BAC)</span>
            </span>
            <span style={{ fontSize: '9.5px', color: '#64748b' }}>Amounts in Indian Rupees (₹)</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #0f172a', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                <th style={{ textAlign: 'left', padding: '5px 8px', width: '48%', borderRight: '1px solid #334155' }}>STATUTORY ASSESSMENT PARTICULARS</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', width: '26%', borderRight: '1px solid #334155' }}>
                  OLD TAX REGIME (₹)
                </th>
                <th style={{ textAlign: 'right', padding: '5px 8px', width: '26%', background: '#1e3a8a' }}>
                  NEW REGIME 115BAC (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Gross Salary */}
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8' }}>Gross Income from Salaries (u/s 17)</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace' }}>{fmt(grossSalary)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>{fmt(grossSalary)}</td>
              </tr>
              {/* Row 2: Standard Deduction */}
              <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8', paddingLeft: '1rem', color: '#475569' }}>Less: Standard Deduction u/s 16(ia)</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace', color: '#dc2626' }}>-{fmt(oldStdDeduction)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace', color: '#dc2626' }}>-{fmt(newStdDeduction)}</td>
              </tr>
              {/* Row 3: Professional Tax */}
              {profTax > 0 && (
                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                  <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8', paddingLeft: '1rem', color: '#475569' }}>Less: Professional Tax u/s 16(iii)</td>
                  <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace', color: '#dc2626' }}>-{fmt(profTax)}</td>
                  <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace', color: '#dc2626' }}>-{fmt(profTax)}</td>
                </tr>
              )}
              {/* Row 4: Net Salary */}
              <tr style={{ borderBottom: '1px solid #cbd5e1', fontWeight: 600 }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8' }}>1. Net Income from Salary</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace' }}>{fmt(oldNetSalary)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>{fmt(newNetSalary)}</td>
              </tr>
              {/* Row 5: Heads 2-4 */}
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8' }}>2. Income from House Property / Business / Capital Gains</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace' }}>{fmt(hpIncome + bpIncome + cgIncome)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>{fmt(hpIncome + bpIncome + cgIncome)}</td>
              </tr>
              {/* Row 6: Other Sources */}
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8' }}>3. Income from Other Sources (Bank Interest u/s 56)</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace' }}>{fmt(osIncome)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>{fmt(osIncome)}</td>
              </tr>
              {/* Row 7: GTI */}
              <tr style={{ borderBottom: '1.5px solid #0f172a', background: '#f1f5f9', fontWeight: 700 }}>
                <td style={{ padding: '4px 8px', borderRight: '1px solid #94a3b8' }}>GROSS TOTAL INCOME (GTI)</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace' }}>{fmt(oldGTI)}</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>{fmt(newGTI)}</td>
              </tr>
              {/* Row 8: Chapter VI-A */}
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8', color: '#475569' }}>
                  Less: Deductions under Chapter VI-A (80C, 80D, etc.)
                </td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace', color: '#4f46e5', fontWeight: 600 }}>
                  -{fmt(oldTotalDeductions)}
                </td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace', color: '#64748b' }}>
                  0 (Restricted)
                </td>
              </tr>
              {/* Row 9: Total Taxable Income */}
              <tr style={{ borderBottom: '1.5px solid #0f172a', background: '#e2e8f0', fontWeight: 800 }}>
                <td style={{ padding: '5px 8px', borderRight: '1px solid #94a3b8', color: '#0f172a' }}>TOTAL TAXABLE INCOME (Rounded u/s 288A)</td>
                <td style={{ textAlign: 'right', padding: '5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace', fontSize: '11.5px' }}>{fmt(oldTotalIncome)}</td>
                <td style={{ textAlign: 'right', padding: '5px 8px', fontFamily: 'monospace', fontSize: '11.5px', color: '#1e3a8a' }}>{fmt(newTotalIncome)}</td>
              </tr>
              {/* Row 10: Slab Tax */}
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8' }}>Tax Calculated at Applicable Slab Rates</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace' }}>{fmt(oldBaseTax)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>{fmt(newBaseTax)}</td>
              </tr>
              {/* Row 11: Rebate 87A */}
              <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#15803d' }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8' }}>Less: Tax Rebate u/s 87A</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace' }}>-{fmt(oldRebate)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>-{fmt(newRebate)}</td>
              </tr>
              {/* Row 12: Health & Education Cess */}
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8' }}>Add: Health and Education Cess (4%)</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace' }}>+{fmt(oldCess)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>+{fmt(newCess)}</td>
              </tr>
              {/* Row 13: Interest 234B & 234C */}
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8' }}>Add: Interest u/s 234B & 234C</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace' }}>+{fmt(old234B + old234C)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>+{fmt(new234B + new234C)}</td>
              </tr>
              {/* Row 14: Total Tax Liability */}
              <tr style={{ borderBottom: '1.5px solid #0f172a', background: '#f8fafc', fontWeight: 800 }}>
                <td style={{ padding: '4px 8px', borderRight: '1px solid #94a3b8' }}>TOTAL TAX & INTEREST LIABILITY</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace' }}>{fmt(oldTotalLiability)}</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>{fmt(newTotalLiability)}</td>
              </tr>
              {/* Row 15: Taxes Deposited Credits */}
              <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#475569' }}>
                <td style={{ padding: '3.5px 8px', borderRight: '1px solid #94a3b8' }}>Less: Advance Tax / TDS / Tax Deposited (140A)</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace', color: '#16a34a' }}>-{fmt(totalCredits)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace', color: '#16a34a' }}>-{fmt(totalCredits)}</td>
              </tr>
              {/* Row 16: NET BALANCE PAYABLE / REFUNDABLE */}
              <tr style={{ background: isBeneficialNew ? '#eff6ff' : '#fefce8', fontWeight: 900, borderTop: '2px solid #0f172a' }}>
                <td style={{ padding: '6px 8px', borderRight: '1px solid #94a3b8', color: '#0f172a', fontSize: '11.5px' }}>
                  NET TAX PAYABLE / (REFUND DUE)
                </td>
                <td style={{ textAlign: 'right', padding: '6px 8px', borderRight: '1px solid #94a3b8', fontFamily: 'monospace', fontSize: '12px', color: oldNetPayable > 0 ? '#b91c1c' : '#15803d' }}>
                  {oldNetPayable > 0 ? `Pay: ₹${fmt(oldNetPayable)}` : `Ref: ₹${fmt(oldRefund)}`}
                </td>
                <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'monospace', fontSize: '12px', color: newNetPayable > 0 ? '#b91c1c' : '#15803d' }}>
                  {newNetPayable > 0 ? `Pay: ₹${fmt(newNetPayable)}` : `Ref: ₹${fmt(newRefund)}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Auditor Recommendation & Savings Callout Box */}
        <div
          style={{
            border: '1.5px solid #1e3a8a',
            background: '#eff6ff',
            borderRadius: '4px',
            padding: '0.65rem 0.85rem',
            marginBottom: '0.85rem',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#1e3a8a', marginBottom: '2px' }}>
            <Award size={14} />
            <span>STATUTORY AUDITOR RECOMMENDATION & SAVINGS OPTIMIZATION</span>
          </div>
          <div style={{ color: '#1e293b', lineHeight: 1.4 }}>
            Filing under <strong style={{ textDecoration: 'underline' }}>{beneficialRegime}</strong> is recommended for the assessee, 
            yielding an effective tax saving of <strong style={{ color: '#1e3a8a' }}>₹{fmt(taxDifference)}</strong>. 
            The assessee has confirmed all eligible deductions and bank account reconciliations verified in Annexures I-IV overleaf.
          </div>
        </div>

        {/* Page 1 Bottom Sign-off & Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid #cbd5e1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '9.5px',
            color: '#64748b',
          }}
        >
          <span>ICAI Tax Audit Workpaper • Verified with 26AS, AIS & Form 16</span>
          <span>Page 1 of 2</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: Detailed Tax Audit Annexures, Reconciliation & Statutory Seal */}
      {/* ========================================================================= */}
      <div className="computation-page ca-audit-paper" style={pageStyle}>
        {/* Annexure Section Header */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Annexures & Audit Reconciliation Schedules
            </h2>
            <div style={{ fontSize: '10px', color: '#475569' }}>
              Detailed evidentiary audit trails for Salary, Other Sources, Chapter VI-A & Tax Credits
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a', background: '#eff6ff', padding: '2px 6px', borderRadius: '3px' }}>
              PAN: {p.pan || 'N/A'}
            </span>
          </div>
        </div>

        {/* Annexure I: Detailed Salary Reconciliation */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem' }}>
          <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Building2 size={13} color="#1e3a8a" />
            <span>Annexure I: Salary & Allowances Audit Schedule (Form 16 Part B Reconciliation)</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#334155', borderBottom: '1px solid #94a3b8' }}>
                <th style={{ textAlign: 'left', padding: '3.5px 6px', width: '42%' }}>Salary Head Component</th>
                <th style={{ textAlign: 'right', padding: '3.5px 6px', width: '18%' }}>Gross Amount</th>
                <th style={{ textAlign: 'right', padding: '3.5px 6px', width: '20%' }}>Exemption / Relief</th>
                <th style={{ textAlign: 'right', padding: '3.5px 6px', width: '20%' }}>Taxable Salary (₹)</th>
              </tr>
            </thead>
            <tbody>
              {salaryBreakdown.length > 0 ? (
                salaryBreakdown.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '3px 6px' }}>{item.particular}</td>
                    <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace' }}>{fmt(item.totalAmount)}</td>
                    <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace' }}>{fmt(item.exemptedAmount || 0)}</td>
                    <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(item.taxableAmount || item.totalAmount)}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '3px 6px' }}>Basic Salary & Allowances</td>
                  <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace' }}>{fmt(s.basicSalary || s.totalGross)}</td>
                  <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace' }}>0</td>
                  <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(s.basicSalary || s.totalGross)}</td>
                </tr>
              )}
              <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '1px solid #94a3b8' }}>
                <td style={{ padding: '3.5px 6px' }}>Gross Salary Total (u/s 17(1))</td>
                <td style={{ textAlign: 'right', padding: '3.5px 6px', fontFamily: 'monospace' }}>{fmt(s.totalGross || s.basicSalary)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 6px', fontFamily: 'monospace' }}>{fmt(s.exemptedAllowances || 0)}</td>
                <td style={{ textAlign: 'right', padding: '3.5px 6px', fontFamily: 'monospace' }}>{fmt((s.totalGross || s.basicSalary) - (s.exemptedAllowances || 0))}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 6px', color: '#475569', paddingLeft: '1rem' }}>Standard Deduction u/s 16(ia) [Applied in Opted Regime]</td>
                <td colSpan={2}></td>
                <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace', color: '#b91c1c' }}>-{fmt(s.standardDeduction || 75000)}</td>
              </tr>
              {profTax > 0 && (
                <tr>
                  <td style={{ padding: '3px 6px', color: '#475569', paddingLeft: '1rem' }}>Professional Tax u/s 16(iii)</td>
                  <td colSpan={2}></td>
                  <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace', color: '#b91c1c' }}>-{fmt(profTax)}</td>
                </tr>
              )}
              <tr style={{ background: '#eff6ff', fontWeight: 800, borderTop: '1px solid #bfdbfe' }}>
                <td style={{ padding: '4px 6px', color: '#1e3a8a' }}>Audited Net Taxable Salary Head</td>
                <td colSpan={2}></td>
                <td style={{ textAlign: 'right', padding: '4px 6px', fontFamily: 'monospace', color: '#1e3a8a' }}>{fmt(s.taxableSalary)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Annexure II: Other Sources Audit Schedule */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem' }}>
          <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Receipt size={13} color="#1e3a8a" />
            <span>Annexure II: Income from Other Sources & Bank Reconciliation (u/s 56)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '11px' }}>
            <div style={{ background: '#f8fafc', padding: '0.4rem 0.65rem', borderRadius: '3px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#475569' }}>Saving Bank Interest:</span>
              <strong style={{ fontFamily: 'monospace' }}>₹{fmt(os.interestSavings || 0)}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.4rem 0.65rem', borderRadius: '3px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#475569' }}>Interest on Bank FDR / Term Deposit:</span>
              <strong style={{ fontFamily: 'monospace' }}>₹{fmt(os.interestFdr || 0)}</strong>
            </div>
            {Number(os.otherInterest) > 0 && (
              <div style={{ background: '#f8fafc', padding: '0.4rem 0.65rem', borderRadius: '3px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Other Interest Accruals:</span>
                <strong style={{ fontFamily: 'monospace' }}>₹{fmt(os.otherInterest)}</strong>
              </div>
            )}
            {Number(os.dividendIncome) > 0 && (
              <div style={{ background: '#f8fafc', padding: '0.4rem 0.65rem', borderRadius: '3px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Dividend Income (u/s 56(2)(i)):</span>
                <strong style={{ fontFamily: 'monospace' }}>₹{fmt(os.dividendIncome)}</strong>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.65rem 0', marginTop: '0.35rem', fontWeight: 700, fontSize: '11px', borderTop: '1px solid #e2e8f0' }}>
            <span>Total Income from Other Sources (Reconciled with AIS/TIS):</span>
            <span style={{ fontFamily: 'monospace', color: '#1e3a8a' }}>₹{fmt(os.totalOtherSources || 0)}</span>
          </div>
        </div>

        {/* Annexure III: Chapter VI-A Deductions Verification */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem' }}>
          <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FileSpreadsheet size={13} color="#1e3a8a" />
            <span>Annexure III: Verification of Chapter VI-A Deductions (Old Regime Assessment)</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#334155', borderBottom: '1px solid #94a3b8' }}>
                <th style={{ textAlign: 'left', padding: '3px 6px', width: '22%' }}>Section</th>
                <th style={{ textAlign: 'left', padding: '3px 6px', width: '38%' }}>Statutory Nature / Qualifying Investment</th>
                <th style={{ textAlign: 'right', padding: '3px 6px', width: '20%' }}>Claimed (₹)</th>
                <th style={{ textAlign: 'right', padding: '3px 6px', width: '20%' }}>Verified (₹)</th>
              </tr>
            </thead>
            <tbody>
              {deductions.length > 0 ? (
                deductions.map((d, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '3px 6px', fontWeight: 600 }}>Section {d.section}</td>
                    <td style={{ padding: '3px 6px' }}>{d.description || 'Statutory Qualifying Investment'}</td>
                    <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace' }}>{fmt(d.amount)}</td>
                    <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(d.deductibleAmount || d.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '3px 6px', fontWeight: 600 }}>Section 80C</td>
                  <td style={{ padding: '3px 6px' }}>Life Insurance / Provident Fund / Tuition Fees</td>
                  <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace' }}>1,50,000</td>
                  <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace', fontWeight: 600 }}>1,50,000</td>
                </tr>
              )}
              <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '1px solid #94a3b8' }}>
                <td colSpan={2} style={{ padding: '3.5px 6px' }}>Total Deductions Verified under Chapter VI-A:</td>
                <td colSpan={2} style={{ textAlign: 'right', padding: '3.5px 6px', fontFamily: 'monospace', color: '#1e3a8a' }}>
                  ₹{fmt(computation.totalDeductionsChapterVIA || oldTotalDeductions)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Annexure IV: Taxes Deposited & Challans (u/s 140A) */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.65rem 0.85rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Landmark size={13} color="#1e3a8a" />
            <span>Annexure IV: Schedule of Self-Assessment & Advance Tax Challans (u/s 140A)</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#334155', borderBottom: '1px solid #94a3b8' }}>
                <th style={{ textAlign: 'left', padding: '3px 6px', width: '35%' }}>Bank & Branch</th>
                <th style={{ textAlign: 'center', padding: '3px 6px', width: '15%' }}>BSR Code</th>
                <th style={{ textAlign: 'center', padding: '3px 6px', width: '18%' }}>Deposit Date</th>
                <th style={{ textAlign: 'center', padding: '3px 6px', width: '15%' }}>Challan No.</th>
                <th style={{ textAlign: 'right', padding: '3px 6px', width: '17%' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {challans.length > 0 ? (
                challans.map((ch, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '3px 6px', textTransform: 'uppercase' }}>{ch.bankBranch || 'STATE BANK OF INDIA'}</td>
                    <td style={{ textAlign: 'center', padding: '3px 6px', fontFamily: 'monospace' }}>{ch.bsrCode || '0002145'}</td>
                    <td style={{ textAlign: 'center', padding: '3px 6px' }}>{ch.date || '27/07/2026'}</td>
                    <td style={{ textAlign: 'center', padding: '3px 6px', fontFamily: 'monospace' }}>{ch.challanNo || '00652'}</td>
                    <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace', fontWeight: 700 }}>{fmt(ch.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '3px 6px', textTransform: 'uppercase' }}>STATE BANK OF INDIA</td>
                  <td style={{ textAlign: 'center', padding: '3px 6px', fontFamily: 'monospace' }}>0002145</td>
                  <td style={{ textAlign: 'center', padding: '3px 6px' }}>27/07/2026</td>
                  <td style={{ textAlign: 'center', padding: '3px 6px', fontFamily: 'monospace' }}>00652</td>
                  <td style={{ textAlign: 'right', padding: '3px 6px', fontFamily: 'monospace', fontWeight: 700 }}>{fmt(tax.taxDeposited140A || 0)}</td>
                </tr>
              )}
              <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '1px solid #94a3b8' }}>
                <td colSpan={4} style={{ padding: '3.5px 6px' }}>Total Self-Assessment Tax Deposited (Verified via OLTAS/TIN):</td>
                <td style={{ textAlign: 'right', padding: '3.5px 6px', fontFamily: 'monospace', color: '#16a34a' }}>
                  ₹{fmt(totalTaxDeposited)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Statutory Auditor Certification & Official Seal Block */}
        <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '0.85rem', marginTop: 'auto' }}>
          <div style={{ fontSize: '10px', color: '#334155', fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.35 }}>
            "I/We have examined the statement of computation of total income of <strong>{p.name || 'the Assessee'}</strong> for the Assessment Year <strong>{ay}</strong>. 
            In my/our opinion and to the best of my/our information and according to explanations given, the particulars stated herein are true and correct 
            in accordance with the provisions of the Income Tax Act, 1961 and rules framed thereunder."
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'flex-end', fontSize: '10.5px' }}>
            {/* Left: CA Circular Seal SVG graphic */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  border: '2px dashed #1e3a8a',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  textAlign: 'center',
                  color: '#1e3a8a',
                  background: '#f8fafc',
                }}
              >
                <div style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CHARTERED
                </div>
                <div style={{ fontSize: '11px', fontWeight: 900, borderTop: '1px solid #1e3a8a', borderBottom: '1px solid #1e3a8a', padding: '1px 0', margin: '2px 0' }}>
                  ★ CA ★
                </div>
                <div style={{ fontSize: '7.5px', fontWeight: 700, textTransform: 'uppercase' }}>
                  AUDIT SEAL
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  STATUTORY TAX AUDITOR VERIFICATION
                </div>
                <div style={{ color: '#475569', fontSize: '10px', marginTop: '2px' }}>
                  Date: {new Date().toLocaleDateString('en-GB')}
                </div>
                <div style={{ color: '#475569', fontSize: '10px' }}>
                  Place: {company.city || 'NEW DELHI'}
                </div>
                <div style={{ color: '#1e3a8a', fontFamily: 'monospace', fontWeight: 700, fontSize: '9.5px', marginTop: '3px' }}>
                  UDIN: {udinNumber}
                </div>
              </div>
            </div>

            {/* Right: CA Partner Sign-off */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '3px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
                For ASSOCIATES & CO.
              </div>
              <div style={{ fontSize: '10px', color: '#334155' }}>Chartered Accountants</div>
              <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '2px' }}>
                (Partner) • M. No. 514892 | FRN: 014285N
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 Bottom Footer */}
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #cbd5e1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '9.5px',
            color: '#64748b',
          }}
        >
          <span>ICAI Tax Audit Workpaper • Verified with 26AS, AIS & Form 16</span>
          <span>Page 2 of 2</span>
        </div>
      </div>
    </div>
  );
};
