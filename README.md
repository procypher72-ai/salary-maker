# Salary Maker 💼

A modern MERN stack portal featuring **Admin Authentication (JWT & Bcrypt)** and a dedicated **User Registration & Payroll Management Suite**.

---

## ✨ Features

- 🔐 **Admin Authentication**: Secure JWT-based authentication with bcrypt password hashing.
- 🛡️ **Role-Based Access Control**: Strict middleware ensuring only administrators can register new employees and manage user accounts.
- 👤 **User Registration System**: Form with real-time feedback, auto-password generator, designation, department, and base salary assignments.
- 📊 **Dynamic Dashboard**:
  - Live metric counters (Total Registered Members, Total Payroll Budget, Active Departments, Admin Session info).
  - Searchable and role-filterable member directory table.
  - User deletion controls.
- 🎨 **Modern Design**: Glassmorphic UI, tailored CSS design system, micro-animations, and toast feedback.

---

## 🚀 Default Admin Credentials

When the server boots up, it automatically initializes the default administrator if not present:

- **Email**: `admin@salarymaker.com`
- **Password**: `Admin@12345`

*(You can also use the one-click "Fill Credentials" button on the login screen).*

---

## 🛠️ How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` (or provide `MONGO_URI` in `server/.env`)

### 2. Start Backend Server
```bash
cd server
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 3. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate admin / user and receive JWT token |
| `GET` | `/api/auth/me` | Protected | Get authenticated user profile |
| `POST` | `/api/auth/register-user` | Admin Only | Register a new user/employee with salary & role |
| `GET` | `/api/auth/users` | Admin Only | Retrieve list of all registered users |
| `DELETE` | `/api/auth/users/:id` | Admin Only | Remove a user by ID |
| `POST` | `/api/auth/seed-admin` | Public | Auto-seed default admin credentials |
