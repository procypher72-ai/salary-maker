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
  } else {
    // Generate standard earnings list based on baseline salary
    if (base.basicPay) earnings.push({ label: 'Basic Salary', amount: Math.round(base.basicPay * payRatio) });
    if (base.hra) earnings.push({ label: 'House Rent Allowance (HRA)', amount: Math.round(base.hra * payRatio) });
    if (base.specialAllowance) earnings.push({ label: 'Special Allowance', amount: Math.round(base.specialAllowance * payRatio) });
    if (base.conveyanceAllowance) earnings.push({ label: 'Conveyance Allowance', amount: Math.round(base.conveyanceAllowance * payRatio) });
    if (base.medicalAllowance) earnings.push({ label: 'Medical Allowance', amount: Math.round(base.medicalAllowance * payRatio) });
    if (base.otherAllowances) earnings.push({ label: 'Other Allowances', amount: Math.round(base.otherAllowances * payRatio) });
  }

  if (customOverrides.deductions && Array.isArray(customOverrides.deductions)) {
    deductions = customOverrides.deductions.map((d) => ({
      label: d.label,
      amount: Number(d.amount) || 0,
    }));
  } else {
    // Generate standard deductions list based on baseline salary
    if (base.pfDeduction) deductions.push({ label: 'Provident Fund (PF)', amount: Number(base.pfDeduction) });
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
      templateKey: company.templateKey,
    },
    employee: {
      empCode: employee.empCode,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      department: employee.department,
      joiningDate: employee.joiningDate,
      dynamicFields: employee.dynamicFields ? Object.fromEntries(employee.dynamicFields) : {},
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

    const financials = computePayslipFinancials(employee, company, customOverrides);
    const snapshotData = createSnapshot(company, employee);

    res.status(200).json({
      success: true,
      draft: {
        companyId: company._id,
        employeeId: employee._id,
        month,
        year: Number(year),
        payPeriod: `${month} ${year}`,
        paymentDate: customOverrides?.paymentDate || new Date(),
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

module.exports = {
  prepareDraftPayslip,
  createPayslip,
  generateBulkPayslips,
  getPayslips,
  getPayslipById,
  deletePayslip,
};
