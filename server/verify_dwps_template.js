const mongoose = require('mongoose');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const SalaryTemplate = require('./models/SalaryTemplate');
const Payslip = require('./models/Payslip');
const { seedDefaultTemplates } = require('./controllers/templateController');

const verifyDwpsTemplate = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/salary_maker');
    console.log('--- Verifying Delhi World Public School Template System ---');

    // 1. Seed & Update SalaryTemplate
    await seedDefaultTemplates();
    const tpl = await SalaryTemplate.findOne({ templateKey: 'delhi_public_school' });
    console.log('1. Template Seeded:', tpl ? 'PASS' : 'FAIL');
    if (tpl) {
      console.log('   Template Name:', tpl.name);
      console.log('   Required Fields:', tpl.requiredFields.map(f => f.key).join(', '));
      console.log('   Default Earnings:', tpl.defaultEarnings.map(e => e.label).join(', '));
      console.log('   Default Deductions:', tpl.defaultDeductions.map(d => d.label).join(', '));
    }

    // 2. Seed / Update Delhi World Public School company
    let dwpsComp = await Company.findOne({
      $or: [
        { name: 'Delhi World Public School' },
        { name: 'Delhi World Public School, Ashta' },
        { templateKey: 'delhi_public_school' }
      ]
    });

    if (!dwpsComp) {
      dwpsComp = await Company.create({
        name: 'Delhi World Public School',
        fullAddress: 'Shujalpur Road Ashta, Dist. Sehore (M.P)',
        templateKey: 'delhi_public_school',
        slipWidth: 794,
      });
      console.log('2. Created Delhi World Public School Company');
    } else {
      dwpsComp.name = 'Delhi World Public School';
      dwpsComp.fullAddress = 'Shujalpur Road Ashta, Dist. Sehore (M.P)';
      dwpsComp.templateKey = 'delhi_public_school';
      await dwpsComp.save();
      console.log('2. Updated Delhi World Public School Company');
    }

    // 3. Seed / Update SUNAINA SHARMA employee
    let sunaina = await Employee.findOne({ companyId: dwpsComp._id, fullName: 'SUNAINA SHARMA' });
    const empData = {
      companyId: dwpsComp._id,
      empCode: '4417',
      fullName: 'SUNAINA SHARMA',
      designation: 'PRINCIPAL',
      bankAccount: '38570100006930',
      panNumber: 'MKRPK2843N',
      joiningDate: new Date('2021-10-21'),
      baselineSalary: {
        basicPay: 40000,
        hra: 6400,
        specialAllowance: 20000,
        medicalAllowance: 500,
        pfDeduction: 7200,
        tds: 5000,
        professionalTax: 200,
      },
      dynamicFields: {
        accountNo: '38570100006930',
        dateOfJoiningStr: '21/10/2021',
        bankDetails: 'BANK OF BARODA(IFSC Code: BARB0VJASHT)',
        bankAddress: 'KANNOD ROAD, ASHTA, DIST.SEHORE, ASHTA - 466116',
        postingOffice: 'DELHI WORLD PUBLIC SCHOOL, ASHTA',
        designation: 'PRINCIPAL',
        empId: '4417',
        panNo: 'MKRPK2843N',
      },
    };

    if (!sunaina) {
      sunaina = await Employee.create(empData);
      console.log('3. Created SUNAINA SHARMA Employee');
    } else {
      Object.assign(sunaina, empData);
      await sunaina.save();
      console.log('3. Updated SUNAINA SHARMA Employee');
    }

    // 4. Seed / Update June 2023 sample payslip exactly matching the official PDF!
    const juneSlipData = {
      companyId: dwpsComp._id,
      employeeId: sunaina._id,
      month: 'June',
      year: 2023,
      payPeriod: '(Period 01/06/2023-30/06/2023)',
      paymentDate: new Date('2023-06-30'),
      workingDays: 30,
      paidDays: 30,
      lopDays: 0,
      earnings: [
        { label: 'Basic', amount: 40000 },
        { label: 'Dearness Allowance', amount: 20000 },
        { label: 'House Rent Allowance', amount: 6400 },
        { label: 'Medical Allowance', amount: 500 },
      ],
      deductions: [
        { label: 'Provident Fund', amount: 7200 },
        { label: 'Income Tax', amount: 5000 },
        { label: 'Proffessional Tax', amount: 200 },
      ],
      grossEarnings: 66900,
      totalDeductions: 12400,
      netSalary: 54500,
      netSalaryInWords: 'Rupees Fifty Four Thousand Five Hundred Only',
      templateKey: 'delhi_public_school',
      snapshotData: {
        company: dwpsComp.toObject(),
        employee: sunaina.toObject(),
        templateKey: 'delhi_public_school',
      },
    };

    let slip = await Payslip.findOne({
      companyId: dwpsComp._id,
      employeeId: sunaina._id,
      month: 'June',
      year: 2023,
    });

    if (!slip) {
      await Payslip.create(juneSlipData);
      console.log('4. Created official June 2023 payslip');
    } else {
      Object.assign(slip, juneSlipData);
      await slip.save();
      console.log('4. Updated official June 2023 payslip');
    }

    console.log('--- DWPS Template Verification Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Error during DWPS template verification:', err);
    process.exit(1);
  }
};

verifyDwpsTemplate();
