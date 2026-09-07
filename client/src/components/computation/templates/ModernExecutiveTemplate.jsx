import React from 'react';
import { ShieldCheck, TrendingUp, Building2, UserCheck, Calendar, FileText } from 'lucide-react';

/**
 * Modern Executive Tax Computation Template
 * Polished, high-contrast corporate statement format for modern enterprises.
 */
export const ModernExecutiveTemplate = ({ computation = {}, company = {} }) => {
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
  const osBreakdown = Array.isArray(os.breakdown) ? os.breakdown : [];

  const fmt = (val) => {
    if (val === undefined || val === null || val === '') return '₹0';
    const num = Number(val);
    if (isNaN(num)) return val;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const isOldRegime = computation.regime === 'old';

  return (
    <div
      style={{
        background: '#ffffff',
        color: '#1e293b',
        fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif",
        fontSize: '12.5px',
        lineHeight: 1.4,
        padding: '2.5rem',
        maxWidth: '850px',
        margin: '0 auto',
        minHeight: '1100px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#ffffff',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt="Logo"
                style={{ width: '56px', height: '56px', objectFit: 'contain', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px' }}
              />
            ) : (
              <div style={{ width: '48px', height: '48px', background: '#6366f1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.35rem', color: '#fff' }}>
                {(company.name || 'C')[0]}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>{company.name || 'Enterprise Corporation'}</h1>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.2rem 0 0' }}>Official Annual Income Tax Computation & Salary Statement</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)', fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {isOldRegime ? 'Old Tax Regime' : 'New Regime (115BAC)'}
            </span>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              FY: <strong style={{ color: '#fff' }}>{computation.financialYear || '2025-2026'}</strong> | AY: <strong style={{ color: '#fff' }}>{computation.assessmentYear || '2026-2027'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Gross Total Income</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem', display: 'block', fontFamily: 'monospace' }}>{fmt(computation.grossTotalIncome)}</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Deductions (Ch. VIA)</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1', marginTop: '0.25rem', display: 'block', fontFamily: 'monospace' }}>{fmt(computation.totalDeductionsChapterVIA || 0)}</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Taxable Total Income</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem', display: 'block', fontFamily: 'monospace' }}>{fmt(computation.roundedTotalIncome)}</span>
        </div>
        <div style={{ background: '#f0fdf4', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', display: 'block' }}>Net Tax Payable</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d', marginTop: '0.25rem', display: 'block', fontFamily: 'monospace' }}>{fmt(tax.taxRoundedOff || tax.amountPayable || 0)}</span>
        </div>
      </div>

      {/* Employee & Assessment Info Grid */}
      <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '12px' }}>
        <div>
          <h3 style={{ fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', fontSize: '0.785rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserCheck size={14} />
            <span>Assessee Profile</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Employee Name:</span> <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{p.name || 'N/A'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Father's Name:</span> <span style={{ textTransform: 'uppercase' }}>{p.fathersName || 'N/A'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>PAN Number:</span> <strong style={{ fontFamily: 'monospace', color: '#6366f1', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{p.pan || 'N/A'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Date of Birth:</span> <span>{p.dob || 'N/A'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Residential Address:</span> <span style={{ textAlign: 'right', maxWidth: '200px', fontSize: '11px', textTransform: 'uppercase' }}>{p.residentialAddress || 'N/A'}</span></div>
          </div>
        </div>

        <div>
          <h3 style={{ fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', fontSize: '0.785rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={14} />
            <span>Filing & Employer Details</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Employer Name:</span> <strong style={{ color: '#0f172a' }}>{company.name || s.employerName || 'N/A'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Status / Residential:</span> <span>{p.status || 'Individual'} / {p.residentStatus || 'Resident'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Return Section:</span> <strong>{computation.filingSection || '139(1)'} ({computation.returnType || 'ORIGINAL'})</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Due Date:</span> <span>{computation.filingDueDate || '31/07/2026'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Office Address:</span> <span style={{ textAlign: 'right', maxWidth: '200px', fontSize: '11px', textTransform: 'uppercase' }}>{company.fullAddress || p.officeAddress || 'N/A'}</span></div>
          </div>
        </div>
      </div>

      {/* Heads of Income Breakdown Table */}
      <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', fontSize: '0.785rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
          Summary of Income Heads & Total Assessment
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>Income Classification Head</th>
              <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem' }}>Gross Income</th>
              <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem' }}>Net Set-off Income</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.45rem 0.75rem', fontWeight: 600 }}>1. Income from Salaries (u/s 17)</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace' }}>{fmt(s.totalGross)}</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(s.taxableSalary)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.45rem 0.75rem', fontWeight: 600 }}>2. Income from House Property</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace' }}>{fmt(hp.netIncome || 0)}</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(hp.netIncome || 0)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.45rem 0.75rem', fontWeight: 600 }}>3. Profits and Gains of Business or Profession</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace' }}>{fmt(bp.netProfit || 0)}</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(bp.netProfit || 0)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.45rem 0.75rem', fontWeight: 600 }}>4. Capital Gains (Short & Long Term)</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace' }}>{fmt(cg.netGains || 0)}</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(cg.netGains || 0)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.45rem 0.75rem', fontWeight: 600 }}>5. Income from Other Sources (Interest / Dividend)</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace' }}>{fmt(os.totalOtherSources || 0)}</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(os.totalOtherSources || 0)}</td>
            </tr>
            <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.55rem 0.75rem' }}>Gross Total Income (GTI)</td>
              <td style={{ textAlign: 'right', padding: '0.55rem 0.75rem', fontFamily: 'monospace' }}>-</td>
              <td style={{ textAlign: 'right', padding: '0.55rem 0.75rem', fontFamily: 'monospace' }}>{fmt(computation.grossTotalIncome)}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.45rem 0.75rem', color: '#64748b' }}>Less: Deductions under Chapter VI-A</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace' }}>-</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace', color: '#6366f1' }}>-{fmt(computation.totalDeductionsChapterVIA || 0)}</td>
            </tr>
            <tr style={{ background: '#eef2ff', fontWeight: 800, borderTop: '1px solid #c7d2fe' }}>
              <td style={{ padding: '0.55rem 0.75rem', color: '#1e1b4b' }}>Total Income (Rounded off u/s 288A)</td>
              <td style={{ textAlign: 'right', padding: '0.55rem 0.75rem', fontFamily: 'monospace' }}>-</td>
              <td style={{ textAlign: 'right', padding: '0.55rem 0.75rem', fontFamily: 'monospace', color: '#1e1b4b', fontSize: '13px' }}>{fmt(computation.roundedTotalIncome)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tax Calculation & Tax Credits Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1rem' }}>
          <h3 style={{ fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', fontSize: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.65rem' }}>
            Tax Computation Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Basic Exemption Limit:</span> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(tax.basicExemptionLimit || 400000)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Tax at Normal Rates:</span> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(tax.taxAtNormalRates)}</span></div>
            {Number(tax.rebate87A) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d', fontWeight: 600 }}><span>Rebate u/s 87A:</span> <span style={{ fontFamily: 'monospace' }}>-{fmt(tax.rebate87A)}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Health & Education Cess (4%):</span> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(tax.cess)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Interest u/s 234A/B/C:</span> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(tax.totalInterest || 0)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem', color: '#0f172a' }}>
              <span>Total Tax & Interest Liability:</span>
              <span style={{ fontFamily: 'monospace', color: '#4338ca' }}>{fmt(tax.totalTaxAndInterest)}</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1rem' }}>
          <h3 style={{ fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', fontSize: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.65rem' }}>
            Taxes Paid & Refund/Payable
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>TDS on Salary (u/s 192):</span> <span style={{ fontFamily: 'monospace' }}>{fmt(tax.tdsSalary || 0)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Self Assessment (u/s 140A):</span> <span style={{ fontFamily: 'monospace' }}>{fmt(tax.taxDeposited140A || 0)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Advance Tax Paid:</span> <span style={{ fontFamily: 'monospace' }}>{fmt(tax.advanceTax || 0)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid #f1f5f9', paddingTop: '0.3rem' }}><span style={{ color: '#334155' }}>Total Taxes Deposited:</span> <span style={{ fontFamily: 'monospace' }}>{fmt(tax.totalTaxesPaid || 0)}</span></div>
            
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Net Amount {Number(tax.amountRefundable) > 0 ? 'Refundable' : 'Payable'} :</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', color: '#4ade80' }}>
                {fmt(tax.taxRoundedOff || tax.amountPayable || tax.amountRefundable || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Salary Schedule & Deductions */}
      <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', fontSize: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.65rem' }}>
          Annexure: Detailed Salary Schedule & Deductions
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '0.75rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '0.35rem 0.75rem' }}>Salary Component</th>
              <th style={{ textAlign: 'right', padding: '0.35rem 0.75rem' }}>Gross Total</th>
              <th style={{ textAlign: 'right', padding: '0.35rem 0.75rem' }}>Exempted</th>
              <th style={{ textAlign: 'right', padding: '0.35rem 0.75rem' }}>Taxable Value</th>
            </tr>
          </thead>
          <tbody>
            {salaryBreakdown.length > 0 ? (
              salaryBreakdown.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.35rem 0.75rem' }}>{item.particular}</td>
                  <td style={{ textAlign: 'right', padding: '0.35rem 0.75rem', fontFamily: 'monospace' }}>{fmt(item.totalAmount)}</td>
                  <td style={{ textAlign: 'right', padding: '0.35rem 0.75rem', fontFamily: 'monospace' }}>{fmt(item.exemptedAmount || 0)}</td>
                  <td style={{ textAlign: 'right', padding: '0.35rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(item.taxableAmount || item.totalAmount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={{ padding: '0.35rem 0.75rem' }}>Basic Salary</td>
                <td style={{ textAlign: 'right', padding: '0.35rem 0.75rem', fontFamily: 'monospace' }}>{fmt(s.basicSalary || s.totalGross)}</td>
                <td style={{ textAlign: 'right', padding: '0.35rem 0.75rem', fontFamily: 'monospace' }}>₹0</td>
                <td style={{ textAlign: 'right', padding: '0.35rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(s.basicSalary || s.totalGross)}</td>
              </tr>
            )}
            <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.45rem 0.75rem' }}>Gross Salary Total</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace' }}>{fmt(s.totalGross)}</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace' }}>{fmt(s.exemptedAllowances || 0)}</td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace' }}>{fmt(s.totalGross - (s.exemptedAllowances || 0))}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.35rem 0.75rem', color: '#64748b', paddingLeft: '1.5rem' }}>Standard Deduction u/s 16(ia)</td>
              <td colSpan={2}></td>
              <td style={{ textAlign: 'right', padding: '0.35rem 0.75rem', fontFamily: 'monospace', color: '#e11d48' }}>-{fmt(s.standardDeduction || 75000)}</td>
            </tr>
            {Number(s.professionalTax) > 0 && (
              <tr>
                <td style={{ padding: '0.35rem 0.75rem', color: '#64748b', paddingLeft: '1.5rem' }}>Professional Tax u/s 16(iii)</td>
                <td colSpan={2}></td>
                <td style={{ textAlign: 'right', padding: '0.35rem 0.75rem', fontFamily: 'monospace', color: '#e11d48' }}>-{fmt(s.professionalTax)}</td>
              </tr>
            )}
            <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
              <td style={{ padding: '0.45rem 0.75rem', color: '#0f172a' }}>Net Taxable Salary Head</td>
              <td colSpan={2}></td>
              <td style={{ textAlign: 'right', padding: '0.45rem 0.75rem', fontFamily: 'monospace', color: '#0f172a' }}>{fmt(s.taxableSalary)}</td>
            </tr>
          </tbody>
        </table>

        {/* Challans */}
        {challans.length > 0 && (
          <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.7rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
              Challan Deposit Records (u/s 140A / Advance Tax)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {challans.map((ch, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <div><strong style={{ textTransform: 'uppercase' }}>{ch.bankBranch}</strong> | BSR: <span style={{ fontFamily: 'monospace' }}>{ch.bsrCode}</span> | Date: {ch.date}</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>{fmt(ch.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Signature & Verification Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          <div>System Generated Income Tax Computation Report</div>
          <div>Verified as per Books of Account and Form 16 / AIS records.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '1.75rem' }}>Assessee Signature:</div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.785rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderTop: '1px solid #94a3b8', paddingTop: '0.25rem' }}>
            {computation.verifiedBy || p.name || 'Authorised Signatory'}
          </div>
        </div>
      </div>
    </div>
  );
};
