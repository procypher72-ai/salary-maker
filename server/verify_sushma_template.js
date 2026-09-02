const mongoose = require('mongoose');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const SalaryTemplate = require('./models/SalaryTemplate');
const Payslip = require('./models/Payslip');
const { seedDefaultTemplates } = require('./controllers/templateController');

const verifySushmaTemplate = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/salary_maker');
    console.log('--- Verifying Sushma Buildtech Template System ---');

    // 1. Seed & Check SalaryTemplate
    await seedDefaultTemplates();
    const tpl = await SalaryTemplate.findOne({ templateKey: 'sushma_buildtech' });
    console.log('1. Template Seeded:', tpl ? 'PASS' : 'FAIL');
    if (tpl) {
      console.log('   Template Name:', tpl.name);
      console.log('   Required Fields:', tpl.requiredFields.map(f => f.key).join(', '));
      console.log('   Default Earnings:', tpl.defaultEarnings.map(e => e.label).join(', '));
      console.log('   Default Deductions:', tpl.defaultDeductions.map(d => d.label).join(', '));
    }

    // 2. Check Company Model Enum Support
    const sushmaComp = await Company.findOne({ name: 'Sushma Buildtech Limited' });
    console.log('2. Sushma Company Exists:', sushmaComp ? `PASS (${sushmaComp.name})` : 'NOT YET SEEDED');

    // 3. Check Employee & Payslips
    if (sushmaComp) {
      const surjeet = await Employee.findOne({ companyId: sushmaComp._id, empCode: 'S10187' });
      console.log('3. SURJEET SINGH Employee:', surjeet ? `PASS (${surjeet.fullName})` : 'FAIL');

      const slips = await Payslip.find({ companyId: sushmaComp._id }).sort({ createdAt: 1 });
      console.log(`4. Generated Payslips Count: ${slips.length}`);
      slips.forEach(s => {
        console.log(`   - ${s.payPeriod}: Gross=₹${s.grossEarnings}, Deductions=₹${s.totalDeductions}, Net=₹${s.netSalary}`);
      });
    }

    console.log('--- Sushma Buildtech Template Verification Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Verification Error:', err);
    process.exit(1);
  }
};

verifySushmaTemplate();
