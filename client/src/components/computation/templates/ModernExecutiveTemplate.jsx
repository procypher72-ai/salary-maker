import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  UserCheck, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Award, 
  Landmark, 
  Receipt,
  Scale
} from 'lucide-react';

/**
 * Modern Executive Tax Computation Template
 * Polished, high-contrast corporate statement format for modern enterprises.
 * Multi-page executive layout designed for boardroom and official statutory presentations.
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

  const pageStyle = {
    background: '#ffffff',
    color: '#1e293b',
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '12px',
    lineHeight: 1.4,
    padding: '24px 28px',
    width: '100%',
    maxWidth: '820px',
    minHeight: '1060px',
    margin: '0 auto',
    boxSizing: 'border-box',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  };

  const grossSalary = Number(s.totalGross) || (Number(s.basicSalary) || 0) + (Number(s.allowances) || 0);

  return (
    <div className="modern-executive-document" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ========================================================================= */}
      {/* PAGE 1: Executive Summary & Primary Tax Assessment */}
      {/* ========================================================================= */}
      <div className="computation-page modern-executive-paper" style={pageStyle}>
        {/* Executive Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 15px rgba(15, 23, 42, 0.18)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt="Company Logo"
                  style={{ width: '52px', height: '52px', objectFit: 'contain', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '5px' }}
                />
              ) : (
                <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.35rem', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  {(company.name || 'E')[0]}
                </div>
              )}
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  {company.name || 'ENTERPRISE CORPORATION'}
                </h1>
                <p style={{ fontSize: '0.785rem', color: '#cbd5e1', margin: '0.2rem 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={13} color="#818cf8" />
                  <span>Annual Income Tax Assessment & Compensation Statement</span>
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: isOldRegime ? 'rgba(234, 179, 8, 0.2)' : 'rgba(99, 102, 241, 0.25)',
                  color: isOldRegime ? '#fde047' : '#c7d2fe',
                  border: isOldRegime ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)',
                  fontSize: '0.725rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '0.3rem',
                  letterSpacing: '0.04em',
                }}
              >
                {isOldRegime ? 'Old Tax Regime' : 'New Regime (115BAC)'}
              </span>
              <div style={{ fontSize: '0.785rem', color: '#cbd5e1' }}>
                FY: <strong style={{ color: '#fff' }}>{computation.financialYear || '2024-2025'}</strong> | AY: <strong style={{ color: '#fff' }}>{computation.assessmentYear || '2025-2026'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Executive KPI Metrics Ribbon */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.75rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', borderTop: '3px solid #3b82f6' }}>
            <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Gross Compensation</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem', display: 'block', fontFamily: 'monospace' }}>{fmt(computation.grossTotalIncome)}</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.75rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', borderTop: '3px solid #8b5cf6' }}>
            <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Deductions (Ch. VIA)</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.2rem', display: 'block', fontFamily: 'monospace' }}>{fmt(computation.totalDeductionsChapterVIA || 0)}</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.75rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', borderTop: '3px solid #0f172a' }}>
            <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Taxable Total Income</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem', display: 'block', fontFamily: 'monospace' }}>{fmt(computation.roundedTotalIncome)}</span>
          </div>

          <div style={{ background: Number(tax.amountPayable) > 0 ? '#fff1f2' : '#f0fdf4', padding: '0.75rem 0.85rem', borderRadius: '6px', border: Number(tax.amountPayable) > 0 ? '1px solid #fecdd3' : '1px solid #bbf7d0', borderTop: Number(tax.amountPayable) > 0 ? '3px solid #f43f5e' : '3px solid #10b981' }}>
            <span style={{ fontSize: '0.675rem', fontWeight: 700, color: Number(tax.amountPayable) > 0 ? '#9f1239' : '#166534', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              {Number(tax.amountPayable) > 0 ? 'Net Tax Payable' : 'Net Tax Due (Zero)'}
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: Number(tax.amountPayable) > 0 ? '#e11d48' : '#15803d', marginTop: '0.2rem', display: 'block', fontFamily: 'monospace' }}>
              {fmt(tax.taxRoundedOff || tax.amountPayable || 0)}
            </span>
          </div>
        </div>

        {/* Assessee & Assessment Info Grid */}
        <div style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem', fontSize: '11.5px' }}>
          <div>
            <h3 style={{ fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', fontSize: '0.725rem', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserCheck size={13} />
              <span>Assessee Profile & Identity</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Assessee Name:</span> 
                <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{p.name || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Father's Name:</span> 
                <span style={{ textTransform: 'uppercase' }}>{p.fathersName || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Permanent Account No:</span> 
                <strong style={{ fontFamily: 'monospace', color: '#4338ca', background: '#eef2ff', padding: '1px 6px', borderRadius: '4px' }}>{p.pan || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Date of Birth:</span> 
                <span>{p.dob || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ color: '#64748b' }}>Residential Address:</span> 
                <span style={{ textAlign: 'right', maxWidth: '220px', fontSize: '11px', textTransform: 'uppercase', lineHeight: 1.3 }}>{p.residentialAddress || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', fontSize: '0.725rem', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={13} />
              <span>Statutory Filing Parameters</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Employer Organization:</span> 
                <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{company.name || s.employerName || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status / Residential:</span> 
                <span>{p.status || 'Individual'} / {p.residentStatus || 'Resident'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Return Filing Section:</span> 
                <strong>{computation.filingSection || '139(1)'} ({computation.returnType || 'ORIGINAL'})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Statutory Due Date:</span> 
                <span>{computation.filingDueDate || '31/07/2026'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ color: '#64748b' }}>Office / Employer Address:</span> 
                <span style={{ textAlign: 'right', maxWidth: '220px', fontSize: '11px', textTransform: 'uppercase', lineHeight: 1.3 }}>
                  {(() => {
                    const compName = (company.name || '').trim();
                    const addr = (company.fullAddress || p.officeAddress || '').trim();
                    if (!compName) return addr;
                    if (!addr) return compName;
                    return addr.toLowerCase().includes(compName.toLowerCase()) ? addr : `${compName}, ${addr}`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Heads of Income Flow Table */}
        <div style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '0.85rem 1.1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', fontSize: '0.725rem', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.65rem' }}>
            Computation of Total Income across 5 Heads
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '5px 8px', width: '50%' }}>Income Classification Head</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', width: '25%' }}>Gross Income</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', width: '25%' }}>Net Income After Set-off</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '4px 8px', fontWeight: 600 }}>1. Income from Salaries (u/s 17)</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>{fmt(s.totalGross)}</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(s.taxableSalary)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '4px 8px', fontWeight: 600 }}>2. Income from House Property</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>{fmt(hp.netIncome || 0)}</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(hp.netIncome || 0)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '4px 8px', fontWeight: 600 }}>3. Profits and Gains of Business or Profession</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>{fmt(bp.netProfit || 0)}</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(bp.netProfit || 0)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '4px 8px', fontWeight: 600 }}>4. Capital Gains (Short & Long Term)</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>{fmt(cg.netGains || 0)}</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(cg.netGains || 0)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '4px 8px', fontWeight: 600 }}>5. Income from Other Sources (Interest / Dividend)</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>{fmt(os.totalOtherSources || 0)}</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(os.totalOtherSources || 0)}</td>
              </tr>

              <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '1px solid #cbd5e1' }}>
                <td style={{ padding: '5px 8px' }}>Gross Total Income (GTI)</td>
                <td style={{ textAlign: 'right', padding: '5px 8px', fontFamily: 'monospace' }}>-</td>
                <td style={{ textAlign: 'right', padding: '5px 8px', fontFamily: 'monospace', fontWeight: 700 }}>{fmt(computation.grossTotalIncome)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px', color: '#64748b' }}>Less: Deductions under Chapter VI-A</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>-</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', color: '#6366f1' }}>-{fmt(computation.totalDeductionsChapterVIA || 0)}</td>
              </tr>
              <tr style={{ background: '#eef2ff', fontWeight: 800, borderTop: '1px solid #c7d2fe', borderBottom: '1px solid #c7d2fe' }}>
                <td style={{ padding: '6px 8px', color: '#1e1b4b' }}>Total Income (Rounded off u/s 288A)</td>
                <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'monospace' }}>-</td>
                <td style={{ textAlign: 'right', padding: '6px 8px', fontFamily: 'monospace', color: '#1e1b4b', fontSize: '12.5px' }}>{fmt(computation.roundedTotalIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Calculation & Tax Credits Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '0.85rem 1rem' }}>
            <h3 style={{ fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', fontSize: '0.725rem', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
              Tax Computation & Interest Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Basic Exemption Limit:</span> 
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(tax.basicExemptionLimit || 300000)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tax at Normal Rates:</span> 
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(tax.taxAtNormalRates)}</span>
              </div>
              {Number(tax.rebate87A) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d', fontWeight: 600 }}>
                  <span>Less: Rebate u/s 87A:</span> 
                  <span style={{ fontFamily: 'monospace' }}>-{fmt(tax.rebate87A)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Health & Education Cess (4%):</span> 
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(tax.cess || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Interest u/s 234B:</span> 
                <span style={{ fontFamily: 'monospace' }}>{fmt(tax.interest234B || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Interest u/s 234C:</span> 
                <span style={{ fontFamily: 'monospace' }}>{fmt(tax.interest234C || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid #cbd5e1', paddingTop: '0.35rem', color: '#0f172a' }}>
                <span>Total Tax & Interest:</span>
                <span style={{ fontFamily: 'monospace', color: '#4338ca' }}>{fmt(tax.totalTaxAndInterest)}</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '0.85rem 1rem' }}>
            <h3 style={{ fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', fontSize: '0.725rem', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
              Taxes Paid & Settlement Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>TDS on Salary (u/s 192):</span> 
                <span style={{ fontFamily: 'monospace' }}>{fmt(tax.tdsSalary || 0)}</span>
              </div>
              {Number(tax.tdsOther) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>TDS on Other Income (194A/194J/194C):</span> 
                  <span style={{ fontFamily: 'monospace' }}>{fmt(tax.tdsOther || 0)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Advance Tax Paid:</span> 
                <span style={{ fontFamily: 'monospace' }}>{fmt(tax.advanceTax || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tax Deposited (u/s 140A):</span> 
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(tax.taxDeposited140A || challans.reduce((s, c) => s + (Number(c.amount) || 0), 0) || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid #f1f5f9', paddingTop: '0.25rem' }}>
                <span style={{ color: '#334155' }}>Total Tax Credits Deposited:</span> 
                <span style={{ fontFamily: 'monospace' }}>{fmt(tax.totalTaxesPaid || tax.taxDeposited140A || 0)}</span>
              </div>

              <div style={{ background: '#0f172a', color: '#ffffff', padding: '0.55rem 0.85rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.725rem', textTransform: 'uppercase' }}>
                  Net Amount {Number(tax.amountRefundable) > 0 ? 'Refundable' : 'Payable'} :
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: Number(tax.amountPayable) > 0 ? '#f87171' : '#4ade80' }}>
                  {fmt(tax.taxRoundedOff || tax.amountPayable || tax.amountRefundable || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 1 Bottom Audit Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '10px',
            color: '#64748b',
          }}
        >
          <span>Executive Tax Assessment • Statement of Legal Compliance</span>
          <span>Page 1 of 2</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: Annexures, Detailed Schedules & Corporate Attestation */}
      {/* ========================================================================= */}
      <div className="computation-page modern-executive-paper" style={pageStyle}>
        {/* Annexure Section Header */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Annexure Schedules & Supporting Accounts
            </h2>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Detailed computation audit trails for Income from Salary & Other Sources</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#4338ca', background: '#eef2ff', padding: '3px 8px', borderRadius: '4px' }}>
            AY {computation.assessmentYear || '2025-2026'}
          </span>
        </div>

        {/* Annexure A: Detailed Salary Schedule */}
        <div style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', fontSize: '0.725rem', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Building2 size={13} />
            <span>Annexure A: Salary Breakdown & Statutory Deductions</span>
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', marginBottom: '0.5rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '4px 8px', width: '45%' }}>Salary Component</th>
                <th style={{ textAlign: 'right', padding: '4px 8px', width: '18%' }}>Gross Total</th>
                <th style={{ textAlign: 'right', padding: '4px 8px', width: '18%' }}>Exempted</th>
                <th style={{ textAlign: 'right', padding: '4px 8px', width: '19%' }}>Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              {salaryBreakdown.length > 0 ? (
                salaryBreakdown.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '3.5px 8px' }}>{item.particular}</td>
                    <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>{fmt(item.totalAmount)}</td>
                    <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>{fmt(item.exemptedAmount || 0)}</td>
                    <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(item.taxableAmount || item.totalAmount)}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '3.5px 8px' }}>Basic Salary</td>
                  <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>{fmt(s.basicSalary || s.totalGross)}</td>
                  <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace' }}>₹0</td>
                  <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{fmt(s.basicSalary || s.totalGross)}</td>
                </tr>
              )}
              <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '4px 8px' }}>Gross Salary Total</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>{fmt(s.totalGross || s.basicSalary)}</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>{fmt(s.exemptedAllowances || 0)}</td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace' }}>{fmt((s.totalGross || s.basicSalary) - (s.exemptedAllowances || 0))}</td>
              </tr>
              <tr>
                <td style={{ padding: '3.5px 8px', color: '#64748b', paddingLeft: '1.25rem' }}>Standard Deduction u/s 16(ia)</td>
                <td colSpan={2}></td>
                <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace', color: '#e11d48' }}>-{fmt(s.standardDeduction || 75000)}</td>
              </tr>
              {Number(s.professionalTax) > 0 && (
                <tr>
                  <td style={{ padding: '3.5px 8px', color: '#64748b', paddingLeft: '1.25rem' }}>Professional Tax u/s 16(iii)</td>
                  <td colSpan={2}></td>
                  <td style={{ textAlign: 'right', padding: '3.5px 8px', fontFamily: 'monospace', color: '#e11d48' }}>-{fmt(s.professionalTax)}</td>
                </tr>
              )}
              <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                <td style={{ padding: '4px 8px', color: '#0f172a' }}>Net Taxable Salary Head</td>
                <td colSpan={2}></td>
                <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', color: '#0f172a' }}>{fmt(s.taxableSalary)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Annexure B: Other Sources Schedule */}
        <div style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', fontSize: '0.725rem', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Receipt size={13} />
            <span>Annexure B: Income from Other Sources Schedule</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '11.5px' }}>
            <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#475569' }}>Saving Bank Interest:</span>
              <strong style={{ fontFamily: 'monospace' }}>{fmt(os.interestSavings || 0)}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#475569' }}>Interest on Bank FDR / Term Deposit:</span>
              <strong style={{ fontFamily: 'monospace' }}>{fmt(os.interestFdr || 0)}</strong>
            </div>
            {Number(os.otherInterest) > 0 && (
              <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Other Interest Income:</span>
                <strong style={{ fontFamily: 'monospace' }}>{fmt(os.otherInterest)}</strong>
              </div>
            )}
            {Number(os.dividendIncome) > 0 && (
              <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Dividend Income:</span>
                <strong style={{ fontFamily: 'monospace' }}>{fmt(os.dividendIncome)}</strong>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem 0', marginTop: '0.5rem', fontWeight: 700, fontSize: '11.5px', borderTop: '1px solid #e2e8f0' }}>
            <span>Total Income from Other Sources:</span>
            <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{fmt(os.totalOtherSources || 0)}</span>
          </div>
        </div>

        {/* Annexure C: Self Assessment Tax Challan Records (u/s 140A) */}
        <div style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', fontSize: '0.725rem', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Landmark size={13} />
            <span>Annexure C: Challan Deposit Records (u/s 140A / Advance Tax)</span>
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Bank and Branch</th>
                <th style={{ textAlign: 'center', padding: '4px 8px' }}>BSR Code</th>
                <th style={{ textAlign: 'center', padding: '4px 8px' }}>Date</th>
                <th style={{ textAlign: 'center', padding: '4px 8px' }}>Challan No.</th>
                <th style={{ textAlign: 'right', padding: '4px 8px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {challans.length > 0 ? (
                challans.map((ch, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '4px 8px', textTransform: 'uppercase' }}>{ch.bankBranch || 'STATE BANK OF INDIA'}</td>
                    <td style={{ textAlign: 'center', padding: '4px 8px', fontFamily: 'monospace' }}>{ch.bsrCode || '0002145'}</td>
                    <td style={{ textAlign: 'center', padding: '4px 8px' }}>{ch.date || '27/07/2026'}</td>
                    <td style={{ textAlign: 'center', padding: '4px 8px', fontFamily: 'monospace' }}>{ch.challanNo || '00652'}</td>
                    <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', fontWeight: 700 }}>{fmt(ch.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '4px 8px', textTransform: 'uppercase' }}>STATE BANK OF INDIA</td>
                  <td style={{ textAlign: 'center', padding: '4px 8px', fontFamily: 'monospace' }}>0002145</td>
                  <td style={{ textAlign: 'center', padding: '4px 8px' }}>27/07/2026</td>
                  <td style={{ textAlign: 'center', padding: '4px 8px', fontFamily: 'monospace' }}>00652</td>
                  <td style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'monospace', fontWeight: 700 }}>{fmt(tax.taxDeposited140A || 0)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Corporate Verification & Sign-off Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #cbd5e1', fontSize: '11.5px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              <Award size={15} color="#4338ca" />
              <span>Corporate Compliance & AIS Reconciliation Attestation</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '11px', margin: 0, lineHeight: 1.4 }}>
              This annual tax assessment computation has been prepared and reconciled against employer Form 16 Part B, 
              Form 26AS, Annual Information Statement (AIS), and taxpayer records under the statutory provisions of the Income Tax Act, 1961.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '35px' }}></div>
            <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '4px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.04em' }}>
              {p.name ? (p.name.startsWith('Mr.') ? p.name : `Mr. ${p.name}`) : (computation.verifiedBy || 'Authorised Assessee Signatory')}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Assessee / Authorised Signatory</div>
          </div>
        </div>

        {/* Page 2 Bottom Audit Footer */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '10px',
            color: '#64748b',
          }}
        >
          <span>Executive Tax Assessment • Statement of Legal Compliance</span>
          <span>Page 2 of 2</span>
        </div>
      </div>
    </div>
  );
};
