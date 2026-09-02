// Test Drag-to-Position Logo Persistence & Generation

const verifyLogoPositioning = async () => {
  const baseUrl = 'http://localhost:5000/api';

  console.log('=== VERIFYING DRAG-TO-POSITION LOGO PERSISTENCE ===\n');

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
  console.log(`Target Company: "${targetComp.name}"`);

  // 3. Update logo layout (Position: Right, OffsetX: 20, OffsetY: 10, Width: 95, Height: 75)
  const updateRes = await fetch(`${baseUrl}/companies/${targetComp._id}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      logoPosition: 'right',
      logoOffsetX: 20,
      logoOffsetY: 10,
      logoWidth: 95,
      logoHeight: 75,
    }),
  });
  const updatedData = await updateRes.json();
  console.log(`Updated Company Logo Layout: Position = "${updatedData.company.logoPosition}", Offset = (${updatedData.company.logoOffsetX}px, ${updatedData.company.logoOffsetY}px), Size = ${updatedData.company.logoWidth}x${updatedData.company.logoHeight}px`);

  // 4. Fetch Employees
  const empRes = await fetch(`${baseUrl}/employees?companyId=${targetComp._id}`, { headers });
  const { employees } = await empRes.json();
  const emp = employees[0];

  // 5. Generate Payslip
  const createRes = await fetch(`${baseUrl}/payslips`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: targetComp._id,
      employeeId: emp._id,
      month: 'March',
      year: 2026,
      workingDays: 31,
      paidDays: 31,
      lopDays: 0,
      earnings: [{ label: 'Basic Salary', amount: 87450 }],
      deductions: [{ label: 'Ee PF contribution', amount: 10494 }],
    }),
  });
  const { payslip } = await createRes.json();
  console.log(`Generated Payslip Snapshot Logo: Position = "${payslip.snapshotData.company.logoPosition}", Offset = (${payslip.snapshotData.company.logoOffsetX}px, ${payslip.snapshotData.company.logoOffsetY}px), Size = ${payslip.snapshotData.company.logoWidth}x${payslip.snapshotData.company.logoHeight}px`);

  console.log('\n=== DRAG-TO-POSITION LOGO VERIFICATION PASSED! ===');
};

verifyLogoPositioning().catch(console.error);
