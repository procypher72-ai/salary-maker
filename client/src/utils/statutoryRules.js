/**
 * Client-side Statutory Rules Engine
 */

export const PT_STATES = [
  { key: 'maharashtra', label: 'Maharashtra (₹200/mo, ₹300 Feb)' },
  { key: 'karnataka', label: 'Karnataka (₹200/mo for >= ₹15k)' },
  { key: 'tamil_nadu', label: 'Tamil Nadu (Slab-based up to ₹208/mo)' },
  { key: 'west_bengal', label: 'West Bengal (Slab-based ₹110-₹200/mo)' },
  { key: 'telangana', label: 'Telangana (₹150-₹200/mo)' },
  { key: 'andhra_pradesh', label: 'Andhra Pradesh (₹150-₹200/mo)' },
  { key: 'gujarat', label: 'Gujarat (₹200/mo for > ₹12k)' },
  { key: 'punjab', label: 'Punjab (₹200/mo for > ₹10k)' },
  { key: 'delhi', label: 'Delhi (No PT - ₹0)' },
  { key: 'haryana', label: 'Haryana (No PT - ₹0)' },
  { key: 'rajasthan', label: 'Rajasthan (No PT - ₹0)' },
  { key: 'other', label: 'Other State (Exempt / ₹0)' },
];

export const calculateEPF = (basicPay = 0, restrictToStatutoryCap = false) => {
  const wageBase = restrictToStatutoryCap ? Math.min(basicPay, 15000) : basicPay;
  const employeeEPF = Math.round(wageBase * 0.12);
  const epsBase = Math.min(basicPay, 15000);
  const employerEPS = Math.round(epsBase * 0.0833);
  const employerEPF = Math.max(0, employeeEPF - employerEPS);

  return {
    wageBase,
    employeeEPF,
    employerEPS,
    employerEPF,
    employerTotal: employeeEPF,
  };
};

export const calculateESIC = (grossSalary = 0) => {
  if (grossSalary > 21000) {
    return { isEligible: false, employeeESIC: 0, employerESIC: 0, totalESIC: 0 };
  }
  const employeeESIC = Math.ceil(grossSalary * 0.0075);
  const employerESIC = Math.ceil(grossSalary * 0.0325);
  return {
    isEligible: true,
    employeeESIC,
    employerESIC,
    totalESIC: employeeESIC + employerESIC,
  };
};

export const calculatePT = (monthlyGross = 0, state = 'maharashtra', gender = 'M', month = 'January') => {
  const normalizedState = (state || '').toLowerCase().replace(/\s+/g, '_');
  
  if (normalizedState === 'maharashtra') {
    const threshold = gender === 'F' ? 25000 : 10000;
    if (monthlyGross <= threshold) return 0;
    return (month || '').toLowerCase() === 'february' ? 300 : 200;
  }
  if (normalizedState === 'karnataka') {
    return monthlyGross >= 15000 ? 200 : 0;
  }
  if (normalizedState === 'tamil_nadu') {
    if (monthlyGross < 3500) return 0;
    if (monthlyGross <= 5000) return 22;
    if (monthlyGross <= 7500) return 48;
    if (monthlyGross <= 10000) return 96;
    if (monthlyGross <= 12500) return 144;
    return 208;
  }
  if (normalizedState === 'west_bengal') {
    if (monthlyGross <= 10000) return 0;
    if (monthlyGross <= 15000) return 110;
    if (monthlyGross <= 25000) return 130;
    if (monthlyGross <= 40000) return 150;
    return 200;
  }
  if (normalizedState === 'telangana' || normalizedState === 'andhra_pradesh') {
    if (monthlyGross <= 15000) return 0;
    if (monthlyGross <= 20000) return 150;
    return 200;
  }
  if (normalizedState === 'gujarat') {
    return monthlyGross > 12000 ? 200 : 0;
  }
  if (normalizedState === 'punjab') {
    return monthlyGross > 10000 ? 200 : 0;
  }
  return 0; // Delhi, Haryana, Rajasthan, Other
};

export const calculateGratuity = (basicPay = 0) => {
  return Math.round((basicPay * 15) / (26 * 12));
};

export const calculateCtcStructure = ({
  annualCtc = 600000,
  basicPercent = 40,
  hraPercent = 50,
  ptState = 'maharashtra',
  restrictPfCap = false,
  includeEmployerPfInCtc = true,
  includeGratuityInCtc = true,
  gender = 'M',
}) => {
  const monthlyCtc = Math.round(annualCtc / 12);
  let monthlyBasic = Math.round(monthlyCtc * (basicPercent / 100));
  if (monthlyBasic < 1000) monthlyBasic = 1000;

  const monthlyHra = Math.round(monthlyBasic * (hraPercent / 100));
  const conveyance = 1600;
  const medicalAllowance = 1250;

  const epfObj = calculateEPF(monthlyBasic, restrictPfCap);
  const employerPf = includeEmployerPfInCtc ? epfObj.employerTotal : 0;
  const gratuity = includeGratuityInCtc ? calculateGratuity(monthlyBasic) : 0;

  const fixedAllocated = monthlyBasic + monthlyHra + conveyance + medicalAllowance + employerPf + gratuity;
  let specialAllowance = monthlyCtc - fixedAllocated;
  if (specialAllowance < 0) specialAllowance = 0;

  const monthlyGross = monthlyBasic + monthlyHra + conveyance + medicalAllowance + specialAllowance;
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
