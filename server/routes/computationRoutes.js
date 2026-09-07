const express = require('express');
const router = express.Router();
const {
  getComputations,
  getComputationById,
  createComputation,
  updateComputation,
  deleteComputation,
  aggregateEmployeeSalaryForFY,
} = require('../controllers/computationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getComputations)
  .post(createComputation);

router.route('/aggregate-salary')
  .get(aggregateEmployeeSalaryForFY);

router.route('/:id')
  .get(getComputationById)
  .put(updateComputation)
  .delete(deleteComputation);

module.exports = router;
