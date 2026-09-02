const mongoose = require('mongoose');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const SalaryTemplate = require('./models/SalaryTemplate');
const Payslip = require('./models/Payslip');
const { seedDefaultTemplates } = require('./controllers/templateController');

const verifyConcentrixTemplate = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/salary_maker');
    console.log('--- Verifying Concentrix Daksh Template System ---');

    // 1. Seed & Check SalaryTemplate
    await seedDefaultTemplates();
    const tpl = await SalaryTemplate.findOne({ templateKey: 'concentrix_daksh' });
    console.log('1. Template Seeded:', tpl ? 'PASS' : 'FAIL');
    if (tpl) {
      console.log('   Template Name:', tpl.name);
      console.log('   Required Fields:', tpl.requiredFields.map(f => f.key).join(', '));
      console.log('   Default Earnings:', tpl.defaultEarnings.map(e => e.label).join(', '));
      console.log('   Default Deductions:', tpl.defaultDeductions.map(d => d.label).join(', '));
    }

    // 2. Check Company Model Enum Support
    const cnxComp = await Company.findOne({ name: 'CONCENTRIX DAKSH SERVICES INDIA PRIVATE LIMITED' });
    console.log('2. Concentrix Company Exists:', cnxComp ? `PASS (${cnxComp.name})` : 'FAIL');

    // 3. Check Employee & Payslips
    if (cnxComp) {
      const pankaj = await Employee.findOne({ companyId: cnxComp._id, empCode: '306007' });
      console.log('3. Pankaj Sharma Employee:', pankaj ? `PASS (${pankaj.fullName})` : 'FAIL');

      const slips = await Payslip.find({ companyId: cnxComp._id }).sort({ createdAt: 1 });
      console.log(`4. Generated Payslips Count: ${slips.length}`);
      slips.forEach(s => {
        console.log(`   - ${s.payPeriod}: Gross=₹${s.grossEarnings}, Deductions=₹${s.totalDeductions}, Net=₹${s.netSalary}`);
      });
    }

    console.log('--- Concentrix Template Verification Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Verification Error:', err);
    process.exit(1);
  }
};

verifyConcentrixTemplate();
