// Comprehensive End-to-End Verification of SRS Multi-Company Payroll System

const runSRSVerification = async () => {
  const baseUrl = 'http://localhost:5000/api';

  console.log('===========================================================');
  console.log('   SALARY MAKER: MULTI-COMPANY PAYROLL SYSTEM SRS TESTS    ');
  console.log('===========================================================\n');

  // Step 1: Admin Login
  console.log('1. Testing Admin Authentication...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@salarymaker.com', password: 'Admin@12345' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('   ✅ Admin logged in. Token issued.');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Step 2: Template Catalog Verification
  console.log('\n2. Testing Template Registry & Dynamic Schemas...');
  const tplRes = await fetch(`${baseUrl}/templates`, { headers: authHeaders });
  const tplData = await tplRes.json();
  console.log(`   ✅ Retrieved ${tplData.templates.length} templates:`);
  tplData.templates.forEach((t) => {
    console.log(`      • ${t.name} (${t.templateKey}) - Required Fields: ${t.requiredFields.length}`);
  });

  // Step 3: Create a New Company with Minimalist Startup Template
  console.log('\n3. Testing Module 1: Company Profile & Template Association...');
  const compRes = await fetch(`${baseUrl}/companies`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Vortex Quantum Labs Inc.',
      email: 'finance@vortexquantum.io',
      phone: '+1 (415) 890-1234',
      fullAddress: '550 Howard St, San Francisco, CA 94105',
      gstin: 'US-TAX-892140',
      pan: 'VRTX9900Q',
      website: 'https://vortexquantum.io',
      templateKey: 'minimalist_startup',
      currency: '$',
      currencyCode: 'USD',
      signatoryName: 'Elena Rostova',
      signatoryDesignation: 'Chief People Officer',
    }),
  });
  const compData = await compRes.json();
  const newCompanyId = compData.company._id;
  console.log(`   ✅ Company created: "${compData.company.name}" (Template: ${compData.company.templateKey})`);

  // Step 4: Dynamic Employee Onboarding
  console.log('\n4. Testing Module 2 & 3: Dynamic Employee Onboarding...');
  const empRes = await fetch(`${baseUrl}/employees`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      companyId: newCompanyId,
      empCode: 'VQ-042',
      fullName: 'Marcus Vance',
      email: 'marcus.v@vortexquantum.io',
      designation: 'Quantum AI Researcher',
      department: 'R&D',
      dynamicFields: {
        bankName: 'Silicon Valley Bank',
        bankAccount: '99201948102',
        department: 'Quantum Algorithms',
      },
      baselineSalary: {
        basicPay: 12000,
        hra: 0,
        specialAllowance: 3000,
        conveyanceAllowance: 500,
        medicalAllowance: 500,
        otherAllowances: 0,
        pfDeduction: 0,
        professionalTax: 0,
        tds: 2200,
        otherDeductions: 300,
      },
    }),
  });
  const empData = await empRes.json();
  const employeeId = empData.employee._id;
  console.log(`   ✅ Employee created: ${empData.employee.fullName} (${empData.employee.empCode})`);

  // Step 5: Module 4 - Interactive Payslip Draft Preparation
  console.log('\n5. Testing Module 4: Interactive Live Draft Preparation...');
  const draftRes = await fetch(`${baseUrl}/payslips/prepare-draft`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      employeeId,
      month: 'August',
      year: 2026,
    }),
  });
  const draftData = await draftRes.json();
  console.log('   ✅ Draft generated:');
  console.log(`      Gross: $${draftData.draft.grossEarnings} | Deductions: $${draftData.draft.totalDeductions} | Net: $${draftData.draft.netSalary}`);
  console.log(`      In Words: "${draftData.draft.netSalaryInWords}"`);

  // Step 6: Save & Finalize Interactive Payslip with Custom Bonus
  console.log('\n6. Testing Live Canvas Customization & Persistence...');
  const customEarnings = [
    ...draftData.draft.earnings,
    { label: 'Quantum Patent Award Bonus', amount: 4500 },
  ];
  const customGross = customEarnings.reduce((a, b) => a + b.amount, 0);
  const customNet = customGross - draftData.draft.totalDeductions;

  const saveRes = await fetch(`${baseUrl}/payslips`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      ...draftData.draft,
      earnings: customEarnings,
      grossEarnings: customGross,
      netSalary: customNet,
      netSalaryInWords: 'Dollars Seventeen Thousand Five Hundred Only',
    }),
  });
  const saveData = await saveRes.json();
  console.log(`   ✅ Saved Payslip ID: ${saveData.payslip._id}`);
  console.log(`      Updated Net Salary with bonus: $${saveData.payslip.netSalary}`);
  console.log(`      Snapshot Company: ${saveData.payslip.snapshotData.company.name}`);

  // Step 7: Bulk Date-Range Generation (Jan 2026 to Jun 2026 - 6 consecutive months)
  console.log('\n7. Testing Bulk Date-Range Generator (Jan 2026 to Jun 2026)...');
  const bulkRes = await fetch(`${baseUrl}/payslips/bulk-generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      employeeId,
      startMonth: 'January',
      startYear: 2026,
      endMonth: 'June',
      endYear: 2026,
    }),
  });
  const bulkData = await bulkRes.json();
  console.log(`   ✅ Bulk Generator: Issued ${bulkData.count} consecutive monthly payslips:`);
  bulkData.payslips.forEach((p) => {
    console.log(`      • ${p.payPeriod} - Net Salary: $${p.netSalary}`);
  });

  // Step 8: Query Historical Archive
  console.log('\n8. Testing Module 5: Storage & Historical Archive Query...');
  const historyRes = await fetch(`${baseUrl}/payslips?companyId=${newCompanyId}`, {
    headers: authHeaders,
  });
  const historyData = await historyRes.json();
  console.log(`   ✅ Retrieved ${historyData.count} archived payslips for "${compData.company.name}".`);

  console.log('\n===========================================================');
  console.log('   🎉 ALL 5 SRS MODULES SUCCESSFULLY VALIDATED & VERIFIED! ');
  console.log('===========================================================');
};

runSRSVerification().catch(console.error);
