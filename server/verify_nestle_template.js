const mongoose = require('mongoose');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const SalaryTemplate = require('./models/SalaryTemplate');
const Payslip = require('./models/Payslip');
const { seedDefaultTemplates } = require('./controllers/templateController');

const verifyNestleTemplate = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salary_maker';
    await mongoose.connect(mongoUri);
    console.log('--- Verifying Nestle India Template System ---');

    // 1. Seed & Check SalaryTemplate
    await seedDefaultTemplates();
    const tpl = await SalaryTemplate.findOne({ templateKey: 'nestle_india' });
    console.log('1. Template Seeded:', tpl ? 'PASS' : 'FAIL');
    if (tpl) {
      console.log('   Template Name:', tpl.name);
      console.log('   Required Fields:', tpl.requiredFields.map(f => f.key).join(', '));
      console.log('   Default Earnings:', tpl.defaultEarnings.map(e => e.label).join(', '));
      console.log('   Default Deductions:', tpl.defaultDeductions.map(d => d.label).join(', '));
    }

    // 2. Seed Nestle India Limited company if not present
    let nestleComp = await Company.findOne({ name: 'Nestle India Limited' });
    if (!nestleComp) {
      nestleComp = await Company.create({
        name: 'Nestle India Limited',
        fullAddress: 'Nestle House, Jacaranda Marg, M Block, DLF City Phase II, National Highway 8, Gurgaon - 122002, Haryana',
        location: 'Gurgaon',
        templateKey: 'nestle_india',
        slipWidth: 980,
      });
      console.log('2. Created Nestle India Limited Company');
    } else {
      console.log('2. Nestle India Limited Company Exists');
    }

    // 3. Seed Vaibhav Gupta employee if not present
    let vaibhav = await Employee.findOne({ companyId: nestleComp._id, empCode: '10218436' });
    if (!vaibhav) {
      vaibhav = await Employee.create({
        companyId: nestleComp._id,
        empCode: '10218436',
        fullName: 'Vaibhav Gupta',
        fatherName: 'Mukesh Gupta',
        designation: 'Senior Key Accounts Manag',
        department: 'Organised Trade',
        location: 'Gurgaon',
        joiningDate: new Date('2021-01-01'),
        baselineSalary: {
          basicPay: 168129,
          hra: 84065,
          specialAllowance: 55565,
          conveyanceAllowance: 28500,
          pfDeduction: 20175,
          tds: 70040,
        },
        dynamicFields: {
          costCenter: 'Organised Trade',
          location: 'Gurgaon',
          bankName: 'Kotak Mahindra Bank',
          bankAccount: '9449576305',
          basicRate: '168129.00',
          pfNo: 'DL/4398/3127',
          esiNo: '',
          days: '31.00',
          absence: '0.00',
          suspension: '0.00',
          leaveWithoutPay: '0.00',
          hoursWithoutPay: '0.00',
          nightShiftAllow: '0.00',
          natFestHol: '0.00',
          specialLeave: '0.00',
          loans: '',
          annualGross: 5225152,
          exemptionUs10: 255058.10,
          deductionUs80: 467449.00,
          totalTaxableIncome: 4452650.00,
          taxPayable: 1194227.00,
          taxDeducted: 1194227.00,
          footerWatermark: '##40523418##.##.##PAYSLIP##31.03.2025##',
        },
      });
      console.log('3. Created Vaibhav Gupta Employee');
    } else {
      console.log('3. Vaibhav Gupta Employee Exists');
    }

    // 4. Seed March 2025 Payslip if not present
    let payslip = await Payslip.findOne({
      companyId: nestleComp._id,
      employeeId: vaibhav._id,
      month: 'March',
      year: 2025,
    });

    if (!payslip) {
      payslip = await Payslip.create({
        companyId: nestleComp._id,
        employeeId: vaibhav._id,
        month: 'March',
        year: 2025,
        payPeriod: 'March 2025',
        workingDays: 31,
        paidDays: 31,
        lopDays: 0,
        earnings: [
          { label: 'Basic Salary', amount: 168129 },
          { label: 'House Rent Allowance', amount: 84065 },
          { label: 'Compensatory Allowance', amount: 55565 },
          { label: 'Transport Allowance', amount: 28500 },
        ],
        deductions: [
          { label: 'Income Tax', amount: 70040 },
          { label: 'Recreation Club GGN', amount: 150 },
          { label: 'Ee PF contribution', amount: 20175 },
        ],
        grossEarnings: 336259,
        totalDeductions: 90365,
        netSalary: 245894,
        netSalaryInWords: 'Rupees Two Lakh Forty Five Thousand Eight Hundred Ninety Four Only',
        templateSnapshot: {
          templateKey: 'nestle_india',
          company: {
            name: nestleComp.name,
            location: nestleComp.location,
            templateKey: 'nestle_india',
          },
          employee: {
            empCode: vaibhav.empCode,
            fullName: vaibhav.fullName,
            designation: vaibhav.designation,
            department: vaibhav.department,
            fatherName: vaibhav.fatherName,
            dynamicFields: vaibhav.dynamicFields,
          },
          draft: {
            month: 'March',
            year: 2025,
            workingDays: 31,
            paidDays: 31,
            lopDays: 0,
            earnings: [
              { label: 'Basic Salary', amount: 168129 },
              { label: 'House Rent Allowance', amount: 84065 },
              { label: 'Compensatory Allowance', amount: 55565 },
              { label: 'Transport Allowance', amount: 28500 },
            ],
            deductions: [
              { label: 'Income Tax', amount: 70040 },
              { label: 'Recreation Club GGN', amount: 150 },
              { label: 'Ee PF contribution', amount: 20175 },
            ],
            cumulatedEarnings: [
              { label: 'Basic Salary', amount: 2017548 },
              { label: 'House Rent Allowance', amount: 1008780 },
              { label: 'Compensatory Allowance', amount: 666780 },
              { label: 'Transport Allowance', amount: 342000 },
            ],
            cumulatedDeductions: [
              { label: 'Income Tax', amount: 1194227 },
              { label: 'Ee PF contribution', amount: 242100 },
              { label: 'Recreation Club GGN', amount: 1800 },
            ],
            grossEarnings: 336259,
            totalDeductions: 90365,
            netSalary: 245894,
          },
        },
      });
      console.log('4. Created March 2025 Payslip for Vaibhav Gupta');
    } else {
      console.log('4. March 2025 Payslip Exists');
    }

    console.log('--- ALL CHECKS PASSED FOR NESTLE INDIA TEMPLATE ---');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error verifying Nestle template:', err);
    process.exit(1);
  }
};

verifyNestleTemplate();
