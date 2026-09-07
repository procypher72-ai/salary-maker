/**
 * Advanced Income Tax & Salary Computation Engine
 * Supports New Regime (115BAC) and Old Regime across multiple Financial Years
 */

// Round to nearest 10 as per Income Tax Act (u/s 288A for income, u/s 288B for tax)
export const roundToTen = (num = 0) => {
  return Math.round((Number(num) || 0) / 10) * 10;
};

export const getStandardDeduction = (regime = 'new_115bac', financialYear = '2025-2026') => {
  if (regime === 'old') return 50000;
  // New regime
  if (financialYear === '2023-2024') return 50000;
  return 75000; // FY 2024-25 / 2025-26 / 2026-27
};

export const getBasicExemptionLimit = (regime = 'new_115bac', financialYear = '2025-2026', age = 30) => {
  if (regime === 'old') {
    if (age >= 80) return 500000; // Super Senior
    if (age >= 60) return 300000; // Senior
    return 250000; // General
  }
  // New Regime 115BAC
  if (financialYear === '2025-2026' || financialYear === '2026-2027') {
    return 400000;
  }
  return 300000;
};

/**
 * Calculates Tax on Normal Income according to Regime & FY
 */
export const calculateTaxOnNormalIncome = (taxableIncome = 0, regime = 'new_115bac', financialYear = '2025-2026', age = 30) => {
  const income = Math.max(0, Number(taxableIncome) || 0);
  let tax = 0;

  if (regime === 'new_115bac') {
    if (financialYear === '2025-2026' || financialYear === '2026-2027') {
      // Slabs: 0-4L: Nil, 4-8L: 5%, 8-12L: 10%, 12-16L: 15%, 16-20L: 20%, >20L: 30%
      if (income <= 400000) {
        tax = 0;
      } else if (income <= 800000) {
        tax = (income - 400000) * 0.05;
      } else if (income <= 1200000) {
        tax = 400000 * 0.05 + (income - 800000) * 0.10;
      } else if (income <= 1600000) {
        tax = 400000 * 0.05 + 400000 * 0.10 + (income - 1200000) * 0.15;
      } else if (income <= 2000000) {
        tax = 400000 * 0.05 + 400000 * 0.10 + 400000 * 0.15 + (income - 1600000) * 0.20;
      } else {
        tax = 400000 * 0.05 + 400000 * 0.10 + 400000 * 0.15 + 400000 * 0.20 + (income - 2000000) * 0.30;
      }
    } else if (financialYear === '2024-2025') {
      // Slabs: 0-3L: Nil, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, >15L: 30%
      if (income <= 300000) {
        tax = 0;
      } else if (income <= 700000) {
        tax = (income - 300000) * 0.05;
      } else if (income <= 1000000) {
        tax = 400000 * 0.05 + (income - 700000) * 0.10;
      } else if (income <= 1200000) {
        tax = 400000 * 0.05 + 300000 * 0.10 + (income - 1000000) * 0.15;
      } else if (income <= 1500000) {
        tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + (income - 1200000) * 0.20;
      } else {
        tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + 300000 * 0.20 + (income - 1500000) * 0.30;
      }
    } else {
      // Slabs FY 2023-24: 0-3L: Nil, 3-6L: 5%, 6-9L: 10%, 9-12L: 15%, 12-15L: 20%, >15L: 30%
      if (income <= 300000) {
        tax = 0;
      } else if (income <= 600000) {
        tax = (income - 300000) * 0.05;
      } else if (income <= 900000) {
        tax = 300000 * 0.05 + (income - 600000) * 0.10;
      } else if (income <= 1200000) {
        tax = 300000 * 0.05 + 300000 * 0.10 + (income - 900000) * 0.15;
      } else if (income <= 1500000) {
        tax = 300000 * 0.05 + 300000 * 0.10 + 300000 * 0.15 + (income - 1200000) * 0.20;
      } else {
        tax = 300000 * 0.05 + 300000 * 0.10 + 300000 * 0.15 + 300000 * 0.20 + (income - 1500000) * 0.30;
      }
    }
  } else {
    // Old Regime
    const exemption = getBasicExemptionLimit('old', financialYear, age);
    if (income <= exemption) {
      tax = 0;
    } else if (income <= 500000) {
      tax = (income - exemption) * 0.05;
    } else if (income <= 1000000) {
      tax = (500000 - exemption) * 0.05 + (income - 500000) * 0.20;
    } else {
      tax = (500000 - exemption) * 0.05 + 500000 * 0.20 + (income - 1000000) * 0.30;
    }
  }

  return Math.round(tax);
};

/**
 * Calculates Section 87A Tax Rebate
 */
