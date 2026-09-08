const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const Company = require('../models/Company');
const SalaryTemplate = require('../models/SalaryTemplate');
const { numberToWords } = require('../utils/numberToWords');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to calculate days and LOP pro-rata deduction
const computePayslipFinancials = (employee, company, customOverrides = {}) => {
  const base = employee.baselineSalary || {};
  const workingDays = customOverrides.workingDays !== undefined ? Number(customOverrides.workingDays) : 30;
  const paidDays = customOverrides.paidDays !== undefined ? Number(customOverrides.paidDays) : 30;
  const lopDays = customOverrides.lopDays !== undefined ? Number(customOverrides.lopDays) : Math.max(0, workingDays - paidDays);

  // Pro-rata factor for loss of pay if paid days < working days
  const payRatio = workingDays > 0 ? (paidDays / workingDays) : 1;

  let earnings = [];
  let deductions = [];

  if (customOverrides.earnings && Array.isArray(customOverrides.earnings)) {
    earnings = customOverrides.earnings.map((e) => ({
      label: e.label,
      amount: Number(e.amount) || 0,
    }));
  } else if (base.customEarnings && Array.isArray(base.customEarnings) && base.customEarnings.length > 0) {
    earnings = base.customEarnings.map((e) => ({
      label: e.label,
      amount: Math.round((Number(e.amount) || 0) * payRatio),
    }));
  } else if (company?.templateKey === 'aiims_govt_medical') {
    // Official 10 Earnings Breakdown matching Original AIIMS PDF
    earnings = [
      { label: 'Basic', amount: Math.round(67400 * payRatio) },
      { label: 'Dearness Allowance', amount: Math.round(26960 * payRatio) },
      { label: 'Travelling Allowance', amount: Math.round(4800 * payRatio) },
      { label: 'TADA', amount: Math.round(1512 * payRatio) },
      { label: 'ICU Allowance', amount: Math.round(540 * payRatio) },
      { label: 'Deputation Pay Allowance', amount: Math.round(1280 * payRatio) },
      { label: 'Uniform Allowance', amount: Math.round(2800 * payRatio) },
      { label: 'Medical Allowance', amount: Math.round(3200 * payRatio) },
      { label: 'Nps Employer Earning Share', amount: Math.round(15224 * payRatio) },
      { label: 'Other Allowance', amount: Math.round(10650 * payRatio) },
    ];
  } else if (company?.templateKey === 'classic_tabular') {
    earnings = [
      { label: 'Basic', amount: Math.round(97000 * payRatio), rate: 97000, arrear: 0 },
      { label: 'House Rent Allowance', amount: Math.round(48500 * payRatio), rate: 48500, arrear: 0 },
      { label: 'Other Allowance', amount: Math.round(24250 * payRatio), rate: 24250, arrear: 0 },
      { label: 'Leave Travel Allowance', amount: Math.round(8080 * payRatio), rate: 8080, arrear: 0 },
      { label: 'Performance Bonus', amount: Math.round(24700 * payRatio), rate: 0, arrear: 0 },
    ];
  } else if (company?.templateKey === 'hcl_corporate_tech') {
    // Exact HCL Corporate Tech breakdown matching original HCL format
    earnings = [
      { label: 'Basic Salary', amount: Math.round(87450 * payRatio) },
      { label: 'HRA', amount: Math.round(34980 * payRatio) },
      { label: 'Travel Allowance', amount: Math.round(22600 * payRatio) },
      { label: 'Holiday Allowance', amount: Math.round(9500 * payRatio) },
      { label: 'Food Wallet', amount: Math.round(4500 * payRatio) },
      { label: 'Incentives', amount: Math.round(45213 * payRatio) },
    ];
  } else if (company?.templateKey === 'concentrix_daksh') {
    earnings = [
      { label: 'BASIC SALARY', amount: Math.round(23000 * payRatio), fullAmount: 23000 },
      { label: 'HOUSE RENT ALLOWANCE', amount: Math.round(11500 * payRatio), fullAmount: 11500 },
      { label: 'STATUTORY BONUS', amount: Math.round(3500 * payRatio), fullAmount: 3500 },
      { label: 'SPECIAL ALLOWANCE', amount: Math.round(17500 * payRatio), fullAmount: 17500 },
      { label: 'RMEDICAL ALLOWANCE', amount: Math.round(2500 * payRatio), fullAmount: 2500 },
      { label: 'PERFORMANCE BONUS', amount: Math.round(8000 * payRatio), fullAmount: 8000 },
    ];
  } else if (company?.templateKey === 'sushma_buildtech') {
    earnings = [
      { label: 'BASIC', amount: Math.round(28387 * payRatio), rate: 28387 },
      { label: 'HRA', amount: Math.round(14194 * payRatio), rate: 14194 },
      { label: 'CONVEYANCE', amount: Math.round(1600 * payRatio), rate: 1600 },
      { label: 'CHILD EDU ALLOWANCE', amount: Math.round(200 * payRatio), rate: 200 },
      { label: 'SPECIAL ALLOWANCE', amount: Math.round(13619 * payRatio), rate: 13619 },
      { label: 'PERFORMANCE BONUS', amount: Math.round(10000 * payRatio), rate: 10000 },
    ];
  } else {
    // Standard corporate earnings list based on baseline salary
    if (base.basicPay) earnings.push({ label: 'Basic Salary', amount: Math.round(base.basicPay * payRatio) });
    if (base.hra) earnings.push({ label: 'House Rent Allowance (HRA)', amount: Math.round(base.hra * payRatio) });
    if (base.specialAllowance) earnings.push({ label: 'Special Allowance', amount: Math.round(base.specialAllowance * payRatio) });
    if (base.conveyanceAllowance) earnings.push({ label: 'Conveyance Allowance', amount: Math.round(base.conveyanceAllowance * payRatio) });
    if (base.medicalAllowance) earnings.push({ label: 'Medical Allowance', amount: Math.round(base.medicalAllowance * payRatio) });
    if (base.otherAllowances) earnings.push({ label: 'Other Allowances', amount: Math.round(base.otherAllowances * payRatio) });
    if (earnings.length === 0) {
      earnings.push({ label: 'Basic Salary', amount: Math.round(45000 * payRatio) });
      earnings.push({ label: 'House Rent Allowance (HRA)', amount: Math.round(18000 * payRatio) });
      earnings.push({ label: 'Special Allowance', amount: Math.round(12000 * payRatio) });
    }
  }

  if (customOverrides.deductions && Array.isArray(customOverrides.deductions)) {
    deductions = customOverrides.deductions.map((d) => ({
      label: d.label,
      amount: Number(d.amount) || 0,
    }));
  } else if (base.customDeductions && Array.isArray(base.customDeductions) && base.customDeductions.length > 0) {
    deductions = base.customDeductions.map((d) => ({
      label: d.label,
      amount: Number(d.amount) || 0,
    }));
  } else if (company?.templateKey === 'aiims_govt_medical') {
    // Official 8 Deductions/Recoveries Breakdown matching Original AIIMS PDF
    deductions = [
      { label: 'Association Fund Category Amount', amount: 20 },
      { label: 'Emp Health Scheme', amount: 650 },
      { label: 'Emp Insurance Scheme', amount: 60 },
      { label: 'Income Tax', amount: 7357 },
      { label: 'Miscellaneous Recovery NA', amount: 967 },
      { label: 'New Pension Scehme-110001989995', amount: 10874 },
      { label: 'Nps Employer Ded Share', amount: 15224 },
      { label: 'Water Charges', amount: 82 },
    ];
  } else if (company?.templateKey === 'classic_tabular') {
    deductions = [
      { label: 'Provident Fund', amount: 17460 },
      { label: 'Professional Tax', amount: 200 },
      { label: 'Income Tax', amount: 31547 },
    ];
  } else if (company?.templateKey === 'hcl_corporate_tech') {
    deductions = [
      { label: 'Ee PF contribution', amount: 10494 },
      { label: 'Prof Tax - split period', amount: 200 },
      { label: 'Income Tax', amount: 36586 },
    ];
  } else if (company?.templateKey === 'concentrix_daksh') {
    deductions = [
      { label: 'PROVIDENT FUND', amount: 2760 },
      { label: 'PROFESSIONAL TAX', amount: 200 },
      { label: 'INCOME TAX (TDS)', amount: 4800 },
    ];
  } else if (company?.templateKey === 'sushma_buildtech') {
    deductions = [
      { label: 'PF EMPLOYEE SHARE', amount: 3406 },
      { label: 'PROFESSIONAL TAX', amount: 200 },
      { label: 'TDS', amount: 2500 },
    ];
  } else {
    // Standard deductions list based on baseline salary
    if (base.pfDeduction) deductions.push({ label: 'Provident Fund (PF)', amount: Number(base.pfDeduction) });
    if (base.esicDeduction) deductions.push({ label: 'Employee State Insurance (ESIC)', amount: Number(base.esicDeduction) });
    if (base.professionalTax) deductions.push({ label: 'Professional Tax (PT)', amount: Number(base.professionalTax) });
    if (base.tds) deductions.push({ label: 'Income Tax / TDS', amount: Number(base.tds) });
    if (base.otherDeductions) deductions.push({ label: 'Other Deductions', amount: Number(base.otherDeductions) });
  }

  const grossEarnings = earnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalDeductions = deductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const netSalary = Math.max(0, grossEarnings - totalDeductions);
  const currencyName = company.currencyCode === 'USD' ? 'Dollars' : 'Rupees';
  const netSalaryInWords = numberToWords(netSalary, currencyName);

  return {
    workingDays,
    paidDays,
    lopDays,
    payRatio,
    earnings,
    deductions,
    grossEarnings,
    totalDeductions,
    netSalary,
    netSalaryInWords,
  };
};

