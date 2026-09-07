const mongoose = require('mongoose');

const computationSchema = new mongoose.Schema(
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
    financialYear: {
      type: String,
      required: true, // e.g. '2025-2026'
    },
    assessmentYear: {
      type: String,
      required: true, // e.g. '2026-2027'
    },
    regime: {
      type: String,
      enum: ['new_115bac', 'old'],
      default: 'new_115bac',
    },
    returnType: {
      type: String,
      default: 'ORIGINAL',
    },
    filingSection: {
      type: String,
      default: '139(1)',
    },
    filingDueDate: {
      type: String,
      default: '31/07/2026',
    },
    interestCalculatedUpto: {
      type: String,
      default: '',
    },
    templateId: {
      type: String,
      default: 'kdk_zenit', // 'kdk_zenit', 'modern_executive', 'ca_audit'
    },

    // Snapshot of personal details
    personalDetails: {
      name: { type: String, default: '' },
      fathersName: { type: String, default: '' },
      officeAddress: { type: String, default: '' },
      residentialAddress: { type: String, default: '' },
      pan: { type: String, default: '' },
      dob: { type: String, default: '' },
      gender: { type: String, default: 'Male' },
      status: { type: String, default: 'Individual' },
      residentStatus: { type: String, default: 'Resident' },
    },

    // 5 Heads of Income
    headsOfIncome: {
      salary: {
        employerName: { type: String, default: '' },
        employmentMonths: { type: Number, default: 12 },
        basicSalary: { type: Number, default: 0 },
        allowances: { type: Number, default: 0 },
        totalGross: { type: Number, default: 0 },
        exemptedAllowances: { type: Number, default: 0 },
        standardDeduction: { type: Number, default: 75000 },
        professionalTax: { type: Number, default: 0 },
        taxableSalary: { type: Number, default: 0 },
        salaryBreakdown: [
          {
            particular: { type: String, default: '' },
            totalAmount: { type: Number, default: 0 },
            exemptedAmount: { type: Number, default: 0 },
            taxableAmount: { type: Number, default: 0 },
          },
        ],
      },
      houseProperty: {
        annualValue: { type: Number, default: 0 },
        municipalTaxes: { type: Number, default: 0 },
        standardDeduction30: { type: Number, default: 0 },
        interestOnHousingLoan: { type: Number, default: 0 },
        netIncome: { type: Number, default: 0 },
      },
      businessProfession: {
        netProfit: { type: Number, default: 0 },
      },
      capitalGains: {
        shortTermNormal: { type: Number, default: 0 },
        shortTerm15: { type: Number, default: 0 },
        longTerm10: { type: Number, default: 0 },
        longTerm20: { type: Number, default: 0 },
        netGains: { type: Number, default: 0 },
      },
      otherSources: {
        interestSavings: { type: Number, default: 0 },
        interestFdr: { type: Number, default: 0 },
        dividendIncome: { type: Number, default: 0 },
        otherIncome: { type: Number, default: 0 },
        totalOtherSources: { type: Number, default: 0 },
        breakdown: [
          {
            label: { type: String, default: '' },
            amount: { type: Number, default: 0 },
          },
        ],
      },
    },

    grossTotalIncome: { type: Number, default: 0 },

    // Chapter VI-A Deductions
    deductionsChapterVIA: [
      {
        section: { type: String, default: '' },
        description: { type: String, default: '' },
        grossAmount: { type: Number, default: 0 },
        deductibleAmount: { type: Number, default: 0 },
      },
    ],
    totalDeductionsChapterVIA: { type: Number, default: 0 },

    totalIncome: { type: Number, default: 0 },
    roundedTotalIncome: { type: Number, default: 0 }, // u/s 288A
    taxableNormalRate: { type: Number, default: 0 },
    taxableSpecialRate: { type: Number, default: 0 },

    // Tax Computation
    taxCalculation: {
      basicExemptionLimit: { type: Number, default: 400000 },
      taxAtNormalRates: { type: Number, default: 0 },
      taxAtSpecialRates: { type: Number, default: 0 },
      totalTax: { type: Number, default: 0 },
      rebate87A: { type: Number, default: 0 },
      taxAfterRebate: { type: Number, default: 0 },
      cess: { type: Number, default: 0 },
      totalTaxWithCess: { type: Number, default: 0 },
      interest234A: { type: Number, default: 0 },
      interest234B: { type: Number, default: 0 },
      interest234BDetails: { type: String, default: '' },
      interest234C: { type: Number, default: 0 },
      interest234CDetails: { type: String, default: '' },
      totalInterest: { type: Number, default: 0 },
      totalTaxAndInterest: { type: Number, default: 0 },
      tdsSalary: { type: Number, default: 0 },
      tdsOther: { type: Number, default: 0 },
      advanceTax: { type: Number, default: 0 },
      taxDeposited140A: { type: Number, default: 0 },
      totalTaxesPaid: { type: Number, default: 0 },
      amountPayable: { type: Number, default: 0 },
      amountRefundable: { type: Number, default: 0 },
      taxRoundedOff: { type: Number, default: 0 }, // u/s 288B
    },

    challans: [
      {
        type: { type: String, default: '140A' },
        bankBranch: { type: String, default: '' },
        bsrCode: { type: String, default: '' },
        date: { type: String, default: '' },
        challanNo: { type: String, default: '' },
        amount: { type: Number, default: 0 },
      },
    ],

    verifiedBy: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true, strict: false }
);

// Compound indexes for fast query and retrieval
computationSchema.index({ companyId: 1, employeeId: 1, financialYear: 1 });
computationSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('Computation', computationSchema);
