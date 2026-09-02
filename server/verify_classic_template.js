// Test Classic Tabular Template & Arunima Seed Data

const verifyClassicTabular = async () => {
  const baseUrl = 'http://localhost:5000/api';

  console.log('=== VERIFYING CLASSIC TABULAR (PDF REPLICA) TEMPLATE ===\n');

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
  console.log('Available Templates in Collection:');
  templates.forEach((t) => console.log(` - ${t.name} (${t.templateKey})`));

  // 3. Fetch Companies
  const compRes = await fetch(`${baseUrl}/companies`, { headers });
  const { companies } = await compRes.json();
  console.log('\nAvailable Companies:');
  companies.forEach((c) => console.log(` - ${c.name} [Template: ${c.templateKey}]`));

  // 4. Fetch Employees
  const empRes = await fetch(`${baseUrl}/employees`, { headers });
  const { employees } = await empRes.json();
  console.log('\nAvailable Employees:');
  employees.forEach((e) => console.log(` - ${e.fullName} (${e.empCode}) - Company: ${e.companyId?.name || e.companyId}`));

  console.log('\n=== VERIFICATION COMPLETE ===');
};

verifyClassicTabular().catch(console.error);