// Helper to build immutable snapshot
const createSnapshot = (company, employee) => {
  return {
    company: {
      name: company.name,
      email: company.email,
      phone: company.phone,
      fullAddress: company.fullAddress,
      gstin: company.gstin,
      pan: company.pan,
      website: company.website,
      logoUrl: company.logoUrl,
      logoWidth: company.logoWidth || 65,
      logoHeight: company.logoHeight || 65,
      logoPosition: company.logoPosition || 'left',
      logoOffsetX: company.logoOffsetX || 0,
      logoOffsetY: company.logoOffsetY || 0,
      secondaryLogoUrl: company.secondaryLogoUrl || '',
      secondaryLogoWidth: company.secondaryLogoWidth || 85,
      secondaryLogoHeight: company.secondaryLogoHeight || 60,
      secondaryLogoPosition: company.secondaryLogoPosition || 'right',
      secondaryLogoOffsetX: company.secondaryLogoOffsetX || 0,
      secondaryLogoOffsetY: company.secondaryLogoOffsetY || 0,
      currency: company.currency || '₹',
      signatoryName: company.signatoryName,
      signatoryDesignation: company.signatoryDesignation,
      signatureUrl: company.signatureUrl || '',
      signatureWidth: company.signatureWidth || 120,
      signatureHeight: company.signatureHeight || 50,
      signatureOffsetX: company.signatureOffsetX || 0,
      signatureOffsetY: company.signatureOffsetY || 0,
      showSignature: company.showSignature !== undefined ? company.showSignature : true,
      stampUrl: company.stampUrl || '',
      stampWidth: company.stampWidth || 90,
      stampHeight: company.stampHeight || 90,
      stampOffsetX: company.stampOffsetX || 0,
      stampOffsetY: company.stampOffsetY || 0,
      stampOpacity: company.stampOpacity !== undefined ? company.stampOpacity : 85,
      showStamp: company.showStamp !== undefined ? company.showStamp : true,
      templateKey: company.templateKey,
      slipWidth: company.slipWidth !== undefined ? company.slipWidth : 950,
      slipMinHeight: company.slipMinHeight !== undefined ? company.slipMinHeight : 0,
      slipPadding: company.slipPadding !== undefined ? company.slipPadding : 24,
      slipBorderWidth: company.slipBorderWidth !== undefined ? company.slipBorderWidth : 1,
      slipBorderStyle: company.slipBorderStyle || 'solid',
      slipBorderColor: company.slipBorderColor || '#000000',
      slipBorderRadius: company.slipBorderRadius !== undefined ? company.slipBorderRadius : 0,
      incomeDeductionHeight: company.incomeDeductionHeight !== undefined ? company.incomeDeductionHeight : 30,
      incomeDeductionMinHeight: company.incomeDeductionMinHeight !== undefined ? company.incomeDeductionMinHeight : 160,
      incomeColumnWidth: company.incomeColumnWidth !== undefined ? company.incomeColumnWidth : 50,
      tableBorderWidth: company.tableBorderWidth !== undefined ? company.tableBorderWidth : 1,
      tableBorderStyle: company.tableBorderStyle || 'solid',
      tableBorderColor: company.tableBorderColor || '#000000',
      fontSizeScale: company.fontSizeScale !== undefined ? company.fontSizeScale : 100,
      extraSpacerHeight: company.extraSpacerHeight !== undefined ? company.extraSpacerHeight : 0,
      minTableRows: company.minTableRows !== undefined ? company.minTableRows : 6,
    },
    employee: {
      empCode: employee.empCode,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      department: employee.department,
      joiningDate: employee.joiningDate,
      dynamicFields: employee.dynamicFields ? (employee.dynamicFields instanceof Map ? Object.fromEntries(employee.dynamicFields) : employee.dynamicFields) : {},
      taxRegime: employee.taxRegime || 'new',
      ptState: employee.ptState || 'maharashtra',
    },
    templateKey: company.templateKey,
  };
};

