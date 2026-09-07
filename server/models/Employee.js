const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company association is required'],
    },
    empCode: {
      type: String,
      required: [true, 'Employee Code/ID is required'],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Employee Full Name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    
    // Dynamic key-value map for template-specific fields
    // (e.g. panNumber, uanNumber, pfNumber, bankName, bankAccount, ifscCode, location)
    dynamicFields: {
      type: Map,
      of: String,
      default: {},
    },

    // Baseline compensation structure (monthly amounts)
    baselineSalary: {
      basicPay: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      specialAllowance: { type: Number, default: 0 },
      conveyanceAllowance: { type: Number, default: 0 },
      medicalAllowance: { type: Number, default: 0 },
      otherAllowances: { type: Number, default: 0 },
      
      // Standard deductions
      pfDeduction: { type: Number, default: 0 },
      esicDeduction: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      tds: { type: Number, default: 0 },
      otherDeductions: { type: Number, default: 0 },
    },

    ctcAnnual: {
      type: Number,
      default: 0,
    },
    taxRegime: {
      type: String,
      enum: ['new', 'old'],
      default: 'new',
    },
    ptState: {
      type: String,
      default: 'maharashtra',
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Compound index to ensure empCode is unique per company
employeeSchema.index({ companyId: 1, empCode: 1 }, { unique: true });

module.exports = mongoose.model('Employee', employeeSchema);
