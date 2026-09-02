const express = require('express');
const router = express.Router();
const {
  login,
  registerUser,
  getMe,
  getAllUsers,
  deleteUser,
  seedAdmin,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/seed-admin', seedAdmin);

// Protected routes
router.get('/me', protect, getMe);

// Admin-only routes
router.post('/register-user', protect, adminOnly, registerUser);
router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
