/**
 * Indian Statutory Rules Engine
 * Computes EPF, ESIC, Professional Tax (PT), and Gratuity based on latest Indian compliance rules.
 */

// State-wise Professional Tax (PT) Slabs (Monthly Rates)
const PT_SLABS = {
  maharashtra: (monthlyGross, gender = 'M', month = 'January') => {
    // Men: > ₹10,000 = ₹200 (₹300 in February)
    // Women: > ₹25,000 = ₹200 (₹300 in February)
    const threshold = gender === 'F' ? 25000 : 10000;
    if (monthlyGross <= threshold) return 0;
    return month.toLowerCase() === 'february' ? 300 : 200;
  },

  karnataka: (monthlyGross) => {
    // >= ₹15,000 = ₹200/month
    return monthlyGross >= 15000 ? 200 : 0;
  },

  tamil_nadu: (monthlyGross) => {
    // Bi-annual slabs divided monthly approx:
    if (monthlyGross < 3500) return 0;
    if (monthlyGross <= 5000) return 22;
    if (monthlyGross <= 7500) return 48;
    if (monthlyGross <= 10000) return 96;
    if (monthlyGross <= 12500) return 144;
    return 208; // > 12500
  },

  west_bengal: (monthlyGross) => {
    if (monthlyGross <= 10000) return 0;
    if (monthlyGross <= 15000) return 110;
    if (monthlyGross <= 25000) return 130;
    if (monthlyGross <= 40000) return 150;
    return 200;
  },

  telangana: (monthlyGross) => {
    if (monthlyGross <= 15000) return 0;
    if (monthlyGross <= 20000) return 150;
    return 200;
  },

  andhra_pradesh: (monthlyGross) => {
    if (monthlyGross <= 15000) return 0;
    if (monthlyGross <= 20000) return 150;
    return 200;
  },

  gujarat: (monthlyGross) => {
    if (monthlyGross <= 12000) return 0;
    return 200;
  },

  delhi: () => 0, // No PT in Delhi
  haryana: () => 0, // No PT in Haryana
  punjab: (monthlyGross) => (monthlyGross > 10000 ? 200 : 0),
  rajasthan: () => 0, // No PT in Rajasthan
  other: () => 0,
};

/**
 * Calculate Employee and Employer EPF
 * @param {number} basicPay - Monthly Basic + DA
 * @param {boolean} restrictToStatutoryCap - Cap at ₹15,000 ceiling (₹1,800/mo) or actual 12%
 */
const calculateEPF = (basicPay = 0, restrictToStatutoryCap = false) => {
  const wageBase = restrictToStatutoryCap ? Math.min(basicPay, 15000) : basicPay;
  
  // Employee Share: 12% of basic
  const employeeEPF = Math.round(wageBase * 0.12);

  // Employer Share: 12% total breakdown (8.33% EPS capped at ₹15,000 + remaining 3.67% EPF)
  const epsBase = Math.min(basicPay, 15000);
  const employerEPS = Math.round(epsBase * 0.0833);
  const employerEPF = Math.max(0, employeeEPF - employerEPS);
  const employerTotal = employeeEPF;

  return {
    wageBase,
    employeeEPF,
    employerEPS,
    employerEPF,
    employerTotal,
  };
};

/**
 * Calculate ESIC
 * Applicable only if Monthly Gross Salary <= ₹21,000
 */
const calculateESIC = (grossSalary = 0) => {
  if (grossSalary > 21000) {
    return {
      isEligible: false,
      employeeESIC: 0,
      employerESIC: 0,
      totalESIC: 0,
    };
  }

  // Employee: 0.75%, Employer: 3.25%
  const employeeESIC = Math.ceil(grossSalary * 0.0075);
  const employerESIC = Math.ceil(grossSalary * 0.0325);

  return {
    isEligible: true,
    employeeESIC,
    employerESIC,
    totalESIC: employeeESIC + employerESIC,
  };
};

/**
 * Calculate Professional Tax
 */
