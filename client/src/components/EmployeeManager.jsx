import React, { useState, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CtcCalculatorModal } from './CtcCalculatorModal';
import { SnapshotRenderer } from './common/SnapshotRenderer';
import { BulkPayslipViewerModal } from './common/BulkPayslipViewerModal';
import { calculateEPF, calculateESIC, calculatePT } from '../utils/statutoryRules';
import { exportElementToPdf, exportToExcel } from '../utils/exportUtils';
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Edit,
  Sparkles,
  Building,
  CreditCard,
  Briefcase,
  DollarSign,
  ShieldCheck,
  Loader2,
  X,
  Calendar,
  Calculator,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  FileText,
  Plus,
  PlusCircle,
  Eye,
  Printer,
  Save,
  CheckCircle2,
  Zap,
  RefreshCw,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = [2024, 2025, 2026, 2027];

export const EmployeeManager = ({
  employees = [],
  activeCompany,
  templates = [],
  payslips = [],
  onRefresh,
  setActiveTab,
}) => {
  const { showToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCtcModalOpen, setIsCtcModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkImportResults, setBulkImportResults] = useState(null);

  // ── Modals for Salary Slip Operations ──
  const [selectedEmpForSlips, setSelectedEmpForSlips] = useState(null);
  const [generatingEmp, setGeneratingEmp] = useState(null);
  const [viewingPayslip, setViewingPayslip] = useState(null);
  const [isEditingPayslip, setIsEditingPayslip] = useState(false);
  const [editSlipDraft, setEditSlipDraft] = useState(null);
  const [isUpdatingSlip, setIsUpdatingSlip] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [bulkViewerEmp, setBulkViewerEmp] = useState(null);
  const [isBulkViewerOpen, setIsBulkViewerOpen] = useState(false);

  // ── Generation Form State ──
  const currentMonthName = MONTHS[new Date().getMonth()] || 'August';
  const currentYearNum = new Date().getFullYear() || 2026;
  const [genMonth, setGenMonth] = useState(currentMonthName);
  const [genYear, setGenYear] = useState(currentYearNum);
  const [genWorkingDays, setGenWorkingDays] = useState(30);
  const [genPaidDays, setGenPaidDays] = useState(30);
  const [genLopDays, setGenLopDays] = useState(0);
  const [genPaymentDate, setGenPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [genEarnings, setGenEarnings] = useState([]);
  const [genDeductions, setGenDeductions] = useState([]);
  const [isSavingSlip, setIsSavingSlip] = useState(false);

  // Active template metadata
  const activeTemplate = templates.find(
    (t) => t.templateKey === (activeCompany?.templateKey || 'corporate_detailed')
  );

  const currencySymbol = activeCompany?.currency || '₹';

  const initialForm = {
    empCode: '',
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    department: 'Engineering',
    joiningDate: new Date().toISOString().split('T')[0],
    taxRegime: activeCompany?.defaultTaxRegime || 'new',
    ptState: activeCompany?.ptState || 'maharashtra',
    ctcAnnual: 600000,
    dynamicFields: {},
    baselineSalary: {
      basicPay: 20000,
      hra: 10000,
      specialAllowance: 13788,
      conveyanceAllowance: 1600,
      medicalAllowance: 1250,
      otherAllowances: 0,
      pfDeduction: 2400,
      esicDeduction: 0,
      professionalTax: 200,
      tds: 0,
      otherDeductions: 0,
    },
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenCreate = () => {
    setEditingEmp(null);
    const tplKey = activeCompany?.templateKey || 'corporate_detailed';
    if (tplKey === 'delhi_public_school') {
      setFormData({
        empCode: `DWPS-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: '',
        email: '',
        phone: '',
        designation: '',
        department: 'Management',
        joiningDate: new Date().toISOString().split('T')[0],
        taxRegime: activeCompany?.defaultTaxRegime || 'new',
        ptState: activeCompany?.ptState || 'madhya pradesh',
        ctcAnnual: 600000,
        dynamicFields: {
          functionRole: 'Management',
          location: 'Ashta',
          bankDetails: '',
          dateOfJoiningStr: '',
        },
        baselineSalary: {
          basicPay: 20000,
          hra: 20000,
          specialAllowance: 10000, // D.A
          conveyanceAllowance: 0,
          medicalAllowance: 0,
          otherAllowances: 0,
          pfDeduction: 0,
          esicDeduction: 0,
          professionalTax: 212,
          tds: 0,
          otherDeductions: 0,
        },
      });
    } else {
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setFormData({
      empCode: emp.empCode || '',
      fullName: emp.fullName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      designation: emp.designation || '',
      department: emp.department || 'General',
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      taxRegime: emp.taxRegime || 'new',
      ptState: emp.ptState || 'maharashtra',
      ctcAnnual: emp.ctcAnnual || 0,
      dynamicFields: emp.dynamicFields || {},
      baselineSalary: emp.baselineSalary || initialForm.baselineSalary,
    });
    setIsModalOpen(true);
  };

  const handleApplyCtcSalary = (appliedData) => {
    setFormData((prev) => ({
      ...prev,
      ctcAnnual: appliedData.ctcAnnual,
      taxRegime: appliedData.taxRegime || prev.taxRegime,
      ptState: appliedData.ptState || prev.ptState,
      baselineSalary: {
        ...prev.baselineSalary,
        ...appliedData.baselineSalary,
      },
    }));
    showToast('Applied computed CTC salary components!', 'success');
  };

  const handleDynamicFieldChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      dynamicFields: {
        ...prev.dynamicFields,
        [key]: value,
      },
    }));
  };

  const handleSalaryChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      baselineSalary: {
        ...prev.baselineSalary,
        [key]: Number(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCompany) {
      showToast('Please select an active company first', 'error');
      return;
    }
    const tplKey = activeCompany?.templateKey || 'corporate_detailed';

    let empCodeToUse = formData.empCode?.trim();
    if (!empCodeToUse) {
      empCodeToUse = `EMP-${Date.now().toString().slice(-4)}`;
    }

    if (!formData.fullName?.trim() || !formData.designation?.trim()) {
      showToast('Please fill in Employee Full Name and Designation', 'error');
      return;
    }

    // Sync DWPS specific field mappings
    const dynamicFieldsToSave = { ...(formData.dynamicFields || {}) };
    let departmentToUse = formData.department || 'General';

    if (tplKey === 'delhi_public_school') {
      if (formData.joiningDate) {
        const d = new Date(formData.joiningDate);
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          dynamicFieldsToSave.dateOfJoiningStr = `${day}/${month}/${year}`;
        }
      }
      if (dynamicFieldsToSave.functionRole) {
        departmentToUse = dynamicFieldsToSave.functionRole;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        empCode: empCodeToUse,
        department: departmentToUse,
        dynamicFields: dynamicFieldsToSave,
        companyId: activeCompany._id,
      };

      if (editingEmp) {
        const res = await api.updateEmployee(editingEmp._id, payload);
        showToast(res.message || 'Employee updated successfully!', 'success');
      } else {
        const res = await api.createEmployee(payload);
        showToast(res.message || 'Employee added successfully!', 'success');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove employee "${name}"?`)) {
      return;
    }
    try {
      const res = await api.deleteEmployee(id);
      showToast(res.message || 'Employee deleted', 'info');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Helper to get all payslips for an employee
  const getEmployeePayslips = (emp) => {
    if (!emp) return [];
    return payslips.filter((p) => {
      const pEmpId = p.employeeId?._id || p.employeeId;
      const pEmpCode = p.snapshotData?.employee?.empCode || p.employeeId?.empCode;
      return pEmpId === emp._id || (pEmpCode && pEmpCode === emp.empCode);
    });
  };

  // Helper to check if a payslip exists for a given employee, month, and year
  const getExistingSlipForMonth = (emp, month, year) => {
    if (!emp) return null;
    const empSlips = getEmployeePayslips(emp);
    return empSlips.find((p) => p.month === month && Number(p.year) === Number(year));
  };

  // ── Open View All Slips Modal ──
  const handleOpenSlipsModal = (emp) => {
    setSelectedEmpForSlips(emp);
  };

  // ── Open Generate Slip Modal ──
  const handleOpenGenerateModal = (emp, initialMonth = null, initialYear = null) => {
    setGeneratingEmp(emp);
    const m = initialMonth || currentMonthName;
    const y = initialYear || currentYearNum;
    setGenMonth(m);
    setGenYear(y);
    setGenWorkingDays(30);
    setGenPaidDays(30);
    setGenLopDays(0);
    setGenPaymentDate(new Date().toISOString().split('T')[0]);

    // Populate initial earnings and deductions from baseline
    const base = emp.baselineSalary || {};
    const tplKey = activeCompany?.templateKey || 'corporate_detailed';

    let initialEarnings = [];
    if (tplKey === 'aiims_govt_medical') {
      initialEarnings = [
        { label: 'Basic', amount: 67400 },
        { label: 'Dearness Allowance', amount: 26960 },
        { label: 'Travelling Allowance', amount: 4800 },
        { label: 'TADA', amount: 1512 },
        { label: 'ICU Allowance', amount: 540 },
        { label: 'Deputation Pay Allowance', amount: 1280 },
        { label: 'Uniform Allowance', amount: 2800 },
        { label: 'Medical Allowance', amount: 3200 },
        { label: 'Nps Employer Earning Share', amount: 15224 },
        { label: 'Other Allowance', amount: 10650 },
      ];
    } else if (tplKey === 'hcl_corporate_tech') {
      initialEarnings = [
        { label: 'Basic Salary', amount: 87450 },
        { label: 'HRA', amount: 34980 },
        { label: 'Travel Allowance', amount: 22600 },
        { label: 'Holiday Allowance', amount: 9500 },
        { label: 'Food Wallet', amount: 4500 },
        { label: 'Incentives', amount: 45213 },
      ];
    } else if (tplKey === 'concentrix_daksh') {
      initialEarnings = [
        { label: 'BASIC SALARY', amount: 23000, fullAmount: 23000 },
        { label: 'HOUSE RENT ALLOWANCE', amount: 11500, fullAmount: 11500 },
        { label: 'STATUTORY BONUS', amount: 3500, fullAmount: 3500 },
        { label: 'SPECIAL ALLOWANCE', amount: 17500, fullAmount: 17500 },
        { label: 'RMEDICAL ALLOWANCE', amount: 2500, fullAmount: 2500 },
        { label: 'PERFORMANCE BONUS', amount: 8000, fullAmount: 8000 },
      ];
    } else if (tplKey === 'sushma_buildtech') {
      initialEarnings = [
        { label: 'BASIC', amount: 28387, rate: 28387 },
        { label: 'HRA', amount: 14194, rate: 14194 },
        { label: 'CONVEYANCE', amount: 1600, rate: 1600 },
        { label: 'CHILD EDU ALLOWANCE', amount: 200, rate: 200 },
        { label: 'SPECIAL ALLOWANCE', amount: 13619, rate: 13619 },
        { label: 'PERFORMANCE BONUS', amount: 10000, rate: 10000 },
      ];
    } else if (tplKey === 'delhi_public_school') {
      initialEarnings = [
        { label: 'Basic', amount: base.basicPay ? Number(base.basicPay) : 20000 },
        { label: 'D.A', amount: base.specialAllowance ? Number(base.specialAllowance) : 10000 },
        { label: 'H.R.A', amount: base.hra ? Number(base.hra) : 20000 },
      ];
    } else {
      if (base.basicPay) initialEarnings.push({ label: 'Basic Salary', amount: Number(base.basicPay) });
      if (base.hra) initialEarnings.push({ label: 'House Rent Allowance (HRA)', amount: Number(base.hra) });
      if (base.specialAllowance) initialEarnings.push({ label: 'Special Allowance', amount: Number(base.specialAllowance) });
      if (base.conveyanceAllowance) initialEarnings.push({ label: 'Conveyance Allowance', amount: Number(base.conveyanceAllowance) });
      if (base.medicalAllowance) initialEarnings.push({ label: 'Medical Allowance', amount: Number(base.medicalAllowance) });
      if (base.otherAllowances) initialEarnings.push({ label: 'Other Allowances', amount: Number(base.otherAllowances) });
      if (initialEarnings.length === 0) {
        initialEarnings.push({ label: 'Basic Salary', amount: 45000 });
        initialEarnings.push({ label: 'House Rent Allowance (HRA)', amount: 18000 });
      }
    }

    let initialDeductions = [];
    if (tplKey === 'aiims_govt_medical') {
      initialDeductions = [
        { label: 'Association Fund Category Amount', amount: 20 },
        { label: 'Emp Health Scheme', amount: 650 },
        { label: 'Emp Insurance Scheme', amount: 60 },
        { label: 'Income Tax', amount: 7357 },
        { label: 'Miscellaneous Recovery NA', amount: 967 },
        { label: 'New Pension Scehme-110001989995', amount: 10874 },
        { label: 'Nps Employer Ded Share', amount: 15224 },
        { label: 'Water Charges', amount: 82 },
      ];
    } else if (tplKey === 'hcl_corporate_tech') {
      initialDeductions = [
        { label: 'Ee PF contribution', amount: 10494 },
        { label: 'Prof Tax - split period', amount: 200 },
        { label: 'Income Tax', amount: 36586 },
      ];
    } else if (tplKey === 'concentrix_daksh') {
      initialDeductions = [
        { label: 'PROVIDENT FUND', amount: 2760 },
        { label: 'PROFESSIONAL TAX', amount: 200 },
        { label: 'INCOME TAX (TDS)', amount: 4800 },
      ];
    } else if (tplKey === 'sushma_buildtech') {
      initialDeductions = [
        { label: 'PF EMPLOYEE SHARE', amount: 3406 },
        { label: 'PROFESSIONAL TAX', amount: 200 },
        { label: 'TDS', amount: 2500 },
      ];
    } else if (tplKey === 'delhi_public_school') {
      initialDeductions = [
        { label: 'Professsional Tax', amount: base.professionalTax ? Number(base.professionalTax) : 212 },
      ];
    } else {
      if (base.pfDeduction) initialDeductions.push({ label: 'Provident Fund (PF)', amount: Number(base.pfDeduction) });
      if (base.esicDeduction) initialDeductions.push({ label: 'Employee State Insurance (ESIC)', amount: Number(base.esicDeduction) });
      if (base.professionalTax) initialDeductions.push({ label: 'Professional Tax (PT)', amount: Number(base.professionalTax) });
      if (base.tds) initialDeductions.push({ label: 'Income Tax / TDS', amount: Number(base.tds) });
      if (base.otherDeductions) initialDeductions.push({ label: 'Other Deductions', amount: Number(base.otherDeductions) });
    }

    setGenEarnings(initialEarnings);
    setGenDeductions(initialDeductions);
  };

  // Generate Modal Attendance / Pro-rata change
  const handleGenDaysChange = (field, val) => {
    const num = Number(val) || 0;
    if (field === 'workingDays') {
      setGenWorkingDays(num);
      setGenLopDays(Math.max(0, num - genPaidDays));
    } else if (field === 'paidDays') {
      setGenPaidDays(num);
      setGenLopDays(Math.max(0, genWorkingDays - num));
    } else if (field === 'lopDays') {
      setGenLopDays(num);
      setGenPaidDays(Math.max(0, genWorkingDays - num));
    }
  };

  const handleGenProRata = () => {
    if (!generatingEmp) return;
    const workingDays = genWorkingDays > 0 ? genWorkingDays : 30;
    const paidDays = genPaidDays !== undefined ? genPaidDays : workingDays;
    const payRatio = paidDays / workingDays;
    const base = generatingEmp.baselineSalary || {};

    const updatedEarnings = genEarnings.map((item) => {
      let originalAmount = item.amount;
      if (item.label.includes('Basic') && base.basicPay) originalAmount = base.basicPay;
      else if (item.label.includes('HRA') && base.hra) originalAmount = base.hra;
      else if (item.label.includes('Special') && base.specialAllowance) originalAmount = base.specialAllowance;
      else if (item.label.includes('Conveyance') && base.conveyanceAllowance) originalAmount = base.conveyanceAllowance;
      else if (item.label.includes('Medical') && base.medicalAllowance) originalAmount = base.medicalAllowance;

      return {
        ...item,
        amount: Math.round(originalAmount * payRatio),
      };
    });

    setGenEarnings(updatedEarnings);
    showToast(`Pro-rata calculated for ${paidDays}/${workingDays} days (${(payRatio * 100).toFixed(1)}%)!`, 'info');
  };

  const handleGenStatutoryAutofill = () => {
    if (!generatingEmp) return;
    const gross = genEarnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const basicItem = genEarnings.find((e) => e.label.toLowerCase().includes('basic'));
    const basicPay = basicItem ? Number(basicItem.amount) || 0 : Math.round(gross * 0.4);

    const ptState = generatingEmp.ptState || activeCompany?.ptState || 'maharashtra';
    const epfObj = calculateEPF(basicPay, false);
    const esicObj = calculateESIC(gross);
    const pt = calculatePT(gross, ptState, generatingEmp.dynamicFields?.gender || 'M', genMonth);

    const updatedDeductions = [];
    if (epfObj.employeeEPF > 0) {
      updatedDeductions.push({ label: 'Provident Fund (PF 12%)', amount: epfObj.employeeEPF });
    }
    if (esicObj.isEligible && esicObj.employeeESIC > 0) {
      updatedDeductions.push({ label: 'Employee State Insurance (ESIC 0.75%)', amount: esicObj.employeeESIC });
    }
    if (pt > 0) {
      updatedDeductions.push({ label: 'Professional Tax (PT)', amount: pt });
    }
    if (generatingEmp.baselineSalary?.tds) {
      updatedDeductions.push({ label: 'Income Tax / TDS', amount: Number(generatingEmp.baselineSalary.tds) });
    }

    setGenDeductions(updatedDeductions);
    showToast('Statutory deductions autofilled (EPF, ESIC, PT, TDS)!', 'success');
  };

  // Submit Generate Single Payslip
  const handleGenerateSlipSubmit = async () => {
    if (!generatingEmp || !activeCompany) return;

    // Strict duplicate check
    const existing = getExistingSlipForMonth(generatingEmp, genMonth, genYear);
    if (existing) {
      showToast(`A salary slip for ${genMonth} ${genYear} already exists. Duplicate salary slips cannot be created for the same month.`, 'error');
      return;
    }

    setIsSavingSlip(true);
    try {
      const grossEarnings = genEarnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const totalDeductions = genDeductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const netSalary = Math.max(0, grossEarnings - totalDeductions);

      const payload = {
        companyId: activeCompany._id,
        employeeId: generatingEmp._id,
        month: genMonth,
        year: Number(genYear),
        payPeriod: `${genMonth} ${genYear}`,
        paymentDate: genPaymentDate || new Date(),
        workingDays: Number(genWorkingDays) || 30,
        paidDays: Number(genPaidDays) || 30,
        lopDays: Number(genLopDays) || 0,
        earnings: genEarnings,
        deductions: genDeductions,
        grossEarnings,
        totalDeductions,
        netSalary,
      };

      const res = await api.createPayslip(payload);
      showToast(res.message || `Salary slip for ${genMonth} ${genYear} generated successfully!`, 'success');
      setGeneratingEmp(null);
      onRefresh();
      // Automatically open the newly generated slip for viewing
      if (res.payslip) {
        handleOpenViewPayslip(res.payslip, false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate salary slip', 'error');
    } finally {
      setIsSavingSlip(false);
    }
  };

  // ── Open View / Edit Modal ──
  const handleOpenViewPayslip = (slip, startInEdit = false) => {
    setViewingPayslip(slip);
    setIsEditingPayslip(startInEdit);
    setEditSlipDraft({
      ...slip,
      earnings: slip.earnings ? [...slip.earnings] : [],
      deductions: slip.deductions ? [...slip.deductions] : [],
    });
  };

  // Handlers for Live Editing in View/Edit Modal
  const handleEditSlipDaysChange = (field, val) => {
    if (!editSlipDraft) return;
    const num = Number(val) || 0;
    const updated = { ...editSlipDraft, [field]: num };
    if (field === 'workingDays' || field === 'paidDays') {
      const w = field === 'workingDays' ? num : editSlipDraft.workingDays || 30;
      const p = field === 'paidDays' ? num : editSlipDraft.paidDays || 30;
      updated.lopDays = Math.max(0, w - p);
    }
    recalculateEditDraftTotals(updated);
  };

  const handleEditSlipEarningChange = (idx, field, val) => {
    if (!editSlipDraft) return;
    const updatedEarnings = [...editSlipDraft.earnings];
    updatedEarnings[idx] = {
      ...updatedEarnings[idx],
      [field]: field === 'amount' ? Number(val) || 0 : val,
    };
    const updated = { ...editSlipDraft, earnings: updatedEarnings };
    recalculateEditDraftTotals(updated);
  };

  const handleEditSlipAddEarning = () => {
    if (!editSlipDraft) return;
    const updated = {
      ...editSlipDraft,
      earnings: [...(editSlipDraft.earnings || []), { label: 'Custom Allowance / Bonus', amount: 5000 }],
    };
    recalculateEditDraftTotals(updated);
  };

  const handleEditSlipDeleteEarning = (idx) => {
    if (!editSlipDraft) return;
    const updated = {
      ...editSlipDraft,
      earnings: editSlipDraft.earnings.filter((_, i) => i !== idx),
    };
    recalculateEditDraftTotals(updated);
  };

  const handleEditSlipDeductionChange = (idx, field, val) => {
    if (!editSlipDraft) return;
    const updatedDeductions = [...editSlipDraft.deductions];
    updatedDeductions[idx] = {
      ...updatedDeductions[idx],
      [field]: field === 'amount' ? Number(val) || 0 : val,
    };
    const updated = { ...editSlipDraft, deductions: updatedDeductions };
    recalculateEditDraftTotals(updated);
  };

  const handleEditSlipAddDeduction = () => {
    if (!editSlipDraft) return;
    const updated = {
      ...editSlipDraft,
      deductions: [...(editSlipDraft.deductions || []), { label: 'Advance / Deduction Adjustment', amount: 1000 }],
    };
    recalculateEditDraftTotals(updated);
  };

  const handleEditSlipDeleteDeduction = (idx) => {
    if (!editSlipDraft) return;
    const updated = {
      ...editSlipDraft,
      deductions: editSlipDraft.deductions.filter((_, i) => i !== idx),
    };
    recalculateEditDraftTotals(updated);
  };

  const recalculateEditDraftTotals = (targetDraft) => {
    const grossEarnings = (targetDraft.earnings || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalDeductions = (targetDraft.deductions || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const netSalary = Math.max(0, grossEarnings - totalDeductions);
    targetDraft.grossEarnings = grossEarnings;
    targetDraft.totalDeductions = totalDeductions;
    targetDraft.netSalary = netSalary;
    setEditSlipDraft({ ...targetDraft });
  };

  const handleLogoLayoutSaved = (logoData) => {
    if (editSlipDraft) {
      setEditSlipDraft((prev) => ({
        ...prev,
        snapshotData: {
          ...prev?.snapshotData,
          company: {
            ...prev?.snapshotData?.company,
            ...logoData,
          },
        },
      }));
    }
    if (viewingPayslip) {
      setViewingPayslip((prev) => ({
        ...prev,
        snapshotData: {
          ...prev?.snapshotData,
          company: {
            ...prev?.snapshotData?.company,
            ...logoData,
          },
        },
      }));
    }
    if (logoData?.company || logoData?._persisted) {
      onRefresh();
    }
  };

  // Submit Update Salary Slip Changes
  const handleSaveSlipUpdates = async () => {
    if (!viewingPayslip || !editSlipDraft) return;
    setIsUpdatingSlip(true);
    try {
      const payload = {
        workingDays: editSlipDraft.workingDays,
        paidDays: editSlipDraft.paidDays,
        lopDays: editSlipDraft.lopDays,
        paymentDate: editSlipDraft.paymentDate,
        earnings: editSlipDraft.earnings,
        deductions: editSlipDraft.deductions,
        grossEarnings: editSlipDraft.grossEarnings,
        totalDeductions: editSlipDraft.totalDeductions,
        netSalary: editSlipDraft.netSalary,
        snapshotData: editSlipDraft.snapshotData,
        status: editSlipDraft.status || 'generated',
      };

      const res = await api.updatePayslip(viewingPayslip._id, payload);
      showToast(res.message || 'Salary slip updated successfully!', 'success');
      setViewingPayslip(res.payslip);
      setEditSlipDraft(res.payslip);
      setIsEditingPayslip(false);
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update salary slip', 'error');
    } finally {
      setIsUpdatingSlip(false);
    }
  };

  // Delete Payslip Record
  const handleDeletePayslip = async (slipId, periodText) => {
    if (!window.confirm(`Are you sure you want to delete the salary slip for ${periodText}?`)) {
      return;
    }
    try {
      const res = await api.deletePayslip(slipId);
      showToast(res.message || 'Salary slip deleted', 'info');
      if (viewingPayslip?._id === slipId) {
        setViewingPayslip(null);
      }
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete salary slip', 'error');
    }
  };

  // Download PDF
  const handleDownloadSinglePdf = async (slip) => {
    try {
      setIsExportingPdf(true);
      const empName = slip.snapshotData?.employee?.fullName || 'Employee';
      const filename = `Payslip_${empName.replace(/\s+/g, '_')}_${slip.month}_${slip.year}.pdf`;
      await exportElementToPdf('employee-payslip-canvas-view', filename);
      showToast('Downloaded PDF payslip successfully!', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Filter employees for active company and search query
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleDownloadSampleTemplate = () => {
    const sampleData = [
      {
        'Emp Code': 'EMP-101',
        'Full Name': 'Rajesh Kumar',
        'Designation': 'Software Engineer',
        'Department': 'Engineering',
        'Email': 'rajesh@example.com',
        'Phone': '+91 9876543210',
        'Basic Salary': 50000,
        'HRA': 20000,
        'Special Allowance': 15000,
        'Conveyance Allowance': 2000,
        'Medical Allowance': 1250,
        'PF Deduction': 1800,
        'Professional Tax': 200,
        'TDS': 2500,
        'PAN Number': 'ABCDE1234F',
        'UAN Number': '101234567890',
        'PF Number': 'MH/BAN/0012345/001',
        'Bank Name': 'HDFC Bank',
        'Bank Account': '50100482910482',
        'IFSC Code': 'HDFC0001234',
        'Location': 'Bengaluru',
      },
      {
        'Emp Code': 'EMP-102',
        'Full Name': 'Sunita Sharma',
        'Designation': 'Product Manager',
        'Department': 'Product',
        'Email': 'sunita@example.com',
        'Phone': '+91 9811122334',
        'Basic Salary': 70000,
        'HRA': 28000,
        'Special Allowance': 20000,
        'Conveyance Allowance': 2000,
        'Medical Allowance': 1250,
        'PF Deduction': 1800,
        'Professional Tax': 200,
        'TDS': 4500,
        'PAN Number': 'XYZPS5512K',
        'UAN Number': '101998877665',
        'PF Number': 'MH/BAN/0012345/002',
        'Bank Name': 'ICICI Bank',
        'Bank Account': '001205009841',
        'IFSC Code': 'ICIC0000012',
        'Location': 'Mumbai',
      },
    ];
    exportToExcel(sampleData, `${activeCompany?.name?.replace(/\s+/g, '_') || 'Company'}_Employee_Import_Template.xlsx`, 'Employees');
    showToast('Downloaded sample employee roster Excel template!', 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setIsBulkImporting(true);
        setBulkImportResults(null);
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const parsedRows = XLSX.utils.sheet_to_json(worksheet);

        if (parsedRows.length === 0) {
          showToast('The selected file contains no data rows.', 'error');
          setIsBulkImporting(false);
          return;
        }

        const res = await api.bulkImportEmployees(activeCompany._id, parsedRows);
        setBulkImportResults(res.results);
        showToast(res.message, 'success');
        onRefresh();
      } catch (err) {
        console.error('Bulk import error:', err);
        showToast(err.message || 'Failed to import Excel file', 'error');
      } finally {
        setIsBulkImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Compute selected month duplicate status for current generation
  const activeGenDuplicateSlip = generatingEmp
    ? getExistingSlipForMonth(generatingEmp, genMonth, genYear)
    : null;

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Employee Master Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Company: <strong style={{ color: '#fff' }}>{activeCompany?.name}</strong> • Active Template Schema:{' '}
            <span className="badge badge-admin" style={{ marginLeft: '0.35rem' }}>
              {(activeCompany?.templateKey || 'corporate_detailed').replace('_', ' ').toUpperCase()}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setBulkImportResults(null);
              setIsBulkModalOpen(true);
            }}
            className="btn btn-secondary"
            id="bulk-import-employee-btn"
          >
            <Upload size={16} />
            <span>Bulk Import Excel</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary"
            id="add-employee-btn"
          >
            <UserPlus size={16} />
            <span>Onboard New Employee</span>
          </button>
        </div>
      </div>

      {/* Dynamic Schema Info Card */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderLeft: '4px solid var(--accent-cyan)',
        }}
      >
        <Sparkles size={20} className="text-cyan" />
        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-main)' }}>Dynamic Schema Active:</strong> The employee form adapts automatically to request only the fields required by{' '}
          <span style={{ color: 'var(--accent-cyan)' }}>{activeTemplate?.name || 'Selected Template'}</span>.
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="form-input-wrapper" style={{ maxWidth: '400px' }}>
          <Search size={16} className="form-input-icon" />
          <input
            type="text"
            className="form-input has-icon"
            placeholder="Search by name, ID code, designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="employee-search-input"
          />
        </div>
      </div>

      {/* Employees Directory Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-container">
          {filteredEmployees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p>No employees registered in this company yet.</p>
            </div>
          ) : (
            <table className="custom-table" id="employees-table">
              <thead>
                <tr>
                  <th>Emp ID & Name</th>
                  <th>Designation / Dept</th>
                  <th>Template Fields</th>
                  <th>Monthly Gross</th>
                  <th>Salary Slips</th>
                  <th>Joining Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const base = emp.baselineSalary || {};
                  const monthlyGross =
                    (base.basicPay || 0) +
                    (base.hra || 0) +
                    (base.specialAllowance || 0) +
                    (base.conveyanceAllowance || 0) +
                    (base.medicalAllowance || 0);

                  const empSlips = getEmployeePayslips(emp);

                  return (
                    <tr key={emp._id} id={`emp-row-${emp._id}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              color: '#fff',
                            }}
                          >
                            {emp.fullName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                              ID: {emp.empCode} • {emp.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{emp.designation}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          {emp.department}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {emp.dynamicFields?.panNumber && <span>PAN: {emp.dynamicFields.panNumber}</span>}
                          {emp.dynamicFields?.bankAccount && <span>A/C: ••••{emp.dynamicFields.bankAccount.slice(-4)}</span>}
                          {emp.dynamicFields?.uanNumber && <span>UAN: {emp.dynamicFields.uanNumber}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="salary-text">
                          {currencySymbol}
                          {monthlyGross.toLocaleString('en-IN')}/mo
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleOpenSlipsModal(emp)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: '0.25rem 0.65rem',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            borderColor: empSlips.length > 0 ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                            color: empSlips.length > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                          }}
                          title={`View all ${empSlips.length} salary slips for ${emp.fullName}`}
                          id={`view-slips-badge-${emp._id}`}
                        >
                          <FileText size={13} />
                          <span>{empSlips.length} {empSlips.length === 1 ? 'Slip' : 'Slips'}</span>
                        </button>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleOpenGenerateModal(emp)}
                            className="btn btn-primary btn-sm"
                            title={`Generate new monthly salary slip for ${emp.fullName}`}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            id={`generate-slip-btn-${emp._id}`}
                          >
                            <PlusCircle size={13} />
                            <span>Generate Slip</span>
                          </button>
                          <button
                            onClick={() => handleOpenSlipsModal(emp)}
                            className="btn btn-secondary btn-sm"
                            title={`View all salary slips for ${emp.fullName}`}
                            id={`view-all-slips-btn-${emp._id}`}
                          >
                            <Eye size={13} />
                            <span>View Slips</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Employee Profile"
                            id={`edit-emp-${emp._id}`}
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id, emp.fullName)}
                            className="btn btn-danger-subtle btn-sm"
                            title="Delete Employee"
                            id={`delete-emp-${emp._id}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. VIEW ALL SALARY SLIPS MODAL (FOR SELECTED EMPLOYEE)
      ───────────────────────────────────────────────────────────── */}
      {selectedEmpForSlips && (() => {
        const empSlips = getEmployeePayslips(selectedEmpForSlips);

        return (
          <div className="modal-overlay">
            <div
              className="modal-content glass-panel"
              style={{ maxWidth: '880px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#fff',
                      fontSize: '1.1rem',
                    }}
                  >
                    {selectedEmpForSlips.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                      Salary Slips: {selectedEmpForSlips.fullName}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      ID: <strong style={{ color: 'var(--accent-cyan)' }}>{selectedEmpForSlips.empCode}</strong> • {selectedEmpForSlips.designation} • {selectedEmpForSlips.department}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {empSlips.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setBulkViewerEmp(selectedEmpForSlips);
                        setIsBulkViewerOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                      id="emp-modal-view-range-bulk-pdf-btn"
                      title="View all months (e.g. Jan - Jun) and download consolidated multi-page PDF"
                    >
                      <Layers size={14} />
                      <span>📅 Range / Bulk PDF</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const emp = selectedEmpForSlips;
                      setSelectedEmpForSlips(null);
                      handleOpenGenerateModal(emp);
                    }}
                    className="btn btn-primary btn-sm"
                    id="emp-modal-generate-new-slip-btn"
                  >
                    <PlusCircle size={15} />
                    <span>Generate New Salary Slip</span>
                  </button>
                  <button
                    onClick={() => setSelectedEmpForSlips(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Slips Content */}
              {empSlips.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3.5rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-subtle)',
                  }}
                  id="no-salary-slip-generated-notice"
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      color: 'var(--primary)',
                    }}
                  >
                    <FileText size={32} />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
                    no salary slip generated
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                    No salary slips have been generated for {selectedEmpForSlips.fullName} yet. Only one salary slip can be created per month.
                  </p>
                  <button
                    onClick={() => {
                      const emp = selectedEmpForSlips;
                      setSelectedEmpForSlips(null);
                      handleOpenGenerateModal(emp);
                    }}
                    className="btn btn-primary"
                    id="generate-first-salary-slip-btn"
                  >
                    <PlusCircle size={16} />
                    <span>Generate First Salary Slip</span>
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" id="emp-slips-history-table">
                    <thead>
                      <tr>
                        <th>Pay Period</th>
                        <th>Payment Date</th>
                        <th>Working / Paid Days</th>
                        <th>Gross Earnings</th>
                        <th>Deductions</th>
                        <th>Net Take-Home</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empSlips.map((slip) => (
                        <tr key={slip._id} id={`emp-slip-row-${slip._id}`}>
                          <td>
                            <strong style={{ color: '#fff' }}>{slip.payPeriod}</strong>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {slip.paymentDate ? new Date(slip.paymentDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {slip.paidDays || 30} / {slip.workingDays || 30} days
                            {slip.lopDays > 0 && (
                              <span style={{ color: '#fb7185', fontSize: '0.75rem', marginLeft: '0.35rem' }}>
                                ({slip.lopDays} LOP)
                              </span>
                            )}
                          </td>
                          <td>{currencySymbol}{(slip.grossEarnings || 0).toLocaleString('en-IN')}</td>
                          <td style={{ color: '#fb7185' }}>
                            {currencySymbol}{(slip.totalDeductions || 0).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <strong className="salary-text">
                              {currencySymbol}{(slip.netSalary || 0).toLocaleString('en-IN')}
                            </strong>
                          </td>
                          <td>
                            <span className="badge badge-admin" style={{ textTransform: 'capitalize' }}>
                              {slip.status || 'generated'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => handleOpenViewPayslip(slip, false)}
                                className="btn btn-secondary btn-sm"
                                title="View Salary Slip"
                                id={`view-slip-${slip._id}`}
                              >
                                <Eye size={13} />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleOpenViewPayslip(slip, true)}
                                className="btn btn-secondary btn-sm"
                                title="Edit / Update in Salary Slip"
                                style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                                id={`edit-slip-${slip._id}`}
                              >
                                <Edit size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeletePayslip(slip._id, slip.payPeriod)}
                                className="btn btn-danger-subtle btn-sm"
                                title="Delete Salary Slip"
                                id={`delete-slip-${slip._id}`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          2. GENERATE NEW SALARY SLIP MODAL (WITH DUPLICATE CHECK)
      ───────────────────────────────────────────────────────────── */}
      {generatingEmp && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '840px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  Generate Salary Slip — {generatingEmp.fullName}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ID: <strong style={{ color: 'var(--accent-cyan)' }}>{generatingEmp.empCode}</strong> • Designation: {generatingEmp.designation} • Template: {activeTemplate?.name || activeCompany?.templateKey}
                </p>
              </div>
              <button
                onClick={() => setGeneratingEmp(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Pay Period Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Salary Month *</label>
                <select
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                  className="form-select"
                  id="gen-salary-month-select"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Salary Year *</label>
                <select
                  value={genYear}
                  onChange={(e) => setGenYear(Number(e.target.value))}
                  className="form-select"
                  id="gen-salary-year-select"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Date</label>
                <input
                  type="date"
                  value={genPaymentDate}
                  onChange={(e) => setGenPaymentDate(e.target.value)}
                  className="form-input"
                  id="gen-payment-date-input"
                />
              </div>
            </div>

            {/* Strict Duplicate Check Banner */}
            {activeGenDuplicateSlip ? (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid var(--accent-rose)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
                id="duplicate-salary-slip-alert"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertCircle size={22} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#fca5a5', fontSize: '0.95rem' }}>
                      Salary Slip Already Generated for {genMonth} {genYear}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Only one salary slip can be created per month. Duplicate salary slips for the same month are not permitted.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const slipToView = activeGenDuplicateSlip;
                    setGeneratingEmp(null);
                    handleOpenViewPayslip(slipToView, true);
                  }}
                  className="btn btn-primary btn-sm"
                  id="view-update-existing-duplicate-btn"
                >
                  <Edit size={14} />
                  <span>View / Update Existing Slip</span>
                </button>
              </div>
            ) : null}

            {/* Attendance & Pro-Rata Controls */}
            <div
              className="glass-panel"
              style={{
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', margin: 0 }}>
                  Attendance & Pro-Rata Salary
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleGenProRata}
                    className="btn btn-secondary btn-sm"
                    title="Recalculate earnings pro-rata based on Paid Days / Working Days"
                  >
                    <Calculator size={13} />
                    <span>Auto Pro-Rata</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenStatutoryAutofill}
                    className="btn btn-secondary btn-sm"
                    title="Autofill EPF (12%), ESIC (0.75%), PT, and TDS"
                  >
                    <Zap size={13} />
                    <span>Statutory Autofill</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Total Working Days</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="form-input"
                    value={genWorkingDays}
                    onChange={(e) => handleGenDaysChange('workingDays', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Paid / Present Days</label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    className="form-input"
                    value={genPaidDays}
                    onChange={(e) => handleGenDaysChange('paidDays', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Loss of Pay (LOP) Days</label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    className="form-input"
                    value={genLopDays}
                    onChange={(e) => handleGenDaysChange('lopDays', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown Grids */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Earnings Section */}
              <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', margin: 0 }}>
                    Earnings Components
                  </h4>
                  <button
                    type="button"
                    onClick={() => setGenEarnings([...genEarnings, { label: 'Custom Allowance', amount: 2000 }])}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <Plus size={12} /> Add Earning
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {genEarnings.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...genEarnings];
                          updated[idx].label = e.target.value;
                          setGenEarnings(updated);
                        }}
                      />
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '100px', textAlign: 'right', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        value={item.amount}
                        onChange={(e) => {
                          const updated = [...genEarnings];
                          updated[idx].amount = Number(e.target.value) || 0;
                          setGenEarnings(updated);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setGenEarnings(genEarnings.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', padding: '0 4px' }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions Section */}
              <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#fb7185', margin: 0 }}>
                    Deductions Components
                  </h4>
                  <button
                    type="button"
                    onClick={() => setGenDeductions([...genDeductions, { label: 'Adjustment / Advance', amount: 1000 }])}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <Plus size={12} /> Add Deduction
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {genDeductions.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...genDeductions];
                          updated[idx].label = e.target.value;
                          setGenDeductions(updated);
                        }}
                      />
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '100px', textAlign: 'right', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        value={item.amount}
                        onChange={(e) => {
                          const updated = [...genDeductions];
                          updated[idx].amount = Number(e.target.value) || 0;
                          setGenDeductions(updated);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setGenDeductions(genDeductions.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', padding: '0 4px' }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Summary Card */}
            {(() => {
              const gross = genEarnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
              const totalDed = genDeductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
              const net = Math.max(0, gross - totalDed);

              return (
                <div
                  style={{
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1))',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GROSS EARNINGS</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                      {currencySymbol}{gross.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL DEDUCTIONS</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fb7185' }}>
                      {currencySymbol}{totalDed.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ borderLeft: '2px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      NET TAKE-HOME SALARY
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                      {currencySymbol}{net.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setGeneratingEmp(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateSlipSubmit}
                disabled={isSavingSlip || !!activeGenDuplicateSlip}
                className="btn btn-primary"
                id="submit-generate-salary-slip-btn"
              >
                {isSavingSlip ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Saving Payslip...</span>
                  </>
                ) : activeGenDuplicateSlip ? (
                  <span>Duplicate Not Allowed</span>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Generate & Finalize Salary Slip</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. VIEW / EDIT SALARY SLIP MODAL (WITH IN-PLACE UPDATE)
      ───────────────────────────────────────────────────────────── */}
      {viewingPayslip && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '980px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}
          >
            {/* Modal Header Toolbar */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.75rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingPayslip(!isEditingPayslip)}
                  className={`btn btn-sm ${isEditingPayslip ? 'btn-primary' : 'btn-secondary'}`}
                  id="toggle-edit-slip-mode-btn"
                >
                  <Edit size={14} />
                  <span>{isEditingPayslip ? 'Editing Mode (Active)' : 'Edit / Update Salary Slip'}</span>
                </button>

                {isEditingPayslip && (
                  <button
                    type="button"
                    onClick={handleSaveSlipUpdates}
                    disabled={isUpdatingSlip}
                    className="btn btn-primary btn-sm"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                    id="save-slip-updates-btn"
                  >
                    {isUpdatingSlip ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                    <span>{isUpdatingSlip ? 'Updating...' : 'Save & Update Slip'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDownloadSinglePdf(isEditingPayslip ? editSlipDraft : viewingPayslip)}
                  disabled={isExportingPdf}
                  className="btn btn-secondary btn-sm"
                >
                  <Download size={14} />
                  <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {viewingPayslip.snapshotData?.employee?.fullName || 'Employee'} • {viewingPayslip.payPeriod}
                </span>
                <button
                  onClick={() => setViewingPayslip(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* In-Edit Notice Banner */}
            {isEditingPayslip && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid var(--primary)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.825rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                  <Sparkles size={16} className="text-cyan" />
                  <span>
                    <strong>Edit Mode Active:</strong> You can modify days, earnings, and deductions directly on the salary slip. Click <strong>"Save & Update Slip"</strong> when finished.
                  </span>
                </div>
              </div>
            )}

            {/* Render High Fidelity Snapshot Canvas */}
            <div className="payslip-canvas-scroll-wrapper" id="employee-payslip-canvas-view">
              <SnapshotRenderer
                payslip={isEditingPayslip ? editSlipDraft : viewingPayslip}
                company={activeCompany}
                isEditable={isEditingPayslip}
                onEarningChange={handleEditSlipEarningChange}
                onDeductionChange={handleEditSlipDeductionChange}
                onAddEarning={handleEditSlipAddEarning}
                onDeleteEarning={handleEditSlipDeleteEarning}
                onAddDeduction={handleEditSlipAddDeduction}
                onDeleteDeduction={handleEditSlipDeleteDeduction}
                onDaysChange={handleEditSlipDaysChange}
                onSizeSaved={handleLogoLayoutSaved}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. ONBOARD / EDIT EMPLOYEE DYNAMIC SCHEMA MODAL
      ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {editingEmp ? 'Edit Employee Record' : 'Onboard New Employee'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Active Template:{' '}
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {activeTemplate?.name || activeCompany?.templateKey}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {activeCompany?.templateKey === 'delhi_public_school' ? (
                /* ── DELHI WORLD PUBLIC SCHOOL FOCUSED ONBOARDING FORM ── */
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Users size={18} className="text-cyan" />
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-cyan)', margin: 0, fontWeight: 700 }}>
                        Employee Details (Delhi World Public School Format)
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {/* Name (Full Name) */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Name (Full Name) *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. SUNAINA SHARMA"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          required
                          autoFocus
                          id="dwps-input-fullname"
                        />
                      </div>

                      {/* Function */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Function</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Management"
                          value={formData.dynamicFields?.functionRole !== undefined ? formData.dynamicFields.functionRole : (formData.department || '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              department: val,
                              dynamicFields: { ...prev.dynamicFields, functionRole: val },
                            }));
                          }}
                          id="dwps-input-function"
                        />
                      </div>

                      {/* Designation */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Designation *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Principal"
                          value={formData.designation}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              designation: val,
                              dynamicFields: { ...prev.dynamicFields, designation: val },
                            }));
                          }}
                          required
                          id="dwps-input-designation"
                        />
                      </div>

                      {/* Location */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Location</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Ashta"
                          value={formData.dynamicFields?.location || ''}
                          onChange={(e) => handleDynamicFieldChange('location', e.target.value)}
                          id="dwps-input-location"
                        />
                      </div>

                      {/* Bank Details */}
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label" style={{ fontWeight: 700 }}>Bank Details (Account No, Bank Name, Branch)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 38570100006930,Bank of Baroda,Ashta"
                          value={formData.dynamicFields?.bankDetails || ''}
                          onChange={(e) => handleDynamicFieldChange('bankDetails', e.target.value)}
                          id="dwps-input-bankdetails"
                        />
                      </div>

                      {/* Date of Joining */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Date of Joining</label>
                        <input
                          type="date"
                          className="form-input"
                          value={formData.joiningDate}
                          onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                          id="dwps-input-joiningdate"
                        />
                      </div>

                      {/* Employee ID (Auto / Optional) */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Employee ID / Code (Auto)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. DWPS-1021"
                          value={formData.empCode}
                          onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                          id="dwps-input-empcode"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: DWPS Baseline Compensation Structure */}
                  <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <DollarSign size={18} className="text-cyan" />
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-cyan)', margin: 0, fontWeight: 700 }}>
                        Monthly Salary Structure ({currencySymbol})
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Basic ({currencySymbol})</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.basicPay}
                          onChange={(e) => handleSalaryChange('basicPay', e.target.value)}
                          id="dwps-salary-basic"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>D.A ({currencySymbol})</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.specialAllowance}
                          onChange={(e) => handleSalaryChange('specialAllowance', e.target.value)}
                          id="dwps-salary-da"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>H.R.A ({currencySymbol})</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.hra}
                          onChange={(e) => handleSalaryChange('hra', e.target.value)}
                          id="dwps-salary-hra"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Professional Tax ({currencySymbol})</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.professionalTax}
                          onChange={(e) => handleSalaryChange('professionalTax', e.target.value)}
                          id="dwps-salary-pt"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ── DYNAMIC SCHEMA FORM FOR ALL OTHER TEMPLATES ── */
                <>
                  {/* Section 1: Core Profile */}
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '0.85rem' }}>
                    1. Core Employee Details
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Employee ID / Code *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. EMP-001"
                        value={formData.empCode}
                        onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Rajesh Kumar"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Lead Engineer"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Engineering"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="rajesh@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Joining Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.joiningDate}
                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Section 2: Dynamic Template Fields */}
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', margin: 0 }}>
                        2. Schema Fields ({activeTemplate?.name || 'Standard'})
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Auto-configured for active template
                      </span>
                    </div>

                    {activeTemplate?.requiredFields && activeTemplate.requiredFields.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        {activeTemplate.requiredFields.map((field) => (
                          <div className="form-group" key={field.key}>
                            <label className="form-label">
                              {field.label} {field.required ? '*' : ''}
                            </label>
                            <input
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                              className="form-input"
                              placeholder={field.placeholder || `Enter ${field.label}`}
                              value={formData.dynamicFields?.[field.key] || ''}
                              onChange={(e) => handleDynamicFieldChange(field.key, e.target.value)}
                              required={!!field.required}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">PAN Number</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="ABCDE1234F"
                            value={formData.dynamicFields?.panNumber || ''}
                            onChange={(e) => handleDynamicFieldChange('panNumber', e.target.value.toUpperCase())}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Bank Account Number</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="50100482910482"
                            value={formData.dynamicFields?.bankAccount || ''}
                            onChange={(e) => handleDynamicFieldChange('bankAccount', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Bank Name</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="HDFC Bank"
                            value={formData.dynamicFields?.bankName || ''}
                            onChange={(e) => handleDynamicFieldChange('bankName', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Baseline Monthly Salary Structure */}
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', margin: 0 }}>
                        3. Baseline Monthly Salary ({currencySymbol})
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsCtcModalOpen(true)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Calculator size={14} />
                        <span>Auto CTC Deconstructor</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Basic Salary</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.basicPay}
                          onChange={(e) => handleSalaryChange('basicPay', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">House Rent Allowance (HRA)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.hra}
                          onChange={(e) => handleSalaryChange('hra', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Special Allowance</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.specialAllowance}
                          onChange={(e) => handleSalaryChange('specialAllowance', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Conveyance Allowance</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.conveyanceAllowance}
                          onChange={(e) => handleSalaryChange('conveyanceAllowance', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Medical Allowance</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.medicalAllowance}
                          onChange={(e) => handleSalaryChange('medicalAllowance', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Provident Fund (PF)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.pfDeduction}
                          onChange={(e) => handleSalaryChange('pfDeduction', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Professional Tax (PT)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.professionalTax}
                          onChange={(e) => handleSalaryChange('professionalTax', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">TDS / Income Tax</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.baselineSalary.tds}
                          onChange={(e) => handleSalaryChange('tds', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? <Loader2 size={16} className="spin" /> : null}
                  <span>{editingEmp ? 'Save Employee' : 'Create Employee Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. BULK IMPORT MODAL
      ───────────────────────────────────────────────────────────── */}
      {isBulkModalOpen && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '640px', padding: '1.75rem' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileSpreadsheet size={20} className="text-cyan" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Bulk Import Employees via Excel / CSV
                </h3>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Step 1: Download Sample Excel Template</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                    Use our verified template with pre-configured headers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="btn btn-secondary btn-sm"
                >
                  <Download size={14} />
                  <span>Download Template</span>
                </button>
              </div>

              <div
                style={{
                  padding: '2rem 1.5rem',
                  border: '2px dashed var(--border-focus)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  background: 'rgba(99, 102, 241, 0.05)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                  disabled={isBulkImporting}
                />
                <Upload size={36} style={{ color: 'var(--primary)', margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                  {isBulkImporting ? 'Parsing & Importing Employees...' : 'Click or Drag & Drop Excel/CSV file here'}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Supports .xlsx, .xls, and .csv formats
                </p>
              </div>

              {bulkImportResults && (
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--accent-emerald)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.25rem' }}>
                    Import Complete!
                  </div>
                  <div style={{ color: '#fff' }}>
                    Inserted: <strong>{bulkImportResults.inserted}</strong> • Updated: <strong>{bulkImportResults.updated}</strong>
                  </div>
                  {bulkImportResults.errors.length > 0 && (
                    <div style={{ marginTop: '0.5rem', color: 'var(--accent-rose)', fontSize: '0.8rem' }}>
                      Errors ({bulkImportResults.errors.length}):
                      <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                        {bulkImportResults.errors.map((err, i) => (
                          <li key={i}>Row {err.row}: {err.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTC Breakdown Calculator Modal */}
      <CtcCalculatorModal
        isOpen={isCtcModalOpen}
        onClose={() => setIsCtcModalOpen(false)}
        initialCtc={formData.ctcAnnual || 600000}
        initialState={formData.ptState || 'maharashtra'}
        onApplySalary={handleApplyCtcSalary}
      />

      {/* Bulk & Date-Range Salary Slip Multi-Page Viewer & PDF Exporter Modal */}
      <BulkPayslipViewerModal
        isOpen={isBulkViewerOpen}
        onClose={() => {
          setIsBulkViewerOpen(false);
          setBulkViewerEmp(null);
        }}
        payslips={payslips}
        employee={bulkViewerEmp}
        company={activeCompany}
      />
    </div>
  );
};
