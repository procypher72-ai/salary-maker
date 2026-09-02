const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
});

const payslipSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: String,
      required: true, // e.g. 'January' or '01'
    },
    year: {
      type: Number,
      required: true, // e.g. 2026
    },
    payPeriod: {
      type: String,
      required: true, // e.g. 'January 2026'
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    
    // Attendance & Days breakdown
    workingDays: { type: Number, default: 30 },
    paidDays: { type: Number, default: 30 },
    lopDays: { type: Number, default: 0 },

    // Financial line items
    earnings: [lineItemSchema],
    deductions: [lineItemSchema],

    grossEarnings: { type: Number, required: true, default: 0 },
    totalDeductions: { type: Number, required: true, default: 0 },
    netSalary: { type: Number, required: true, default: 0 },
    netSalaryInWords: { type: String, default: '' },

    // Immutable snapshot of company & employee at generation time
    snapshotData: {
      company: {
        name: String,
        email: String,
        phone: String,
        fullAddress: String,
        gstin: String,
        pan: String,
        website: String,
        logoUrl: String,
        logoWidth: Number,
        logoHeight: Number,
        logoPosition: String,
        logoOffsetX: Number,
        logoOffsetY: Number,
        secondaryLogoUrl: String,
        secondaryLogoWidth: Number,
        secondaryLogoHeight: Number,
        secondaryLogoPosition: String,
        secondaryLogoOffsetX: Number,
        secondaryLogoOffsetY: Number,
        currency: String,
        signatoryName: String,
        signatoryDesignation: String,
        templateKey: String,
      },
      employee: {
        empCode: String,
        fullName: String,
        email: String,
        phone: String,
        designation: String,
        department: String,
        joiningDate: Date,
        dynamicFields: mongoose.Schema.Types.Mixed,
      },
      templateKey: String,
    },

    status: {
      type: String,
      enum: ['draft', 'generated', 'paid'],
      default: 'generated',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payslip', payslipSchema);
