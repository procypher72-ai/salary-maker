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

    // 1. Seed & Check SalaryTemplate
    await seedDefaultTemplates();
    const tpl = await SalaryTemplate.findOne({ templateKey: 'delhi_public_school' });
    console.log('1. Template Seeded:', tpl ? 'PASS' : 'FAIL');
    if (tpl) {
      console.log('   Template Name:', tpl.name);
      console.log('   Required Fields:', tpl.requiredFields.map(f => f.key).join(', '));
      console.log('   Default Earnings:', tpl.defaultEarnings.map(e => e.label).join(', '));
      console.log('   Default Deductions:', tpl.defaultDeductions.map(d => d.label).join(', '));
    }

    // 2. Optionally seed Delhi World Public School company if not present
    let dwpsComp = await Company.findOne({ name: 'Delhi World Public School, Ashta' });
    if (!dwpsComp) {
      dwpsComp = await Company.create({
        name: 'Delhi World Public School, Ashta',
        fullAddress: 'Shujalpur Road Ashta, Dist. Sehore (M.P)',
        pinCode: 'Pin Code - 466116',
        templateKey: 'delhi_public_school',
        slipWidth: 950,
        slipPadding: 24,
      });
      console.log('2. Created Delhi World Public School Company');
    } else {
      console.log('2. Delhi World Public School Company Exists');
    }

    // 3. Optionally seed SUNAINA SHARMA employee if not present
    let sunaina = await Employee.findOne({ companyId: dwpsComp._id, fullName: 'SUNAINA SHARMA' });
    if (!sunaina) {
      sunaina = await Employee.create({
        companyId: dwpsComp._id,
        empCode: 'DWPS-1021',
        fullName: 'SUNAINA SHARMA',
        designation: 'Principal',
        department: 'Management',
        location: 'Ashta',
        joiningDate: new Date('2021-10-21'),
        baselineSalary: {
          basicPay: 20000,
          hra: 20000,
          specialAllowance: 10000,
        },
        dynamicFields: {
          functionRole: 'Management',
          designation: 'Principal',
          location: 'Ashta',
          bankDetails: '38570100006930,Bank of Baroda,Ashta',
          dateOfJoiningStr: '21/10/2021',
        },
      });
      console.log('3. Created SUNAINA SHARMA Employee');
    } else {
      console.log('3. SUNAINA SHARMA Employee Exists');
    }

    // 4. Optionally seed April, May, June 2022 sample payslips matching the PDF!
    const sampleMonths = [
      { month: 'April', year: 2022, payPeriod: 'April 2022' },
      { month: 'May', year: 2022, payPeriod: 'May 2022' },
      { month: 'June', year: 2022, payPeriod: 'June 2022' },
    ];

    for (const m of sampleMonths) {
      const existingSlip = await Payslip.findOne({
        companyId: dwpsComp._id,
        employeeId: sunaina._id,
        month: m.month,
        year: m.year,
      });

      if (!existingSlip) {
        await Payslip.create({
          companyId: dwpsComp._id,
          employeeId: sunaina._id,
          month: m.month,
          year: m.year,
          payPeriod: m.payPeriod,
          paymentDate: new Date(`${m.year}-${m.month === 'April' ? '04' : m.month === 'May' ? '05' : '06'}-30`),
          workingDays: 30,
          paidDays: 30,
          lopDays: 0,
          earnings: [
            { label: 'Basic', amount: 20000 },
            { label: 'D.A', amount: 10000 },
            { label: 'H.R.A', amount: 20000 },
          ],
          deductions: [
            { label: 'Professsional Tax', amount: 212 },
          ],
          grossEarnings: 50000,
          totalDeductions: 212,
          netSalary: 49788,
          netSalaryInWords: 'Fourty nine thousand seven hunderd and eighty eighty only.',
          templateKey: 'delhi_public_school',
          snapshotData: {
            company: dwpsComp.toObject(),
            employee: sunaina.toObject(),
            templateKey: 'delhi_public_school',
          },
        });
        console.log(`4. Seeded sample payslip: ${m.payPeriod}`);
      }
    }

    console.log('--- DWPS Template Verification Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Error verifying DWPS template:', err);
    process.exit(1);
  }
};

verifyDwpsTemplate();
