const mongoose = require('mongoose');
const Company = require('./models/Company');
const Employee = require('./models/Employee');
const Payslip = require('./models/Payslip');
const { updateCompany } = require('./controllers/companyController');
require('dotenv').config();

const verifySlipLayout = async () => {
  try {
    console.log('=== VERIFYING SALARY SLIP SIZING & BORDER CUSTOMIZATION ===\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Fetch or create a test company
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({
        name: 'Layout Test Enterprise',
        templateKey: 'classic_tabular',
      });
    }

    console.log(`1. Target Company: "${company.name}" (ID: ${company._id})`);
    console.log('   Initial Slip Width:', company.slipWidth);
    console.log('   Initial Income/Deduction Row Height:', company.incomeDeductionHeight);

    // 2. Update company with custom slip layout & border parameters
    const customLayout = {
      slipWidth: 1080,
      slipMinHeight: 700,
      slipPadding: 32,
      slipBorderWidth: 3,
      slipBorderStyle: 'double',
      slipBorderColor: '#0f172a',
      slipBorderRadius: 8,
      incomeDeductionHeight: 48,
      incomeDeductionMinHeight: 250,
      incomeColumnWidth: 58,
      tableBorderWidth: 2,
      tableBorderStyle: 'solid',
      tableBorderColor: '#0f172a',
      fontSizeScale: 110,
    };

    const updatedCompany = await Company.findByIdAndUpdate(company._id, customLayout, {
      new: true,
      runValidators: true,
    });

    console.log('\n2. Updated Company with Custom Slip Layout:');
    console.log(`   • slipWidth: ${updatedCompany.slipWidth}px (Expected: 1080)`);
    console.log(`   • slipMinHeight: ${updatedCompany.slipMinHeight}px (Expected: 700)`);
    console.log(`   • slipPadding: ${updatedCompany.slipPadding}px (Expected: 32)`);
    console.log(`   • slipBorderWidth: ${updatedCompany.slipBorderWidth}px (Expected: 3)`);
    console.log(`   • slipBorderStyle: ${updatedCompany.slipBorderStyle} (Expected: double)`);
    console.log(`   • slipBorderColor: ${updatedCompany.slipBorderColor} (Expected: #0f172a)`);
    console.log(`   • slipBorderRadius: ${updatedCompany.slipBorderRadius}px (Expected: 8)`);
    console.log(`   • incomeDeductionHeight: ${updatedCompany.incomeDeductionHeight}px (Expected: 48)`);
    console.log(`   • incomeDeductionMinHeight: ${updatedCompany.incomeDeductionMinHeight}px (Expected: 250)`);
    console.log(`   • incomeColumnWidth: ${updatedCompany.incomeColumnWidth}% (Expected: 58)`);

    const passCheck =
      updatedCompany.slipWidth === 1080 &&
      updatedCompany.slipMinHeight === 700 &&
      updatedCompany.slipBorderWidth === 3 &&
      updatedCompany.slipBorderStyle === 'double' &&
      updatedCompany.incomeDeductionHeight === 48 &&
      updatedCompany.incomeColumnWidth === 58;

    console.log('\n3. Verification Result:', passCheck ? '✅ ALL SCHEMA CHECKS PASSED!' : '❌ FAILED');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Error:', err);
    process.exit(1);
  }
};

verifySlipLayout();
