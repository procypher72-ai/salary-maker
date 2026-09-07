/**
 * Comprehensive Indian Income Tax Computation Engine
 * Supports New Tax Regime (Section 115BAC) across FY 2024-25, FY 2025-26 & FY 2026-27
 * and Old Tax Regime with standard exemptions, Section 87A rebate & marginal relief.
 */

// Round to nearest 10 as per Income Tax Act u/s 288B
const roundToTen = (num = 0) => {
  return Math.round((Number(num) || 0) / 10) * 10;
};

/**
 * Compute Tax under New Tax Regime (Section 115BAC)
 * Standard Deduction: ₹75,000 (Salaried)
 * FY 2025-26 / 2026-27 Slabs:
 * 0 - 4L : Nil
 * 4L - 8L : 5%
 * 8L - 12L : 10%
 * 12L - 16L : 15%
 * 16L - 20L : 20%
 * Above 20L : 30%
 * Section 87A Rebate: Full rebate up to ₹12,00,000 taxable income
 * 
 * FY 2024-25 Slabs:
 * 0 - 3L : Nil
 * 3L - 7L : 5%
 * 7L - 10L : 10%
 * 10L - 12L : 15%
 * 12L - 15L : 20%
 * Above 15L : 30%
 * Section 87A Rebate: Full rebate up to ₹7,00,000 taxable income
 */
const computeNewRegimeTax = (annualGross = 0, financialYear = '2025-2026') => {
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, annualGross - standardDeduction);

  let baseTax = 0;
  const isFY2526OrLater = financialYear === '2025-2026' || financialYear === '2026-2027';

  if (isFY2526OrLater) {
    if (taxableIncome <= 400000) {
      baseTax = 0;
    } else if (taxableIncome <= 800000) {
      baseTax = (taxableIncome - 400000) * 0.05;
    } else if (taxableIncome <= 1200000) {
      baseTax = 400000 * 0.05 + (taxableIncome - 800000) * 0.10;
    } else if (taxableIncome <= 1600000) {
      baseTax = 400000 * 0.05 + 400000 * 0.10 + (taxableIncome - 1200000) * 0.15;
    } else if (taxableIncome <= 2000000) {
      baseTax = 400000 * 0.05 + 400000 * 0.10 + 400000 * 0.15 + (taxableIncome - 1600000) * 0.20;
    } else {
      baseTax = 400000 * 0.05 + 400000 * 0.10 + 400000 * 0.15 + 400000 * 0.20 + (taxableIncome - 2000000) * 0.30;
    }
  } else {
    // FY 2024-25
    if (taxableIncome <= 300000) {
      baseTax = 0;
    } else if (taxableIncome <= 700000) {
      baseTax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      baseTax = 400000 * 0.05 + (taxableIncome - 700000) * 0.10;
    } else if (taxableIncome <= 1200000) {
      baseTax = 400000 * 0.05 + 300000 * 0.10 + (taxableIncome - 1000000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      baseTax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + (taxableIncome - 1200000) * 0.20;
    } else {
      baseTax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + 300000 * 0.20 + (taxableIncome - 1500000) * 0.30;
    }
  }

  // Section 87A Rebate & Marginal Relief
  const rebateThreshold = isFY2526OrLater ? 1200000 : 700000;
  let rebate87A = 0;
  if (taxableIncome <= rebateThreshold) {
    rebate87A = baseTax;
    baseTax = 0;
  } else {
    // Marginal relief under Section 87A
    const excessIncome = taxableIncome - rebateThreshold;
    if (baseTax > excessIncome) {
      rebate87A = baseTax - excessIncome;
      baseTax = excessIncome;
    }
  }

  const cess = Math.round(baseTax * 0.04);
  const totalTax = roundToTen(baseTax + cess);
  const monthlyTds = Math.round(totalTax / 12);

  return {
    regime: `New Regime (${isFY2526OrLater ? 'FY 2025-26 Budget' : 'FY 2024-25'})`,
    financialYear,
    annualGross,
    standardDeduction,
    otherDeductions: 0,
    totalDeductions: standardDeduction,
    taxableIncome,
    baseTax: Math.round(baseTax),
    rebate87A: Math.round(rebate87A),
    cess,
    totalTax,
    monthlyTds,
    effectiveTaxRate: annualGross > 0 ? ((totalTax / annualGross) * 100).toFixed(2) : '0.00',
  };
};

