const SalaryTemplate = require('../models/SalaryTemplate');

// Predefined template definitions according to SRS
const DEFAULT_TEMPLATES = [
  {
    templateKey: 'corporate_detailed',
    name: 'Corporate Detailed Template',
    description: 'Comprehensive statutory compliance format with PAN, UAN, PF No, Bank IFSC, and detailed allowance breakdowns.',
    badge: 'Enterprise Compliance',
    colorScheme: { primary: '#1e3a8a', secondary: '#0f172a', accent: '#3b82f6' },
    requiredFields: [
      { key: 'panNumber', label: 'PAN Number', type: 'text', required: true, section: 'statutory', placeholder: 'ABCDE1234F' },
      { key: 'uanNumber', label: 'UAN (Universal Account No)', type: 'text', required: true, section: 'statutory', placeholder: '100XXXXXXXXX' },
      { key: 'pfNumber', label: 'PF Account Number', type: 'text', required: true, section: 'statutory', placeholder: 'MH/BAN/0000000/000' },
      { key: 'bankName', label: 'Bank Name', type: 'text', required: true, section: 'banking', placeholder: 'HDFC / SBI / Chase' },
      { key: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true, section: 'banking', placeholder: '50100XXXXXXXX' },
      { key: 'ifscCode', label: 'IFSC / Routing Code', type: 'text', required: true, section: 'banking', placeholder: 'HDFC0001234' },
      { key: 'department', label: 'Department / Unit', type: 'text', required: true, section: 'job', placeholder: 'Information Technology' },
      { key: 'location', label: 'Work Location', type: 'text', required: false, section: 'job', placeholder: 'Headquarters / Remote' },
    ],
    defaultEarnings: [
      { label: 'Basic Salary', isFixed: true },
      { label: 'House Rent Allowance (HRA)', isFixed: true },
      { label: 'Special Allowance', isFixed: false },
      { label: 'Conveyance Allowance', isFixed: false },
      { label: 'Medical Allowance', isFixed: false },
    ],
    defaultDeductions: [
      { label: 'Provident Fund (PF)', isFixed: true },
      { label: 'Professional Tax (PT)', isFixed: true },
      { label: 'Income Tax (TDS)', isFixed: false },
    ],
  },
  {
    templateKey: 'minimalist_startup',
    name: 'Minimalist Startup Template',
    description: 'Clean, modern, and agile layout. Excludes complex statutory PF/UAN fields for contractual and modern tech teams.',
    badge: 'Modern & Compact',
    colorScheme: { primary: '#0f766e', secondary: '#134e4a', accent: '#14b8a6' },
    requiredFields: [
      { key: 'bankName', label: 'Bank Name', type: 'text', required: true, section: 'banking', placeholder: 'Silicon Valley Bank / Axis' },
      { key: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true, section: 'banking', placeholder: 'Account Number' },
      { key: 'department', label: 'Team / Squad', type: 'text', required: false, section: 'job', placeholder: 'Core Product' },
    ],
    defaultEarnings: [
      { label: 'Monthly Base Remuneration', isFixed: true },
      { label: 'Performance Incentive', isFixed: false },
      { label: 'Internet / Work Perks', isFixed: false },
    ],
    defaultDeductions: [
      { label: 'Tax Withholding / TDS', isFixed: false },
      { label: 'Other Deductions', isFixed: false },
    ],
  },
  {
    templateKey: 'standard_industrial',
    name: 'Standard Industrial / Executive',
    description: 'Structured layout emphasizing attendance metrics, shift/overtime allowances, LOP unpaid leave tracking, and wage breakdowns.',
    badge: 'Shift & Industrial',
    colorScheme: { primary: '#4c1d95', secondary: '#2e1065', accent: '#8b5cf6' },
    requiredFields: [
      { key: 'panNumber', label: 'Tax / PAN Number', type: 'text', required: true, section: 'statutory', placeholder: 'ABCDE1234F' },
      { key: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true, section: 'banking', placeholder: 'Bank Account No' },
      { key: 'ifscCode', label: 'IFSC Code', type: 'text', required: true, section: 'banking', placeholder: 'Bank IFSC' },
      { key: 'department', label: 'Plant / Division', type: 'text', required: true, section: 'job', placeholder: 'Manufacturing / Assembly' },
      { key: 'location', label: 'Plant Location', type: 'text', required: false, section: 'job', placeholder: 'Unit 1' },
    ],
    defaultEarnings: [
      { label: 'Basic Wage', isFixed: true },
      { label: 'Dearness Allowance (DA)', isFixed: false },
      { label: 'House Rent Allowance (HRA)', isFixed: true },
      { label: 'Overtime / Shift Allowance', isFixed: false },
    ],
    defaultDeductions: [
      { label: 'Provident Fund (PF)', isFixed: true },
      { label: 'ESIC Contribution', isFixed: false },
      { label: 'Professional Tax', isFixed: true },
      { label: 'LOP (Loss of Pay)', isFixed: false },
    ],
  },
  {
    templateKey: 'classic_tabular',
    name: 'Classic Monospace Tabular (PDF Replica)',
    description: 'Exact dot-matrix typewriter style tabular layout with Rate & Arrear columns, aligned colons, attendance matrix, and uppercase text.',
    badge: 'Exact PDF Replica',
    colorScheme: { primary: '#0f172a', secondary: '#000000', accent: '#d97706' },
    requiredFields: [
      { key: 'vertical', label: 'Vertical / Division', type: 'text', required: true, section: 'job', placeholder: 'Survey / Construction' },
      { key: 'location', label: 'Location', type: 'text', required: true, section: 'job', placeholder: 'Chandigarh' },
      { key: 'dempDoj', label: 'DEMP DOJ (Date of Joining)', type: 'text', required: true, section: 'job', placeholder: '01/11/2023' },
      { key: 'gender', label: 'Gender', type: 'text', required: true, section: 'personal', placeholder: 'M / F' },
      { key: 'panNumber', label: 'EMP PAN', type: 'text', required: true, section: 'statutory', placeholder: 'NQBPS8394P' },
      { key: 'pfNumber', label: 'PF_NO', type: 'text', required: true, section: 'statutory', placeholder: 'PB/CHD/29780/38554' },
      { key: 'uanNumber', label: 'UAN Number', type: 'text', required: true, section: 'statutory', placeholder: '101719643698' },
      { key: 'bankName', label: 'Bank Name', type: 'text', required: true, section: 'banking', placeholder: 'BOI BANK' },
      { key: 'bankAccount', label: 'A/C NO (Account Number)', type: 'text', required: true, section: 'banking', placeholder: '600810110006756' },
    ],
    defaultEarnings: [
      { label: 'Basic', isFixed: true },
      { label: 'House Rent Allowance', isFixed: true },
      { label: 'Other Allowance', isFixed: true },
      { label: 'Leave Travel Allowance', isFixed: true },
      { label: 'Performance Bonus', isFixed: false },
    ],
    defaultDeductions: [
      { label: 'Provident Fund', isFixed: true },
      { label: 'Professional Tax', isFixed: true },
      { label: 'Income Tax', isFixed: true },
    ],
  },
  {
    templateKey: 'hcl_corporate_tech',
    name: 'HCLTech Enterprise 3-Column Matrix',
    description: 'Enterprise corporate format featuring 3-column financial matrix (Standard Monthly Salary vs. Actual Earnings vs. Deductions), Band classification, and PF Trust IDs.',
    badge: '3-Column Enterprise',
    colorScheme: { primary: '#0284c7', secondary: '#0369a1', accent: '#38bdf8' },
    requiredFields: [
      { key: 'dojGender', label: 'DOJ / Gender', type: 'text', required: true, section: 'personal', placeholder: '01.11.2023 / Male' },
      { key: 'panNumber', label: 'PAN No', type: 'text', required: true, section: 'statutory', placeholder: 'KEJPS3652M' },
      { key: 'pfPensionNo', label: 'PF / Pension No*', type: 'text', required: true, section: 'statutory', placeholder: 'HIL EPF Trust-GN/GGN/5572/635481' },
      { key: 'uanNumber', label: 'UAN No', type: 'text', required: true, section: 'statutory', placeholder: '100417097851' },
      { key: 'bankNameAccount', label: 'Bank Name & Account No', type: 'text', required: true, section: 'banking', placeholder: 'BOI BANK 600810110006820' },
      { key: 'location', label: 'Location', type: 'text', required: true, section: 'job', placeholder: 'Chandigarh' },
      { key: 'department', label: 'Department', type: 'text', required: true, section: 'job', placeholder: 'IT' },
      { key: 'band', label: 'Band', type: 'text', required: true, section: 'job', placeholder: 'S2' },
    ],
    defaultEarnings: [
      { label: 'Basic Salary', isFixed: true },
      { label: 'HRA', isFixed: true },
      { label: 'Travel Allowance', isFixed: true },
      { label: 'Holiday Allowance', isFixed: true },
      { label: 'Food Wallet', isFixed: true },
      { label: 'Incentives', isFixed: false },
    ],
    defaultDeductions: [
      { label: 'Ee PF contribution', isFixed: true },
      { label: 'Prof Tax - split period', isFixed: true },
      { label: 'Income Tax', isFixed: true },
    ],
  },
  {
    templateKey: 'aiims_govt_medical',
    name: 'AIIMS / Central Government Medical Institute',
    description: 'Official Premier Government & Medical Institute format featuring Pay Matrix Level, PFMS-NO, Dealing Office, G20 branding, and Deductions/Recoveries breakdown.',
    badge: 'Government / AIIMS Format',
    colorScheme: { primary: '#1e3a8a', secondary: '#0f172a', accent: '#3b82f6' },
    requiredFields: [
      { key: 'dealingOffice', label: 'Dealing Office', type: 'text', required: true, section: 'job', placeholder: 'Faculty Cell' },
      { key: 'payDetails', label: 'Pay Details (Pay Matrix)', type: 'text', required: true, section: 'job', placeholder: 'Level 10(15600 - 5400 - 39100)' },
      { key: 'oldSalaryCode', label: 'Old Salary Code', type: 'text', required: false, section: 'job', placeholder: 'JHN163' },
      { key: 'pfmsNo', label: 'PFMS-NO', type: 'text', required: true, section: 'statutory', placeholder: 'VAININ00359313' },
      { key: 'panNumber', label: 'PAN Number', type: 'text', required: true, section: 'statutory', placeholder: 'AKLPY8113F' },
      { key: 'bankName', label: 'Bank Name', type: 'text', required: true, section: 'banking', placeholder: 'SBI' },
      { key: 'bankAccount', label: 'Bank Account No.', type: 'text', required: true, section: 'banking', placeholder: '20457116529' },
      { key: 'ifscCode', label: 'IFSC Code', type: 'text', required: true, section: 'banking', placeholder: 'SBIN00033211' },
      { key: 'department', label: 'Current Department', type: 'text', required: true, section: 'job', placeholder: 'IT' },
      { key: 'reportDateTime', label: 'Report Date & Time', type: 'text', required: false, section: 'job', placeholder: '02-Mar-2026&11:28 AM' },
    ],
    defaultEarnings: [
      { label: 'Basic', isFixed: true },
      { label: 'Dearness Allowance', isFixed: true },
      { label: 'Travelling Allowance', isFixed: true },
      { label: 'TADA', isFixed: true },
      { label: 'ICU Allowance', isFixed: false },
      { label: 'Deputation Pay Allowance', isFixed: false },
      { label: 'Uniform Allowance', isFixed: false },
      { label: 'Medical Allowance', isFixed: false },
      { label: 'Nps Employer Earning Share', isFixed: true },
      { label: 'Other Allowance', isFixed: false },
    ],
    defaultDeductions: [
      { label: 'Association Fund Category Amount', isFixed: false },
      { label: 'Emp Health Scheme', isFixed: true },
      { label: 'Emp Insurance Scheme', isFixed: true },
      { label: 'Income Tax', isFixed: true },
      { label: 'Miscellaneous Recovery NA', isFixed: false },
      { label: 'New Pension Scehme-110001989995', isFixed: true },
      { label: 'Nps Employer Ded Share', isFixed: true },
      { label: 'Water Charges', isFixed: false },
    ],
  },
  {
    templateKey: 'concentrix_daksh',
    name: 'Concentrix Daksh (Full & Actual Format)',
    description: 'Corporate BPO / Services format with Full vs. Actual Earnings comparison, dedicated Deductions column, LOP & Effective Work Days tracking, and clean boxed grid structure.',
    badge: 'Full vs. Actual Corporate',
    colorScheme: { primary: '#002b49', secondary: '#0072ce', accent: '#00a3e0' },
    requiredFields: [
      { key: 'location', label: 'Location', type: 'text', required: true, section: 'job', placeholder: 'Chandigarh' },
      { key: 'joiningDateStr', label: 'Joining Date', type: 'text', required: false, section: 'personal', placeholder: '10 Oct 2022' },
      { key: 'bankName', label: 'Bank Name', type: 'text', required: true, section: 'banking', placeholder: 'SBI' },
      { key: 'bankAccount', label: 'Bank Account No', type: 'text', required: true, section: 'banking', placeholder: '40777179100' },
      { key: 'panNumber', label: 'PAN Number', type: 'text', required: true, section: 'statutory', placeholder: 'NJSPS5596H' },
      { key: 'pfNumber', label: 'PF No', type: 'text', required: true, section: 'statutory', placeholder: 'PB/CHD/29780/38538' },
      { key: 'uanNumber', label: 'PF UAN', type: 'text', required: true, section: 'statutory', placeholder: '101719643567' },
    ],
    defaultEarnings: [
      { label: 'BASIC', isFixed: true },
      { label: 'HRA', isFixed: true },
      { label: 'LTA', isFixed: true },
      { label: 'SPECIAL ALLOWANCE', isFixed: true },
      { label: 'RMEDICAL ALLOWANCE', isFixed: true },
    ],
    defaultDeductions: [
      { label: 'PF', isFixed: true },
      { label: 'PROF TAX', isFixed: true },
      { label: 'INCOME TAX', isFixed: true },
    ],
  },
  {
    templateKey: 'sushma_buildtech',
    name: 'Sushma Buildtech (Standard Rate & Attendance Matrix)',
    description: 'Corporate Real Estate & Infrastructure format featuring a teal header banner, 4-column attendance & statutory matrix (Standard vs. LWOP vs. Days Worked, Grade), Standard Rate vs. Amount grid, and Remarks footer.',
    badge: 'Standard Rate & Attendance',
    colorScheme: { primary: '#0284c7', secondary: '#0f172a', accent: '#38bdf8' },
    requiredFields: [
      { key: 'employeeCode', label: 'Employee Code', type: 'text', required: true, section: 'job', placeholder: 'S10187' },
      { key: 'dateOfJoiningStr', label: 'Date of Joining', type: 'text', required: false, section: 'personal', placeholder: '01 June 2020' },
      { key: 'grade', label: 'Grade', type: 'text', required: false, section: 'job', placeholder: '28' },
      { key: 'location', label: 'Location', type: 'text', required: true, section: 'job', placeholder: 'Chandigarh' },
      { key: 'panNumber', label: 'PAN Number', type: 'text', required: true, section: 'statutory', placeholder: 'FWUPS9092F' },
      { key: 'uanNumber', label: 'UAN Number', type: 'text', required: true, section: 'statutory', placeholder: '101719643698' },
      { key: 'pfNumber', label: 'PF Number', type: 'text', required: true, section: 'statutory', placeholder: 'PB/CHD/29780/38554' },
      { key: 'esicNumber', label: 'ESIC Number', type: 'text', required: false, section: 'statutory', placeholder: '' },
      { key: 'bankAccount', label: 'Bank Account Number', type: 'text', required: true, section: 'banking', placeholder: '600810110006815' },
      { key: 'ifscCode', label: 'IFSC Code', type: 'text', required: true, section: 'banking', placeholder: 'BKID0006791' },
      { key: 'standardDays', label: 'Standard Days', type: 'number', required: false, section: 'job', placeholder: '31.00' },
      { key: 'lwopDays', label: 'LWOP Days', type: 'number', required: false, section: 'job', placeholder: '0.00' },
      { key: 'daysWorked', label: 'Days Worked', type: 'number', required: false, section: 'job', placeholder: '31.00' },
    ],
    defaultEarnings: [
      { label: 'Basic Salary', isFixed: true },
      { label: 'House Rent Allowance', isFixed: true },
      { label: 'Other Allowance', isFixed: true },
      { label: 'Leave Travel Allowance', isFixed: true },
      { label: 'Performance Bonus', isFixed: false },
    ],
    defaultDeductions: [
      { label: 'Provident Fund', isFixed: true },
      { label: 'Professional Tax', isFixed: true },
      { label: 'Income Tax', isFixed: true },
    ],
  },
  {
    templateKey: 'delhi_public_school',
    name: 'Delhi World Public School (DWPS Format)',
    description: 'School and Educational Institution layout featuring institutional crest branding, Function/Designation/Location/Bank metadata, clean 4-column bordered financial grid, and Authorized Signature footer.',
    badge: 'School & Institutional',
    colorScheme: { primary: '#15803d', secondary: '#14532d', accent: '#84cc16' },
    requiredFields: [
      { key: 'functionRole', label: 'Function / Department', type: 'text', required: true, section: 'job', placeholder: 'Management' },
      { key: 'location', label: 'Location', type: 'text', required: true, section: 'job', placeholder: 'Ashta' },
      { key: 'bankDetails', label: 'Bank Details (A/C, Bank, Branch)', type: 'text', required: true, section: 'banking', placeholder: '38570100006930,Bank of Baroda,Ashta' },
      { key: 'dateOfJoiningStr', label: 'Date of Joining', type: 'text', required: true, section: 'personal', placeholder: '21/10/2021' },
    ],
    defaultEarnings: [
      { label: 'Basic', isFixed: true },
      { label: 'D.A', isFixed: true },
      { label: 'H.R.A', isFixed: true },
    ],
    defaultDeductions: [
      { label: 'Professional Tax', isFixed: true },
    ],
  },
];