export const calculateRebate87A = (taxableIncome = 0, baseTax = 0, regime = 'new_115bac', financialYear = '2025-2026') => {
  const income = Number(taxableIncome) || 0;
  if (baseTax <= 0) return 0;

  if (regime === 'new_115bac') {
    const threshold = (financialYear === '2025-2026' || financialYear === '2026-2027') ? 1200000 : 700000;
    if (income <= threshold) {
      return baseTax;
    }
    // Marginal relief under new regime
    const excessIncome = income - threshold;
    if (baseTax > excessIncome) {
      return baseTax - excessIncome;
    }
    return 0;
  } else {
    // Old regime: Total income <= 5,00,000 -> Max 12,500 rebate
    if (income <= 500000) {
      return Math.min(baseTax, 12500);
    }
    return 0;
  }
};

export const calculateHouseProperty = (hp = {}, regime = 'new_115bac') => {
  const propertyType = hp.propertyType || 'let_out'; // 'let_out' | 'self_occupied' | 'deemed_let_out'
  const rentReceived = Number(hp.rentReceived) || 0;
  const municipalValuation = Number(hp.municipalValuation) || 0;
  const fairRent = Number(hp.fairRent) || 0;
  const unrealisedRent = Number(hp.unrealisedRent) || 0;
  const municipalTaxes = Number(hp.municipalTaxes) || 0;
  const currentYearInterest = Number(hp.currentYearInterest || hp.interestOnHousingLoan) || 0;
  const preConstructionInterest = Number(hp.preConstructionInterest) || 0;
  const arrearOfRent = Number(hp.arrearOfRent) || 0;

  if (propertyType === 'self_occupied') {
    const annualValue = 0;
    const standardDeduction30 = 0;
    let interestAllowed = currentYearInterest + preConstructionInterest;
    if (regime === 'old') {
      interestAllowed = Math.min(interestAllowed, 200000);
    } else {
      interestAllowed = Math.min(interestAllowed, 200000);
    }
    const netIncome = 0 - interestAllowed;

    return {
      ...hp,
      propertyType,
      annualValue: 0,
      municipalTaxes: 0,
      standardDeduction30: 0,
      interestAllowed,
      netIncome: hp.netIncome !== undefined && hp.isManualNet ? Number(hp.netIncome) : netIncome,
    };
  }

  // Let Out or Deemed Let Out
  const reasonableRent = Math.max(municipalValuation, fairRent);
  const grossRent = Math.max(0, rentReceived - unrealisedRent);
  const grossAnnualValue = Math.max(reasonableRent, grossRent);
  const netAnnualValue = Math.max(0, grossAnnualValue - municipalTaxes);
  const standardDeduction30 = Math.round(netAnnualValue * 0.30);
  const totalInterest = currentYearInterest + preConstructionInterest;
  const netIncome = netAnnualValue - standardDeduction30 - totalInterest + Math.round(arrearOfRent * 0.70);

  return {
    ...hp,
    propertyType,
    annualValue: grossAnnualValue,
    netAnnualValue,
    standardDeduction30,
    interestAllowed: totalInterest,
    netIncome: hp.netIncome !== undefined && hp.isManualNet ? Number(hp.netIncome) : netIncome,
  };
};

/**
 * Recalculates full computation state
 */