/**
 * Compute Tax under Old Tax Regime
 * Slabs:
 * Up to ₹2,50,000 : Nil
 * ₹2,50,001 - ₹5,00,000 : 5%
 * ₹5,00,001 - ₹10,00,000 : 20%
 * Above ₹10,00,000 : 30%
 * Standard Deduction: ₹50,000
 * Section 87A Rebate: Full rebate up to ₹5,00,000 taxable income (Max ₹12,500)
 */
const computeOldRegimeTax = ({
  annualGross = 0,
  section80C = 150000,
  section80D = 25000,
  hraExemption = 0,
  otherExemptions = 0,
  age = 30,
}) => {
  const standardDeduction = 50000;
  const capped80C = Math.min(Math.max(0, Number(section80C) || 0), 150000);
  const capped80D = Math.min(Math.max(0, Number(section80D) || 0), 75000);
  const validHra = Math.max(0, Number(hraExemption) || 0);
  const validOther = Math.max(0, Number(otherExemptions) || 0);

  const totalDeductions = standardDeduction + capped80C + capped80D + validHra + validOther;
  const taxableIncome = Math.max(0, annualGross - totalDeductions);

  let basicExemption = 250000;
  if (age >= 80) basicExemption = 500000;
  else if (age >= 60) basicExemption = 300000;

  let baseTax = 0;
  if (taxableIncome <= basicExemption) {
    baseTax = 0;
  } else if (taxableIncome <= 500000) {
    baseTax = (taxableIncome - basicExemption) * 0.05;
  } else if (taxableIncome <= 1000000) {
    baseTax = (500000 - basicExemption) * 0.05 + (taxableIncome - 500000) * 0.20;
  } else {
    baseTax = (500000 - basicExemption) * 0.05 + 500000 * 0.20 + (taxableIncome - 1000000) * 0.30;
  }

  // Section 87A Rebate in Old Regime (taxable income <= 5L)
  let rebate87A = 0;
  if (taxableIncome <= 500000) {
    rebate87A = Math.min(baseTax, 12500);
    baseTax = Math.max(0, baseTax - rebate87A);
  }

  const cess = Math.round(baseTax * 0.04);
  const totalTax = roundToTen(baseTax + cess);
  const monthlyTds = Math.round(totalTax / 12);

  return {
    regime: 'Old Regime',
    annualGross,
    standardDeduction,
    deductionsBreakdown: {
      standardDeduction,
      section80C: capped80C,
      section80D: capped80D,
      hraExemption: validHra,
      otherExemptions: validOther,
    },
    totalDeductions,
    taxableIncome,
    baseTax: Math.round(baseTax),
    rebate87A: Math.round(rebate87A),
    cess,
    totalTax,
    monthlyTds,
    effectiveTaxRate: annualGross > 0 ? ((totalTax / annualGross) * 100).toFixed(2) : '0.00',
  };
};

/**
 * Compare Old vs New Tax Regime side-by-side
 */
const compareTaxRegimes = (payload) => {
  const annualGross = Number(payload.annualGross) || 0;
  const financialYear = payload.financialYear || '2025-2026';
  const newTax = computeNewRegimeTax(annualGross, financialYear);
  const oldTax = computeOldRegimeTax({
    annualGross,
    section80C: payload.section80C !== undefined ? payload.section80C : 150000,
    section80D: payload.section80D !== undefined ? payload.section80D : 25000,
    hraExemption: payload.hraExemption || 0,
    otherExemptions: payload.otherExemptions || 0,
    age: payload.age || 30,
  });

  const taxDifference = Math.abs(oldTax.totalTax - newTax.totalTax);
  const recommendedRegime = newTax.totalTax <= oldTax.totalTax ? 'new' : 'old';
  const savings = taxDifference;

  return {
    annualGross,
    financialYear,
    newRegime: newTax,
    oldRegime: oldTax,
    recommendedRegime,
    savings,
    recommendedMonthlyTds: recommendedRegime === 'new' ? newTax.monthlyTds : oldTax.monthlyTds,
  };
};

module.exports = {
  roundToTen,
  computeNewRegimeTax,
  computeOldRegimeTax,
  compareTaxRegimes,
};
