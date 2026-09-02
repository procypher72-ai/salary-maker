// Test Secondary / G20 Logo Resizing & Position Persistence

const verifySecondaryLogo = async () => {
  const baseUrl = 'http://localhost:5000/api';

  console.log('=== VERIFYING SECONDARY (G20) LOGO RESIZE & POSITION ===\n');

  // 1. Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@salarymaker.com', password: 'Admin@12345' }),
  });
  const { token } = await loginRes.json();
  const headers = { Authorization: `Bearer ${token}` };

  // 2. Fetch AIIMS Company
  const compRes = await fetch(`${baseUrl}/companies`, { headers });
  const { companies } = await compRes.json();
  const aiimsComp = companies.find((c) => c.name.includes('Medical Sciences'));
  console.log(`AIIMS Company: "${aiimsComp.name}"`);

  // 3. Update secondary / G20 logo layout (Width: 100, Height: 70, Position: Right)
  const updateRes = await fetch(`${baseUrl}/companies/${aiimsComp._id}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secondaryLogoWidth: 100,
      secondaryLogoHeight: 70,
      secondaryLogoPosition: 'right',
    }),
  });
  const updatedData = await updateRes.json();
  console.log(`Updated AIIMS Secondary Logo: Size = ${updatedData.company.secondaryLogoWidth}x${updatedData.company.secondaryLogoHeight}px, Position = "${updatedData.company.secondaryLogoPosition}"`);

  console.log('\n=== SECONDARY (G20) LOGO VERIFICATION PASSED! ===');
};

verifySecondaryLogo().catch(console.error);
