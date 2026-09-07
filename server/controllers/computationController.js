const Computation = require('../models/Computation');
const Employee = require('../models/Employee');
const Company = require('../models/Company');
const Payslip = require('../models/Payslip');

// Month mapping for Financial Year (April -> March)
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Helper to parse FY string like '2024-2025' or '2025-2026'
 */
const parseFinancialYear = (fyStr) => {
  const parts = fyStr.split('-').map((p) => parseInt(p.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { startYear: parts[0], endYear: parts[1] };
  }
  const currentYear = new Date().getFullYear();
  return { startYear: currentYear - 1, endYear: currentYear };
};

// @desc    Get all computations
// @route   GET /api/computations
// @access  Private
exports.getComputations = async (req, res) => {
  try {
    const { companyId, employeeId, financialYear } = req.query;
    const filter = {};

    if (companyId) filter.companyId = companyId;
    if (employeeId) filter.employeeId = employeeId;
    if (financialYear) filter.financialYear = financialYear;

    const computations = await Computation.find(filter)
      .populate('employeeId', 'fullName empCode designation department panNumber')
      .populate('companyId', 'name gstin logoUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: computations.length,
      computations,
    });
  } catch (error) {
    console.error('Error fetching computations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch computations',
      error: error.message,
    });
  }
};

// @desc    Get single computation by ID
// @route   GET /api/computations/:id
// @access  Private
exports.getComputationById = async (req, res) => {
  try {
    const computation = await Computation.findById(req.params.id)
      .populate('employeeId')
      .populate('companyId');

    if (!computation) {
      return res.status(404).json({
        success: false,
        message: 'Computation not found',
      });
    }

    res.status(200).json({
      success: true,
      computation,
    });
  } catch (error) {
    console.error('Error fetching computation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch computation',
      error: error.message,
    });
  }
};

// @desc    Create new computation
// @route   POST /api/computations
// @access  Private
exports.createComputation = async (req, res) => {
  try {
    const computationData = req.body;

    if (!computationData.companyId || !computationData.employeeId || !computationData.financialYear) {
      return res.status(400).json({
        success: false,
        message: 'Company, Employee, and Financial Year are required',
      });
    }

    const computation = await Computation.create(computationData);

    const populated = await Computation.findById(computation._id)
      .populate('employeeId', 'fullName empCode designation department')
      .populate('companyId', 'name logoUrl');

    res.status(201).json({
      success: true,
      message: 'Tax computation created successfully',
      computation: populated,
    });
  } catch (error) {
    console.error('Error creating computation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create computation',
      error: error.message,
    });
  }
};

// @desc    Update computation
// @route   PUT /api/computations/:id
// @access  Private
exports.updateComputation = async (req, res) => {
  try {
    let computation = await Computation.findById(req.params.id);

    if (!computation) {
      return res.status(404).json({
        success: false,
        message: 'Computation not found',
      });
    }

    computation = await Computation.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('employeeId', 'fullName empCode designation department')
      .populate('companyId', 'name logoUrl');

    res.status(200).json({
      success: true,
      message: 'Tax computation updated successfully',
      computation,
    });
  } catch (error) {
    console.error('Error updating computation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update computation',
      error: error.message,
    });
  }
};

// @desc    Delete computation
// @route   DELETE /api/computations/:id
// @access  Private
exports.deleteComputation = async (req, res) => {
  try {
    const computation = await Computation.findById(req.params.id);

    if (!computation) {
      return res.status(404).json({
        success: false,
        message: 'Computation not found',
      });
    }

    await Computation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Tax computation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting computation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete computation',
      error: error.message,
    });
  }
};

