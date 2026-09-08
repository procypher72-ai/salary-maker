const Company = require('../models/Company');
const Payslip = require('../models/Payslip');

// @desc    Get all companies
// @route   GET /api/companies
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: companies.length, companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new company
// @route   POST /api/companies
const createCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      fullAddress,
      gstin,
      pan,
      website,
      logoUrl,
      templateKey,
      currency,
      currencyCode,
      signatoryName,
      signatoryDesignation,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const company = await Company.create({
      name,
      email,
      phone,
      fullAddress,
      gstin,
      pan,
      website,
      logoUrl,
      templateKey: templateKey || 'corporate_detailed',
      currency: currency || '₹',
      currencyCode: currencyCode || 'INR',
      signatoryName: signatoryName || 'Authorized Signatory',
      signatoryDesignation: signatoryDesignation || 'Head of HR',
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: `Company "${company.name}" created successfully!`,
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update company profile / template
// @route   PUT /api/companies/:id
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Synchronize branding/logo/signature/stamp across all existing payslips for this company
    const logoFields = [
      'name', 'fullAddress', 'gstin', 'pan', 'website', 'email', 'phone', 'currency', 'currencyCode',
      'logoWidth', 'logoHeight', 'logoPosition', 'logoOffsetX', 'logoOffsetY', 'logoUrl',
      'secondaryLogoUrl', 'secondaryLogoWidth', 'secondaryLogoHeight', 'secondaryLogoPosition',
      'secondaryLogoOffsetX', 'secondaryLogoOffsetY',
      'signatoryName', 'signatoryDesignation', 'signatureUrl', 'stampUrl',
      'showSignature', 'showStamp',
      'signatureWidth', 'signatureHeight', 'signatureOffsetX', 'signatureOffsetY',
      'stampWidth', 'stampHeight', 'stampOffsetX', 'stampOffsetY', 'stampOpacity',
      'templateKey', 'slipWidth', 'slipMinHeight', 'slipPadding', 'slipBorderWidth', 'slipBorderStyle', 'slipBorderColor', 'slipBorderRadius',
      'incomeDeductionHeight', 'incomeDeductionMinHeight', 'incomeColumnWidth', 'tableBorderWidth', 'tableBorderStyle', 'tableBorderColor', 'fontSizeScale',
      'extraSpacerHeight', 'minTableRows', 'dwpsCustomFields', 'dwpsMetaColumns', 'customMetaFields'
    ];

    const updateSet = {};
    logoFields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updateSet[`snapshotData.company.${f}`] = req.body[f];
      }
    });

    if (Object.keys(updateSet).length > 0) {
      await Payslip.updateMany({ companyId: company._id }, { $set: updateSet });
    }

    res.status(200).json({
      success: true,
      message: `Company "${company.name}" and all associated salary slips updated successfully!`,
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.status(200).json({
      success: true,
      message: `Company "${company.name}" deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Seed starter default companies if none exists
const seedDefaultCompany = async () => {
  try {
    // 1. Check/Seed Nexus Tech
    let defaultComp = await Company.findOne({ name: 'Nexus Tech Global Ltd.' });
    if (!defaultComp) {
      defaultComp = await Company.create({
        name: 'Nexus Tech Global Ltd.',
        email: 'payroll@nexustech.io',
        phone: '+91 (022) 4567-8900',
        fullAddress: 'Tower 4, Floor 12, Cyber Park, Electronic City, Bengaluru - 560100',
        gstin: '29ABCDE1234F1Z5',
        pan: 'ABCDE1234F',
        website: 'https://nexustech.io',
        logoUrl: '',
        templateKey: 'corporate_detailed',
        currency: '₹',
        currencyCode: 'INR',
        signatoryName: 'Robert Vance',
        signatoryDesignation: 'Director of Human Resources',
      });
      console.log(`✅ Default starter company created: ${defaultComp.name}`);
    }

    // 2. Check/Seed Arunima Constructions (Classic Tabular Template)
    let arunimaComp = await Company.findOne({ name: 'Arunima Constructions Private Limited' });
    if (!arunimaComp) {
      arunimaComp = await Company.create({
        name: 'Arunima Constructions Private Limited',
        email: 'accounts@arunimaconstructions.com',
        phone: '+91 (0172) 278-9000',
        fullAddress: 'Plot No. 42, Industrial Area Phase II, Chandigarh - 160002',
        gstin: '04AABCA1234E1ZP',
        pan: 'AABCA1234E',
        website: 'https://arunimaconstructions.com',
        logoUrl: '',
        templateKey: 'classic_tabular',
        currency: '₹',
        currencyCode: 'INR',
        signatoryName: 'Authorized Signatory',
        signatoryDesignation: 'Head of Accounts',
      });
      console.log(`✅ Seeded PDF Replica Company: ${arunimaComp.name}`);
    }

    // 3. Check/Seed HCL Technologies Ltd. (HCL Corporate 3-Column Template)
    let hclComp = await Company.findOne({ name: 'HCL Technologies Ltd.' });
    if (!hclComp) {
      hclComp = await Company.create({
        name: 'HCL Technologies Ltd.',
        email: 'payroll@hcltech.com',
        phone: '+91 (120) 438-2000',
        fullAddress: 'Technology Hub, SEZ, Plot No. 3A, Sector 126, Noida - 201304',
        gstin: '07AAACH1234E1Z1',
        pan: 'AAACH1234E',
        website: 'https://hcltech.com',
        logoUrl: '',
        templateKey: 'hcl_corporate_tech',
        currency: '₹',
        currencyCode: 'INR',
        signatoryName: 'Authorized Signatory',
        signatoryDesignation: 'Head of Global Payroll',
      });
      console.log(`✅ Seeded PDF Replica Company: ${hclComp.name}`);
    }

    // 4. Check/Seed AIIMS (AIIMS Govt Medical Template)
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
      console.log(`✅ Seeded PDF Replica Company: ${aiimsComp.name}`);
    }

    return defaultComp;
  } catch (err) {
    console.error('Error seeding default company:', err.message);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  seedDefaultCompany,
};
