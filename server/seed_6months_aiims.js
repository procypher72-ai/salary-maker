// Seed all 6 months (September 2025 to February 2026) for AMITESH KUMAR YADAV (AIIMS) matching PDF pages 1-6

const mongoose = require('mongoose');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const Payslip = require('./models/Payslip');
const { numberToWords } = require('./utils/numberToWords');

const seedAiims6Months = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/salary_maker');
    console.log('MongoDB connected for seeding AIIMS 6 months payslips...');

    let aiimsComp = await Company.findOne({ name: 'All India Institute Of Medical Sciences' });
    if (!aiimsComp) {
      aiimsComp = await Company.create({
        name: 'All India Institute Of Medical Sciences',
        email: 'accounts@aiims.edu',
        phone: '+91 (011) 2658-8500',
        fullAddress: 'Sri Aurobindo Marg, Ansari Nagar, Ansari Nagar East New Delhi, Delhi-110029',
        gstin: '07AAAI1234E1ZZ',
        pan: 'AAAI1234E',
        website: 'https://aiims.edu',
        logoUrl: '',
        templateKey: 'aiims_govt_medical',
        currency: 'Rs.',
        currencyCode: 'INR',
        signatoryName: 'Senior Accounts Officer',
        signatoryDesignation: 'Finance & Accounts Division',
      });
      console.log('Created AIIMS company');
    }

    let amitesh = await Employee.findOne({ companyId: aiimsComp._id, empCode: 'E0400345' });
    if (!amitesh) {
      amitesh = await Employee.create({
        companyId: aiimsComp._id,
        empCode: 'E0400345',
        fullName: 'AMITESH KUMAR YADAV',
        email: 'amitesh.yadav@aiims.edu',
        phone: '+91 98100 11223',
        designation: 'Senior Programmer',
        department: 'IT',
        joiningDate: new Date('2021-08-01'),
        dynamicFields: {
          dealingOffice: 'Faculty Cell',
          payDetails: 'Level 10(15600 - 5400 - 39100)',
          oldSalaryCode: 'JHN163',
          pfmsNo: 'VAININ00359313',
          panNumber: 'AKLPY8113F',
          bankName: 'SBI',
          bankAccount: '20457116529',
          ifscCode: 'SBIN00033211',
          department: 'IT',
          reportDateTime: '02-Mar-2026&11:28 AM',
        },
      });
      console.log('Created AMITESH KUMAR YADAV');
    }

    const commonEarnings = [
      { label: 'Basic', amount: 67400 },
      { label: 'Dearness Allowance', amount: 26960 },
      { label: 'Travelling Allowance', amount: 4800 },
      { label: 'TADA', amount: 1512 },
      { label: 'ICU Allowance', amount: 540 },
      { label: 'Deputation Pay Allowance', amount: 1280 },
      { label: 'Uniform Allowance', amount: 2800 },
      { label: 'Medical Allowance', amount: 3200 },
      { label: 'Nps Employer Earning Share', amount: 15224 },
      { label: 'Other Allowance', amount: 10650 },
    ];

    const getDeductions = (incomeTax) => [
      { label: 'Association Fund Category Amount', amount: 20 },
      { label: 'Emp Health Scheme', amount: 650 },
      { label: 'Emp Insurance Scheme', amount: 60 },
      { label: 'Income Tax', amount: incomeTax },
      { label: 'Miscellaneous Recovery NA', amount: 967 },
      { label: 'New Pension Scehme-110001989995', amount: 10874 },
      { label: 'Nps Employer Ded Share', amount: 15224 },
      { label: 'Water Charges', amount: 82 },
    ];

    const monthsData = [
      { month: 'September', year: 2025, it: 7357, reportTime: '02-Mar-2026&11:28 AM' },
      { month: 'October', year: 2025, it: 7411, reportTime: '02-Mar-2026&11:28 AM' },
      { month: 'November', year: 2025, it: 7116, reportTime: '02-Mar-2026&11:29 AM' },
      { month: 'December', year: 2025, it: 7576, reportTime: '02-Mar-2026&11:29 AM' },
      { month: 'January', year: 2026, it: 6984, reportTime: '02-Mar-2026&11:30 AM' },
      { month: 'February', year: 2026, it: 7418, reportTime: '02-Mar-2026&11:30 AM' },
    ];

    for (const m of monthsData) {
      const deductions = getDeductions(m.it);
      const gross = commonEarnings.reduce((s, i) => s + i.amount, 0);
      const totalDed = deductions.reduce((s, i) => s + i.amount, 0);
      const net = Math.max(0, gross - totalDed);
      const words = numberToWords(net, 'Rupees');

      const snapshot = {
        company: {
          name: aiimsComp.name,
          email: aiimsComp.email,
          phone: aiimsComp.phone,
          fullAddress: aiimsComp.fullAddress,
          gstin: aiimsComp.gstin,
          pan: aiimsComp.pan,
          website: aiimsComp.website,
          logoUrl: aiimsComp.logoUrl,
          logoWidth: aiimsComp.logoWidth || 65,
          logoHeight: aiimsComp.logoHeight || 65,
          logoPosition: aiimsComp.logoPosition || 'left',
          logoOffsetX: aiimsComp.logoOffsetX || 0,
          logoOffsetY: aiimsComp.logoOffsetY || 0,
          currency: 'Rs.',
          signatoryName: aiimsComp.signatoryName,
          signatoryDesignation: aiimsComp.signatoryDesignation,
          templateKey: 'aiims_govt_medical',
        },
        employee: {
          empCode: amitesh.empCode,
          fullName: amitesh.fullName,
          email: amitesh.email,
          phone: amitesh.phone,
          designation: amitesh.designation,
          department: amitesh.department,
          joiningDate: amitesh.joiningDate,
          dynamicFields: {
            dealingOffice: 'Faculty Cell',
            payDetails: 'Level 10(15600 - 5400 - 39100)',
            oldSalaryCode: 'JHN163',
            pfmsNo: 'VAININ00359313',
            panNumber: 'AKLPY8113F',
            bankName: 'SBI',
            bankAccount: '20457116529',
            ifscCode: 'SBIN00033211',
            department: 'IT',
            reportDateTime: m.reportTime,
          },
        },
      };

      await Payslip.findOneAndUpdate(
        { companyId: aiimsComp._id, employeeId: amitesh._id, month: m.month, year: m.year },
        {
          companyId: aiimsComp._id,
          employeeId: amitesh._id,
          month: m.month,
          year: m.year,
          payPeriod: `${m.month} ${m.year}`,
          workingDays: 30,
          paidDays: 30,
          lopDays: 0,
          earnings: commonEarnings,
          deductions: deductions,
          grossEarnings: gross,
          totalDeductions: totalDed,
          netSalary: net,
          netSalaryInWords: words,
          snapshotData: snapshot,
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded AIIMS Payslip: ${m.month} ${m.year} for AMITESH KUMAR YADAV (Net: Rs. ${net.toLocaleString('en-IN')})`);
    }

    console.log('\n=== ALL 6 MONTHS OF AIIMS SEEDED SUCCESSFULLY ===');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding AIIMS 6 months:', err.message);
    process.exit(1);
  }
};

seedAiims6Months();
