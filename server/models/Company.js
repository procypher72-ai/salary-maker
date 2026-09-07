const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide company name'],
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
    fullAddress: {
      type: String,
      trim: true,
    },
    gstin: {
      type: String,
      trim: true,
    },
    pan: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    logoWidth: {
      type: Number,
      default: 65,
    },
    logoHeight: {
      type: Number,
      default: 65,
    },
    logoPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    logoOffsetX: {
      type: Number,
      default: 0,
    },
    logoOffsetY: {
      type: Number,
      default: 0,
    },
    // Secondary / Co-branding logo (e.g. G20, ISO, Seal)
    secondaryLogoUrl: {
      type: String,
      default: '',
    },
    secondaryLogoWidth: {
      type: Number,
      default: 85,
    },
    secondaryLogoHeight: {
      type: Number,
      default: 60,
    },
    secondaryLogoPosition: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'right',
    },
    secondaryLogoOffsetX: {
      type: Number,
      default: 0,
    },
    secondaryLogoOffsetY: {
      type: Number,
      default: 0,
    },
    templateKey: {
      type: String,
      enum: ['corporate_detailed', 'minimalist_startup', 'standard_industrial', 'classic_tabular', 'hcl_corporate_tech', 'aiims_govt_medical', 'concentrix_daksh', 'sushma_buildtech'],
      default: 'corporate_detailed',
    },
    // Salary Slip Dimensions, Borders, and Income/Deduction Layout Customization
    slipWidth: {
      type: Number,
      default: 950, // width in px
    },
    slipMinHeight: {
      type: Number,
      default: 0, // min-height in px (0 = auto)
    },
    slipPadding: {
      type: Number,
      default: 24, // inner padding in px
    },
    slipBorderWidth: {
      type: Number,
      default: 1, // outer border thickness in px
    },
    slipBorderStyle: {
      type: String,
      enum: ['solid', 'dashed', 'dotted', 'double', 'groove', 'none'],
      default: 'solid',
    },
    slipBorderColor: {
      type: String,
      default: '#000000',
    },
    slipBorderRadius: {
      type: Number,
      default: 0, // border radius in px
    },
    incomeDeductionHeight: {
      type: Number,
      default: 30, // row min-height / vertical cell spacing in px
    },
    incomeDeductionMinHeight: {
      type: Number,
      default: 160, // table min-height in px
    },
    incomeColumnWidth: {
      type: Number,
      default: 50, // Earnings column width split % (e.g. 50 = 50% / 50%)
    },
    tableBorderWidth: {
      type: Number,
      default: 1, // inner table borders thickness in px
    },
    tableBorderStyle: {
      type: String,
      enum: ['solid', 'dashed', 'dotted', 'double', 'none'],
      default: 'solid',
    },
    tableBorderColor: {
      type: String,
      default: '#000000',
    },
    fontSizeScale: {
      type: Number,
      default: 100, // percentage font scale 80% - 130%
    },
    currency: {
      type: String,
      default: '₹',
    },
    currencyCode: {
      type: String,
      default: 'INR',
    },
    signatoryName: {
      type: String,
      default: 'Authorized Signatory',
    },
    signatoryDesignation: {
      type: String,
      default: 'Head of Human Resources',
    },
    // Digital Signature Asset & Sizing
    signatureUrl: {
      type: String,
      default: '',
    },
    signatureWidth: {
      type: Number,
      default: 120,
    },
    signatureHeight: {
      type: Number,
      default: 50,
    },
    signatureOffsetX: {
      type: Number,
      default: 0,
    },
    signatureOffsetY: {
      type: Number,
      default: 0,
    },
    showSignature: {
      type: Boolean,
      default: true,
    },
    // Company Official Seal / Stamp Asset & Sizing
    stampUrl: {
      type: String,
      default: '',
    },
    stampWidth: {
      type: Number,
      default: 90,
    },
    stampHeight: {
      type: Number,
      default: 90,
    },
    stampOffsetX: {
      type: Number,
      default: 0,
    },
    stampOffsetY: {
      type: Number,
      default: 0,
    },
    stampOpacity: {
      type: Number,
      default: 85, // opacity percentage 0 - 100
    },
    showStamp: {
      type: Boolean,
      default: true,
    },
    // Statutory Default Settings
    ptState: {
      type: String,
      default: 'maharashtra',
    },
    pfCalculationType: {
      type: String,
      enum: ['statutory_cap', 'actual_basic', 'opt_out'],
      default: 'statutory_cap',
    },
    defaultTaxRegime: {
      type: String,
      enum: ['new', 'old'],
      default: 'new',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
