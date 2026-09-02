// Seed all 6 months (January to June 2026) for Hardeep Singh matching PDF pages 1-6

const mongoose = require('mongoose');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const Payslip = require('./models/Payslip');
const { numberToWords } = require('./utils/numberToWords');

const seedHardeep6Months = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/salary_maker');
    console.log('MongoDB connected for seeding 6 months payslips...');

    const hclComp = await Company.findOne({ name: 'HCL Technologies Ltd.' });
    if (!hclComp) {
      console.log('HCL Technologies Ltd. company not found.');
      process.exit(1);
    }

    const hardeep = await Employee.findOne({ companyId: hclComp._id, empCode: 'S285679' });
    if (!hardeep) {
      console.log('Hardeep Singh employee not found.');
      process.exit(1);
    }

    const monthsData = [
      {
        month: 'January',
        year: 2026,
        workingDays: 31,
        paidDays: 31,
        lopDays: 0,
        payPeriod: '01.01.2026 to 31.01.2026',
        earnings: [
          { label: 'Basic Salary', amount: 87450 },
          { label: 'HRA', amount: 34980 },
          { label: 'Travel Allowance', amount: 22600 },
          { label: 'Holiday Allowance', amount: 9500 },
          { label: 'Food Wallet', amount: 4500 },
          { label: 'Incentives', amount: 45213 },
        ],
        deductions: [
          { label: 'Ee PF contribution', amount: 10494 },
          { label: 'Prof Tax - split period', amount: 200 },
          { label: 'Income Tax', amount: 36586 },
        ],
      },
      {
        month: 'February',
        year: 2026,
        workingDays: 28,
        paidDays: 28,
        lopDays: 0,
        payPeriod: '01.02.2026 to 28.02.2026',
        earnings: [
          { label: 'Basic Salary', amount: 87450 },
          { label: 'HRA', amount: 34980 },
          { label: 'Travel Allowance', amount: 22600 },
          { label: 'Holiday Allowance', amount: 9500 },
          { label: 'Food Wallet', amount: 4500 },
          { label: 'Incentives', amount: 45310 },
        ],
        deductions: [
          { label: 'Ee PF contribution', amount: 10494 },
          { label: 'Prof Tax - split period', amount: 200 },
          { label: 'Income Tax', amount: 39178 },
        ],
      },
      {
        month: 'March',
        year: 2026,
        workingDays: 31,
        paidDays: 31,
        lopDays: 0,
        payPeriod: '01.03.2026 to 31.03.2026',
        earnings: [
          { label: 'Basic Salary', amount: 87450 },
          { label: 'HRA', amount: 34980 },
          { label: 'Travel Allowance', amount: 22600 },
          { label: 'Holiday Allowance', amount: 9500 },
          { label: 'Food Wallet', amount: 4500 },
          { label: 'Incentives', amount: 48772 },
        ],
        deductions: [
          { label: 'Ee PF contribution', amount: 10494 },
          { label: 'Prof Tax - split period', amount: 200 },
          { label: 'Income Tax', amount: 40145 },
        ],
      },
      {
        month: 'April',
        year: 2026,
        workingDays: 30,
        paidDays: 30,
        lopDays: 0,
        payPeriod: '01.04.2026 to 30.04.2026',
        earnings: [
          { label: 'Basic Salary', amount: 87450 },
          { label: 'HRA', amount: 34980 },
          { label: 'Travel Allowance', amount: 22600 },
          { label: 'Holiday Allowance', amount: 9500 },
          { label: 'Food Wallet', amount: 4500 },
          { label: 'Incentives', amount: 43391 },
        ],
        deductions: [
          { label: 'Ee PF contribution', amount: 10494 },
          { label: 'Prof Tax - split period', amount: 200 },
          { label: 'Income Tax', amount: 37259 },
        ],
      },
      {
        month: 'May',
        year: 2026,
        workingDays: 31,
        paidDays: 31,
        lopDays: 0,
        payPeriod: '01.05.2026 to 31.05.2026',
        earnings: [
          { label: 'Basic Salary', amount: 87450 },
          { label: 'HRA', amount: 34980 },
          { label: 'Travel Allowance', amount: 22600 },
          { label: 'Holiday Allowance', amount: 9500 },
          { label: 'Food Wallet', amount: 4500 },
          { label: 'Incentives', amount: 45777 },
        ],
        deductions: [
          { label: 'Ee PF contribution', amount: 10494 },
          { label: 'Prof Tax - split period', amount: 200 },
          { label: 'Income Tax', amount: 35982 },
        ],
      },
      {
        month: 'June',
        year: 2026,
        workingDays: 30,
        paidDays: 30,
        lopDays: 0,
        payPeriod: '01.06.2026 to 30.06.2026',
        earnings: [
          { label: 'Basic Salary', amount: 87450 },
          { label: 'HRA', amount: 34980 },
          { label: 'Travel Allowance', amount: 22600 },
          { label: 'Holiday Allowance', amount: 9500 },
          { label: 'Food Wallet', amount: 4500 },
          { label: 'Incentives', amount: 46674 },
        ],
        deductions: [
          { label: 'Ee PF contribution', amount: 10494 },
          { label: 'Prof Tax - split period', amount: 200 },
          { label: 'Income Tax', amount: 37748 },
        ],
      },
    ];

    for (const data of monthsData) {
      const gross = data.earnings.reduce((s, i) => s + i.amount, 0);
      const totalDed = data.deductions.reduce((s, i) => s + i.amount, 0);
      const net = Math.max(0, gross - totalDed);
      const words = numberToWords(net, 'Rupees');

      const snapshot = {
        company: {
          name: hclComp.name,
          email: hclComp.email,
          phone: hclComp.phone,
          fullAddress: hclComp.fullAddress,
          gstin: hclComp.gstin,
          pan: hclComp.pan,
          website: hclComp.website,
          logoUrl: hclComp.logoUrl,
          logoWidth: hclComp.logoWidth || 65,
          logoHeight: hclComp.logoHeight || 65,
          logoPosition: hclComp.logoPosition || 'left',
          logoOffsetX: hclComp.logoOffsetX || 0,
          logoOffsetY: hclComp.logoOffsetY || 0,
          currency: hclComp.currency || '₹',
          signatoryName: hclComp.signatoryName,
          signatoryDesignation: hclComp.signatoryDesignation,
          templateKey: hclComp.templateKey || 'hcl_corporate_tech',
        },
        employee: {
          empCode: hardeep.empCode,
          fullName: hardeep.fullName,
          email: hardeep.email,
          phone: hardeep.phone,
          designation: hardeep.designation,
          department: hardeep.department,
          joiningDate: hardeep.joiningDate,
          dynamicFields: hardeep.dynamicFields,
        },
      };

      await Payslip.findOneAndUpdate(
        { companyId: hclComp._id, employeeId: hardeep._id, month: data.month, year: data.year },
        {
          companyId: hclComp._id,
          employeeId: hardeep._id,
          month: data.month,
          year: data.year,
          payPeriod: data.payPeriod,
          workingDays: data.workingDays,
          paidDays: data.paidDays,
          lopDays: data.lopDays,
          earnings: data.earnings,
          deductions: data.deductions,
          grossEarnings: gross,
          totalDeductions: totalDed,
          netSalary: net,
          netSalaryInWords: words,
          snapshotData: snapshot,
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded payslip: ${data.month} ${data.year} for Hardeep Singh (Net: ₹${net.toLocaleString('en-IN')})`);
    }

    console.log('\n=== ALL 6 MONTHS SEEDED SUCCESSFULLY ===');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding 6 months:', err.message);
    process.exit(1);
  }
};

seedHardeep6Months();
