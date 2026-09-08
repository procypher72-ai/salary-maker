# 📚 Salary Maker — Comprehensive User Guide & Step-by-Step Manual

Welcome to **Salary Maker**, an enterprise-grade Multi-Company Payroll Management, Automated Payslip Generator, and Indian Income Tax Computation platform.

- 🌐 **Live Deployed Application**: [https://salary-maker.onrender.com/](https://salary-maker.onrender.com/)
- 💻 **Platform**: Web-based (Responsive for Desktop, Tablet, and Mobile)

---

## 📑 Table of Contents
1. [Quick Start & Login](#1-quick-start--login)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Step 1: Set Up & Manage Companies](#3-step-1-set-up--manage-companies)
4. [Step 2: Add & Manage Employees](#4-step-2-add--manage-employees)
   - [A. Adding Employees Individually](#a-adding-an-employee-individually)
   - [B. Bulk Import via Excel / CSV](#b-bulk-importing-employees-via-csv--excel)
5. [Step 3: Choose & Customize Payslip Templates](#5-step-3-choose--customize-payslip-templates)
6. [Step 4: Generate Payslips (Single & Batch)](#6-step-4-generate-payslips-single--batch)
   - [A. Generating a Single Payslip](#a-generating-a-single-payslip)
   - [B. Batch / Bulk Payslip Generation & ZIP Export](#b-batch--bulk-payslip-generation)
7. [Step 5: Income Tax Computations & Form 16 Preparation](#7-step-5-income-tax-computations--form-16-prep)
8. [Step 6: Global CTC Calculator & Tax Simulator](#8-step-6-global-ctc-calculator--tax-simulator)
9. [Step 7: Payslip History & Record Management](#9-step-7-payslip-history--record-management)
10. [Troubleshooting & Frequently Asked Questions (FAQ)](#10-troubleshooting--faqs)

---

## 1. Quick Start & Login

### 🔗 Accessing the Portal
Navigate to [https://salary-maker.onrender.com/](https://salary-maker.onrender.com/) in your web browser (Chrome, Firefox, Edge, or Safari recommended).

> 💡 **Note on Render Free Tier**: If the server has been idle, the initial page load or login might take **30–50 seconds** while the backend container spins up. Subsequent actions will be fast.

### 🔑 Credentials
- **Default Email**: `admin@salarymaker.com`
- **Default Password**: `Admin@12345`

### ⚡ One-Click Demo Login
On the login screen, click the **"Fill Admin Credentials"** button. The email and password will auto-populate. Click **"Sign In to Enterprise Portal"** to enter.

---

## 2. Dashboard Overview

Once logged in, the **Dashboard** (`#dashboard`) provides a high-level summary of your payroll operations:
- **Active Company Selector**: Switch between different companies instantly using the dropdown in the top navbar.
- **Metric Cards**:
  - 👥 **Total Active Employees**: Headcount under the selected company.
  - 💰 **Total Monthly Payroll**: Combined gross salary commitment.
  - 📑 **Payslips Issued**: Count of generated payslips.
  - 🏢 **Registered Companies**: Total corporate entities configured.
- **Quick Action Buttons**: Jump directly to *Add Employee*, *Generate Payslip*, *Add Company*, or *Income Tax Computations*.
- **Recent Activity Table**: View the latest generated payslips with direct PDF download buttons.

---

## 3. Step 1: Set Up & Manage Companies

Salary Maker supports multiple companies under a single admin account.

### Adding or Updating a Company
1. Click **"Companies"** in the top navigation bar (`#companies`).
2. Click **"+ Add New Company"** (or click the **Pencil / Edit** icon on an existing company).
3. Fill in the company details:
   - **Company Profile**: Name, Company Code (e.g., `ACME-01`), Registered Address, Support Email, Phone Number, Website.
   - **Statutory Identifiers**: PAN, TAN, GSTIN, Corporate Identification Number (CIN), PF Establishment Code, ESIC Registration Number.
   - **Bank Account Details**: Bank Name, Account Number, IFSC Code, Branch Name.
   - **Professional Tax State**: Select your state (e.g., *Maharashtra, Karnataka, West Bengal, Tamil Nadu, Telangana, Gujarat, etc.*) to apply state-specific PT tax rules.
   - **Branding & Assets**:
     - **Company Logo**: Upload `.png`, `.jpg`, or `.svg`. You can resize and reposition the logo interactively.
     - **Authorized Signature**: Upload digital signature image for automated payslip signing.
     - **Official Stamp / Seal**: Upload circular or rectangular company seal.
   - **Default Template**: Choose which payslip design should be the default for this company.
4. Click **"Save Company"**.

---

## 4. Step 2: Add & Manage Employees

### A. Adding an Employee Individually
1. Navigate to **"Employees"** (`#employees`).
2. Click **"+ Add Employee"**.
3. Fill out the tabbed employee onboarding form:
   - **Personal Information**: Full Name, Employee ID (unique), Email, Phone Number, Date of Birth, PAN, Aadhaar Number, UAN (Universal Account Number for PF), PF Number, ESIC Number.
   - **Job & Employment**: Department (e.g., *Engineering, HR, Sales*), Designation (e.g., *Senior Software Engineer*), Date of Joining, Employment Type (*Full-Time, Contract, Part-Time, Intern*), Work Location.
   - **Bank Account Details**: Bank Name, Account Number, IFSC Code, Branch.
   - **Salary & Compensation Structure**:
     - Enter **Monthly CTC** (or Basic Salary).
     - Use the **"Auto-Calculate Breakup"** button to automatically distribute:
       - **Basic Salary** (typically 40% - 50% of CTC)
       - **House Rent Allowance (HRA)** (typically 40% - 50% of Basic)
       - **Special Allowance / Balancing Allowance**
       - **Conveyance & Medical Allowances**
       - **Employee Provident Fund (EPF)** (12% of Basic up to statutory limits)
       - **ESIC** (0.75% of Gross if applicable)
       - **Professional Tax (PT)** (auto-derived based on company state and salary slab)
       - **TDS / Income Tax deduction** (optional monthly deduction)
     - **Custom Allowances & Deductions**: Add custom line items (e.g., *Performance Bonus, Shift Allowance, Health Insurance Deductions*).
4. Click **"Save Employee"**.

### B. Bulk Importing Employees via CSV / Excel
If you have a large workforce:
1. Go to **"Employees"** (`#employees`).
2. Click **"Bulk Import"**.
3. Click **"Download Sample Template (CSV / Excel)"**.
4. Fill in your employee records following the sample columns:
   `employeeId, fullName, email, phone, designation, department, dateOfJoining, pan, bankName, accountNumber, ifsc, basicSalary, hra, specialAllowance, epf, pt, tds`
5. Upload the completed file. The system validates all rows and provides a preview before importing.
6. Click **"Confirm & Import"**.

---

## 5. Step 3: Choose & Customize Payslip Templates

Salary Maker comes with **5 professionally designed, printable payslip templates**:

| Template Name | Style / Theme | Best Suited For |
|---|---|---|
| **Classic Tabular Payslip** | Clean, bordered grid layout | Traditional corporate, manufacturing, logistics |
| **HCL Corporate Payslip** | Modern blue-accent executive theme | IT services, consulting, enterprise firms |
| **AIIMS Govt Payslip** | Formal government / PSU structured sheet | Healthcare, education, public sector |
| **Concentrix Daksh Payslip** | Compact high-density dual-column | BPO, KPO, retail, tech startups |
| **Sushma Buildtech Payslip** | Contemporary architecture & sleek typography | Real estate, creative agencies, design firms |

### Customizing Templates
1. Go to **"Templates"** (`#templates`).
2. **Preview**: Click **"Preview Template"** to inspect how the template looks with sample or active employee data.
3. **Set Default**: Click **"Set as Company Default"** to assign a template to the active company.
4. **Rename / Badge**: Customize the display name or badge for internal identification.
5. **Dynamic Field Customizer**: Hide/show specific fields (e.g., UAN, ESIC, Bank IFSC) or add custom headers to match internal branding guidelines.

---

## 6. Step 4: Generate Payslips (Single & Batch)

### A. Generating a Single Payslip
1. Go to **"Generator"** (`#generator`) or click **"Generate Payslip"** from an employee row in the Employee list.
2. **Select Employee**: Pick an employee from the dropdown (auto-fills their designations, bank info, and base salary structure).
3. **Select Pay Period**: Choose **Month** (e.g., *January*) and **Year** (e.g., *2026*).
4. **Configure Attendance & Adjustments**:
   - **Total Working Days**: (e.g., `30` or `31`)
   - **Paid / Present Days**: (e.g., `28`)
   - **Loss of Pay (LOP) Days**: (e.g., `2`) — *The engine automatically prorates Basic, HRA, and allowances accordingly*.
   - **Overtime Hours & OT Rate**: Input overtime hours if applicable for automatic addition.
   - **Ad-hoc Bonuses / Arrears / Incentives**: Add one-off earnings for this month.
   - **Variable Deductions**: Add advances, damage recovery, or extra tax cuts.
5. **Live Interactive Preview**: Check the right-hand panel for real-time calculation of **Gross Earnings**, **Total Deductions**, and **Net Pay in Numbers & Words**.
6. **Export Options**:
   - 📄 **Download PDF**: Instantly downloads a print-ready vector PDF.
   - 🖨️ **Print Direct**: Opens your browser's print dialog with optimized `@media print` styling.
   - 💾 **Save to Records**: Stores the payslip in the permanent database audit history.

### B. Batch / Bulk Payslip Generation
To generate payslips for all employees at once:
1. Navigate to **"Generator"** (`#generator`) and click the **"Batch Generation"** tab.
2. Select the target **Company** and **Department** (or *All Departments*).
3. Select the **Pay Period (Month & Year)**.
4. The system calculates payroll for every active employee in seconds.
5. Click **"Generate & Download All (ZIP)"** to receive a structured ZIP archive containing individual PDFs named as `[EmployeeID]_[EmployeeName]_[Month]_[Year].pdf`.

---

## 7. Step 5: Income Tax Computations & Form 16 Prep

Salary Maker includes an Indian Income Tax Computation and Assessment Engine supporting **FY 2023-24 through FY 2026-27** (Assessment Years 2024-25 to 2027-28).

### How to Create an Income Tax Computation Sheet
1. Click **"Computations"** (`#computations`) in the navbar.
2. Click **"+ Create Computation"**.
3. Fill in the computation wizard tabs:

#### 1. Personal & Assessment Details
- Select the Employee (or enter Assessee details manually).
- Choose **Financial Year** (e.g., *FY 2025-2026 / AY 2026-2027*).
- Select **Tax Regime**:
  - **New Tax Regime (u/s 115BAC)**: Default lower slab rates with standard deduction (₹75,000 for FY 25-26).
  - **Old Tax Regime**: Standard slab rates with Chapter VI-A deductions and exemptions.

#### 2. 5 Heads of Income
- 💼 **Salary Tab**: Gross Salary, Standard Deduction (auto-applied), HRA Exemption u/s 10(13A), Professional Tax u/s 16(iii), Entertainment Allowance.
- 🏠 **House Property Tab**: Self-occupied vs. Let-out property income, Municipal Taxes paid, Standard Deduction (30% u/s 24a), Home Loan Interest deduction (u/s 24b up to ₹2,00,000).
- 📈 **Profits & Gains of Business/Profession (PGBP)**: Turnover, Presumptive taxation u/s 44AD / 44ADA, Net Business Income.
- 📊 **Capital Gains Tab**: Short-Term (STCG u/s 111A at 15%/20%, Normal STCG) and Long-Term (LTCG u/s 112A with ₹1.25L exemption, LTCG u/s 112 with indexation).
- 💰 **Other Sources Tab**: Savings Bank Interest, Fixed Deposit Interest, Dividend Income, Family Pension (with standard deduction u/s 57).

#### 3. Chapter VI-A Deductions (Old Regime)
- **Section 80C**: EPF, PPF, ELSS, Life Insurance Premium, Children Tuition Fees, Principal Home Loan repayment (up to ₹1,50,000).
- **Section 80D**: Medical Insurance for Self, Family, and Senior Citizen Parents (up to ₹25,000 / ₹50,000 / ₹1,00,000).
- **Section 80CCD(1B)**: Additional NPS contribution (up to ₹50,000).
- **Section 80E**: Interest on Higher Education Loan.
- **Section 80G**: Donations to approved charitable / relief funds.
- **Section 80TTA / 80TTB**: Savings bank interest deduction (₹10,000 for regular / ₹50,000 for senior citizens).

#### 4. Taxes Paid & Challans
- Enter Advance Tax payments, TDS deducted by Employer (Form 16 Part A), and other TCS/TDS credits.
- The engine calculates Rebate u/s 87A, Surcharge, Health & Education Cess (4%), and net Tax Payable / Refundable.

4. **Print / Export Assessment Sheet**:
   - Choose output format: **Modern Executive**, **CA Audit Workpaper**, or **ZenIT / KDK Standard**.
   - Click **Print / Download PDF** for official tax filing and Form 16 documentation.

---

## 8. Step 6: Global CTC Calculator & Tax Simulator

Accessible anytime from the top navigation bar by clicking **"CTC Calculator"**:
1. Enter your target **Annual CTC** (e.g., `₹12,00,000`).
2. Select your **State** for Professional Tax calculation.
3. The simulator immediately computes:
   - **Monthly Gross Salary**
   - **Employer Contributions**: PF (12%), Gratuity (4.81%), Employer ESIC
   - **Employee Deductions**: PF, Professional Tax, ESIC, Estimated TDS
   - **Monthly Take-Home (In-Hand) Salary**
   - **Old vs. New Tax Regime Comparison** showing exact annual tax savings.

---

## 9. Step 7: Payslip History & Record Management

1. Click **"History"** (`#history`) in the navbar.
2. **Search & Filter**:
   - Filter by Company, Department, Employee Name/ID, Month, or Financial Year.
3. **Actions Available for Each Record**:
   - 👁️ **Preview**: Open payslip modal for quick on-screen inspection.
   - 📥 **Download PDF**: Re-download the original payslip PDF anytime.
   - 🖨️ **Print**: One-click hardcopy printing.
   - 🗑️ **Delete**: Remove test or obsolete records.
4. **Batch Archive**: Select multiple payslips using checkboxes and click **"Export Selected as ZIP"** for audits and bulk distribution.

---

## 10. Troubleshooting & FAQs

### Q1: The page took some time to open on Render. Why?
**A:** Render spins down inactive instances on its free tier after inactivity. The first request wakes the container up (takes ~30–50s). After that initial spin-up, the app responds in real-time.

### Q2: How do I change the currency symbol on the payslip?
**A:** Go to **Companies** (`#companies`), edit your company, and select your preferred currency (INR `₹`, USD `$`, EUR `€`, GBP `£`, AED `د.إ`, etc.).

### Q3: My company logo looks too big/small on the generated PDF. How do I fix it?
**A:** Go to **Templates** (`#templates`) or **Companies** (`#companies`), click the interactive resize handle on the logo preview to adjust the width (e.g., 140px to 220px), and click **Save**.

### Q4: How is Professional Tax (PT) calculated?
**A:** Professional Tax is state-dependent in India. When you select a state (e.g., *Maharashtra, Karnataka, West Bengal*), the system applies the exact statutory monthly slab (including special February/March adjustments where applicable).

### Q5: Can I regenerate a payslip if attendance was entered incorrectly?
**A:** Yes. Go to **Generator** (`#generator`), select the employee and month, adjust the LOP (Loss of Pay) or Overtime hours, and click **"Save & Generate"**. It will update the record in Payslip History.

---

**Salary Maker Enterprise** — Engineered for speed, accuracy, and compliance.  
*For questions or technical support, contact your organization's System Administrator.*
