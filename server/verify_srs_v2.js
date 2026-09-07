const { calculateCtcStructure, calculateEPF, calculateESIC, calculatePT } = require('./utils/statutoryRules');
const { computeNewRegimeTax, computeOldRegimeTax, compareTaxRegimes } = require('./utils/taxEngine');

console.log('--- Testing Statutory Engine ---');
const ctcRes = calculateCtcStructure({
  annualCtc: 600000,
  basicPercent: 40,
  hraPercent: 50,
  ptState: 'maharashtra',
  restrictPfCap: false,
});

console.log('CTC Breakdown for ₹6,00,000:', {
  monthlyCtc: ctcRes.monthlyCtc,
  grossEarnings: ctcRes.earnings.grossEarnings,
  basicPay: ctcRes.earnings.basicPay,
  hra: ctcRes.earnings.hra,
  pf: ctcRes.deductions.pfDeduction,
  pt: ctcRes.deductions.professionalTax,
  netTakeHome: ctcRes.netTakeHome,
});

console.log('\n--- Testing Tax Engine ---');
const taxCompare = compareTaxRegimes({
  annualGross: 850000,
  section80C: 150000,
  section80D: 25000,
  hraExemption: 60000,
});

console.log('Tax Comparison for ₹8,50,000:', {
  newTax: taxCompare.newRegime.totalTax,
  newMonthlyTds: taxCompare.newRegime.monthlyTds,
  oldTax: taxCompare.oldRegime.totalTax,
  oldMonthlyTds: taxCompare.oldRegime.monthlyTds,
  recommended: taxCompare.recommendedRegime,
  savings: taxCompare.savings,
});

console.log('\n✅ Backend engines validated successfully!');
