const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'salarymaker_default_secret', {
    expiresIn: '30d',
  });
};

// @desc    Admin & User Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check user & select password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department,
        baseSalary: user.baseSalary,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: error.message,
    });
  }
};

// @desc    Admin Register a new User / Employee
// @route   POST /api/auth/register-user
// @access  Private / Admin Only
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, designation, department, baseSalary } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Name, Email, and Password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      designation: designation || 'Team Member',
      department: department || 'Engineering',
      baseSalary: Number(baseSalary) || 0,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: `User '${newUser.name}' registered successfully!`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        designation: newUser.designation,
        department: newUser.department,
        baseSalary: newUser.baseSalary,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Register User error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user.',
      error: error.message,
    });
  }
};

// @desc    Get Current Logged in User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Registered Users (Admin)
// @route   GET /api/auth/users
// @access  Private / Admin Only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users list',
      error: error.message,
    });
  }
};

// @desc    Delete a User (Admin)
// @route   DELETE /api/auth/users/:id
// @access  Private / Admin Only
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot delete their own account from the portal.',
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${user.name} removed successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// @desc    Seed Initial Admin Account if None Exists
// @route   POST /api/auth/seed-admin
// @access  Public
const seedAdmin = async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@salarymaker.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      return res.status(200).json({
        success: true,
        message: 'Admin already initialized',
        adminEmail,
      });
    }

    admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      designation: 'Head of Operations',
      department: 'Executive',
      baseSalary: 120000,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Default Administrator account created successfully!',
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Seed Admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed initial admin account',
      error: error.message,
    });
  }
};

module.exports = {
  login,
  registerUser,
  getMe,
  getAllUsers,
  deleteUser,
  seedAdmin,
};
