/**
 * Client-side Tax Computation Engine
 */

export const computeNewRegimeTax = (annualGross = 0) => {
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, annualGross - standardDeduction);

  let baseTax = 0;
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

  let rebate87A = 0;
  if (taxableIncome <= 700000) {
    rebate87A = baseTax;
    baseTax = 0;
  }

  const cess = Math.round(baseTax * 0.04);
  const totalTax = Math.round(baseTax + cess);
  const monthlyTds = Math.round(totalTax / 12);

  return {
    regime: 'New Regime (FY 2024-25/26)',
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

export const computeOldRegimeTax = ({
  annualGross = 0,
  section80C = 150000,
  section80D = 25000,
  hraExemption = 0,
  otherExemptions = 0,
}) => {
  const standardDeduction = 50000;
  const capped80C = Math.min(Math.max(0, Number(section80C) || 0), 150000);
  const capped80D = Math.min(Math.max(0, Number(section80D) || 0), 75000);
  const validHra = Math.max(0, Number(hraExemption) || 0);
  const validOther = Math.max(0, Number(otherExemptions) || 0);

  const totalDeductions = standardDeduction + capped80C + capped80D + validHra + validOther;
  const taxableIncome = Math.max(0, annualGross - totalDeductions);

  let baseTax = 0;
  if (taxableIncome <= 250000) {
    baseTax = 0;
  } else if (taxableIncome <= 500000) {
    baseTax = (taxableIncome - 250000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    baseTax = 250000 * 0.05 + (taxableIncome - 500000) * 0.20;
  } else {
    baseTax = 250000 * 0.05 + 500000 * 0.20 + (taxableIncome - 1000000) * 0.30;
  }

  let rebate87A = 0;
  if (taxableIncome <= 500000) {
    rebate87A = baseTax;
    baseTax = 0;
  }

  const cess = Math.round(baseTax * 0.04);
  const totalTax = Math.round(baseTax + cess);
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

export const compareTaxRegimes = (payload) => {
  const annualGross = Number(payload.annualGross) || 0;
  const newTax = computeNewRegimeTax(annualGross);
  const oldTax = computeOldRegimeTax({
    annualGross,
    section80C: payload.section80C !== undefined ? payload.section80C : 150000,
    section80D: payload.section80D !== undefined ? payload.section80D : 25000,
    hraExemption: payload.hraExemption || 0,
    otherExemptions: payload.otherExemptions || 0,
  });

  const taxDifference = Math.abs(oldTax.totalTax - newTax.totalTax);
  const recommendedRegime = newTax.totalTax <= oldTax.totalTax ? 'new' : 'old';

  return {
    annualGross,
    newRegime: newTax,
    oldRegime: oldTax,
    recommendedRegime,
    savings: taxDifference,
    recommendedMonthlyTds: recommendedRegime === 'new' ? newTax.monthlyTds : oldTax.monthlyTds,
  };
};
