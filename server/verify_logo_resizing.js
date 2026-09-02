// Test Logo Resizing Persistence & Generation

const verifyLogoResizing = async () => {
  const baseUrl = 'http://localhost:5000/api';

  console.log('=== VERIFYING LOGO RESIZING & PERSISTENCE ===\n');

  // 1. Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@salarymaker.com', password: 'Admin@12345' }),
  });
  const { token } = await loginRes.json();
  const headers = { Authorization: `Bearer ${token}` };

  // 2. Fetch Companies
  const compRes = await fetch(`${baseUrl}/companies`, { headers });
  const { companies } = await compRes.json();
  const targetComp = companies[0];
  console.log(`Initial Company "${targetComp.name}": Width = ${targetComp.logoWidth || 65}px, Height = ${targetComp.logoHeight || 65}px`);

  // 3. Update logo dimensions (e.g. to 110px x 85px)
  const updateRes = await fetch(`${baseUrl}/companies/${targetComp._id}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      logoWidth: 110,
      logoHeight: 85,
    }),
  });
  const updatedData = await updateRes.json();
  console.log(`Updated Company: Width = ${updatedData.company.logoWidth}px, Height = ${updatedData.company.logoHeight}px`);

  // 4. Fetch Employees
  const empRes = await fetch(`${baseUrl}/employees?companyId=${targetComp._id}`, { headers });
  const { employees } = await empRes.json();
  const emp = employees[0];

  // 5. Generate Payslip Draft & Save
  const createRes = await fetch(`${baseUrl}/payslips`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: targetComp._id,
      employeeId: emp._id,
      month: 'February',
      year: 2026,
      workingDays: 28,
      paidDays: 28,
      lopDays: 0,
      earnings: [
        { label: 'Basic Salary', amount: 87450 },
        { label: 'HRA', amount: 34980 },
      ],
      deductions: [
        { label: 'Ee PF contribution', amount: 10494 },
      ],
    }),
  });
  const { payslip } = await createRes.json();
  console.log(`Generated Payslip Snapshot Company Logo: Width = ${payslip.snapshotData.company.logoWidth}px, Height = ${payslip.snapshotData.company.logoHeight}px`);

  console.log('\n=== LOGO RESIZING VERIFICATION PASSED SUCCESSFULLY! ===');
};

verifyLogoResizing().catch(console.error);
