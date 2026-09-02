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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
