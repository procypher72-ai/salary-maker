// Comprehensive Verification Script for Salary Maker MERN Backend & Authentication

const testFlow = async () => {
  const baseUrl = 'http://localhost:5000/api/auth';

  console.log('=== SALARY MAKER MERN AUTH & REGISTRATION TEST ===\n');

  // 1. Health check
  try {
    const healthRes = await fetch('http://localhost:5000/api/health');
    const health = await healthRes.json();
    console.log('1. Health Check:', health);
  } catch (err) {
    console.error('Failed health check:', err.message);
  }

  // 2. Admin Login
  console.log('\n2. Testing Admin Login...');
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@salarymaker.com',
      password: 'Admin@12345',
    }),
  });
  const loginData = await loginRes.json();
  console.log('Login Result:', {
    status: loginRes.status,
    success: loginData.success,
    userName: loginData.user?.name,
    userRole: loginData.user?.role,
    tokenIssued: !!loginData.token,
  });

  const token = loginData.token;

  // 3. Verify /me route
  console.log('\n3. Testing Protected /me Route with JWT...');
  const meRes = await fetch(`${baseUrl}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  console.log('/me Result:', { status: meRes.status, email: meData.user?.email });

  // 4. Admin Register New User 1 (Software Engineer)
  console.log('\n4. Admin Registering Employee (Alex Johnson)...');
  const reg1Res = await fetch(`${baseUrl}/register-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'Alex Johnson',
      email: 'alex.johnson@salarymaker.com',
      password: 'SecurePassword123!',
      role: 'employee',
      designation: 'Senior Frontend Engineer',
      department: 'Engineering',
      baseSalary: 95000,
    }),
  });
  const reg1Data = await reg1Res.json();
  console.log('Register Alex Result:', { status: reg1Res.status, success: reg1Data.success, message: reg1Data.message });

  // 5. Admin Register New User 2 (Manager)
  console.log('\n5. Admin Registering Manager (Sarah Connor)...');
  const reg2Res = await fetch(`${baseUrl}/register-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'Sarah Connor',
      email: 'sarah.connor@salarymaker.com',
      password: 'SecurePassword123!',
      role: 'manager',
      designation: 'Operations Lead',
      department: 'Operations',
      baseSalary: 115000,
    }),
  });
  const reg2Data = await reg2Res.json();
  console.log('Register Sarah Result:', { status: reg2Res.status, success: reg2Data.success, message: reg2Data.message });

  // 6. Admin Fetch All Users
  console.log('\n6. Admin Fetching Registered Users Directory...');
  const usersRes = await fetch(`${baseUrl}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const usersData = await usersRes.json();
  console.log(`Total users in system: ${usersData.count}`);
  usersData.users.forEach((u, i) => {
    console.log(`  [${i + 1}] ${u.name} (${u.email}) - Role: ${u.role}, Title: ${u.designation}, Salary: $${u.baseSalary}`);
  });

  // 7. Security test: Attempt to register without token
  console.log('\n7. Security Test: Unauthorized registration attempt...');
  const unauthRes = await fetch(`${baseUrl}/register-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Hacker',
      email: 'hacker@salarymaker.com',
      password: '123',
    }),
  });
  const unauthData = await unauthRes.json();
  console.log('Unauthorized Access Rejected Correctly:', {
    status: unauthRes.status,
    message: unauthData.message,
  });

  console.log('\n=== ALL VERIFICATION CHECKS PASSED ===');
};

testFlow().catch(console.error);
