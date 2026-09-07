import React from 'react';
import { ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export const Form16PartBTemplate = ({ computation = {}, company = {} }) => {
  const p = computation.personalDetails || {};
  const s = computation.headsOfIncome?.salary || {};
  const tax = computation.taxCalculation || {};
  const deductions = computation.deductionsChapterVIA || [];

  return (
    <div className="form16-print-container" id="form16-certificate-view">
      {/* Official Form 16 Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', margin: 0 }}>
          FORM NO. 16 - PART B
        </h2>
        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginTop: '4px' }}>
          [See rule 31(1)(a)]
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
          Certificate under Section 203 of the Income-tax Act, 1961 for Tax Deducted at Source on Salary
        </div>
      </div>

      {/* Header Assessee and Deductor Info Table */}
      <table className="form16-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '0.8rem' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', padding: '8px', border: '1px solid #cbd5e1', verticalAlign: 'top' }}>
              <strong>Name and Address of the Employer:</strong>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{company.name || s.employerName || 'Nexus Tech Global Ltd.'}</div>
              <div style={{ color: '#64748b' }}>{company.fullAddress || 'Corporate Office, Bengaluru'}</div>
              <div style={{ marginTop: '4px' }}><strong>PAN:</strong> {company.pan || 'N/A'} | <strong>GSTIN:</strong> {company.gstin || 'N/A'}</div>
            </td>
            <td style={{ width: '50%', padding: '8px', border: '1px solid #cbd5e1', verticalAlign: 'top' }}>
              <strong>Name and Address of the Employee:</strong>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{p.name || 'Assessee Employee'}</div>
              <div style={{ color: '#64748b' }}>{p.residentialAddress || 'Resident Individual'}</div>
              <div style={{ marginTop: '4px' }}><strong>PAN:</strong> {p.pan || 'N/A'}</div>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>
              <strong>Assessment Year:</strong> {computation.assessmentYear || '2026-2027'}
            </td>
            <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>
              <strong>Financial Year:</strong> {computation.financialYear || '2025-2026'} | <strong>Tax Regime:</strong> {computation.regime === 'new_115bac' ? 'Section 115BAC (New)' : 'Old Regime'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Main Form 16 Part B Schedule */}
      <table className="form16-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', color: '#0f172a' }}>
            <th style={{ padding: '8px', border: '1px solid #94a3b8', width: '8%', textAlign: 'center' }}>Item</th>
            <th style={{ padding: '8px', border: '1px solid #94a3b8', width: '62%' }}>Particulars</th>
            <th style={{ padding: '8px', border: '1px solid #94a3b8', width: '15%', textAlign: 'right' }}>Amount (₹)</th>
            <th style={{ padding: '8px', border: '1px solid #94a3b8', width: '15%', textAlign: 'right' }}>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {/* 1. Gross Salary */}
          <tr>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>1</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Gross Salary:</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}></td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>
              ₹{Number(s.totalGross || 0).toLocaleString('en-IN')}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', color: '#334155' }}>
              (a) Salary as per provisions contained in sec 17(1)
            </td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
              ₹{Number(s.basicSalary || s.totalGross || 0).toLocaleString('en-IN')}
            </td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
          </tr>
          <tr>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', color: '#334155' }}>
              (b) Value of perquisites u/s 17(2)
            </td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>₹0</td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
          </tr>

          {/* 2. Less Exemptions u/s 10 */}
          <tr>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>2</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Less: Allowances to the extent exempt under Section 10</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}></td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#475569' }}>
              ₹{Number(s.exemptedAllowances || 0).toLocaleString('en-IN')}
            </td>
          </tr>

          {/* 3. Balance */}
          <tr style={{ background: '#f8fafc' }}>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>3</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Balance (1 - 2)</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}></td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>
              ₹{Math.max(0, (Number(s.totalGross) || 0) - (Number(s.exemptedAllowances) || 0)).toLocaleString('en-IN')}
            </td>
          </tr>

          {/* 4. Deductions under Section 16 */}
          <tr>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>4</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Deductions under Section 16:</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>
              ₹{(Number(s.standardDeduction || 75000) + Number(s.professionalTax || 0)).toLocaleString('en-IN')}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', color: '#334155' }}>(a) Standard Deduction u/s 16(ia)</td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
              ₹{Number(s.standardDeduction || 75000).toLocaleString('en-IN')}
            </td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
          </tr>
          <tr>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', color: '#334155' }}>(b) Tax on Employment (Professional Tax) u/s 16(iii)</td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
              ₹{Number(s.professionalTax || 0).toLocaleString('en-IN')}
            </td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
          </tr>

          {/* 5. Income Chargeable under 'Salaries' */}
          <tr style={{ background: '#f8fafc' }}>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>5</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Income chargeable under the head 'Salaries' (3 - 4)</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>
              ₹{Number(s.taxableSalary || 0).toLocaleString('en-IN')}
            </td>
          </tr>

          {/* 6. Gross Total Income */}
          <tr style={{ background: '#e2e8f0' }}>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>6</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Gross Total Income</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800 }}>
              ₹{Number(computation.grossTotalIncome || 0).toLocaleString('en-IN')}
            </td>
          </tr>

          {/* 7. Chapter VI-A Deductions */}
          <tr>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>7</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Deductions under Chapter VI-A:</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>
              ₹{Number(computation.totalDeductionsChapterVIA || 0).toLocaleString('en-IN')}
            </td>
          </tr>
          {deductions.map((d, i) => (
            <tr key={i}>
              <td style={{ padding: '3px 6px', border: '1px solid #cbd5e1' }}></td>
              <td style={{ padding: '3px 6px', border: '1px solid #cbd5e1', color: '#334155' }}>
                Section {d.section} ({d.description})
              </td>
              <td style={{ padding: '3px 6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                ₹{Number(d.deductibleAmount || d.grossAmount || 0).toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '3px 6px', border: '1px solid #cbd5e1' }}></td>
            </tr>
          ))}

          {/* 8. Total Taxable Income */}
          <tr style={{ background: '#f1f5f9' }}>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>8</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Total Taxable Income (Rounded off u/s 288A)</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
              ₹{Number(computation.roundedTotalIncome || computation.totalIncome || 0).toLocaleString('en-IN')}
            </td>
          </tr>

          {/* 9. Tax Calculation */}
          <tr>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>9</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Tax on Total Income</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
              ₹{Number(tax.totalTax || 0).toLocaleString('en-IN')}
            </td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}></td>
          </tr>
          <tr>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', color: '#334155' }}>Rebate under Section 87A</td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
              -₹{Number(tax.rebate87A || 0).toLocaleString('en-IN')}
            </td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
          </tr>
          <tr>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', color: '#334155' }}>Health & Education Cess (4%)</td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
              +₹{Number(tax.cess || 0).toLocaleString('en-IN')}
            </td>
            <td style={{ padding: '4px 6px', border: '1px solid #cbd5e1' }}></td>
          </tr>
          <tr style={{ background: '#f8fafc' }}>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>10</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Total Tax with Cess</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>
              ₹{Number(tax.totalTaxWithCess || 0).toLocaleString('en-IN')}
            </td>
          </tr>

          {/* 11. TDS Deducted & Tax Payable */}
          <tr>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}>11</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Tax Deducted at Source (TDS u/s 192)</td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}></td>
            <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#0369a1' }}>
              ₹{Number(tax.tdsSalary || 0).toLocaleString('en-IN')}
            </td>
          </tr>
          <tr style={{ background: '#0f172a', color: '#fff' }}>
            <td style={{ padding: '8px', border: '1px solid #0f172a', textAlign: 'center', fontWeight: 800 }}>12</td>
            <td style={{ padding: '8px', border: '1px solid #0f172a', fontWeight: 800 }}>
              {Number(tax.amountPayable) > 0 ? 'Tax Payable / (Refundable)' : 'Net Tax Refundable'}
            </td>
            <td style={{ padding: '8px', border: '1px solid #0f172a' }}></td>
            <td style={{ padding: '8px', border: '1px solid #0f172a', textAlign: 'right', fontWeight: 800, fontSize: '0.95rem' }}>
              ₹{Number(tax.taxRoundedOff || tax.amountPayable || 0).toLocaleString('en-IN')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Verification Footer & Signatory */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.8rem', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
        <div style={{ maxWidth: '60%' }}>
          <p style={{ margin: 0, color: '#64748b' }}>
            I, <strong>{company.signatoryName || 'Authorized Signatory'}</strong>, working in the capacity of <strong>{company.signatoryDesignation || 'Finance Officer'}</strong> do hereby certify that a sum of ₹{Number(tax.tdsSalary || 0).toLocaleString('en-IN')} has been deducted and deposited to the credit of the Central Government.
          </p>
          <div style={{ marginTop: '6px', color: '#94a3b8' }}>
            Date: {new Date().toLocaleDateString('en-GB')} | Place: {company.city || 'Headquarters'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ minHeight: '40px' }}></div>
          <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 700, color: '#0f172a' }}>
            Signature of person responsible for deducting tax
          </div>
        </div>
      </div>
    </div>
  );
};
