const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  calculateCtcStructure,
  calculateEPF,
  calculateESIC,
  calculatePT,
  calculateGratuity,
  PT_SLABS,
} = require('../utils/statutoryRules');
const {
  computeNewRegimeTax,
  computeOldRegimeTax,
  compareTaxRegimes,
} = require('../utils/taxEngine');

// @desc    Calculate full CTC structure
// @route   POST /api/statutory/calculate-ctc
router.post('/calculate-ctc', (req, res) => {
  try {
    const result = calculateCtcStructure(req.body || {});
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Compare Old vs New Tax Regimes & TDS
// @route   POST /api/statutory/tax-comparison
router.post('/tax-comparison', (req, res) => {
  try {
    const result = compareTaxRegimes(req.body || {});
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Calculate specific statutory deductions (EPF, ESIC, PT, Gratuity)
// @route   POST /api/statutory/deductions
router.post('/deductions', (req, res) => {
  try {
    const { basicPay = 0, grossSalary = 0, ptState = 'maharashtra', gender = 'M', month = 'January', restrictPfCap = false } = req.body;
    
    const epf = calculateEPF(Number(basicPay), Boolean(restrictPfCap));
    const esic = calculateESIC(Number(grossSalary));
    const pt = calculatePT(Number(grossSalary), ptState, gender, month);
    const gratuity = calculateGratuity(Number(basicPay));

    res.status(200).json({
      success: true,
      data: {
        epf,
        esic,
        pt,
        gratuity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get list of supported PT States
// @route   GET /api/statutory/pt-states
router.get('/pt-states', (req, res) => {
  const states = [
    { key: 'maharashtra', label: 'Maharashtra (₹200/mo, ₹300 Feb)' },
    { key: 'karnataka', label: 'Karnataka (₹200/mo for >= ₹15k)' },
    { key: 'tamil_nadu', label: 'Tamil Nadu (Slab-based up to ₹208/mo)' },
    { key: 'west_bengal', label: 'West Bengal (Slab-based ₹110-₹200/mo)' },
    { key: 'telangana', label: 'Telangana (₹150-₹200/mo)' },
    { key: 'andhra_pradesh', label: 'Andhra Pradesh (₹150-₹200/mo)' },
    { key: 'gujarat', label: 'Gujarat (₹200/mo for > ₹12k)' },
    { key: 'punjab', label: 'Punjab (₹200/mo for > ₹10k)' },
    { key: 'delhi', label: 'Delhi (No PT - ₹0)' },
    { key: 'haryana', label: 'Haryana (No PT - ₹0)' },
    { key: 'rajasthan', label: 'Rajasthan (No PT - ₹0)' },
    { key: 'other', label: 'Other State (Exempt / ₹0)' },
  ];
  res.status(200).json({ success: true, states });
});

module.exports = router;