// @desc    Prepare Draft Payslip for Live Preview
// @route   POST /api/payslips/prepare-draft
const prepareDraftPayslip = async (req, res) => {
  try {
    const { employeeId, month, year, customOverrides } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employeeId, month, and year.',
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const company = await Company.findById(employee.companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Associated company not found' });
    }

    let financials;
    const existingPayslip = await Payslip.findOne({
      companyId: company._id,
      employeeId: employee._id,
      month,
      year: Number(year),
    });

    if (existingPayslip && (!customOverrides || Object.keys(customOverrides).length === 0)) {
      financials = {
        workingDays: existingPayslip.workingDays,
        paidDays: existingPayslip.paidDays,
        lopDays: existingPayslip.lopDays,
        payRatio: existingPayslip.workingDays > 0 ? (existingPayslip.paidDays / existingPayslip.workingDays) : 1,
        earnings: existingPayslip.earnings,
        deductions: existingPayslip.deductions,
        grossEarnings: existingPayslip.grossEarnings,
        totalDeductions: existingPayslip.totalDeductions,
        netSalary: existingPayslip.netSalary,
        netSalaryInWords: existingPayslip.netSalaryInWords,
      };
    } else {
      financials = computePayslipFinancials(employee, company, customOverrides);
    }

    const snapshotData = existingPayslip?.snapshotData || createSnapshot(company, employee);

    res.status(200).json({
      success: true,
      draft: {
        companyId: company._id,
        employeeId: employee._id,
        month,
        year: Number(year),
        payPeriod: `${month} ${year}`,
        paymentDate: customOverrides?.paymentDate || existingPayslip?.paymentDate || new Date(),
        ...financials,
        snapshotData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate & Save Single Payslip
// @route   POST /api/payslips
const createPayslip = async (req, res) => {
  try {
    const {
      companyId,
      employeeId,
      month,
      year,
      payPeriod,
      paymentDate,
      workingDays,
      paidDays,
      lopDays,
      earnings,
      deductions,
      grossEarnings,
      totalDeductions,
      netSalary,
      netSalaryInWords,
      snapshotData,
    } = req.body;

    const employee = await Employee.findById(employeeId);
    const company = await Company.findById(companyId);

    if (!employee || !company) {
      return res.status(400).json({ success: false, message: 'Invalid employee or company reference' });
    }

    // Check if salary slip already exists for this employee for the specified month and year
    const existingPayslip = await Payslip.findOne({
      employeeId,
      month,
      year: Number(year),
    });

    if (existingPayslip) {
      return res.status(400).json({
        success: false,
        message: `A salary slip already exists for ${employee.fullName} for ${month} ${year}. Only one salary slip can be created per month. Please view or update the existing salary slip.`,
        existingId: existingPayslip._id,
      });
    }

    // Build final snapshot if not provided in request
    const finalSnapshot = snapshotData || createSnapshot(company, employee);
    const calculatedWords = netSalaryInWords || numberToWords(netSalary, company.currencyCode === 'USD' ? 'Dollars' : 'Rupees');

    const payslip = await Payslip.create({
      companyId,
      employeeId,
      month,
      year: Number(year),
      payPeriod: payPeriod || `${month} ${year}`,
      paymentDate: paymentDate || Date.now(),
      workingDays: Number(workingDays) || 30,
      paidDays: Number(paidDays) || 30,
      lopDays: Number(lopDays) || 0,
      earnings: earnings || [],
      deductions: deductions || [],
      grossEarnings: Number(grossEarnings) || 0,
      totalDeductions: Number(totalDeductions) || 0,
      netSalary: Number(netSalary) || 0,
      netSalaryInWords: calculatedWords,
      snapshotData: finalSnapshot,
      status: 'generated',
    });

    res.status(201).json({
      success: true,
      message: `Payslip for ${employee.fullName} (${month} ${year}) generated successfully!`,
      payslip,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing Payslip
// @route   PUT /api/payslips/:id
const updatePayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip record not found' });
    }

    const {
      workingDays,
      paidDays,
      lopDays,
      paymentDate,
      earnings,
      deductions,
      grossEarnings,
      totalDeductions,
      netSalary,
      netSalaryInWords,
      snapshotData,
      status,
    } = req.body;

    if (workingDays !== undefined) payslip.workingDays = Number(workingDays);
    if (paidDays !== undefined) payslip.paidDays = Number(paidDays);
    if (lopDays !== undefined) payslip.lopDays = Number(lopDays);
    if (paymentDate) payslip.paymentDate = paymentDate;
    if (earnings !== undefined) payslip.earnings = earnings;
    if (deductions !== undefined) payslip.deductions = deductions;
    if (grossEarnings !== undefined) payslip.grossEarnings = Number(grossEarnings);
    if (totalDeductions !== undefined) payslip.totalDeductions = Number(totalDeductions);
    if (netSalary !== undefined) payslip.netSalary = Number(netSalary);
    if (status !== undefined) payslip.status = status;

    if (snapshotData !== undefined) {
      payslip.snapshotData = {
        ...payslip.snapshotData,
        ...snapshotData,
      };

      // If company branding/logo was changed in snapshotData, sync it to Company and other payslips
      if (snapshotData.company) {
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
          'extraSpacerHeight', 'minTableRows'
        ];
        const compUpdates = {};
        const allSlipsSync = {};
        logoFields.forEach((f) => {
          if (snapshotData.company[f] !== undefined) {
            compUpdates[f] = snapshotData.company[f];
            allSlipsSync[`snapshotData.company.${f}`] = snapshotData.company[f];
          }
        });
        if (Object.keys(compUpdates).length > 0) {
          await Company.findByIdAndUpdate(payslip.companyId, compUpdates);
          await Payslip.updateMany({ companyId: payslip.companyId }, { $set: allSlipsSync });
        }
      }
    }

    const company = await Company.findById(payslip.companyId);
    const currencyName = company?.currencyCode === 'USD' ? 'Dollars' : 'Rupees';
    payslip.netSalaryInWords = netSalaryInWords || numberToWords(payslip.netSalary, currencyName);

    await payslip.save();

    res.status(200).json({
      success: true,
      message: `Salary slip for ${payslip.payPeriod} updated successfully!`,
      payslip,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk Generate Payslips for a Date Range (e.g. Jan 2026 to Jun 2026)
// @route   POST /api/payslips/bulk-generate
const generateBulkPayslips = async (req, res) => {
  try {
    const {
      employeeId,
      startMonth,
      startYear,
      endMonth,
      endYear,
      workingDays = 30,
    } = req.body;

    if (!employeeId || !startMonth || !startYear || !endMonth || !endYear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employeeId, startMonth, startYear, endMonth, and endYear.',
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const company = await Company.findById(employee.companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const startIndex = MONTH_NAMES.indexOf(startMonth);
    const endIndex = MONTH_NAMES.indexOf(endMonth);

    if (startIndex === -1 || endIndex === -1) {
      return res.status(400).json({ success: false, message: 'Invalid month format.' });
    }

    const startTotalMonths = Number(startYear) * 12 + startIndex;
    const endTotalMonths = Number(endYear) * 12 + endIndex;

    if (endTotalMonths < startTotalMonths) {
      return res.status(400).json({
        success: false,
        message: 'End period cannot be before Start period.',
      });
    }

    const createdPayslips = [];
    const snapshotData = createSnapshot(company, employee);

    for (let current = startTotalMonths; current <= endTotalMonths; current++) {
      const year = Math.floor(current / 12);
      const monthIdx = current % 12;
      const month = MONTH_NAMES[monthIdx];
      const payPeriod = `${month} ${year}`;

      const financials = computePayslipFinancials(employee, company, { workingDays, paidDays: workingDays, lopDays: 0 });

      // Upsert payslip for this month/year for the employee
      const payslip = await Payslip.findOneAndUpdate(
        { employeeId, month, year },
        {
          companyId: company._id,
          employeeId: employee._id,
          month,
          year,
          payPeriod,
          paymentDate: new Date(year, monthIdx + 1, 0), // Last day of month
          workingDays,
          paidDays: workingDays,
          lopDays: 0,
          earnings: financials.earnings,
          deductions: financials.deductions,
          grossEarnings: financials.grossEarnings,
          totalDeductions: financials.totalDeductions,
          netSalary: financials.netSalary,
          netSalaryInWords: financials.netSalaryInWords,
          snapshotData,
          status: 'generated',
        },
        { upsert: true, new: true }
      );

      createdPayslips.push(payslip);
    }

    res.status(201).json({
      success: true,
      message: `Successfully generated ${createdPayslips.length} payslips from ${startMonth} ${startYear} to ${endMonth} ${endYear}!`,
      count: createdPayslips.length,
      payslips: createdPayslips,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all historical payslips
// @route   GET /api/payslips
const getPayslips = async (req, res) => {
  try {
    const { companyId, employeeId, year, month } = req.query;
    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (employeeId) filter.employeeId = employeeId;
    if (year) filter.year = Number(year);
    if (month) filter.month = month;

    const payslips = await Payslip.find(filter)
      .populate('employeeId', 'fullName empCode designation department')
      .populate('companyId', 'name templateKey currency')
      .sort({ year: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payslips.length,
      payslips,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single payslip by ID
// @route   GET /api/payslips/:id
const getPayslipById = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate('employeeId')
      .populate('companyId');

    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    res.status(200).json({ success: true, payslip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete payslip
// @route   DELETE /api/payslips/:id
const deletePayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findByIdAndDelete(req.params.id);
    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Payslip record deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Bank Payment Advice Report for a given month and year
// @route   GET /api/payslips/reports/bank-advice?companyId=XYZ&month=August&year=2026
const getBankAdviceReport = async (req, res) => {
  try {
    const { companyId, month, year } = req.query;
    if (!companyId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide companyId, month, and year for the bank advice report.',
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const payslips = await Payslip.find({
      companyId,
      month,
      year: Number(year),
    }).populate('employeeId');

    const records = payslips.map((slip, idx) => {
      const emp = slip.employeeId || {};
      const snapEmp = slip.snapshotData?.employee || {};
      const dynamic = snapEmp.dynamicFields || (emp.dynamicFields instanceof Map ? Object.fromEntries(emp.dynamicFields) : (emp.dynamicFields || {}));

      const bankName = dynamic.bankName || dynamic.bankNameAccount || 'Not Specified';
      const bankAccount = dynamic.bankAccount || 'Not Specified';
      const ifscCode = dynamic.ifscCode || 'Not Specified';

      return {
        srNo: idx + 1,
        empCode: snapEmp.empCode || emp.empCode || '',
        beneficiaryName: snapEmp.fullName || emp.fullName || '',
        bankName,
        accountNumber: bankAccount,
        ifscCode,
        netPayableAmount: slip.netSalary || 0,
        paymentDate: slip.paymentDate ? new Date(slip.paymentDate).toISOString().split('T')[0] : '',
        narration: `Salary for ${month} ${year}`,
      };
    });

    const totalPayout = records.reduce((sum, r) => sum + r.netPayableAmount, 0);

    res.status(200).json({
      success: true,
      reportType: 'Bank Payment Advice',
      companyName: company.name,
      month,
      year: Number(year),
      totalEmployees: records.length,
      totalPayout,
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export EPF ECR Report for a given month and year
// @route   GET /api/payslips/reports/epf-ecr?companyId=XYZ&month=August&year=2026
const getEpfEcrReport = async (req, res) => {
  try {
    const { companyId, month, year } = req.query;
    if (!companyId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide companyId, month, and year for EPF ECR report.',
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const payslips = await Payslip.find({
      companyId,
      month,
      year: Number(year),
    }).populate('employeeId');

    const records = payslips.map((slip, idx) => {
      const emp = slip.employeeId || {};
      const snapEmp = slip.snapshotData?.employee || {};
      const dynamic = snapEmp.dynamicFields || (emp.dynamicFields instanceof Map ? Object.fromEntries(emp.dynamicFields) : (emp.dynamicFields || {}));

      // Find Basic Pay & PF Deduction
      const basicItem = (slip.earnings || []).find((e) => e.label.toLowerCase().includes('basic'));
      const basicPay = basicItem ? Number(basicItem.amount) : 0;

      const pfItem = (slip.deductions || []).find((d) => d.label.toLowerCase().includes('provident') || d.label.toLowerCase().includes('pf'));
      const eePf = pfItem ? Number(pfItem.amount) : Math.round(basicPay * 0.12);

      const epfWages = Math.min(basicPay, 15000);
      const epsWages = epfWages;
      const erEpsShare = Math.round(epsWages * 0.0833);
      const erEpfShare = Math.max(0, eePf - erEpsShare);

      return {
        srNo: idx + 1,
        uan: dynamic.uanNumber || '000000000000',
        memberId: dynamic.pfNumber || 'MH/00000/000',
        memberName: snapEmp.fullName || emp.fullName || '',
        grossWages: slip.grossEarnings || 0,
        epfWages: basicPay,
        epsWages,
        edliWages: epsWages,
        eeShare: eePf,
        erEpsShare,
        erEpfShare,
        totalRefundOfAdvances: 0,
        ncpDays: slip.lopDays || 0,
      };
    });

    const totalEeShare = records.reduce((sum, r) => sum + r.eeShare, 0);
    const totalErEps = records.reduce((sum, r) => sum + r.erEpsShare, 0);
    const totalErEpf = records.reduce((sum, r) => sum + r.erEpfShare, 0);

    res.status(200).json({
      success: true,
      reportType: 'EPF Electronic Challan Cum Return (ECR)',
      companyName: company.name,
      month,
      year: Number(year),
      totalMembers: records.length,
      totalSummary: {
        totalEeShare,
        totalErEps,
        totalErEpf,
        grandTotal: totalEeShare + totalErEps + totalErEpf,
      },
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  prepareDraftPayslip,
  createPayslip,
  updatePayslip,
  generateBulkPayslips,
  getPayslips,
  getPayslipById,
  deletePayslip,
  getBankAdviceReport,
  getEpfEcrReport,
};
