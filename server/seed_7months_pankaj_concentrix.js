// Seed all 7 months (April 2025 to October 2025) for Pankaj Sharma (Concentrix Daksh) matching PDF pages 1-7

const mongoose = require('mongoose');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const Payslip = require('./models/Payslip');
const SalaryTemplate = require('./models/SalaryTemplate');
const { seedDefaultTemplates } = require('./controllers/templateController');
const { numberToWords } = require('./utils/numberToWords');

const seedConcentrix7Months = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/salary_maker');
    console.log('MongoDB connected for seeding Concentrix Daksh 7 months payslips...');

    // 1. Seed templates to ensure concentrix_daksh exists in DB
    await seedDefaultTemplates();

    // 2. Create or find Concentrix Company
    let cnxComp = await Company.findOne({ name: 'CONCENTRIX DAKSH SERVICES INDIA PRIVATE LIMITED' });
    if (!cnxComp) {
      cnxComp = await Company.create({
        name: 'CONCENTRIX DAKSH SERVICES INDIA PRIVATE LIMITED',
        email: 'hr@concentrix.com',
        phone: '+91 (011) 4567-8900',
        fullAddress: '1st Floor, Red Fort Capital Parsvnath Towers, Bhai Vir Singh Marg, Gole Market, Connaught Place, New Delhi110001, India',
        gstin: '07AAACC1234D1ZZ',
        pan: 'AAACC1234D',
        website: 'https://www.concentrix.com',
        logoUrl: '',
        templateKey: 'concentrix_daksh',
        currency: '₹',
        currencyCode: 'INR',
        signatoryName: 'Authorized Signatory',
        signatoryDesignation: 'Head of Human Resources',
      });
      console.log('Created Concentrix company');
    }

    // 3. Create or find Pankaj Sharma Employee
    let pankaj = await Employee.findOne({ companyId: cnxComp._id, empCode: '306007' });
    if (!pankaj) {
      pankaj = await Employee.create({
        companyId: cnxComp._id,
        empCode: '306007',
        fullName: 'Pankaj Sharma',
        email: 'pankaj.sharma@concentrix.com',
        phone: '+91 98765 43210',
        designation: 'Lead Business Analyst',
        department: 'Business Analysis',
        joiningDate: new Date('2022-10-10'),
        dynamicFields: {
          joiningDateStr: '10 Oct 2022',
          location: 'Chandigarh',
          bankName: 'SBI',
          bankAccount: '40777179100',
          panNumber: 'NJSPS5596H',
          pfNumber: 'PB/CHD/29780/38538',
          uanNumber: '101719643567',
        },
        baselineSalary: {
          basicPay: 98000,
          hra: 39200,
          specialAllowance: 41905,
          medicalAllowance: 2500,
          otherAllowances: 16337,
          pfDeduction: 1800,
          professionalTax: 200,
          tds: 39647,
        },
      });
      console.log('Created Pankaj Sharma employee');
    }

    const commonEarnings = [
      { label: 'BASIC', amount: 98000, fullAmount: 98000 },
      { label: 'HRA', amount: 39200, fullAmount: 39200 },
      { label: 'LTA', amount: 16337, fullAmount: 16337 },
      { label: 'SPECIAL ALLOWANCE', amount: 41905, fullAmount: 41905 },
      { label: 'RMEDICAL ALLOWANCE', amount: 2500, fullAmount: 2500 },
    ];

    const getDeductions = (incomeTax) => [
      { label: 'PF', amount: 1800 },
      { label: 'PROF TAX', amount: 200 },
      { label: 'INCOME TAX', amount: incomeTax },
    ];

    const monthsData = [
      { month: 'April', year: 2025, days: 30, it: 39647 },
      { month: 'May', year: 2025, days: 31, it: 41153 },
      { month: 'June', year: 2025, days: 30, it: 39381 },
      { month: 'July', year: 2025, days: 31, it: 38963 },
      { month: 'August', year: 2025, days: 31, it: 40123 },
      { month: 'September', year: 2025, days: 30, it: 38296 },
      { month: 'October', year: 2025, days: 31, it: 41157 },
    ];

    for (const m of monthsData) {
      const deductions = getDeductions(m.it);
      const gross = commonEarnings.reduce((s, i) => s + i.amount, 0);
      const totalDed = deductions.reduce((s, i) => s + i.amount, 0);
      const net = Math.max(0, gross - totalDed);
      const words = numberToWords(net, 'Rupees');

      const existing = await Payslip.findOne({
        employeeId: pankaj._id,
        month: m.month,
        year: m.year,
      });

      const slipData = {
        companyId: cnxComp._id,
        employeeId: pankaj._id,
        month: m.month,
        year: m.year,
        payPeriod: `${m.month} ${m.year}`,
        workingDays: m.days,
        paidDays: m.days,
        lopDays: 0,
        earnings: commonEarnings,
        deductions: deductions,
        grossEarnings: gross,
        totalDeductions: totalDed,
        netSalary: net,
        netSalaryInWords: words,
        status: 'generated',
        snapshotData: {
          company: {
            name: cnxComp.name,
            fullAddress: cnxComp.fullAddress,
            gstin: cnxComp.gstin,
            pan: cnxComp.pan,
            logoUrl: cnxComp.logoUrl,
            currency: '₹',
            templateKey: 'concentrix_daksh',
          },
          employee: {
            empCode: pankaj.empCode,
            fullName: pankaj.fullName,
            designation: pankaj.designation,
            department: pankaj.department,
            joiningDate: pankaj.joiningDate,
            dynamicFields: pankaj.dynamicFields,
          },
          templateKey: 'concentrix_daksh',
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

    console.log('\n✅ Concentrix Daksh 7 months payslips successfully seeded for Pankaj Sharma!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Concentrix payslips:', err);
    process.exit(1);
  }
};

seedConcentrix7Months();
