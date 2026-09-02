const mongoose = require('mongoose');

const templateFieldSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'date', 'select'], default: 'text' },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  options: [{ type: String }],
  section: { type: String, enum: ['personal', 'statutory', 'banking', 'job'], default: 'job' },
});

const salaryTemplateSchema = new mongoose.Schema(
  {
    templateKey: {
      type: String,
      required: true,
      unique: true,
      enum: ['corporate_detailed', 'minimalist_startup', 'standard_industrial', 'classic_tabular', 'hcl_corporate_tech', 'aiims_govt_medical', 'concentrix_daksh', 'sushma_buildtech'],
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      default: 'Standard',
    },
    colorScheme: {
      primary: { type: String, default: '#6366f1' },
      secondary: { type: String, default: '#0f172a' },
      accent: { type: String, default: '#06b6d4' },
    },
    // Dynamic fields required by this template during employee registration
    requiredFields: [templateFieldSchema],
    
    // Default earnings components configured for this template
    defaultEarnings: [
      {
        label: { type: String, required: true },
        isFixed: { type: Boolean, default: true },
      },
    ],

    // Default deductions components configured for this template
    defaultDeductions: [
      {
        label: { type: String, required: true },
        isFixed: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SalaryTemplate', salaryTemplateSchema);