// @desc    Aggregate employee salary from payslips for a financial year
// @route   GET /api/computations/aggregate-salary
// @access  Private
exports.aggregateEmployeeSalaryForFY = async (req, res) => {
  try {
    const { employeeId, financialYear } = req.query;

    if (!employeeId || !financialYear) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and Financial Year are required',
      });
    }

    const employee = await Employee.findById(employeeId).populate('companyId');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const { startYear, endYear } = parseFinancialYear(financialYear);

    // Fetch all payslips for this employee
    const allPayslips = await Payslip.find({ employeeId }).sort({ year: 1, month: 1 });

    // Filter payslips belonging to the FY (April of startYear to March of endYear)
    const fyPayslips = allPayslips.filter((slip) => {
      const slipYear = Number(slip.year);
      const slipMonth = slip.month; // e.g. "April", "04", etc.
      let monthIndex = -1;

      if (!isNaN(slipMonth)) {
        monthIndex = parseInt(slipMonth, 10) - 1;
      } else {
        monthIndex = MONTH_NAMES.findIndex(
          (m) => m.toLowerCase() === String(slipMonth).toLowerCase()
        );
      }

      if (monthIndex >= 3 && slipYear === startYear) {
        // April (3) to December (11) of startYear
        return true;
      }
      if (monthIndex >= 0 && monthIndex <= 2 && slipYear === endYear) {
        // January (0) to March (2) of endYear
        return true;
      }
      return false;
    });

    let totalGross = 0;
    let basicSalary = 0;
    let totalAllowances = 0;
    let professionalTax = 0;
    let totalTdsDeducted = 0;
    const earningsByLabel = {};
    const monthsIncluded = [];

    fyPayslips.forEach((slip) => {
      monthsIncluded.push(`${slip.month} ${slip.year}`);
      totalGross += Number(slip.grossEarnings) || 0;

      // Group earnings
      if (Array.isArray(slip.earnings)) {
        slip.earnings.forEach((item) => {
          const lbl = (item.label || 'Other').trim();
          const amt = Number(item.amount) || 0;
          earningsByLabel[lbl] = (earningsByLabel[lbl] || 0) + amt;

          if (lbl.toLowerCase().includes('basic')) {
            basicSalary += amt;
          } else {
            totalAllowances += amt;
          }
        });
      }

      // Check deductions for PT & TDS
      if (Array.isArray(slip.deductions)) {
        slip.deductions.forEach((item) => {
          const lbl = (item.label || '').toLowerCase();
          const amt = Number(item.amount) || 0;
          if (lbl.includes('professional') || lbl === 'pt') {
            professionalTax += amt;
          }
          if (lbl.includes('tds') || lbl.includes('tax')) {
            totalTdsDeducted += amt;
          }
        });
      }
    });

    // If no payslips were found in FY, fallback to employee baseline monthly * 12
    const baseline = employee.baselineSalary || {};
    const fallbackMonths = 12;
    if (fyPayslips.length === 0) {
      basicSalary = (Number(baseline.basicPay) || 0) * fallbackMonths;
      const otherAllowances =
        ((Number(baseline.hra) || 0) +
          (Number(baseline.specialAllowance) || 0) +
          (Number(baseline.conveyanceAllowance) || 0) +
          (Number(baseline.medicalAllowance) || 0) +
          (Number(baseline.otherAllowances) || 0)) *
        fallbackMonths;
      totalAllowances = otherAllowances;
      totalGross = basicSalary + totalAllowances;
      professionalTax = (Number(baseline.professionalTax) || 0) * fallbackMonths;
      totalTdsDeducted = (Number(baseline.tds) || 0) * fallbackMonths;

      earningsByLabel['Basic Salary'] = basicSalary;
      if (baseline.hra) earningsByLabel['House Rent Allowance'] = baseline.hra * 12;
      if (baseline.specialAllowance) earningsByLabel['Special Allowance'] = baseline.specialAllowance * 12;
    }

    // Build salaryBreakdown array for computation schedule
    const salaryBreakdown = Object.keys(earningsByLabel).map((lbl) => ({
      particular: lbl,
      totalAmount: earningsByLabel[lbl],
      exemptedAmount: 0,
      taxableAmount: earningsByLabel[lbl],
    }));

    // If empty, supply default Basic Salary
    if (salaryBreakdown.length === 0) {
      salaryBreakdown.push({
        particular: 'Basic Salary',
        totalAmount: basicSalary || totalGross || 0,
        exemptedAmount: 0,
        taxableAmount: basicSalary || totalGross || 0,
      });
    }

    const company = employee.companyId || {};
    const dynamicFields = employee.dynamicFields instanceof Map 
      ? Object.fromEntries(employee.dynamicFields) 
      : (employee.dynamicFields || {});

    // Assessment year is FY startYear + 1 to endYear + 1
    const assessmentYear = `${startYear + 1}-${endYear + 1}`;

    res.status(200).json({
      success: true,
      data: {
        financialYear,
        assessmentYear,
        monthsCount: fyPayslips.length || 12,
        isFromPayslips: fyPayslips.length > 0,
        monthsIncluded,
        personalDetails: {
          name: employee.fullName,
          fathersName: dynamicFields.fathersName || dynamicFields.fatherName || '',
          officeAddress: company.fullAddress || '',
          residentialAddress: dynamicFields.residentialAddress || dynamicFields.address || '',
          pan: dynamicFields.panNumber || dynamicFields.pan || employee.panNumber || '',
          dob: dynamicFields.dob || dynamicFields.dateOfBirth || '',
          gender: dynamicFields.gender || 'Male',
          status: 'Individual',
          residentStatus: 'Resident',
        },
        salaryDetails: {
          employerName: company.name || '',
          employmentMonths: fyPayslips.length || 12,
          basicSalary,
          allowances: totalAllowances,
          totalGross,
          exemptedAllowances: 0,
          standardDeduction: 75000,
          professionalTax,
          taxableSalary: Math.max(0, totalGross - 75000 - professionalTax),
          salaryBreakdown,
        },
        taxesPaid: {
          tdsSalary: totalTdsDeducted,
        },
      },
    });
  } catch (error) {
    console.error('Error aggregating salary for FY:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to aggregate salary for financial year',
      error: error.message,
    });
  }
};
