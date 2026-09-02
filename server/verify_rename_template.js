const mongoose = require('mongoose');
const SalaryTemplate = require('./models/SalaryTemplate');
const { updateTemplate, seedDefaultTemplates } = require('./controllers/templateController');

const verifyRenameTemplate = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/salary_maker');
    console.log('--- Verifying Template Rename Functionality ---');

    await seedDefaultTemplates();

    // 1. Rename 'concentrix_daksh'
    const targetKey = 'concentrix_daksh';
    const original = await SalaryTemplate.findOne({ templateKey: targetKey });
    console.log('1. Original Template Name:', original?.name);

    // Mock Express req/res
    let responseData = null;
    let statusCode = null;

    const req = {
      params: { templateKey: targetKey },
      body: {
        name: 'Concentrix Daksh (Custom BPO Layout)',
        badge: 'Enterprise Custom BPO',
        description: 'Customized layout for BPO operations with Full vs. Actual Earnings comparison.',
      },
    };

    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
          },
        };
      },
    };

    await updateTemplate(req, res);
    console.log('2. Update Status:', statusCode);
    console.log('   Response Success:', responseData?.success);
    console.log('   Updated Name:', responseData?.template?.name);

    const updated = await SalaryTemplate.findOne({ templateKey: targetKey });
    console.log('3. Database Verified Name:', updated?.name);
    console.log('   Database Verified Badge:', updated?.badge);

    // 4. Test re-seeding does not overwrite custom name
    await seedDefaultTemplates();
    const afterReseed = await SalaryTemplate.findOne({ templateKey: targetKey });
    console.log('4. Name preserved after re-seed:', afterReseed?.name === 'Concentrix Daksh (Custom BPO Layout)' ? 'PASS' : 'FAIL');

    console.log('--- Template Rename Verification Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Rename Verification Error:', err);
    process.exit(1);
  }
};

verifyRenameTemplate();
