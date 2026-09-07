import React from 'react';

/**
 * ZenIT - A KDK Software Product (Official Income Tax Computation Sheet)
 * Exact pixel-perfect reproduction of the official Indian CA / Tax Consultant Assessment Sheet.
 */
export const KdkZenitTemplate = ({ computation = {}, company = {} }) => {
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
    if (val === undefined || val === null || val === '') return '0';
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-IN');
  };

  const isOldRegime = computation.regime === 'old';
  const regimeHeading = isOldRegime
    ? 'Computation of Total Income (Old Regime Tax)'
    : 'Computation of Total Income (as per 115BAC)';

  const basicExemption = tax.basicExemptionLimit || (isOldRegime ? 250000 : 400000);

  return (
    <div
      className="kdk-zenit-paper"
      style={{
        background: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '12px',
        lineHeight: 1.35,
        padding: '2.5rem 3rem',
        maxWidth: '850px',
        margin: '0 auto',
        minHeight: '1100px',
        boxSizing: 'border-box',
        boxShadow: '0 10px 35px rgba(0,0,0,0.18)',
        borderRadius: '2px',
        position: 'relative',
      }}
    >
      {/* ========================================================================= */}
      {/* PAGE 1: Personal KYC & Main Computation of Total Income */}
      {/* ========================================================================= */}

      {/* Assessee Personal & Filing Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', columnGap: '2rem', marginBottom: '1.25rem', fontSize: '12px' }}>
        {/* Left Column: Name, Father's Name, Addresses */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', padding: '1px 0' }}>
            <span>Name :</span>
            <strong style={{ textTransform: 'uppercase' }}>{p.name ? (p.name.startsWith('Mr.') || p.name.startsWith('Ms.') || p.name.startsWith('Mrs.') ? p.name : `Mr. ${p.name}`) : 'Mr. HARWINDER SINGH'}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', padding: '1px 0' }}>
            <span>Father's Name :</span>
            <span style={{ textTransform: 'uppercase' }}>{p.fathersName ? (p.fathersName.startsWith('Mr.') ? p.fathersName : `Mr. ${p.fathersName}`) : 'Mr. JASWINDER SINGH'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', padding: '1px 0', alignItems: 'start' }}>
            <span>Address(O) :</span>
            <span style={{ textTransform: 'uppercase', fontSize: '11px', lineHeight: 1.25 }}>
              {p.officeAddress || company.fullAddress || 'HCL TECHNOLOGIES LIMITED, BLOCK B, C, D 2ND FLOOR, TOWER D, DLF IT PARK, PLOT NO 2, CHANDIGARH-160101'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', padding: '3px 0 1px', alignItems: 'start' }}>
            <span>Address(R) :</span>
            <span style={{ textTransform: 'uppercase', fontSize: '11px', lineHeight: 1.25 }}>
              {p.residentialAddress || 'VILLAGE BASANTPURA, BARARA S.O., BARARA (203), HARYANA-133201'}
            </span>
          </div>
        </div>

        {/* Right Column: PAN, DOB, Gender, Status, FY/AY, Return */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '1px 0' }}>
            <span>Permanent Account No :</span>
            <strong style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>{p.pan || 'NQBPS8394P'}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '1px 0' }}>
            <span>Date of Birth :</span>
            <span>{p.dob || '22/10/1998'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '1px 0' }}>
            <span>Gender :</span>
            <span>{p.gender || 'Male'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '1px 0' }}>
            <span>Status :</span>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{p.status || 'Individual'}</span>
              <span>Resident Status :</span>
              <span>{p.residentStatus || 'Resident'}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '1px 0' }}>
            <span>Previous year :</span>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{computation.financialYear || '2025-2026'}</span>
              <span>Assessment Year :</span>
              <span>{computation.assessmentYear || '2026-2027'}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '1px 0' }}>
            <span>Return :</span>
            <strong>{computation.returnType || 'ORIGINAL'}</strong>
          </div>
        </div>
      </div>

      {/* Section Double Header: Computation of Total Income */}
      <div
        style={{
          borderTop: '2px solid #000000',
          borderBottom: '2px solid #000000',
          padding: '4px 0',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '13px',
          margin: '1rem 0 0.85rem',
        }}
      >
        {regimeHeading}
      </div>

      {/* 5 Heads of Income Table */}
      <div style={{ marginBottom: '1.25rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ fontWeight: 'bold' }}>
              <th style={{ textAlign: 'left', padding: '3px 0', width: '60%', textDecoration: 'underline' }}>
                Income Heads
              </th>
              <th style={{ textAlign: 'right', padding: '3px 0', width: '20%' }}>
                Income<br />Before Set off
              </th>
              <th style={{ textAlign: 'right', padding: '3px 0', width: '20%' }}>
                Income After<br />Set off
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '2px 0', fontWeight: 'bold' }}>Income from Salary</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(s.taxableSalary)}</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(s.taxableSalary)}</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0', fontWeight: 'bold' }}>Income from House Property</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(hp.netIncome || 0)}</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(hp.netIncome || 0)}</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0', fontWeight: 'bold' }}>Income From Business or Profession</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(bp.netProfit || 0)}</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(bp.netProfit || 0)}</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0', fontWeight: 'bold' }}>Income from Capital Gains</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(cg.netGains || 0)}</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(cg.netGains || 0)}</td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0', fontWeight: 'bold' }}>Income from Other Sources</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(os.totalOtherSources || 0)}</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(os.totalOtherSources || 0)}</td>
            </tr>

            {/* Subtotals & Aggregations */}
            <tr>
              <td style={{ padding: '6px 0 2px 2.5rem', fontWeight: 'bold' }}>Gross Total Income</td>
              <td></td>
              <td style={{ textAlign: 'right', padding: '6px 0 2px', borderTop: '1px solid #000000', borderBottom: '1px solid #000000', fontWeight: 'bold' }}>
                {fmt(computation.grossTotalIncome)}
              </td>
            </tr>

            <tr>
              <td style={{ padding: '3px 0 2px 2.5rem' }}>Less : Deduction under Chapter VIA</td>
              <td></td>
              <td style={{ textAlign: 'right', padding: '3px 0 2px' }}>
                {fmt(computation.totalDeductionsChapterVIA || 0)}
              </td>
            </tr>

            <tr>
              <td style={{ padding: '3px 0 2px 2.5rem', fontWeight: 'bold' }}>Total Income</td>
              <td></td>
              <td style={{ textAlign: 'right', padding: '3px 0 2px', borderTop: '1px solid #000000', borderBottom: '1px solid #000000', fontWeight: 'bold' }}>
                {fmt(computation.totalIncome)}
              </td>
            </tr>

            <tr>
              <td style={{ padding: '3px 0 2px 2.5rem', fontWeight: 'bold' }}>Rounding off u/s 288A</td>
              <td></td>
              <td style={{ textAlign: 'right', padding: '3px 0 2px', fontWeight: 'bold' }}>
                {fmt(computation.roundedTotalIncome)}
              </td>
            </tr>

            <tr style={{ fontSize: '11.5px' }}>
              <td style={{ padding: '2px 0 2px 2.5rem' }}>Income Taxable at Normal Rate</td>
              <td></td>
              <td style={{ textAlign: 'right', padding: '2px 0 2px' }}>
                {fmt(computation.taxableNormalRate || computation.roundedTotalIncome)}
              </td>
            </tr>
            <tr style={{ fontSize: '11.5px' }}>
              <td style={{ padding: '1px 0 2px 2.5rem' }}>Income Taxable at Special Rate</td>
              <td></td>
              <td style={{ textAlign: 'right', padding: '1px 0 2px' }}>
                {fmt(computation.taxableSpecialRate || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section Double Header: TAX CALCULATION */}
      <div
        style={{
          borderTop: '2px solid #000000',
          borderBottom: '2px solid #000000',
          padding: '3px 0',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '12.5px',
          margin: '0.75rem 0',
        }}
      >
        TAX CALCULATION
      </div>

      {/* Tax Calculation Body */}
      <div style={{ marginBottom: '1.25rem', fontSize: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '1.5px 0' }}>
          <span>Basic Exemption Limit Rs.</span>
          <span style={{ textAlign: 'right' }}>{fmt(basicExemption)}</span>
          <span></span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '1.5px 0' }}>
          <span>Tax at Normal Rates</span>
          <span style={{ textAlign: 'right' }}>{fmt(tax.taxAtNormalRates)}</span>
          <span></span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '2px 0', fontWeight: 'bold' }}>
          <span>Total Tax</span>
          <span></span>
          <span style={{ textAlign: 'right' }}>{fmt(tax.totalTax)}</span>
        </div>

        {Number(tax.rebate87A) > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '1.5px 0' }}>
            <span>Less : Tax Rebate u/s 87A</span>
            <span style={{ textAlign: 'right' }}>{fmt(tax.rebate87A)}</span>
            <span></span>
          </div>
        )}

        {Number(tax.cess) > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '1.5px 0' }}>
            <span>Add : Health and Education Cess</span>
            <span></span>
            <span style={{ textAlign: 'right' }}>{fmt(tax.cess)}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '2px 0', fontWeight: 'bold' }}>
          <span>Total</span>
          <span></span>
          <span style={{ textAlign: 'right', borderTop: '1px solid #000000', borderBottom: '1px solid #000000' }}>
            {fmt(tax.totalTaxWithCess || tax.totalTax)}
          </span>
        </div>

        {/* Interest Section u/s 234 */}
        <div style={{ padding: '2px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', fontWeight: 'bold' }}>
            <span>Add : Interest</span>
            <span></span>
            <span style={{ textAlign: 'right' }}>{fmt(tax.totalInterest || 0)}</span>
          </div>

          {(Number(tax.interest234B) > 0 || tax.interest234BDetails) && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '1px 0 0 1.25rem' }}>
                <span>u/s 234B</span>
                <span style={{ textAlign: 'right' }}>{fmt(tax.interest234B || 0)}</span>
                <span></span>
              </div>
              {tax.interest234BDetails && (
                <div style={{ paddingLeft: '1.25rem', fontSize: '11px' }}>
                  {tax.interest234BDetails}
                </div>
              )}
            </div>
          )}

          {(Number(tax.interest234C) > 0 || tax.interest234CDetails) && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '1px 0 0 1.25rem' }}>
                <span>u/s 234C</span>
                <span style={{ textAlign: 'right' }}>{fmt(tax.interest234C || 0)}</span>
                <span></span>
              </div>
              {tax.interest234CDetails && (
                <div style={{ paddingLeft: '1.25rem', fontSize: '11px' }}>
                  ( {tax.interest234CDetails} )
                </div>
              )}
            </div>
          )}

          {Number(tax.interest234A) > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '1px 0 0 1.25rem' }}>
              <span>u/s 234A</span>
              <span style={{ textAlign: 'right' }}>{fmt(tax.interest234A)}</span>
              <span></span>
            </div>
          )}
        </div>

        {/* Taxes Deposited & Deducted */}
        <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '2px 0' }}>
          <span>Less : Tax Deposited u/s 140A</span>
          <span></span>
          <span style={{ textAlign: 'right' }}>{fmt(tax.taxDeposited140A || challans.reduce((s, c) => s + (Number(c.amount) || 0), 0) || tax.totalTaxesPaid || 0)}</span>
        </div>

        {Number(tax.tdsSalary) > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '2px 0' }}>
            <span>Less : TDS on Salary</span>
            <span></span>
            <span style={{ textAlign: 'right' }}>{fmt(tax.tdsSalary)}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '3px 0', fontWeight: 'bold' }}>
          <span>Amount Payable</span>
          <span></span>
          <span style={{ textAlign: 'right', borderTop: '1px solid #000000', borderBottom: '1px solid #000000' }}>
            {fmt(tax.amountPayable || 0)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '60% 20% 20%', padding: '2px 0', fontWeight: 'bold' }}>
          <span>Tax Rounded Off u/s 288 B</span>
          <span></span>
          <span style={{ textAlign: 'right' }}>{fmt(tax.taxRoundedOff || tax.amountPayable || 0)}</span>
        </div>
      </div>

      {/* Section Double Header: COMPREHENSIVE DETAIL */}
      <div
        style={{
          borderTop: '2px solid #000000',
          borderBottom: '2px solid #000000',
          padding: '3px 0',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '12.5px',
          margin: '1rem 0 0.75rem',
        }}
      >
        COMPREHENSIVE DETAIL
      </div>

      {/* Comprehensive Detail Breakdown */}
      <div style={{ marginBottom: '1.25rem', fontSize: '12px' }}>
        {/* Income from Salary Schedule */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.25rem' }}>
            <span style={{ textDecoration: 'underline' }}>Income from salary</span>
            <span>{fmt(s.taxableSalary)}</span>
          </div>

          <div style={{ fontSize: '11.5px', marginBottom: '0.4rem' }}>
            <div>Name of employer : {s.employerName || company.name || 'HCL TECHNOLOGIES LIMITED'}</div>
            <div style={{ fontWeight: 'bold' }}>Employment Period(In Month) : {s.employmentMonths || 12}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ fontWeight: 'bold' }}>
                <th style={{ textAlign: 'left', padding: '2px 0', width: '45%' }}>Particular</th>
                <th style={{ textAlign: 'right', padding: '2px 0', width: '18%' }}>Total<br />Amount</th>
                <th style={{ textAlign: 'right', padding: '2px 0', width: '18%' }}>Exempted<br />Amount</th>
                <th style={{ textAlign: 'right', padding: '2px 0', width: '19%' }}>Taxable<br />Amount</th>
              </tr>
            </thead>
            <tbody>
              {salaryBreakdown.length > 0 ? (
                salaryBreakdown.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '2px 0' }}>{item.particular}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(item.totalAmount)}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(item.exemptedAmount || 0)}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(item.taxableAmount || item.totalAmount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ padding: '2px 0' }}>Basic Salary</td>
                  <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(s.totalGross || s.basicSalary)}</td>
                  <td style={{ textAlign: 'right', padding: '2px 0' }}>0</td>
                  <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(s.totalGross || s.basicSalary)}</td>
                </tr>
              )}

              <tr>
                <td style={{ padding: '2px 0', fontWeight: 'bold' }}>Allowance :</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              <tr style={{ fontWeight: 'bold' }}>
                <td style={{ padding: '2px 0' }}>Total</td>
                <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(s.totalGross || s.basicSalary)}</td>
                <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(s.exemptedAllowances || 0)}</td>
                <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(s.totalGross || s.basicSalary)}</td>
              </tr>

              {Number(s.standardDeduction) > 0 && (
                <tr>
                  <td style={{ padding: '2px 0' }}>Standard Deduction</td>
                  <td></td>
                  <td></td>
                  <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(s.standardDeduction)}</td>
                </tr>
              )}

              <tr style={{ fontWeight: 'bold' }}>
                <td style={{ padding: '2px 0' }}>Total Taxable Salary</td>
                <td></td>
                <td></td>
                <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(s.taxableSalary)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Income from Other Sources Schedule */}
        <div style={{ marginTop: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.35rem' }}>
            <span style={{ textDecoration: 'underline' }}>Income From Other Sources</span>
            <span>{fmt(os.totalOtherSources)}</span>
          </div>

          <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {osBreakdown.length > 0 ? (
              osBreakdown.map((item, idx) => (
                <div key={idx}>
                  <div style={{ textDecoration: 'underline' }}>{item.label}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '0.5rem' }}>
                    <span></span>
                    <span style={{ width: '20%', textAlign: 'right' }}>{fmt(item.amount)}</span>
                    <span style={{ width: '20%', textAlign: 'right' }}>{fmt(item.amount)}</span>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div>
                  <div style={{ textDecoration: 'underline' }}>Interest on Bank Savings</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span></span>
                    <span style={{ width: '20%', textAlign: 'right' }}>{fmt(os.interestSavings || 22554)}</span>
                    <span style={{ width: '20%', textAlign: 'right' }}>{fmt(os.interestSavings || 22554)}</span>
                  </div>
                </div>

                <div>
                  <div style={{ textDecoration: 'underline' }}>Interest on Bank FDR</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span></span>
                    <span style={{ width: '20%', textAlign: 'right' }}>{fmt(os.interestFdr || 47643)}</span>
                    <span style={{ width: '20%', textAlign: 'right' }}>{fmt(os.interestFdr || 47643)}</span>
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '0.25rem' }}>
              <span>Total Income</span>
              <span style={{ width: '20%', textAlign: 'right' }}>{fmt(os.totalOtherSources)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Total of Other Sources</span>
              <span style={{ width: '20%', textAlign: 'right' }}>{fmt(os.totalOtherSources)}</span>
            </div>
          </div>
        </div>

        {/* Deductions Under Chapter VIA (if present or Old Regime) */}
        {(deductions.length > 0 || isOldRegime) && (
          <div style={{ marginTop: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.35rem' }}>
              <span style={{ textDecoration: 'underline' }}>Deductions Under Chapter VIA</span>
              <span>{fmt(computation.totalDeductionsChapterVIA || 0)}</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <thead>
                <tr style={{ fontWeight: 'bold' }}>
                  <th style={{ textAlign: 'left', padding: '2px 0', width: '60%' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '2px 0', width: '20%' }}>Gross<br />Amount</th>
                  <th style={{ textAlign: 'right', padding: '2px 0', width: '20%' }}>Deductable<br />Amount</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((d, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '2px 0' }}>u/s {d.section} ({d.description})</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(d.grossAmount || d.deductibleAmount)}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{fmt(d.deductibleAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Details : Tax Deposited u/s 140A */}
        <div style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '0.35rem' }}>
            Details : Tax Deposited u/s 140A
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', border: '1px solid #000000' }}>
            <thead>
              <tr style={{ fontWeight: 'bold', borderBottom: '1px solid #000000' }}>
                <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #000000' }}>Bank and Branch</th>
                <th style={{ textAlign: 'center', padding: '3px 6px', borderRight: '1px solid #000000' }}>BSR Code</th>
                <th style={{ textAlign: 'center', padding: '3px 6px', borderRight: '1px solid #000000' }}>Dated</th>
                <th style={{ textAlign: 'center', padding: '3px 6px', borderRight: '1px solid #000000' }}>ChallanNo.</th>
                <th style={{ textAlign: 'right', padding: '3px 6px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {challans.length > 0 ? (
                challans.map((ch, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #000000' }}>
                    <td style={{ padding: '3px 6px', borderRight: '1px solid #000000', textTransform: 'uppercase' }}>{ch.bankBranch || 'BANK OF INDIA-SECTOR 47C, CHANDIGARH'}</td>
                    <td style={{ textAlign: 'center', padding: '3px 6px', borderRight: '1px solid #000000', fontFamily: 'monospace' }}>{ch.bsrCode || '0006210'}</td>
                    <td style={{ textAlign: 'center', padding: '3px 6px', borderRight: '1px solid #000000' }}>{ch.date || '27/07/2026'}</td>
                    <td style={{ textAlign: 'center', padding: '3px 6px', borderRight: '1px solid #000000', fontFamily: 'monospace' }}>{ch.challanNo || '00652'}</td>
                    <td style={{ textAlign: 'right', padding: '3px 6px' }}>{fmt(ch.amount || 161656)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ padding: '3px 6px', borderRight: '1px solid #000000', textTransform: 'uppercase' }}>BANK OF INDIA-SECTOR 47C, CHANDIGARH</td>
                  <td style={{ textAlign: 'center', padding: '3px 6px', borderRight: '1px solid #000000', fontFamily: 'monospace' }}>0006210</td>
                  <td style={{ textAlign: 'center', padding: '3px 6px', borderRight: '1px solid #000000' }}>27/07/2026</td>
                  <td style={{ textAlign: 'center', padding: '3px 6px', borderRight: '1px solid #000000', fontFamily: 'monospace' }}>00652</td>
                  <td style={{ textAlign: 'right', padding: '3px 6px' }}>{fmt(tax.taxDeposited140A || 161656)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Filing Dates & Sign-Off Verification */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', fontSize: '11.5px' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', padding: '1px 0' }}>
              <span style={{ fontWeight: 'bold' }}>Return Filing Due Date :</span>
              <span style={{ fontWeight: 'bold' }}>{computation.filingDueDate || '31/07/2026'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', padding: '1px 0' }}>
              <span>Interest Calculated Upto :</span>
              <span>{computation.interestCalculatedUpto || '27/07/2026'}</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', gap: '0.5rem', padding: '1px 0' }}>
              <span style={{ fontWeight: 'bold' }}>Return Filing Section :</span>
              <span style={{ fontWeight: 'bold' }}>{computation.filingSection || '139(1)'}</span>
            </div>
          </div>
        </div>

        {/* Verification Name */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem', marginBottom: '2.5rem', fontSize: '12px' }}>
          <strong style={{ textTransform: 'uppercase' }}>
            Verified By : {p.name ? (p.name.startsWith('Mr.') ? p.name.replace('Mr. ', '') : p.name) : (computation.verifiedBy || 'HARWINDER SINGH')}
          </strong>
        </div>
      </div>

      {/* Official Bottom Right Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          right: '2.5rem',
          fontSize: '10.5px',
          color: '#000000',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        ZenIT - A KDK Software Product
      </div>
    </div>
  );
};