const calculatePT = (monthlyGross = 0, state = 'maharashtra', gender = 'M', month = 'January') => {
  const normalizedState = (state || '').toLowerCase().replace(/\s+/g, '_');
  const handler = PT_SLABS[normalizedState] || PT_SLABS.maharashtra;
  return handler(monthlyGross, gender, month);
};

/**
 * Calculate Monthly Gratuity Provision (4.81% of Basic Pay)
 */
const calculateGratuity = (basicPay = 0) => {
  return Math.round((basicPay * 15) / (26 * 12)); // Approx 4.81%
};

/**
 * Comprehensive CTC to Monthly Breakdown Engine
 */
const calculateCtcStructure = ({
  annualCtc = 600000,
  basicPercent = 40, // % of CTC
  hraPercent = 50, // % of Basic (50% Metro, 40% Non-Metro)
  ptState = 'maharashtra',
  restrictPfCap = false, // If true, cap PF at ₹1,800/mo
  includeEmployerPfInCtc = true,
  includeGratuityInCtc = true,
  gender = 'M',
}) => {
  const monthlyCtc = Math.round(annualCtc / 12);

  // 1. Basic Pay
  let monthlyBasic = Math.round((monthlyCtc * (basicPercent / 100)));
  if (monthlyBasic < 1000) monthlyBasic = 1000;

  // 2. HRA
  const monthlyHra = Math.round((monthlyBasic * (hraPercent / 100)));

  // 3. Fixed components
  const conveyance = 1600;
  const medicalAllowance = 1250;

  // 4. Employer Contributions (if part of CTC)
  const epfObj = calculateEPF(monthlyBasic, restrictPfCap);
  const employerPf = includeEmployerPfInCtc ? epfObj.employerTotal : 0;
  const gratuity = includeGratuityInCtc ? calculateGratuity(monthlyBasic) : 0;

  // 5. Special Allowance (Balancing figure to reach exact monthly CTC)
  const fixedAllocated = monthlyBasic + monthlyHra + conveyance + medicalAllowance + employerPf + gratuity;
  let specialAllowance = monthlyCtc - fixedAllocated;

  if (specialAllowance < 0) {
    // If negative, adjust special allowance to 0 and reduce HRA/Basic appropriately
    specialAllowance = 0;
  }

  // Monthly Gross Salary (Earnings)
  const monthlyGross = monthlyBasic + monthlyHra + conveyance + medicalAllowance + specialAllowance;

  // 6. Deductions
  const employeePf = epfObj.employeeEPF;
  const esicObj = calculateESIC(monthlyGross);
  const employeeEsic = esicObj.employeeESIC;
  const pt = calculatePT(monthlyGross, ptState, gender);

  const totalMonthlyDeductions = employeePf + employeeEsic + pt;
  const netTakeHome = Math.max(0, monthlyGross - totalMonthlyDeductions);

  return {
    annualCtc,
    monthlyCtc,
    earnings: {
      basicPay: monthlyBasic,
      hra: monthlyHra,
      conveyanceAllowance: conveyance,
      medicalAllowance: medicalAllowance,
      specialAllowance: specialAllowance,
      grossEarnings: monthlyGross,
    },
    deductions: {
      pfDeduction: employeePf,
      esicDeduction: employeeEsic,
      professionalTax: pt,
      totalDeductions: totalMonthlyDeductions,
    },
    employerContributions: {
      employerPf,
      employerEsic: esicObj.employerESIC,
      gratuity,
      totalEmployerBenefits: employerPf + esicObj.employerESIC + gratuity,
    },
    netTakeHome,
    annualSummary: {
      annualGross: monthlyGross * 12,
      annualDeductions: totalMonthlyDeductions * 12,
      annualNetTakeHome: netTakeHome * 12,
    },
  };
};

module.exports = {
  PT_SLABS,
  calculateEPF,
  calculateESIC,
  calculatePT,
  calculateGratuity,
  calculateCtcStructure,
};
