const Employee = require('../models/Employee');
const Company = require('../models/Company');

// @desc    Get all employees (optionally filtered by companyId)
// @route   GET /api/employees?companyId=XYZ
const getEmployees = async (req, res) => {
  try {
    const { companyId } = req.query;
    const filter = companyId ? { companyId } : {};

    const employees = await Employee.find(filter)
      .populate('companyId', 'name templateKey currency')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('companyId');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const {
      companyId,
      empCode,
      fullName,
      email,
      phone,
      designation,
      department,
      joiningDate,
      dynamicFields,
      baselineSalary,
    } = req.body;

    if (!companyId || !empCode || !fullName || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Company, Employee ID/Code, Full Name, and Designation.',
      });
    }

    // Check duplicate empCode in company
    const existing = await Employee.findOne({ companyId, empCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Employee with ID '${empCode}' already exists in this company.`,
      });
    }

    const employee = await Employee.create({
      companyId,
      empCode,
      fullName,
      email,
      phone,
      designation,
      department: department || 'General',
      joiningDate: joiningDate || Date.now(),
      dynamicFields: dynamicFields || {},
      baselineSalary: baselineSalary || {},
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: `Employee "${employee.fullName}" registered successfully!`,
      employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      message: `Employee "${employee.fullName}" updated successfully!`,
      employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      message: `Employee "${employee.fullName}" deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Seed sample starter employees if company exists
const seedDefaultEmployees = async (companyId) => {
  try {
    const count = await Employee.countDocuments({ companyId });
    if (count === 0 && companyId) {
      await Employee.create([
        {
          companyId,
          empCode: 'NX-101',
          fullName: 'Aarav Sharma',
          email: 'aarav.sharma@nexustech.io',
          phone: '+91 98765 43210',
          designation: 'Principal Software Architect',
          department: 'Engineering',
          joiningDate: new Date('2023-03-15'),
          dynamicFields: {
            panNumber: 'BNZPS8821K',
            uanNumber: '101239847123',
            pfNumber: 'MH/BAN/0048192/001',
            bankName: 'HDFC Bank',
            bankAccount: '50100482910482',
            ifscCode: 'HDFC0001234',
            department: 'Engineering',
            location: 'Bengaluru Campus',
          },
          baselineSalary: {
            basicPay: 85000,
            hra: 34000,
            specialAllowance: 21000,
            conveyanceAllowance: 3000,
            medicalAllowance: 2500,
            otherAllowances: 0,
            pfDeduction: 1800,
            professionalTax: 200,
            tds: 6500,
            otherDeductions: 0,
          },
        },
        {
          companyId,
          empCode: 'NX-102',
          fullName: 'Priya Sundaram',
          email: 'priya.s@nexustech.io',
          phone: '+91 98111 22334',
          designation: 'Senior Product Manager',
          department: 'Product & Design',
          joiningDate: new Date('2024-01-10'),
          dynamicFields: {
            panNumber: 'CPXPS4419M',
            uanNumber: '101558291048',
            pfNumber: 'MH/BAN/0048192/002',
            bankName: 'ICICI Bank',
            bankAccount: '001205004921',
            ifscCode: 'ICIC0000012',
            department: 'Product & Design',
            location: 'Bengaluru Campus',
          },
          baselineSalary: {
            basicPay: 70000,
            hra: 28000,
            specialAllowance: 15000,
            conveyanceAllowance: 2000,
            medicalAllowance: 1500,
            otherAllowances: 0,
            pfDeduction: 1800,
            professionalTax: 200,
            tds: 4200,
            otherDeductions: 0,
          },
        },
      ]);
    }

    // Seed Harwinder Singh for Arunima Constructions
    const arunimaComp = await Company.findOne({ name: 'Arunima Constructions Private Limited' });
    if (arunimaComp) {
      const existingHarwinder = await Employee.findOne({ companyId: arunimaComp._id, empCode: '51410' });
      if (!existingHarwinder) {
        await Employee.create({
          companyId: arunimaComp._id,
          empCode: '51410',
          fullName: 'HARWINDER SINGH',
          email: 'harwinder.singh@arunimaconstructions.com',
          phone: '+91 98765 00000',
          designation: 'Land Surveyor',
          department: 'Survey',
          joiningDate: new Date('2023-11-01'),
          dynamicFields: {
            vertical: 'Survey',
            location: 'Chandigarh',
            dempDoj: '01/11/2023',
            gender: 'M',
            panNumber: 'NQBPS8394P',
            pfNumber: 'PB/CHD/29780/38554',
            uanNumber: '101719643698',
            bankName: 'BOI BANK',
            bankAccount: '600810110006756',
          },
          baselineSalary: {
            basicPay: 97000,
            hra: 48500,
            specialAllowance: 24250,
            conveyanceAllowance: 8080,
            medicalAllowance: 24700,
            otherAllowances: 0,
            pfDeduction: 17460,
            professionalTax: 200,
            tds: 31547,
            otherDeductions: 0,
          },
        });
        console.log('✅ Seeded PDF Sample Employee: HARWINDER SINGH (51410)');
      }
    }

    // Seed Hardeep Singh for HCL Technologies Ltd.
    const hclComp = await Company.findOne({ name: 'HCL Technologies Ltd.' });
    if (hclComp) {
      const existingHardeep = await Employee.findOne({ companyId: hclComp._id, empCode: 'S285679' });
      if (!existingHardeep) {
        await Employee.create({
          companyId: hclComp._id,
          empCode: 'S285679',
          fullName: 'Hardeep Singh',
          email: 'hardeep.singh@hcltech.com',
          phone: '+91 98123 45678',
          designation: 'Software Engineer',
          department: 'IT',
          joiningDate: new Date('2023-11-01'),
          dynamicFields: {
            dojGender: '01.11.2023 / Male',
            panNumber: 'KEJPS3652M',
            pfPensionNo: 'HIL EPF Trust-GN/GGN/5572/635481',
            uanNumber: '100417097851',
            bankNameAccount: 'BOI BANK 600810110006820',
            location: 'Chandigarh',
            department: 'IT',
            band: 'S2',
          },
          baselineSalary: {
            basicPay: 87450,
            hra: 34980,
            specialAllowance: 22600,
            conveyanceAllowance: 9500,
            medicalAllowance: 4500,
            otherAllowances: 45213,
            pfDeduction: 10494,
            professionalTax: 200,
            tds: 36586,
            otherDeductions: 0,
          },
        });
        console.log('✅ Seeded PDF Sample Employee: Hardeep Singh (S285679)');
      }
    }

    // Seed AMITESH KUMAR YADAV for AIIMS
    const aiimsComp = await Company.findOne({ name: 'All India Institute Of Medical Sciences' });
    if (aiimsComp) {
      const existingAmitesh = await Employee.findOne({ companyId: aiimsComp._id, empCode: 'E0400345' });
      if (!existingAmitesh) {
        await Employee.create({
          companyId: aiimsComp._id,
          empCode: 'E0400345',
          fullName: 'AMITESH KUMAR YADAV',
          email: 'amitesh.yadav@aiims.edu',
          phone: '+91 98100 11223',
          designation: 'Senior Programmer',
          department: 'IT',
          joiningDate: new Date('2021-08-01'),
          dynamicFields: {
            dealingOffice: 'Faculty Cell',
            payDetails: 'Level 10(15600 - 5400 - 39100)',
            oldSalaryCode: 'JHN163',
            pfmsNo: 'VAININ00359313',
            panNumber: 'AKLPY8113F',
            bankName: 'SBI',
            bankAccount: '20457116529',
            ifscCode: 'SBIN00033211',
            department: 'IT',
            reportDateTime: '02-Mar-2026&11:28 AM',
          },
          baselineSalary: {
            basicPay: 67400,
            hra: 26960,
            specialAllowance: 4800,
            conveyanceAllowance: 1512,
            medicalAllowance: 540,
            otherAllowances: 33154,
            pfDeduction: 10874,
            professionalTax: 20,
            tds: 7357,
            otherDeductions: 16983,
          },
        });
        console.log('✅ Seeded PDF Sample Employee: AMITESH KUMAR YADAV (E0400345)');
      }
    }
  } catch (err) {
    console.error('Error seeding sample employees:', err.message);
  }
};

// @desc    Bulk import multiple employees from JSON/CSV/Excel roster
// @route   POST /api/employees/bulk-import
const bulkImportEmployees = async (req, res) => {
  try {
    const { companyId, employees: employeeList } = req.body;

    if (!companyId || !Array.isArray(employeeList) || employeeList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide companyId and a list of employees to import.',
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const results = {
      inserted: 0,
      updated: 0,
      errors: [],
    };

    for (const [index, emp] of employeeList.entries()) {
      const empCode = emp.empCode || emp['Employee ID'] || emp['Emp Code'] || emp.id;
      const fullName = emp.fullName || emp['Full Name'] || emp['Name'] || emp.name;
      const designation = emp.designation || emp['Designation'] || 'Staff Member';
      const department = emp.department || emp['Department'] || 'General';
      const email = emp.email || emp['Email'] || '';
      const phone = emp.phone || emp['Phone'] || '';

      if (!empCode || !fullName) {
        results.errors.push({
          row: index + 1,
          message: 'Missing required Employee ID or Full Name',
        });
        continue;
      }

      // Extract baseline compensation
      const basicPay = Number(emp.basicPay || emp['Basic Pay'] || emp['Basic Salary'] || 0);
      const hra = Number(emp.hra || emp['HRA'] || 0);
      const specialAllowance = Number(emp.specialAllowance || emp['Special Allowance'] || 0);
      const conveyanceAllowance = Number(emp.conveyanceAllowance || emp['Conveyance Allowance'] || 0);
      const medicalAllowance = Number(emp.medicalAllowance || emp['Medical Allowance'] || 0);
      const otherAllowances = Number(emp.otherAllowances || emp['Other Allowances'] || 0);
      const pfDeduction = Number(emp.pfDeduction || emp['PF Deduction'] || 0);
      const professionalTax = Number(emp.professionalTax || emp['Professional Tax'] || emp['PT'] || 200);
      const tds = Number(emp.tds || emp['TDS'] || 0);

      // Extract dynamic fields (pan, uan, bank, etc.)
      const dynamicFields = {
        panNumber: emp.panNumber || emp['PAN Number'] || emp['PAN'] || '',
        uanNumber: emp.uanNumber || emp['UAN Number'] || emp['UAN'] || '',
        pfNumber: emp.pfNumber || emp['PF Number'] || emp['PF No'] || '',
        bankName: emp.bankName || emp['Bank Name'] || '',
        bankAccount: emp.bankAccount || emp['Bank Account'] || emp['Account No'] || '',
        ifscCode: emp.ifscCode || emp['IFSC Code'] || emp['IFSC'] || '',
        location: emp.location || emp['Location'] || '',
      };

      const employeeDoc = {
        companyId,
        empCode: String(empCode).trim(),
        fullName: String(fullName).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        designation: String(designation).trim(),
        department: String(department).trim(),
        joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : new Date(),
        dynamicFields,
        baselineSalary: {
          basicPay,
          hra,
          specialAllowance,
          conveyanceAllowance,
          medicalAllowance,
          otherAllowances,
          pfDeduction,
          esicDeduction: Number(emp.esicDeduction || 0),
          professionalTax,
          tds,
          otherDeductions: Number(emp.otherDeductions || 0),
        },
        taxRegime: emp.taxRegime || company.defaultTaxRegime || 'new',
        ptState: emp.ptState || company.ptState || 'maharashtra',
        status: 'active',
      };

      // Upsert employee by companyId and empCode
      const existing = await Employee.findOne({ companyId, empCode: employeeDoc.empCode });
      if (existing) {
        await Employee.findByIdAndUpdate(existing._id, employeeDoc);
        results.updated++;
      } else {
        await Employee.create(employeeDoc);
        results.inserted++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk import completed: ${results.inserted} inserted, ${results.updated} updated, ${results.errors.length} errors.`,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkImportEmployees,
  seedDefaultEmployees,
};
