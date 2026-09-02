// Seed all 6 months (August 2025 to January 2026) for SURJEET SINGH (Sushma Buildtech) matching PDF pages 1-6

const mongoose = require('mongoose');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const Payslip = require('./models/Payslip');
const SalaryTemplate = require('./models/SalaryTemplate');
const { seedDefaultTemplates } = require('./controllers/templateController');
const { numberToWords } = require('./utils/numberToWords');

const seedSushma6Months = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/salary_maker');
    console.log('MongoDB connected for seeding Sushma Buildtech 6 months payslips...');

    // 1. Seed templates
    await seedDefaultTemplates();

    // 2. Create or find Sushma Buildtech Company
    let sushmaComp = await Company.findOne({ name: 'Sushma Buildtech Limited' });
    if (!sushmaComp) {
      sushmaComp = await Company.create({
        name: 'Sushma Buildtech Limited',
        email: 'hr@sushmabuildtech.com',
        phone: '+91 (0172) 456-7890',
        fullAddress: 'B-107, First Floor, Business Complex at Elante Mall, Industrial Area-1,Chandigarh-160002',
        gstin: '04AABCS1234D1ZZ',
        pan: 'AABCS1234D',
        website: 'https://www.sushmabuildtech.com',
        logoUrl: '',
        templateKey: 'sushma_buildtech',
        currency: '₹',
        currencyCode: 'INR',
        signatoryName: 'Authorized Signatory',
        signatoryDesignation: 'Head of Human Resources',
      });
      console.log('Created Sushma Buildtech company');
    }

    // 3. Create or find Surjeet Singh Employee
    let surjeet = await Employee.findOne({ companyId: sushmaComp._id, empCode: 'S10187' });
    if (!surjeet) {
      surjeet = await Employee.create({
        companyId: sushmaComp._id,
        empCode: 'S10187',
        fullName: 'SURJEET SINGH',
        email: 'surjeet.singh@sushmabuildtech.com',
        phone: '+91 98123 45678',
        designation: 'Sales Analyst',
        department: 'SALES OPERATION',
        joiningDate: new Date('2020-06-01'),
        dynamicFields: {
          employeeCode: 'S10187',
          dateOfJoiningStr: '01 June 2020',
          grade: '28',
          location: 'Chandigarh',
          panNumber: 'FWUPS9092F',
          uanNumber: '101719643698',
          pfNumber: 'PB/CHD/29780/38554',
          esicNumber: '',
          bankAccount: '600810110006815',
          ifscCode: 'BKID0006791',
          standardDays: '31.00',
          lwopDays: '0.00',
          daysWorked: '31.00',
        },
        baselineSalary: {
          basicPay: 62000,
          hra: 31000,
          specialAllowance: 30750,
          medicalAllowance: 8080,
          otherAllowances: 15400,
          pfDeduction: 7440,
          professionalTax: 200,
          tds: 11930,
        },
      });
      console.log('Created SURJEET SINGH employee');
    }

    const monthsData = [
      { month: 'August', year: 2025, days: 31, bonus: 30750, it: 11930 },
      { month: 'September', year: 2025, days: 30, bonus: 31400, it: 11478 },
      { month: 'October', year: 2025, days: 31, bonus: 30200, it: 12650 },
      { month: 'November', year: 2025, days: 30, bonus: 30850, it: 11930 },
      { month: 'December', year: 2025, days: 31, bonus: 32200, it: 11478 },
      { month: 'January', year: 2026, days: 31, bonus: 30850, it: 12230 },
    ];

    for (const m of monthsData) {
      const earnings = [
        { label: 'Basic Salary', amount: 62000, rate: 62000 },
        { label: 'House Rent Allowance', amount: 31000, rate: 31000 },
        { label: 'Other Allowance', amount: 15400, rate: 15400 },
        { label: 'Leave Travel Allowance', amount: 8080, rate: 8080 },
        { label: 'Performance Bonus', amount: m.bonus },
      ];

      const deductions = [
        { label: 'Provident Fund', amount: 7440 },
        { label: 'Professional Tax', amount: 200 },
        { label: 'Income Tax', amount: m.it },
      ];

      const gross = earnings.reduce((s, i) => s + i.amount, 0);
      const totalDed = deductions.reduce((s, i) => s + i.amount, 0);
      const net = Math.max(0, gross - totalDed);
      const words = numberToWords(net, 'Rupees');

      const existing = await Payslip.findOne({
        employeeId: surjeet._id,
        month: m.month,
        year: m.year,
      });

      const slipData = {
        companyId: sushmaComp._id,
        employeeId: surjeet._id,
        month: m.month,
        year: m.year,
        payPeriod: `${m.month} ${m.year}`,
        workingDays: m.days,
        paidDays: m.days,
        lopDays: 0,
        earnings,
        deductions,
        grossEarnings: gross,
        totalDeductions: totalDed,
        netSalary: net,
        netSalaryInWords: words,
        status: 'generated',
        snapshotData: {
          company: {
            name: sushmaComp.name,
            fullAddress: sushmaComp.fullAddress,
            gstin: sushmaComp.gstin,
            pan: sushmaComp.pan,
            logoUrl: sushmaComp.logoUrl,
            currency: '₹',
            templateKey: 'sushma_buildtech',
          },
          employee: {
            empCode: surjeet.empCode,
            fullName: surjeet.fullName,
            designation: surjeet.designation,
            department: surjeet.department,
            joiningDate: surjeet.joiningDate,
            dynamicFields: {
              ...(surjeet.toObject().dynamicFields || {}),
              standardDays: `${m.days}.00`,
              lwopDays: '0.00',
              daysWorked: `${m.days}.00`,
            },
          },
          templateKey: 'sushma_buildtech',
        },
      };

      if (existing) {
        await Payslip.findByIdAndUpdate(existing._id, slipData);
        console.log(`Updated payslip for ${m.month} ${m.year} (Net: ₹${net})`);
      } else {
        await Payslip.create(slipData);
        console.log(`Created payslip for ${m.month} ${m.year} (Net: ₹${net})`);
      }
    }

    console.log('\n✅ Sushma Buildtech 6 months payslips successfully seeded for SURJEET SINGH!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Sushma payslips:', err);
    process.exit(1);
  }
};

seedSushma6Months();
