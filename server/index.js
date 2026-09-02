require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const templateRoutes = require('./routes/templateRoutes');
const companyRoutes = require('./routes/companyRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const payslipRoutes = require('./routes/payslipRoutes');

const User = require('./models/User');
const { seedDefaultTemplates } = require('./controllers/templateController');
const { seedDefaultCompany } = require('./controllers/companyController');
const { seedDefaultEmployees } = require('./controllers/employeeController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const path = require('path');
const fs = require('fs');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payslips', payslipRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Salary Maker Multi-Company Payroll API',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend in production if client/dist exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Auto seed default admin, templates, and company on startup
const autoSeedSystem = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@salarymaker.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    // 1. Admin
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        designation: 'Head of Operations',
        department: 'Executive',
        baseSalary: 120000,
        status: 'active',
      });
      console.log(`✨ Default admin initialized: ${adminEmail} / ${adminPassword}`);
    }

    // 2. Templates
    await seedDefaultTemplates();

    // 3. Default Company & Employees
    const defaultCompany = await seedDefaultCompany();
    if (defaultCompany) {
      await seedDefaultEmployees(defaultCompany._id);
    }
  } catch (err) {
    console.error('Error during auto-seeding system data:', err.message);
  }
};

// Start Server
const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await autoSeedSystem();
  }

  app.listen(PORT, () => {
    console.log(`🚀 Salary Maker Backend Server running on port ${PORT}`);
  });
};

startServer();
