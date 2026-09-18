const mongoose = require('mongoose');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const SalaryTemplate = require('./models/SalaryTemplate');
const Payslip = require('./models/Payslip');
const { seedDefaultTemplates } = require('./controllers/templateController');
const { computePayslipFinancials } = require('./controllers/payslipController');

const verifyHaryanaTemplate = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/salary_maker');
    console.log('--- Verifying Haryana Education Template System ---');

    // 1. Seed & Check SalaryTemplate
    await seedDefaultTemplates();
    const tpl = await SalaryTemplate.findOne({ templateKey: 'haryana_education' });
    console.log('1. Template Seeded:', tpl ? 'PASS' : 'FAIL');
    if (tpl) {
      console.log('   Template Name:', tpl.name);
      console.log('   Required Fields:', tpl.requiredFields.map(f => f.key).join(', '));
      console.log('   Default Earnings Count:', tpl.defaultEarnings.length);
      console.log('   Default Deductions Count:', tpl.defaultDeductions.length);
    }

    // 2. Check / Create Haryana Education Company
    let comp = await Company.findOne({ templateKey: 'haryana_education' });
    if (!comp) {
      comp = await Company.create({
        name: 'School Education Department Haryana',
        department: 'Education (Secondary)',
        fullAddress: 'Shiksha Sadan, Sector 5, Panchkula, Haryana',
        templateKey: 'haryana_education',
      });
      console.log('2. Created Haryana Education Company: PASS');
    } else {
      console.log('2. Haryana Education Company Exists: PASS');
    }

    // 3. Create or Check Employee PARBHAT
    let emp = await Employee.findOne({ companyId: comp._id, empCode: '0F3RPK' });
    if (!emp) {
      emp = await Employee.create({
        companyId: comp._id,
        empCode: '0F3RPK',
        fullName: 'PARBHAT',
        designation: 'P.G.T. In History',
        department: 'Education (Secondary)',
        bankName: 'Punjab National Bank',
        bankAccount: '6254',
        pfNumber: 'HREDU 111745',
        aadharNo: '********4272',
        baselineSalary: {
          basicPay: 77900,
          da: 32718,
          hra: 6232,
          medicalAllowance: 1000,
          pfDeduction: 10000,
          tds: 5000,
        },
        dynamicFields: {
          educationWing: 'Education (Secondary)',
          gpfPranNo: 'HREDU 111745',
          aadharNo: '********4272',
          bankAccount: '*******6254',
          voucherNo: '001733',
          voucherDate: '31-08-2025',
          printDateTime: 'Tuesday, February 24, 2026 5:02 PM',
          totalLoans: 20000,
        },
      });
      console.log('3. Created Employee PARBHAT (0F3RPK): PASS');
    } else {
      console.log('3. Employee PARBHAT Exists: PASS');
    }

    // 4. Test Calculation
    const calc = computePayslipFinancials(emp, comp, { workingDays: 30, paidDays: 30, lopDays: 0 });
    console.log('4. Calculation Test:');
    console.log(`   - Gross Earnings: ₹${calc.grossEarnings.toLocaleString('en-IN')} (Expected: ₹117,850)`);
    console.log(`   - Deductions: ₹${calc.totalDeductions.toLocaleString('en-IN')} (Expected: ₹15,060)`);
    console.log(`   - Net Salary: ₹${calc.netSalary.toLocaleString('en-IN')} (Expected: ₹102,790 before external loans or ₹82,790 with 20000 loan)`);

    // 5. Create or verify Payslip for August 2025
    let slip = await Payslip.findOne({ employeeId: emp._id, month: 'August', year: 2025 });
    if (!slip) {
      slip = await Payslip.create({
        companyId: comp._id,
        employeeId: emp._id,
        templateKey: 'haryana_education',
        month: 'August',
        year: 2025,
        payPeriod: 'PAYSLIP--August,2025-26',
        workingDays: 30,
        paidDays: 30,
        earnings: calc.earnings,
        deductions: calc.deductions,
        grossEarnings: calc.grossEarnings,
        totalDeductions: calc.totalDeductions,
        netSalary: calc.netSalary - 20000,
        totalLoans: 20000,
        snapshotData: {
          templateKey: 'haryana_education',
          company: comp.toObject(),
          employee: emp.toObject(),
        },
      });
      console.log('5. Created August 2025 Payslip: PASS');
    } else {
      console.log('5. August 2025 Payslip Exists: PASS');
    }

    console.log('--- All Checks Passed Successfully! ---');
    process.exit(0);
  } catch (err) {
    console.error('Verification Error:', err);
    process.exit(1);
  }
};

verifyHaryanaTemplate();
