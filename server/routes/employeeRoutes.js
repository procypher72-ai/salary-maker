const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkImportEmployees,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getEmployees);
router.get('/:id', protect, getEmployeeById);
router.post('/bulk-import', protect, bulkImportEmployees);
router.post('/', protect, createEmployee);
router.put('/:id', protect, updateEmployee);
router.delete('/:id', protect, deleteEmployee);

module.exports = router;
