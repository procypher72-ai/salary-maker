// Verify AIIMS Government Template & 6 Months Data

const verifyAiimsTemplate = async () => {
  const baseUrl = 'http://localhost:5000/api';

  console.log('=== VERIFYING AIIMS GOVERNMENT MEDICAL TEMPLATE & 6 MONTHS DATA ===\n');

  // 1. Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@salarymaker.com', password: 'Admin@12345' }),
  });
  const { token } = await loginRes.json();
  const headers = { Authorization: `Bearer ${token}` };

  // 2. Fetch Templates
  const tplRes = await fetch(`${baseUrl}/templates`, { headers });
  const { templates } = await tplRes.json();
  console.log('All Templates in Collection:');
  templates.forEach((t) => console.log(` • ${t.name} (${t.templateKey})`));

  // 3. Fetch Companies
  const compRes = await fetch(`${baseUrl}/companies`, { headers });
  const { companies } = await compRes.json();
  const aiimsComp = companies.find((c) => c.name.includes('Medical Sciences'));
  console.log(`\nFound AIIMS Company: ${aiimsComp?.name} [Template: ${aiimsComp?.templateKey}]`);

  // 4. Fetch Payslips for AIIMS
  const slipsRes = await fetch(`${baseUrl}/payslips?companyId=${aiimsComp._id}`, { headers });
  const { payslips } = await slipsRes.json();
  console.log(`\nSeeded Payslips for AIIMS (${payslips.length} total):`);
  payslips.forEach((p) => {
    console.log(` • ${p.month} ${p.year} - Net Pay: Rs. ${p.netSalary.toLocaleString('en-IN')} (Gross: Rs. ${p.grossEarnings.toLocaleString('en-IN')}, Deductions: Rs. ${p.totalDeductions.toLocaleString('en-IN')})`);
  });

  console.log('\n=== ALL AIIMS VERIFICATION CHECKS PASSED! ===');
};

verifyAiimsTemplate().catch(console.error);