export const recalculateComputation = (data) => {
  const regime = data.regime || 'new_115bac';
  const financialYear = data.financialYear || '2025-2026';

  // 1. Heads of Income: Salary
  const salary = data.headsOfIncome?.salary || {};
  const salaryBreakdown = Array.isArray(salary.salaryBreakdown) ? salary.salaryBreakdown : [];
  
  let basicSalary = Number(salary.basicSalary) || 0;
  let allowances = Number(salary.allowances) || 0;
  let totalGrossSalary = Number(salary.totalGross) || 0;

  if (salaryBreakdown.length > 0) {
    totalGrossSalary = salaryBreakdown.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
    const basicItem = salaryBreakdown.find((i) => (i.particular || '').toLowerCase().includes('basic'));
    basicSalary = basicItem ? Number(basicItem.totalAmount) || 0 : totalGrossSalary;
    allowances = totalGrossSalary - basicSalary;
  } else if (!totalGrossSalary) {
    totalGrossSalary = basicSalary + allowances;
  }

  const exemptedAllowances = Number(salary.exemptedAllowances) || 0;
  const standardDeduction = salary.standardDeduction !== undefined 
    ? Number(salary.standardDeduction) 
    : getStandardDeduction(regime, financialYear);
  const professionalTax = Number(salary.professionalTax) || 0;

  const taxableSalary = Math.max(0, totalGrossSalary - exemptedAllowances - standardDeduction - professionalTax);

  // 2. House Property
  const hpRaw = data.headsOfIncome?.houseProperty || {};
  const hpComputed = calculateHouseProperty(hpRaw, regime);
  const hpNet = Number(hpComputed.netIncome) || 0;

  // 3. Business / Profession
  const bp = data.headsOfIncome?.businessProfession || {};
  let bpNet = Number(bp.netProfit) || 0;
  if (Array.isArray(bp.entries) && bp.entries.length > 0) {
    bpNet = bp.entries.reduce((sum, entry) => sum + (Number(entry.profitOrLoss) || 0), 0);
  }

  // 4. Capital Gains
  const cg = data.headsOfIncome?.capitalGains || {};
  let cgNet = Number(cg.netGains) || 0;
  if (Array.isArray(cg.exemptions54) && cg.exemptions54.length > 0) {
    const totalExempted = cg.exemptions54.reduce((s, row) => s + (Number(row.exemptedAmount) || 0), 0);
    const grossCapitalGain = Number(cg.saleConsideration || 0) - Number(cg.purchaseCost || 0) - Number(cg.transferExpenses || 0);
    if (cg.netGains === undefined || !cg.isManual) {
      cgNet = Math.max(0, grossCapitalGain - totalExempted);
    }
  }

  // 5. Other Sources
  const os = data.headsOfIncome?.otherSources || {};
  const osBreakdown = Array.isArray(os.breakdown) ? os.breakdown : [];
  let totalOtherSources = 0;

  const interestSavings = Number(os.interestSavings) || 0;
  const interestFdr = Number(os.interestFdr) || 0;
  const interestItRefund = Number(os.interestItRefund) || 0;
  const interestKvp = Number(os.interestKvp) || 0;
  const interestNsc = Number(os.interestNsc) || 0;
  const otherInterest = Number(os.otherInterest) || 0;
  
  const divQ1 = Number(os.dividendQ1) || 0;
  const divQ2 = Number(os.dividendQ2) || 0;
  const divQ3 = Number(os.dividendQ3) || 0;
  const divQ4 = Number(os.dividendQ4) || 0;
  const divQ5 = Number(os.dividendQ5) || 0;
  const dividendTotal = (divQ1 + divQ2 + divQ3 + divQ4 + divQ5) || Number(os.dividendIncome) || 0;

  const structuredOtherSourcesSum = interestSavings + interestFdr + interestItRefund + interestKvp + interestNsc + otherInterest + dividendTotal + (Number(os.otherIncome) || 0);

  if (osBreakdown.length > 0) {
    totalOtherSources = osBreakdown.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  } else {
    totalOtherSources = structuredOtherSourcesSum;
  }

  // Gross Total Income
  const grossTotalIncome = taxableSalary + hpNet + bpNet + cgNet + totalOtherSources;

  // Chapter VI-A Deductions
  let deductionsChapterVIA = Array.isArray(data.deductionsChapterVIA) ? [...data.deductionsChapterVIA] : [];
  let totalDeductionsChapterVIA = 0;

  if (regime === 'new_115bac') {
    deductionsChapterVIA = deductionsChapterVIA.filter(d => (d.section || '').includes('80CCD(2)'));
    totalDeductionsChapterVIA = deductionsChapterVIA.reduce((sum, d) => sum + (Number(d.deductibleAmount) || 0), 0);
  } else {
    totalDeductionsChapterVIA = deductionsChapterVIA.reduce((sum, d) => sum + (Number(d.deductibleAmount) || 0), 0);
  }

  // Total Income & Rounding u/s 288A
  const totalIncome = Math.max(0, grossTotalIncome - totalDeductionsChapterVIA);
  const roundedTotalIncome = roundToTen(totalIncome);

  const taxableSpecialRate = Number(data.taxableSpecialRate) || 0;
  const taxableNormalRate = Math.max(0, roundedTotalIncome - taxableSpecialRate);

  // Tax Calculation
  const basicExemptionLimit = getBasicExemptionLimit(regime, financialYear);
  const taxAtNormalRates = calculateTaxOnNormalIncome(taxableNormalRate, regime, financialYear);
  const taxAtSpecialRates = Number(data.taxCalculation?.taxAtSpecialRates) || 0;
  const totalTax = taxAtNormalRates + taxAtSpecialRates;

  const rebate87A = calculateRebate87A(roundedTotalIncome, totalTax, regime, financialYear);
  const taxAfterRebate = Math.max(0, totalTax - rebate87A);

  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTaxWithCess = taxAfterRebate + cess;

  // Interest 234A/B/C
  const interest234A = Number(data.taxCalculation?.interest234A) || 0;
  const interest234B = Number(data.taxCalculation?.interest234B) || 0;
  const interest234C = Number(data.taxCalculation?.interest234C) || 0;
  const totalInterest = interest234A + interest234B + interest234C;

  const totalTaxAndInterest = totalTaxWithCess + totalInterest;

  // Taxes Paid / Deposited
  const challans = Array.isArray(data.challans) ? data.challans : [];
  const challans140A = challans.filter(c => c.type === '140A' || !c.type);
  const sumChallans140A = challans140A.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const tdsSalary = Number(data.taxCalculation?.tdsSalary) || 0;
  const tdsOther = Number(data.taxCalculation?.tdsOther) || 0;
  const advanceTax = Number(data.taxCalculation?.advanceTax) || 0;
  const taxDeposited140A = data.taxCalculation?.taxDeposited140A !== undefined 
    ? Number(data.taxCalculation.taxDeposited140A) 
    : sumChallans140A;

  const totalTaxesPaid = tdsSalary + tdsOther + advanceTax + taxDeposited140A;

  const diff = totalTaxAndInterest - totalTaxesPaid;
  const amountPayable = diff > 0 ? diff : 0;
  const amountRefundable = diff < 0 ? Math.abs(diff) : 0;
  const taxRoundedOff = roundToTen(amountPayable);

  return {
    ...data,
    regime,
    financialYear,
    headsOfIncome: {
      ...data.headsOfIncome,
      salary: {
        ...salary,
        basicSalary,
        allowances,
        totalGross: totalGrossSalary,
        exemptedAllowances,
        standardDeduction,
        professionalTax,
        taxableSalary,
        salaryBreakdown,
      },
      houseProperty: hpComputed,
      businessProfession: {
        ...bp,
        netProfit: bpNet,
      },
      capitalGains: {
        ...cg,
        netGains: cgNet,
      },
      otherSources: {
        ...os,
        interestSavings,
        interestFdr,
        interestItRefund,
        interestKvp,
        interestNsc,
        otherInterest,
        dividendIncome: dividendTotal,
        totalOtherSources,
        breakdown: osBreakdown.length > 0 ? osBreakdown : [
          ...(interestSavings ? [{ label: 'Interest on Bank Savings', amount: interestSavings }] : []),
          ...(interestFdr ? [{ label: 'Interest on Bank FDR', amount: interestFdr }] : []),
          ...(interestItRefund ? [{ label: 'Interest on Income Tax Refund', amount: interestItRefund }] : []),
          ...(dividendTotal ? [{ label: 'Dividend Income', amount: dividendTotal }] : []),
          ...(os.otherIncome ? [{ label: 'Other Income', amount: Number(os.otherIncome) }] : []),
        ],
      },
    },
    grossTotalIncome,
    deductionsChapterVIA,
    totalDeductionsChapterVIA,
    totalIncome,
    roundedTotalIncome,
    taxableNormalRate,
    taxableSpecialRate,
    taxCalculation: {
      ...data.taxCalculation,
      basicExemptionLimit,
      taxAtNormalRates,
      taxAtSpecialRates,
      totalTax,
      rebate87A,
      taxAfterRebate,
      cess,
      totalTaxWithCess,
      interest234A,
      interest234B,
      interest234C,
      totalInterest,
      totalTaxAndInterest,
      tdsSalary,
      tdsOther,
      advanceTax,
      taxDeposited140A,
      totalTaxesPaid,
      amountPayable,
      amountRefundable,
      taxRoundedOff,
    },
    challans,
  };
};

/**
 * Calculates side-by-side Old vs New Regime comparison for any computation dataset
 */
export const getRegimeComparison = (formData) => {
  const newRegimeData = recalculateComputation({ ...formData, regime: 'new_115bac' });
  const oldRegimeData = recalculateComputation({ ...formData, regime: 'old' });

  const newTaxPayable = Number(newRegimeData.taxCalculation?.taxRoundedOff ?? newRegimeData.taxCalculation?.amountPayable ?? 0);
  const oldTaxPayable = Number(oldRegimeData.taxCalculation?.taxRoundedOff ?? oldRegimeData.taxCalculation?.amountPayable ?? 0);

  const newTotalTax = Number(newRegimeData.taxCalculation?.totalTaxWithCess || 0);
  const oldTotalTax = Number(oldRegimeData.taxCalculation?.totalTaxWithCess || 0);

  const diff = oldTaxPayable - newTaxPayable;
  const recommended = diff > 0 ? 'new_115bac' : diff < 0 ? 'old' : 'equal';
  const savings = Math.abs(diff);

  return {
    newRegimeData,
    oldRegimeData,
    newTaxPayable,
    oldTaxPayable,
    newTotalTax,
    oldTotalTax,
    diff,
    recommended,
    savings,
  };
};
