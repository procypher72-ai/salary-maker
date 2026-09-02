const mongoose = require('mongoose');
const SalaryTemplate = require('./models/SalaryTemplate');
const { updateTemplate, seedDefaultTemplates } = require('./controllers/templateController');

const verifyCustomFields = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/salary_maker');
    console.log('--- Verifying Template Custom Fields Schema Management ---');

    await seedDefaultTemplates();

    const targetKey = 'classic_tabular';
    const customFields = [
      { key: 'empNo', label: 'EMP NO', type: 'text', section: 'job', required: true },
      { key: 'name', label: 'NAME', type: 'text', section: 'personal', required: true },
      { key: 'company', label: 'COMPANY', type: 'text', section: 'job', required: false },
      { key: 'vertical', label: 'VERTICAL', type: 'text', section: 'job', required: false },
      { key: 'designation', label: 'DESIGNATION', type: 'text', section: 'job', required: true },
      { key: 'dempDoj', label: 'DOJ', type: 'text', section: 'job', required: false }, // Renamed from DEMP DOJ to DOJ
      { key: 'location', label: 'LOCATION', type: 'text', section: 'job', required: false },
      { key: 'area', label: 'AREA', type: 'text', section: 'job', required: false }, // Added custom AREA field
      { key: 'bankName', label: 'BANK NAME', type: 'text', section: 'banking', required: false },
      { key: 'bankAccount', label: 'A/C NO', type: 'text', section: 'banking', required: false },
      { key: 'gender', label: 'GENDER', type: 'text', section: 'personal', required: false },
      { key: 'panNumber', label: 'EMP PAN', type: 'text', section: 'statutory', required: false },
      { key: 'pfNumber', label: 'PF_NO', type: 'text', section: 'statutory', required: false },
      { key: 'uanNumber', label: 'UAN', type: 'text', section: 'statutory', required: false },
    ];

    let responseData = null;
    let statusCode = null;

    const req = {
      params: { templateKey: targetKey },
      body: {
        requiredFields: customFields,
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
    console.log('1. Update Status:', statusCode);
    console.log('   Response Success:', responseData?.success);
    console.log('   Total Fields in DB:', responseData?.template?.requiredFields?.length);

    const updated = await SalaryTemplate.findOne({ templateKey: targetKey });
    const dempDojField = updated.requiredFields.find(f => f.key === 'dempDoj');
    console.log('2. Renamed Label (DEMP DOJ -> DOJ):', dempDojField?.label === 'DOJ' ? 'PASS (DOJ)' : 'FAIL');

    const areaField = updated.requiredFields.find(f => f.key === 'area');
    console.log('3. Added Field (AREA):', areaField ? `PASS (${areaField.label})` : 'FAIL');

    // 4. Test re-seed preserves user customization
    await seedDefaultTemplates();
    const afterReseed = await SalaryTemplate.findOne({ templateKey: targetKey });
    const preservedDoj = afterReseed.requiredFields.find(f => f.key === 'dempDoj');
    const preservedArea = afterReseed.requiredFields.find(f => f.key === 'area');
    console.log('4. Customizations preserved on re-seed:', preservedDoj?.label === 'DOJ' && !!preservedArea ? 'PASS' : 'FAIL');

    console.log('--- Custom Fields Verification Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Field Verification Error:', err);
    process.exit(1);
  }
};

verifyCustomFields();