// Ensure templates are seeded in database without overwriting user-customized fields or names
const seedDefaultTemplates = async () => {
  try {
    for (const t of DEFAULT_TEMPLATES) {
      const existing = await SalaryTemplate.findOne({ templateKey: t.templateKey });
      if (!existing) {
        await SalaryTemplate.create(t);
      } else if (t.templateKey === 'delhi_public_school') {
        // Ensure DWPS template has the clean required fields synced
        await SalaryTemplate.updateOne(
          { templateKey: t.templateKey },
          {
            $set: {
              requiredFields: t.requiredFields,
              defaultEarnings: t.defaultEarnings,
              defaultDeductions: t.defaultDeductions,
            },
          }
        );
      }
    }
    console.log('✅ Salary Templates seeded/verified');
  } catch (err) {
    console.error('Error seeding templates:', err.message);
  }
};

// @desc    Get all available salary templates
// @route   GET /api/templates
const getTemplates = async (req, res) => {
  try {
    const templates = await SalaryTemplate.find();
    if (templates.length === 0) {
      await seedDefaultTemplates();
      const seeded = await SalaryTemplate.find();
      return res.status(200).json({ success: true, templates: seeded });
    }
    res.status(200).json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get template by key
// @route   GET /api/templates/:templateKey
const getTemplateByKey = async (req, res) => {
  try {
    const template = await SalaryTemplate.findOne({ templateKey: req.params.templateKey });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.status(200).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update / Rename a template & customize dynamic fields schema
// @route   PUT /api/templates/:templateKey
const updateTemplate = async (req, res) => {
  try {
    const { name, badge, description, requiredFields, defaultEarnings, defaultDeductions } = req.body;
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid template name' });
    }

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (badge !== undefined) updateFields.badge = badge.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (requiredFields !== undefined) updateFields.requiredFields = requiredFields;
    if (defaultEarnings !== undefined) updateFields.defaultEarnings = defaultEarnings;
    if (defaultDeductions !== undefined) updateFields.defaultDeductions = defaultDeductions;

    const template = await SalaryTemplate.findOneAndUpdate(
      { templateKey: req.params.templateKey },
      { $set: updateFields },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.status(200).json({
      success: true,
      message: `Template "${template.name}" updated successfully`,
      template,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTemplates,
  getTemplateByKey,
  updateTemplate,
  seedDefaultTemplates,
};
