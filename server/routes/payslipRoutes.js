const express = require('express');
const router = express.Router();
const {
  prepareDraftPayslip,
  createPayslip,
  generateBulkPayslips,
  getPayslips,
  getPayslipById,
  deletePayslip,
} = require('../controllers/payslipController');
const { protect } = require('../middleware/auth');

router.post('/prepare-draft', protect, prepareDraftPayslip);
router.post('/bulk-generate', protect, generateBulkPayslips);
router.post('/', protect, createPayslip);
router.get('/', protect, getPayslips);
router.get('/:id', protect, getPayslipById);
router.delete('/:id', protect, deletePayslip);

module.exports = router;
