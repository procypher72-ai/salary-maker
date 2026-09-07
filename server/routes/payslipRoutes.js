const express = require('express');
const router = express.Router();
const {
  prepareDraftPayslip,
  createPayslip,
  updatePayslip,
  generateBulkPayslips,
  getPayslips,
  getPayslipById,
  deletePayslip,
  getBankAdviceReport,
  getEpfEcrReport,
} = require('../controllers/payslipController');
const { protect } = require('../middleware/auth');

router.post('/prepare-draft', protect, prepareDraftPayslip);
router.post('/bulk-generate', protect, generateBulkPayslips);
router.get('/reports/bank-advice', protect, getBankAdviceReport);
router.get('/reports/epf-ecr', protect, getEpfEcrReport);
router.post('/', protect, createPayslip);
router.get('/', protect, getPayslips);
router.get('/:id', protect, getPayslipById);
router.put('/:id', protect, updatePayslip);
router.delete('/:id', protect, deletePayslip);

module.exports = router;
