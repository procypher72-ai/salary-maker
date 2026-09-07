async function testComputationAPI() {
  try {
    console.log('Testing Computation API with Node fetch...');
    // Login to get token
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@salarymaker.com',
        password: 'Admin@12345',
      }),
    });

    const loginData = await loginRes.json();
    const token = loginData.token;
    if (!token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    console.log('Logged in successfully, token received.');

    // Fetch employees & companies
    const empRes = await fetch('http://localhost:5000/api/employees', {
      headers: authHeaders,
    });
    const empData = await empRes.json();
    const employees = empData.employees;
    if (!employees || employees.length === 0) {
      console.log('No employees found to test.');
      return;
    }

    const testEmp = employees[0];
    console.log(`Using Employee: ${testEmp.fullName} (${testEmp._id})`);

    // Test aggregate-salary
    const aggRes = await fetch(
      `http://localhost:5000/api/computations/aggregate-salary?employeeId=${testEmp._id}&financialYear=2025-2026`,
      { headers: authHeaders }
    );
    const aggData = await aggRes.json();
    console.log('Aggregate Salary Response:', {
      success: aggData.success,
      isFromPayslips: aggData.data?.isFromPayslips,
      salaryDetails: aggData.data?.salaryDetails,
    });

    // Test creating a computation
    const newCompPayload = {
      companyId: testEmp.companyId._id || testEmp.companyId,
      employeeId: testEmp._id,
      financialYear: '2025-2026',
      assessmentYear: '2026-2027',
      regime: 'new_115bac',
      returnType: 'ORIGINAL',
      filingSection: '139(1)',
      filingDueDate: '31/07/2026',
      personalDetails: aggData.data?.personalDetails || {},
      headsOfIncome: {
        salary: aggData.data?.salaryDetails || {},
        houseProperty: { netIncome: 0 },
        businessProfession: { netProfit: 0 },
        capitalGains: { netGains: 0 },
        otherSources: {
          interestSavings: 22554,
          interestFdr: 47643,
          totalOtherSources: 70197,
          breakdown: [
            { label: 'Interest on Bank Savings', amount: 22554 },
            { label: 'Interest on Bank FDR', amount: 47643 },
          ],
        },
      },
      grossTotalIncome: 1712721,
      deductionsChapterVIA: [],
      totalDeductionsChapterVIA: 0,
      totalIncome: 1712721,
      roundedTotalIncome: 1712720,
      taxableNormalRate: 1712720,
      taxableSpecialRate: 0,
      taxCalculation: {
        basicExemptionLimit: 400000,
        taxAtNormalRates: 142544,
        totalTax: 142544,
        rebate87A: 0,
        taxAfterRebate: 142544,
        cess: 5702,
        totalTaxWithCess: 148246,
        interest234A: 0,
        interest234B: 5928,
        interest234BDetails: '5928[4M]+0[0M]',
        interest234C: 7482,
        interest234CDetails: '666+2001+3333+1482',
        totalInterest: 13410,
        totalTaxAndInterest: 161656,
        taxDeposited140A: 161656,
        totalTaxesPaid: 161656,
        amountPayable: 0,
        amountRefundable: 0,
        taxRoundedOff: 0,
      },
      challans: [
        {
          type: '140A',
          bankBranch: 'BANK OF INDIA-SECTOR 47C, CHANDIGARH',
          bsrCode: '0006210',
          date: '27/07/2026',
          challanNo: '00652',
          amount: 161656,
        },
      ],
      templateId: 'kdk_zenit',
      verifiedBy: testEmp.fullName,
    };

    const createRes = await fetch('http://localhost:5000/api/computations', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newCompPayload),
    });
    const createData = await createRes.json();
    console.log('Created computation response:', {
      success: createData.success,
      id: createData.computation?._id,
    });

    // Test list computations
    const listRes = await fetch('http://localhost:5000/api/computations', {
      headers: authHeaders,
    });
    const listData = await listRes.json();
    console.log('Total Computations found in DB:', listData.count);

    console.log('✅ All Computation Backend API tests passed successfully!');
  } catch (err) {
    console.error('❌ API Test Failed:', err);
  }
}

testComputationAPI();
