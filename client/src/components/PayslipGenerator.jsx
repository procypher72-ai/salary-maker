import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClassicTabularPayslip } from './templates/ClassicTabularPayslip';
import { HclCorporatePayslip } from './templates/HclCorporatePayslip';
import { AiimsGovtPayslip } from './templates/AiimsGovtPayslip';
import { NewAiimsPayslip } from './templates/NewAiimsPayslip';
import { ConcentrixDakshPayslip } from './templates/ConcentrixDakshPayslip';
import { SushmaBuildtechPayslip } from './templates/SushmaBuildtechPayslip';
import { DelhiPublicSchoolPayslip } from './templates/DelhiPublicSchoolPayslip';
import { HaryanaEducationPayslip } from './templates/HaryanaEducationPayslip';
import { NestleIndiaPayslip } from './templates/NestleIndiaPayslip';
import { ResizableLogo } from './common/ResizableLogo';
import { SlipLayoutToolbar } from './common/SlipLayoutToolbar';
import { SignatureStampBox } from './common/SignatureStampBox';
import { CtcCalculatorModal } from './CtcCalculatorModal';
import { calculateEPF, calculateESIC, calculatePT } from '../utils/statutoryRules';
import { exportElementToPdf } from '../utils/exportUtils';
import {
  FileText,
  Calendar,
  User,
  UserPlus,
  Edit3,
  X,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Printer,
  Download,
  Save,
  Layers,
  Sparkles,
  RefreshCw,
  Building2,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Calculator,
  ShieldCheck,
  Clock,
  Zap,
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = [
  2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
  2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035
];

export const PayslipGenerator = ({
  activeCompany,
  companies = [],
  setActiveCompany,
  employees = [],
  templates = [],
  onPayslipGenerated,
  onCompanyUpdated,
  onRefreshEmployees,
}) => {
  const { showToast } = useAuth();

  // Mode: 'single' or 'bulk'
  const [mode, setMode] = useState('single');

  // Single Mode Selectors
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState(2026);

  // Bulk Mode Selectors
  const [startMonth, setStartMonth] = useState('January');
  const [startYear, setStartYear] = useState(2026);
  const [endMonth, setEndMonth] = useState('June');
  const [endYear, setEndYear] = useState(2026);
  const [bulkMonths, setBulkMonths] = useState([]);

  // Interactive Live Canvas State
  const [draft, setDraft] = useState(null);
  const [existingPayslipRecord, setExistingPayslipRecord] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isCtcModalOpen, setIsCtcModalOpen] = useState(false);
  const [overtimeHours, setOvertimeHours] = useState(0);

  // Quick Employee Management Modal from Generator
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmpObj, setEditingEmpObj] = useState(null);
  const [savingEmp, setSavingEmp] = useState(false);
  const [empFormData, setEmpFormData] = useState({
    fullName: '',
    empCode: '',
    bankAccount: '',
    pan: '',
    panNumber: '',
    designation: '',
    department: 'Management',
    joiningDate: new Date().toISOString().split('T')[0],
    dynamicFields: {},
    baselineSalary: {
      basicPay: 40000,
      hra: 6400,
      specialAllowance: 20000,
      medicalAllowance: 500,
      otherAllowances: 0,
      pfDeduction: 7200,
      esicDeduction: 0,
      professionalTax: 200,
      tds: 5000,
      otherDeductions: 0,
    },
  });

  // Live Layout & Styling Configuration
  const [layoutConfig, setLayoutConfig] = useState({
    slipWidth: activeCompany?.slipWidth || 950,
    slipMinHeight: activeCompany?.slipMinHeight || 0,
    slipPadding: activeCompany?.slipPadding || 24,
    slipBorderWidth: activeCompany?.slipBorderWidth !== undefined ? activeCompany.slipBorderWidth : 1,
    slipBorderStyle: activeCompany?.slipBorderStyle || 'solid',
    slipBorderColor: activeCompany?.slipBorderColor || '#000000',
    slipBorderRadius: activeCompany?.slipBorderRadius || 0,
    incomeDeductionHeight: activeCompany?.incomeDeductionHeight || 30,
    incomeDeductionMinHeight: activeCompany?.incomeDeductionMinHeight || 160,
    incomeColumnWidth: activeCompany?.incomeColumnWidth || 50,
    tableBorderWidth: activeCompany?.tableBorderWidth !== undefined ? activeCompany.tableBorderWidth : 1,
    tableBorderStyle: activeCompany?.tableBorderStyle || 'solid',
    tableBorderColor: activeCompany?.tableBorderColor || '#000000',
    fontSizeScale: activeCompany?.fontSizeScale || 100,
    extraSpacerHeight: activeCompany?.extraSpacerHeight !== undefined ? activeCompany.extraSpacerHeight : 0,
    minTableRows: activeCompany?.minTableRows !== undefined ? activeCompany.minTableRows : 6,
    dwpsCustomFields: activeCompany?.dwpsCustomFields,
    dwpsMetaColumns: activeCompany?.dwpsMetaColumns,
  });

  // Sync layoutConfig when activeCompany changes
  useEffect(() => {
    if (activeCompany) {
      setLayoutConfig({
        slipWidth: activeCompany.slipWidth || 950,
        slipMinHeight: activeCompany.slipMinHeight || 0,
        slipPadding: activeCompany.slipPadding || 24,
        slipBorderWidth: activeCompany.slipBorderWidth !== undefined ? activeCompany.slipBorderWidth : 1,
        slipBorderStyle: activeCompany.slipBorderStyle || 'solid',
        slipBorderColor: activeCompany.slipBorderColor || '#000000',
        slipBorderRadius: activeCompany.slipBorderRadius || 0,
        incomeDeductionHeight: activeCompany.incomeDeductionHeight || 30,
        incomeDeductionMinHeight: activeCompany.incomeDeductionMinHeight || 160,
        incomeColumnWidth: activeCompany.incomeColumnWidth || 50,
        tableBorderWidth: activeCompany.tableBorderWidth !== undefined ? activeCompany.tableBorderWidth : 1,
        tableBorderStyle: activeCompany.tableBorderStyle || 'solid',
        tableBorderColor: activeCompany.tableBorderColor || '#000000',
        fontSizeScale: activeCompany.fontSizeScale || 100,
        extraSpacerHeight: activeCompany.extraSpacerHeight !== undefined ? activeCompany.extraSpacerHeight : 0,
        minTableRows: activeCompany.minTableRows !== undefined ? activeCompany.minTableRows : 6,
        dwpsCustomFields: activeCompany.dwpsCustomFields,
        dwpsMetaColumns: activeCompany.dwpsMetaColumns,
      });
    }
  }, [activeCompany]);

  // Set default employee when employees list is loaded
  useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0]._id);
    }
  }, [employees]);

  const selectedEmployeeObj = employees.find((e) => e._id === selectedEmpId);
  const currencySymbol = activeCompany?.currency || '₹';
  const templateKey = activeCompany?.templateKey || 'corporate_detailed';

  // Load draft preview whenever employee, month, or year changes in Single mode
  const fetchDraft = async () => {
    if (!selectedEmpId || !activeCompany) return;
    setLoadingDraft(true);
    try {
      // Check if payslip already exists for this employee, month, and year
      const existingRes = await api.getPayslips({
        employeeId: selectedEmpId,
        month: selectedMonth,
        year: selectedYear,
      });

      if (existingRes.payslips && existingRes.payslips.length > 0) {
        setExistingPayslipRecord(existingRes.payslips[0]);
      } else {
        setExistingPayslipRecord(null);
      }

      const res = await api.prepareDraftPayslip({
        employeeId: selectedEmpId,
        month: selectedMonth,
        year: selectedYear,
      });
      setDraft(res.draft);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingDraft(false);
    }
  };

  useEffect(() => {
    if (mode === 'single' && selectedEmpId) {
      fetchDraft();
    }
  }, [selectedEmpId, selectedMonth, selectedYear, activeCompany, mode]);

  // Recalculate and preserve custom days for each month in the selected bulk date range
  useEffect(() => {
    const sIdx = MONTHS.indexOf(startMonth);
    const eIdx = MONTHS.indexOf(endMonth);
    const sYr = Number(startYear);
    const eYr = Number(endYear);

    if (sIdx === -1 || eIdx === -1 || isNaN(sYr) || isNaN(eYr)) return;

    const startTotal = sYr * 12 + sIdx;
    const endTotal = eYr * 12 + eIdx;

    if (endTotal < startTotal) {
      setBulkMonths([]);
      return;
    }

    setBulkMonths((prev) => {
      const prevMap = new Map();
      prev.forEach((item) => prevMap.set(`${item.month}-${item.year}`, item));

      const list = [];
      for (let curr = startTotal; curr <= endTotal; curr++) {
        const y = Math.floor(curr / 12);
        const mIdx = curr % 12;
        const mName = MONTHS[mIdx];
        const key = `${mName}-${y}`;
        const totalDays = new Date(y, mIdx + 1, 0).getDate();

        const existing = prevMap.get(key);
        if (existing) {
          const wDays = existing.workingDays !== undefined ? existing.workingDays : totalDays;
          const pDays = existing.paidDays !== undefined ? Math.min(existing.paidDays, wDays) : wDays;
          list.push({
            ...existing,
            totalDays,
            workingDays: wDays,
            paidDays: pDays,
            lopDays: Math.max(0, wDays - pDays),
          });
        } else {
          list.push({
            month: mName,
            year: y,
            totalDays,
            workingDays: totalDays,
            paidDays: totalDays,
            lopDays: 0,
          });
        }
      }
      return list;
    });
  }, [startMonth, startYear, endMonth, endYear]);

  const handleBulkMonthDaysChange = (index, field, value) => {
    setBulkMonths((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      const item = { ...next[index] };
      const numVal = parseInt(value, 10);

      if (field === 'paidDays') {
        const safePaid = isNaN(numVal) ? 0 : Math.max(0, Math.min(numVal, item.workingDays));
        item.paidDays = safePaid;
        item.lopDays = Math.max(0, item.workingDays - safePaid);
      } else if (field === 'workingDays') {
        const safeWork = isNaN(numVal) ? item.totalDays : Math.max(1, Math.min(numVal, item.totalDays));
        item.workingDays = safeWork;
        if (item.paidDays > safeWork) {
          item.paidDays = safeWork;
        }
        item.lopDays = Math.max(0, safeWork - item.paidDays);
      }
      next[index] = item;
      return next;
    });
  };

  // --- Inline Canvas Editing Handlers ---
  const handleDaysChange = (field, val) => {
    if (!draft) return;
    const num = Number(val) || 0;
    const workingDays = field === 'workingDays' ? num : (Number(draft.workingDays) || 30);
    const paidDays = field === 'paidDays' ? num : (draft.paidDays !== undefined ? Number(draft.paidDays) : workingDays);
    const lopDays = Math.max(0, workingDays - paidDays);
    const payRatio = workingDays > 0 ? (paidDays / workingDays) : 1;

    let updatedEarnings = draft.earnings ? [...draft.earnings] : [];

    // Pro-rata recalculation if paid days or working days changed for Delhi World Public School
    if (templateKey === 'delhi_public_school') {
      const base = selectedEmployeeObj?.baselineSalary || {};
      const fullBasic = (base.basicPay !== undefined && base.basicPay !== '' && !isNaN(base.basicPay)) ? Number(base.basicPay) : 40000;
      const fullDa = (base.specialAllowance !== undefined && base.specialAllowance !== '' && !isNaN(base.specialAllowance))
        ? Number(base.specialAllowance)
        : ((base.da !== undefined && base.da !== '' && !isNaN(base.da)) ? Number(base.da) : 20000);
      const fullHra = (base.hra !== undefined && base.hra !== '' && !isNaN(base.hra)) ? Number(base.hra) : 6400;
      const fullMed = (base.medicalAllowance !== undefined && base.medicalAllowance !== '' && !isNaN(base.medicalAllowance)) ? Number(base.medicalAllowance) : 500;

      updatedEarnings = updatedEarnings.map((item) => {
        let baseRate = item.rate !== undefined && item.rate !== null && !isNaN(item.rate) ? Number(item.rate) : item.baseAmount;
        if (!baseRate) {
          const lk = (item.label || '').toLowerCase();
          if (lk.includes('basic')) baseRate = fullBasic;
          else if (lk.includes('dearness') || lk.includes('d.a')) baseRate = fullDa;
          else if (lk.includes('rent') || lk.includes('h.r.a') || lk.includes('hra')) baseRate = fullHra;
          else if (lk.includes('medical')) baseRate = fullMed;
          else baseRate = Number(item.amount) || 0;
        }
        return {
          ...item,
          rate: baseRate,
          amount: Math.round(baseRate * payRatio),
        };
      });
    }

    const updated = {
      ...draft,
      [field]: num,
      workingDays,
      paidDays,
      lopDays,
      earnings: updatedEarnings,
    };

    recalculateTotals(updated);
  };

  const handleOpenNewEmpModal = () => {
    setEditingEmpObj(null);
    if (templateKey === 'delhi_public_school') {
      setEmpFormData({
        fullName: '',
        empCode: '4417',
        bankAccount: '',
        pan: '',
        panNumber: '',
        designation: 'PRINCIPAL',
        department: 'Management',
        joiningDate: new Date().toISOString().split('T')[0],
        dynamicFields: {
          accountNo: '',
          dateOfJoiningStr: '',
          bankDetails: 'BANK OF BARODA(IFSC Code: BARB0VJASHT)',
          bankAddress: 'KANNOD ROAD, ASHTA, DIST.SEHORE, ASHTA - 466116',
          postingOffice: activeCompany?.name || 'DELHI WORLD PUBLIC SCHOOL, ASHTA',
          designation: 'PRINCIPAL',
          empId: '4417',
          panNo: '',
        },
        baselineSalary: {
          basicPay: 40000,
          hra: 6400,
          specialAllowance: 20000,
          medicalAllowance: 500,
          otherAllowances: 0,
          pfDeduction: 7200,
          esicDeduction: 0,
          professionalTax: 200,
          tds: 5000,
          otherDeductions: 0,
        },
      });
    } else {
      setEmpFormData({
        fullName: '',
        empCode: `EMP-${Date.now().toString().slice(-4)}`,
        bankAccount: '',
        pan: '',
        panNumber: '',
        designation: 'Staff',
        department: 'General',
        joiningDate: new Date().toISOString().split('T')[0],
        dynamicFields: {},
        baselineSalary: {
          basicPay: 30000,
          hra: 12000,
          specialAllowance: 8000,
          medicalAllowance: 1000,
          otherAllowances: 0,
          pfDeduction: 3600,
          esicDeduction: 0,
          professionalTax: 200,
          tds: 2000,
          otherDeductions: 0,
        },
      });
    }
    setIsEmpModalOpen(true);
  };

  const handleOpenEditEmpModal = () => {
    if (!selectedEmployeeObj) {
      showToast('Please select an employee to edit', 'info');
      return;
    }
    setEditingEmpObj(selectedEmployeeObj);
    const dyn = selectedEmployeeObj.dynamicFields instanceof Map
      ? Object.fromEntries(selectedEmployeeObj.dynamicFields)
      : (selectedEmployeeObj.dynamicFields || {});
    const accNo = selectedEmployeeObj.bankAccount || dyn.accountNo || dyn.bankAccount || '';
    const panVal = selectedEmployeeObj.pan || selectedEmployeeObj.panNumber || dyn.pan || dyn.panNo || '';
    const empIdVal = selectedEmployeeObj.empCode || dyn.empId || '';

    setEmpFormData({
      fullName: selectedEmployeeObj.fullName || '',
      empCode: empIdVal,
      bankAccount: accNo,
      pan: panVal,
      panNumber: panVal,
      designation: selectedEmployeeObj.designation || dyn.designation || '',
      department: selectedEmployeeObj.department || 'Management',
      joiningDate: selectedEmployeeObj.joiningDate ? new Date(selectedEmployeeObj.joiningDate).toISOString().split('T')[0] : '',
      dynamicFields: {
        ...dyn,
        accountNo: accNo,
        panNo: panVal,
        empId: empIdVal,
        bankDetails: dyn.bankDetails || (selectedEmployeeObj.bankName ? `${selectedEmployeeObj.bankName}${selectedEmployeeObj.ifscCode ? `(IFSC Code: ${selectedEmployeeObj.ifscCode})` : ''}` : 'BANK OF BARODA(IFSC Code: BARB0VJASHT)'),
        bankAddress: dyn.bankAddress || dyn.location || 'KANNOD ROAD, ASHTA, DIST.SEHORE, ASHTA - 466116',
        postingOffice: dyn.postingOffice || activeCompany?.name || 'DELHI WORLD PUBLIC SCHOOL, ASHTA',
      },
      baselineSalary: selectedEmployeeObj.baselineSalary || {
        basicPay: 40000,
        hra: 6400,
        specialAllowance: 20000,
        medicalAllowance: 500,
        otherAllowances: 0,
        pfDeduction: 7200,
        esicDeduction: 0,
        professionalTax: 200,
        tds: 5000,
        otherDeductions: 0,
      },
    });
    setIsEmpModalOpen(true);
  };

  const handleSaveEmployeeRecord = async (e) => {
    e.preventDefault();
    if (!empFormData.fullName?.trim() || !empFormData.designation?.trim()) {
      showToast('Please enter Employee Name and Designation', 'error');
      return;
    }

    const dynToSave = { ...(empFormData.dynamicFields || {}) };
    let empCodeToUse = empFormData.empCode?.trim() || `EMP-${Date.now().toString().slice(-4)}`;

    if (templateKey === 'delhi_public_school') {
      if (empFormData.joiningDate) {
        const d = new Date(empFormData.joiningDate);
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          dynToSave.dateOfJoiningStr = `${day}/${month}/${year}`;
        }
      }
      dynToSave.accountNo = empFormData.bankAccount || dynToSave.accountNo || '';
      dynToSave.panNo = empFormData.pan || empFormData.panNumber || dynToSave.panNo || '';
      dynToSave.empId = empCodeToUse;
      dynToSave.designation = empFormData.designation;
      if (!dynToSave.postingOffice) {
        dynToSave.postingOffice = activeCompany?.name || 'DELHI WORLD PUBLIC SCHOOL, ASHTA';
      }
    }

    setSavingEmp(true);
    try {
      const payload = {
        ...empFormData,
        empCode: empCodeToUse,
        bankAccount: empFormData.bankAccount || dynToSave.accountNo || '',
        pan: empFormData.pan || empFormData.panNumber || dynToSave.panNo || '',
        panNumber: empFormData.pan || empFormData.panNumber || dynToSave.panNo || '',
        dynamicFields: dynToSave,
        companyId: activeCompany._id,
      };

      let savedId = null;
      if (editingEmpObj) {
        const res = await api.updateEmployee(editingEmpObj._id, payload);
        showToast(res.message || 'Employee updated successfully!', 'success');
        savedId = editingEmpObj._id;
      } else {
        const res = await api.createEmployee(payload);
        showToast(res.message || 'Employee created successfully!', 'success');
        savedId = res.employee?._id || res._id;
      }

      setIsEmpModalOpen(false);
      if (onRefreshEmployees) {
        await onRefreshEmployees();
      }
      if (savedId) {
        setSelectedEmpId(savedId);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingEmp(false);
    }
  };

  const handleEarningChange = (index, field, val, labelIfNew) => {
    if (!draft) return;
    let updatedEarnings = [...(draft.earnings || [])];
    if (index >= 0 && index < updatedEarnings.length) {
      updatedEarnings[index] = {
        ...updatedEarnings[index],
        [field]: field === 'amount' ? Number(val) || 0 : val,
      };
    } else if (labelIfNew) {
      updatedEarnings.push({
        label: labelIfNew,
        [field]: field === 'amount' ? Number(val) || 0 : val,
      });
    }
    const updated = { ...draft, earnings: updatedEarnings };
    recalculateTotals(updated);
  };

  const handleAddEarning = () => {
    if (!draft) return;
    const updated = {
      ...draft,
      earnings: [...draft.earnings, { label: 'Custom Allowance / Bonus', amount: 5000 }],
    };
    recalculateTotals(updated);
  };

  const handleDeleteEarning = (index) => {
    if (!draft) return;
    const updatedEarnings = draft.earnings.filter((_, i) => i !== index);
    const updated = { ...draft, earnings: updatedEarnings };
    recalculateTotals(updated);
  };

  const handleDeductionChange = (index, field, val, labelIfNew) => {
    if (!draft) return;
    let updatedDeductions = [...(draft.deductions || [])];
    if (index >= 0 && index < updatedDeductions.length) {
      updatedDeductions[index] = {
        ...updatedDeductions[index],
        [field]: field === 'amount' ? Number(val) || 0 : val,
      };
    } else if (labelIfNew) {
      updatedDeductions.push({
        label: labelIfNew,
        [field]: field === 'amount' ? Number(val) || 0 : val,
      });
    }
    const updated = { ...draft, deductions: updatedDeductions };
    recalculateTotals(updated);
  };

  const handleAddDeduction = () => {
    if (!draft) return;
    const updated = {
      ...draft,
      deductions: [...draft.deductions, { label: 'Advance Salary / Adjustment', amount: 2000 }],
    };
    recalculateTotals(updated);
  };

  const handleDeleteDeduction = (index) => {
    if (!draft) return;
    const updatedDeductions = draft.deductions.filter((_, i) => i !== index);
    const updated = { ...draft, deductions: updatedDeductions };
    recalculateTotals(updated);
  };

  // Recalculate Gross, Deductions, Net, and Words in real-time
  const recalculateTotals = (targetDraft) => {
    const grossEarnings = targetDraft.earnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalDeductions = targetDraft.deductions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const netSalary = Math.max(0, grossEarnings - totalDeductions);
    
    // Quick number to words converter on client side
    targetDraft.grossEarnings = grossEarnings;
    targetDraft.totalDeductions = totalDeductions;
    targetDraft.netSalary = netSalary;
    setDraft({ ...targetDraft });
  };

  // Auto Pro-Rata Recalculator based on Paid Days / Working Days
  const handleAutoProRata = () => {
    if (!draft || !selectedEmployeeObj) return;
    const workingDays = draft.workingDays > 0 ? draft.workingDays : 30;
    const paidDays = draft.paidDays !== undefined ? draft.paidDays : workingDays;
    const payRatio = paidDays / workingDays;
    const base = selectedEmployeeObj.baselineSalary || {};

    let updatedEarnings = [];
    if (templateKey === 'new_aiims_template') {
      const newAiimsBaseEarnings = [
        { label: 'Basic', amount: 95500 },
        { label: 'Dearness Allowance', amount: 57300 },
        { label: 'House Rent Allowance', amount: 28650 },
        { label: 'Transport Allowance', amount: 7200 },
        { label: 'DA ON TPT', amount: 4320 },
        { label: 'ICU Allowance', amount: 1360 },
        { label: 'Tool Allowance', amount: 540 },
        { label: 'Uniform Allowance', amount: 2250 },
        { label: 'Nursing Allowance', amount: 9000 },
      ];
      updatedEarnings = newAiimsBaseEarnings.map((item) => ({
        label: item.label,
        amount: Math.round(item.amount * payRatio),
      }));
    } else if (templateKey === 'aiims_govt_medical') {
      const aiimsBaseEarnings = [
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
      updatedEarnings = aiimsBaseEarnings.map((item) => ({
        label: item.label,
        amount: Math.round(item.amount * payRatio),
      }));
    } else if (templateKey === 'hcl_corporate_tech') {
      const hclBaseEarnings = [
        { label: 'Basic Salary', amount: 87450 },
        { label: 'HRA', amount: 34980 },
        { label: 'Travel Allowance', amount: 22600 },
        { label: 'Holiday Allowance', amount: 9500 },
        { label: 'Food Wallet', amount: 4500 },
        { label: 'Incentives', amount: 45213 },
      ];
      updatedEarnings = hclBaseEarnings.map((item) => ({
        label: item.label,
        amount: Math.round(item.amount * payRatio),
      }));
    } else if (templateKey === 'concentrix_daksh') {
      const cnxBaseEarnings = [
        { label: 'BASIC SALARY', amount: 23000, fullAmount: 23000 },
        { label: 'HOUSE RENT ALLOWANCE', amount: 11500, fullAmount: 11500 },
        { label: 'STATUTORY BONUS', amount: 3500, fullAmount: 3500 },
        { label: 'SPECIAL ALLOWANCE', amount: 17500, fullAmount: 17500 },
        { label: 'RMEDICAL ALLOWANCE', amount: 2500, fullAmount: 2500 },
        { label: 'PERFORMANCE BONUS', amount: 8000, fullAmount: 8000 },
      ];
      updatedEarnings = cnxBaseEarnings.map((item) => ({
        label: item.label,
        amount: Math.round(item.amount * payRatio),
        fullAmount: item.fullAmount,
      }));
    } else if (templateKey === 'sushma_buildtech') {
      const sushmaBaseEarnings = [
        { label: 'BASIC', amount: 28387, rate: 28387 },
        { label: 'HRA', amount: 14194, rate: 14194 },
        { label: 'CONVEYANCE', amount: 1600, rate: 1600 },
        { label: 'CHILD EDU ALLOWANCE', amount: 200, rate: 200 },
        { label: 'SPECIAL ALLOWANCE', amount: 13619, rate: 13619 },
        { label: 'PERFORMANCE BONUS', amount: 10000, rate: 10000 },
      ];
      updatedEarnings = sushmaBaseEarnings.map((item) => ({
        label: item.label,
        amount: Math.round(item.amount * payRatio),
        rate: item.rate,
      }));
    } else if (templateKey === 'delhi_public_school') {
      const basicVal = (base.basicPay !== undefined && base.basicPay !== '' && !isNaN(base.basicPay)) ? Number(base.basicPay) : 40000;
      const daVal = (base.specialAllowance !== undefined && base.specialAllowance !== '' && !isNaN(base.specialAllowance))
        ? Number(base.specialAllowance)
        : ((base.da !== undefined && base.da !== '' && !isNaN(base.da)) ? Number(base.da) : 20000);
      const hraVal = (base.hra !== undefined && base.hra !== '' && !isNaN(base.hra)) ? Number(base.hra) : 6400;
      const medVal = (base.medicalAllowance !== undefined && base.medicalAllowance !== '' && !isNaN(base.medicalAllowance)) ? Number(base.medicalAllowance) : 500;

      const dwpsBaseEarnings = [
        { label: 'Basic', amount: basicVal, rate: basicVal },
        { label: 'Dearness Allowance', amount: daVal, rate: daVal },
        { label: 'House Rent Allowance', amount: hraVal, rate: hraVal },
        { label: 'Medical Allowance', amount: medVal, rate: medVal },
      ];
      if (base.otherAllowances && Number(base.otherAllowances) > 0) {
        dwpsBaseEarnings.push({ label: 'Other Allowance', amount: Number(base.otherAllowances), rate: Number(base.otherAllowances) });
      }
      updatedEarnings = dwpsBaseEarnings.map((item) => ({
        label: item.label,
        rate: item.rate,
        amount: Math.round(item.rate * payRatio),
      }));
    } else if (templateKey === 'haryana_education') {
      const basicVal = (base.basicPay !== undefined && base.basicPay !== '' && !isNaN(base.basicPay) && Number(base.basicPay) !== 77900) ? Number(base.basicPay) : 64600;
      const daVal = (base.da !== undefined && base.da !== '' && !isNaN(base.da) && Number(base.da) !== 32718) ? Number(base.da) : 27132;
      const hraVal = (base.hra !== undefined && base.hra !== '' && !isNaN(base.hra) && Number(base.hra) !== 6232) ? Number(base.hra) : 5058;
      const medVal = (base.medicalAllowance !== undefined && base.medicalAllowance !== '' && !isNaN(base.medicalAllowance)) ? Number(base.medicalAllowance) : 1000;

      const haryanaBaseEarnings = [
        { label: 'Basic Pay', amount: basicVal },
        { label: 'DP', amount: 0 },
        { label: 'GP', amount: 0 },
        { label: 'D.A.', amount: daVal },
        { label: 'Spe. Pay', amount: 0 },
        { label: 'Pers. Pay', amount: 0 },
        { label: 'C.C.A.', amount: 0 },
        { label: 'H.R.A.', amount: hraVal },
        { label: 'Medical All.', amount: medVal },
        { label: 'Convey. All.', amount: 0 },
        { label: 'Wash. All.', amount: 0 },
        { label: 'Ration', amount: 0 },
        { label: 'M.All.', amount: 0 },
        { label: 'Kit Main.All.', amount: 0 },
        { label: 'Handi.All.', amount: 0 },
        { label: 'Non-Prac.All.', amount: 0 },
        { label: 'SafaiKar/Spl.A.', amount: 0 },
        { label: 'Morni Hill All.', amount: 0 },
        { label: 'Rural Health All.', amount: 0 },
        { label: 'Trans/SplTA/FTA', amount: 0 },
        { label: 'Deputation All.', amount: 0 },
        { label: 'Flying/Crpnter All.', amount: 0 },
        { label: 'Hrdshp/Fly.CerAll', amount: 0 },
        { label: 'Sumptry/DietMny', amount: 0 },
        { label: 'Off.Exps/Instrl Al.', amount: 0 },
        { label: 'Consti/Risk All.', amount: 0 },
        { label: 'Tele./Cashier All.', amount: 0 },
        { label: 'Pol.Med/Super A.', amount: 0 },
        { label: 'Other Allowance', amount: 0 },
      ];
      updatedEarnings = haryanaBaseEarnings.map((item) => ({
        label: item.label,
        amount: Math.round(item.amount * payRatio),
      }));
    } else if (templateKey === 'nestle_india') {
      const basicVal = (base.basicPay !== undefined && base.basicPay !== '' && !isNaN(base.basicPay)) ? Number(base.basicPay) : 168129;
      const hraVal = (base.hra !== undefined && base.hra !== '' && !isNaN(base.hra)) ? Number(base.hra) : Math.round(basicVal * 0.5);
      const compVal = (base.specialAllowance !== undefined && base.specialAllowance !== '' && !isNaN(base.specialAllowance)) ? Number(base.specialAllowance) : 55565;
      const transVal = (base.conveyanceAllowance !== undefined && base.conveyanceAllowance !== '' && !isNaN(base.conveyanceAllowance)) ? Number(base.conveyanceAllowance) : 28500;

      const nestleBase = [
        { label: 'Basic Salary', amount: basicVal },
        { label: 'House Rent Allowance', amount: hraVal },
        { label: 'Compensatory Allowance', amount: compVal },
        { label: 'Transport Allowance', amount: transVal },
      ];
      updatedEarnings = nestleBase.map((item) => ({
        label: item.label,
        amount: Math.round(item.amount * payRatio),
      }));
    } else {
      if (base.basicPay) updatedEarnings.push({ label: 'Basic Salary', amount: Math.round(base.basicPay * payRatio) });
      if (base.hra) updatedEarnings.push({ label: 'House Rent Allowance (HRA)', amount: Math.round(base.hra * payRatio) });
      if (base.specialAllowance) updatedEarnings.push({ label: 'Special Allowance', amount: Math.round(base.specialAllowance * payRatio) });
      if (base.conveyanceAllowance) updatedEarnings.push({ label: 'Conveyance Allowance', amount: Math.round(base.conveyanceAllowance * payRatio) });
      if (base.medicalAllowance) updatedEarnings.push({ label: 'Medical Allowance', amount: Math.round(base.medicalAllowance * payRatio) });
      if (base.otherAllowances) updatedEarnings.push({ label: 'Other Allowances', amount: Math.round(base.otherAllowances * payRatio) });
      if (updatedEarnings.length === 0) {
        updatedEarnings = (draft.earnings || []).map((e) => ({
          label: e.label,
          amount: Math.round(e.amount * payRatio),
        }));
      }
    }

    // Add Overtime Pay if overtime hours > 0
    if (overtimeHours > 0) {
      const basicPay = base.basicPay || 67400;
      const hourlyRate = (basicPay / (workingDays * 8)) * 2; // Double rate for OT
      const otAmount = Math.round(hourlyRate * Number(overtimeHours));
      updatedEarnings.push({ label: `Overtime Allowance (${overtimeHours} hrs)`, amount: otAmount });
    }

    const updated = {
      ...draft,
      earnings: updatedEarnings,
    };
    recalculateTotals(updated);
    showToast(`Pro-rata salary recalculated for ${paidDays}/${workingDays} days (${(payRatio * 100).toFixed(1)}%)!`, 'info');
  };

  // Statutory Deductions Autofill (EPF, ESIC, PT, TDS, AIIMS Recoveries, HCL, Concentrix, Sushma)
  const handleStatutoryAutofill = () => {
    if (!draft || !selectedEmployeeObj) return;

    if (templateKey === 'new_aiims_template') {
      const updatedDeductions = [
        { label: 'Emp Health Scheme', amount: 650 },
        { label: 'Emp Insurance Scheme', amount: 100 },
        { label: 'General Provided Fund-A/C:G-11148', amount: 25000 },
        { label: 'Income Tax', amount: 25155 },
        { label: 'Society Recovery 7791.0', amount: 28730 },
      ];
      const updated = {
        ...draft,
        deductions: updatedDeductions,
      };
      recalculateTotals(updated);
      showToast('Autofilled new AIIMS statutory deductions & recoveries!', 'success');
      return;
    }

    if (templateKey === 'aiims_govt_medical') {
      const updatedDeductions = [
        { label: 'Association Fund Category Amount', amount: 20 },
        { label: 'Emp Health Scheme', amount: 650 },
        { label: 'Emp Insurance Scheme', amount: 60 },
        { label: 'Income Tax', amount: 7357 },
        { label: 'Miscellaneous Recovery NA', amount: 967 },
        { label: 'New Pension Scehme-110001989995', amount: 10874 },
        { label: 'Nps Employer Ded Share', amount: 15224 },
        { label: 'Water Charges', amount: 82 },
      ];
      const updated = {
        ...draft,
        deductions: updatedDeductions,
      };
      recalculateTotals(updated);
      showToast('Autofilled AIIMS Central Govt statutory deductions & recoveries!', 'success');
      return;
    }

    if (templateKey === 'hcl_corporate_tech') {
      const updatedDeductions = [
        { label: 'Ee PF contribution', amount: 10494 },
        { label: 'Prof Tax - split period', amount: 200 },
        { label: 'Income Tax', amount: 36586 },
      ];
      const updated = {
        ...draft,
        deductions: updatedDeductions,
      };
      recalculateTotals(updated);
      showToast('Autofilled HCL Technologies enterprise statutory deductions!', 'success');
      return;
    }

    if (templateKey === 'concentrix_daksh') {
      const updatedDeductions = [
        { label: 'PROVIDENT FUND', amount: 2760 },
        { label: 'PROFESSIONAL TAX', amount: 200 },
        { label: 'INCOME TAX (TDS)', amount: 4800 },
      ];
      const updated = {
        ...draft,
        deductions: updatedDeductions,
      };
      recalculateTotals(updated);
      showToast('Autofilled Concentrix Daksh statutory deductions!', 'success');
      return;
    }

    if (templateKey === 'sushma_buildtech') {
      const updatedDeductions = [
        { label: 'PF EMPLOYEE SHARE', amount: 3406 },
        { label: 'PROFESSIONAL TAX', amount: 200 },
        { label: 'TDS', amount: 2500 },
      ];
      const updated = {
        ...draft,
        deductions: updatedDeductions,
      };
      recalculateTotals(updated);
      showToast('Autofilled Sushma Buildtech statutory deductions!', 'success');
      return;
    }

    if (templateKey === 'delhi_public_school') {
      const pfVal = (base.pfDeduction !== undefined && base.pfDeduction !== '' && !isNaN(base.pfDeduction))
        ? Number(base.pfDeduction)
        : 7200;
      const taxVal = (base.tds !== undefined && base.tds !== '' && !isNaN(base.tds))
        ? Number(base.tds)
        : 5000;
      const ptVal = (base.professionalTax !== undefined && base.professionalTax !== '' && !isNaN(base.professionalTax))
        ? Number(base.professionalTax)
        : 200;

      const updatedDeductions = [
        { label: 'Provident Fund', amount: pfVal },
        { label: 'Income Tax', amount: taxVal },
        { label: 'Proffessional Tax', amount: ptVal },
      ];
      const updated = {
        ...draft,
        deductions: updatedDeductions,
      };
      recalculateTotals(updated);
      showToast('Autofilled Delhi World Public School statutory deductions!', 'success');
      return;
    }

    if (templateKey === 'haryana_education') {
      const gpfVal = (base.pfDeduction !== undefined && base.pfDeduction !== '' && !isNaN(base.pfDeduction)) ? Number(base.pfDeduction) : 10000;
      const itVal = (base.tds !== undefined && base.tds !== '' && !isNaN(base.tds)) ? Number(base.tds) : 5000;
      const updatedDeductions = [
        { label: 'GPF Subs.', amount: gpfVal },
        { label: 'NPS Subs.', amount: 0 },
        { label: 'NPS Arrear', amount: 0 },
        { label: 'G.I.S.', amount: 0 },
        { label: 'L.I.C.', amount: 0 },
        { label: 'Car Usage', amount: 0 },
        { label: 'Income Tax', amount: itVal },
        { label: 'Lic.Fee (St)', amount: 0 },
        { label: 'Lic.Fee (Ce)', amount: 0 },
        { label: 'Lic.Fee (De)', amount: 0 },
        { label: 'PLI', amount: 0 },
        { label: 'CTD', amount: 0 },
        { label: 'Relief Fund', amount: 0 },
        { label: 'FTC', amount: 0 },
        { label: 'Wel. Fund Sub.', amount: 0 },
        { label: 'Wel. Loan Ded', amount: 0 },
        { label: 'Sports Fund Sub', amount: 0 },
        { label: 'Main.Fund Sub', amount: 0 },
        { label: 'Electricity Char.', amount: 0 },
        { label: 'Water Charges', amount: 0 },
        { label: 'Other TOBT', amount: 0 },
        { label: 'Other AGBT', amount: 0 },
        { label: 'Other Ded.', amount: 0 },
        { label: 'Bank LOANS', amount: 0 },
        { label: 'SctrAd.', amount: 0 },
        { label: 'CarAdv', amount: 0 },
        { label: 'HBA', amount: 0 },
        { label: 'MarAdv', amount: 0 },
        { label: 'ComAd', amount: 0 },
      ];
      const updated = {
        ...draft,
        deductions: updatedDeductions,
      };
      recalculateTotals(updated);
      showToast('Autofilled Haryana Education statutory deductions!', 'success');
      return;
    }

    if (templateKey === 'nestle_india') {
      const itVal = (base.tds !== undefined && base.tds !== '' && !isNaN(base.tds)) ? Number(base.tds) : 70040;
      const pfVal = (base.pfDeduction !== undefined && base.pfDeduction !== '' && !isNaN(base.pfDeduction)) ? Number(base.pfDeduction) : 20175;
      const updatedDeductions = [
        { label: 'Income Tax', amount: itVal },
        { label: 'Recreation Club GGN', amount: 150 },
        { label: 'Ee PF contribution', amount: pfVal },
      ];
      const updated = {
        ...draft,
        deductions: updatedDeductions,
      };
      recalculateTotals(updated);
      showToast('Autofilled Nestle India statutory deductions!', 'success');
      return;
    }

    const gross = draft.grossEarnings || 0;
    const basicItem = draft.earnings.find((e) => e.label.toLowerCase().includes('basic'));
    const basicPay = basicItem ? Number(basicItem.amount) || 0 : Math.round(gross * 0.4);

    const ptState = selectedEmployeeObj.ptState || activeCompany?.ptState || 'maharashtra';
    const epfObj = calculateEPF(basicPay, false);
    const esicObj = calculateESIC(gross);
    const pt = calculatePT(gross, ptState, selectedEmployeeObj.dynamicFields?.gender || 'M', draft.month);

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
    if (selectedEmployeeObj.baselineSalary?.tds) {
      updatedDeductions.push({ label: 'Income Tax / TDS', amount: Number(selectedEmployeeObj.baselineSalary.tds) });
    }

    const updated = {
      ...draft,
      deductions: updatedDeductions,
    };
    recalculateTotals(updated);
    showToast('Autofilled statutory EPF, ESIC, PT, and TDS deductions!', 'success');
  };

  // Save / Finalize Single Payslip
  const handleSavePayslip = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const payloadDraft = {
        ...draft,
        snapshotData: {
          ...(draft.snapshotData || {}),
          company: {
            ...(draft.snapshotData?.company || {}),
            ...activeCompany,
            ...layoutConfig,
            dwpsCustomFields: layoutConfig.dwpsCustomFields || activeCompany?.dwpsCustomFields,
            dwpsMetaColumns: layoutConfig.dwpsMetaColumns !== undefined ? layoutConfig.dwpsMetaColumns : activeCompany?.dwpsMetaColumns,
          },
          employee: {
            ...(draft.snapshotData?.employee || {}),
            ...(selectedEmployeeObj || {}),
          },
          templateKey,
        },
      };

      if (existingPayslipRecord?._id) {
        const res = await api.updatePayslip(existingPayslipRecord._id, payloadDraft);
        showToast(res.message || 'Existing salary slip updated successfully!', 'success');
      } else {
        const res = await api.createPayslip(payloadDraft);
        showToast(res.message || 'Payslip saved & finalized!', 'success');
      }
      if (onPayslipGenerated) onPayslipGenerated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk Date Range Generation
  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) {
      showToast('Please select an employee', 'error');
      return;
    }

    setIsBulkGenerating(true);
    try {
      const res = await api.generateBulkPayslips({
        employeeId: selectedEmpId,
        startMonth,
        startYear: Number(startYear),
        endMonth,
        endYear: Number(endYear),
        workingDays: draft?.workingDays !== undefined ? draft.workingDays : 30,
        paidDays: draft?.paidDays !== undefined ? draft.paidDays : (draft?.workingDays || 30),
        lopDays: draft?.lopDays !== undefined ? draft.lopDays : 0,
        monthBreakdown: bulkMonths,
        deductions: draft?.deductions,
        snapshotData: {
          company: {
            ...activeCompany,
            ...layoutConfig,
            dwpsCustomFields: layoutConfig.dwpsCustomFields || activeCompany?.dwpsCustomFields,
            dwpsMetaColumns: layoutConfig.dwpsMetaColumns !== undefined ? layoutConfig.dwpsMetaColumns : activeCompany?.dwpsMetaColumns,
          },
          employee: {
            ...(selectedEmployeeObj || {}),
          },
          templateKey,
        },
      });
      showToast(res.message || 'Bulk payslips generated successfully with customized days!', 'success');
      if (onPayslipGenerated) onPayslipGenerated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handlePrint = () => {
    showToast('Print dialog opened. Select "Destination: Save as PDF" for an editable vector PDF.', 'info');
    window.print();
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('live-payslip-print-target');
    if (!el) {
      showToast('Live payslip preview not found', 'error');
      return;
    }
    setIsExportingPdf(true);
    try {
      const empName = (selectedEmployeeObj?.fullName || 'Employee').replace(/\s+/g, '_');
      const filename = `Payslip_${empName}_${selectedMonth}_${selectedYear}.pdf`;
      await exportElementToPdf(el, filename, {
        margin: [6, 6, 6, 6],
        scale: 2,
      });
      showToast(`Exported ${filename} successfully!`, 'success');
    } catch (err) {
      console.error('PDF Export Error:', err);
      showToast('PDF Export failed: ' + err.message, 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleLogoSaved = (logoData) => {
    if (logoData?.company && onCompanyUpdated) {
      onCompanyUpdated(logoData.company);
    } else if (logoData && onCompanyUpdated && activeCompany) {
      onCompanyUpdated({
        ...activeCompany,
        ...logoData,
      });
    }
    if (logoData) {
      setLayoutConfig((prev) => ({
        ...prev,
        ...(logoData.company || logoData),
      }));
    }
  };

  return (
    <div>
      {/* Control Header & Mode Switcher */}
      <div className="no-print" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Salary Slip Studio</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Interactive Live Canvas with In-Place Editing, Dynamic Schema Rendering, and Date Range Bulk Generator
            </p>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="segmented-control">
            <button
              className={`segmented-btn ${mode === 'single' ? 'active' : ''}`}
              onClick={() => setMode('single')}
              id="mode-single-btn"
            >
              Single Month Live Canvas
            </button>
            <button
              className={`segmented-btn ${mode === 'bulk' ? 'active' : ''}`}
              onClick={() => setMode('bulk')}
              id="mode-bulk-btn"
            >
              Bulk Date-Range Mode
            </button>
          </div>
        </div>

        {/* Selection Bar */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          {mode === 'single' ? (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Active Company Switcher */}
              {companies && companies.length > 0 && (
                <div className="form-group" style={{ flex: '1 1 230px', marginBottom: 0 }}>
                  <label className="form-label">Company & Template</label>
                  <select
                    className="form-select"
                    value={activeCompany?._id || ''}
                    onChange={(e) => {
                      const found = companies.find((c) => c._id === e.target.value);
                      if (found && setActiveCompany) setActiveCompany(found);
                    }}
                    id="gen-company-select"
                  >
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        🏢 {c.name} ({(c.templateKey || '').replace(/_/g, ' ').toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group" style={{ flex: '1 1 290px', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Select Employee</label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      onClick={handleOpenNewEmpModal}
                      id="gen-btn-add-emp"
                    >
                      <UserPlus size={13} className="text-cyan" />
                      <span>+ New Employee</span>
                    </button>
                    {selectedEmployeeObj && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={handleOpenEditEmpModal}
                        id="gen-btn-edit-emp"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>
                <select
                  className="form-select"
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  id="select-payslip-emp"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      👤 {emp.fullName} ({emp.empCode}) - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ width: '160px', marginBottom: 0 }}>
                <label className="form-label">Month</label>
                <select
                  className="form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  id="select-payslip-month"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ width: '130px', marginBottom: 0 }}>
                <label className="form-label">Year</label>
                <select
                  className="form-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  id="select-payslip-year"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.3rem' }}>
                <button
                  onClick={fetchDraft}
                  className="btn btn-secondary"
                  title="Reset to Base"
                  id="refresh-draft-btn"
                >
                  <RefreshCw size={15} className={loadingDraft ? 'spin' : ''} />
                  <span>Reset Canvas</span>
                </button>
                <button
                  onClick={handleSavePayslip}
                  className="btn btn-primary"
                  disabled={isSaving || !draft}
                  id="save-payslip-btn"
                >
                  {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                  <span>{existingPayslipRecord ? 'Update Salary Slip' : 'Save Snapshot'}</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="btn btn-primary"
                  disabled={isExportingPdf || !draft}
                  title="Export live canvas directly to PDF"
                  id="download-pdf-btn"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                >
                  {isExportingPdf ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="btn btn-secondary"
                  title="Print or Save as PDF via browser dialog (Produces 100% editable vector PDF)"
                  id="print-payslip-btn"
                >
                  <Printer size={16} />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>
          ) : (
            /* Bulk Mode Parameters */
            <form onSubmit={handleBulkGenerate}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
                  <label className="form-label">Target Employee</label>
                  <select
                    className="form-select"
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        👤 {emp.fullName} ({emp.empCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ width: '150px', marginBottom: 0 }}>
                  <label className="form-label">Start Month</label>
                  <select
                    className="form-select"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ width: '110px', marginBottom: 0 }}>
                  <label className="form-label">Start Year</label>
                  <select
                    className="form-select"
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ width: '150px', marginBottom: 0 }}>
                  <label className="form-label">End Month</label>
                  <select
                    className="form-select"
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ width: '110px', marginBottom: 0 }}>
                  <label className="form-label">End Year</label>
                  <select
                    className="form-select"
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Month-by-Month Days & Attendance Customization Table */}
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1.25rem',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--text-light)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
                      <span>Month-wise Paid Days & Attendance Settings</span>
                      <span className="badge badge-info">{bulkMonths.length} Months Selected</span>
                    </h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Har month ke Paid Days customize karein. Salary us month ke calendar days aur paid days ke hisab se calculate hogi.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      onClick={() => {
                        setBulkMonths((prev) =>
                          prev.map((m) => ({
                            ...m,
                            workingDays: m.totalDays,
                            paidDays: m.totalDays,
                            lopDays: 0,
                          }))
                        );
                        showToast('All months set to 100% full attendance', 'info');
                      }}
                      title="Set full calendar days for every month"
                    >
                      <CheckCircle2 size={12} />
                      <span>Reset All to Full Days</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      onClick={() => {
                        setBulkMonths((prev) =>
                          prev.map((m) => {
                            const standard = Math.min(30, m.totalDays);
                            return {
                              ...m,
                              workingDays: standard,
                              paidDays: standard,
                              lopDays: 0,
                            };
                          })
                        );
                        showToast('All months set to standard 30 days', 'info');
                      }}
                      title="Set standard 30 days for every month"
                    >
                      <span>Standard 30 Days</span>
                    </button>
                  </div>
                </div>

                {bulkMonths.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    ⚠️ Invalid period range. End Month/Year must be after Start Month/Year.
                  </div>
                ) : (
                  <div
                    style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <table className="data-table" style={{ width: '100%', fontSize: '0.82rem', margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '0.6rem 0.8rem' }}>Month & Year</th>
                          <th style={{ textAlign: 'center', padding: '0.6rem 0.8rem' }}>Month Days</th>
                          <th style={{ textAlign: 'center', padding: '0.6rem 0.8rem', width: '130px' }}>Paid Days</th>
                          <th style={{ textAlign: 'center', padding: '0.6rem 0.8rem' }}>Loss of Pay (LOP)</th>
                          <th style={{ textAlign: 'center', padding: '0.6rem 0.8rem' }}>Pay Ratio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkMonths.map((bm, idx) => {
                          const isLop = bm.lopDays > 0;
                          const ratioPct = bm.workingDays > 0 ? Math.round((bm.paidDays / bm.workingDays) * 100) : 100;
                          return (
                            <tr key={`${bm.month}-${bm.year}`} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                              <td style={{ fontWeight: 600, padding: '0.5rem 0.8rem', color: 'var(--text-light)' }}>
                                📅 {bm.month} {bm.year}
                              </td>
                              <td style={{ textAlign: 'center', padding: '0.5rem 0.8rem', color: 'var(--text-muted)' }}>
                                {bm.totalDays} Days
                              </td>
                              <td style={{ textAlign: 'center', padding: '0.5rem 0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max={bm.totalDays}
                                    value={bm.paidDays}
                                    onChange={(e) => handleBulkMonthDaysChange(idx, 'paidDays', e.target.value)}
                                    className="form-input"
                                    style={{
                                      width: '65px',
                                      padding: '0.25rem 0.4rem',
                                      textAlign: 'center',
                                      fontSize: '0.85rem',
                                      fontWeight: 700,
                                      borderColor: isLop ? 'var(--accent-amber)' : 'var(--accent-cyan)',
                                      color: isLop ? 'var(--accent-amber)' : 'inherit',
                                    }}
                                  />
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {bm.totalDays}</span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', padding: '0.5rem 0.8rem' }}>
                                {isLop ? (
                                  <span className="badge badge-admin" style={{ fontWeight: 700, fontSize: '0.72rem' }}>
                                    -{bm.lopDays} Days Absent
                                  </span>
                                ) : (
                                  <span className="badge badge-employee" style={{ fontSize: '0.72rem' }}>
                                    Full Attendance
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center', padding: '0.5rem 0.8rem', fontWeight: 700, color: ratioPct < 100 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                                {ratioPct}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Submit Button inside card */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isBulkGenerating || bulkMonths.length === 0}
                    id="bulk-generate-submit-btn"
                    style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
                  >
                    {isBulkGenerating ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        <span>Generating {bulkMonths.length} Payslips...</span>
                      </>
                    ) : (
                      <>
                        <Layers size={16} />
                        <span>Issue {bulkMonths.length} Consecutive Payslips</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LIVE EDITABLE PAYSLIP CANVAS PREVIEW & LAYOUT CUSTOMIZER
      ───────────────────────────────────────────────────────────── */}
      {draft && mode === 'single' ? (
        <div className="payslip-canvas-container">

          {/* ATTENDANCE & STATUTORY INTELLIGENT ACTION BAR */}
          <div
            className="glass-panel no-print"
            style={{
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Left: Attendance Inputs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.85rem' }}>
                <Clock size={16} />
                <span>Attendance & Days:</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Month Days:</span>
                <input
                  type="number"
                  min="20"
                  max="31"
                  value={draft.workingDays || 30}
                  onChange={(e) => handleDaysChange('workingDays', e.target.value)}
                  className="form-input"
                  style={{ width: '60px', padding: '0.25rem 0.4rem', textAlign: 'center', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paid Days:</span>
                <input
                  type="number"
                  min="0"
                  max={draft.workingDays || 31}
                  value={draft.paidDays !== undefined ? draft.paidDays : (draft.workingDays || 30)}
                  onChange={(e) => handleDaysChange('paidDays', e.target.value)}
                  className="form-input"
                  style={{ width: '60px', padding: '0.25rem 0.4rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, borderColor: 'var(--accent-cyan)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Loss of Pay (LOP):</span>
                <span className={`badge ${draft.lopDays > 0 ? 'badge-admin' : 'badge-employee'}`} style={{ fontWeight: 700 }}>
                  {draft.lopDays || 0} Days
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overtime:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value) || 0)}
                  className="form-input"
                  placeholder="0 hrs"
                  style={{ width: '65px', padding: '0.25rem 0.4rem', textAlign: 'center', fontSize: '0.85rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>hrs</span>
              </div>
            </div>

            {/* Right: Quick Action Engines */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={handleAutoProRata}
                title="Automatically calculate earnings based on Paid Days / Total Days and Overtime"
                id="pro-rata-btn"
                style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
              >
                <Zap size={14} />
                <span>Recalculate Pro-Rata</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={handleStatutoryAutofill}
                title="Autofill EPF 12%, ESIC 0.75%, State PT, and TDS"
                id="statutory-autofill-btn"
                style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)' }}
              >
                <ShieldCheck size={14} />
                <span>Statutory Autofill (PF/ESIC/PT)</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => setIsCtcModalOpen(true)}
                title="Open interactive CTC & Tax Breakdown Calculator"
                id="generator-ctc-calc-btn"
              >
                <Calculator size={14} />
                <span>CTC Engine</span>
              </button>
            </div>
          </div>
          
          {/* Slip Dimensions, Borders & Column Layout Toolbar */}
          <SlipLayoutToolbar
            company={activeCompany}
            layoutConfig={layoutConfig}
            onChangeLayout={(newCfg) => setLayoutConfig(newCfg)}
            onSaveCompanyLayout={(updatedComp) => {
              if (onCompanyUpdated) onCompanyUpdated(updatedComp);
            }}
          />

          {/* Mobile Swipe / Scroll Hint */}
          <div className="mobile-scroll-hint">
            <span>↔ Swipe horizontally to view & edit full payslip sheet</span>
          </div>

          <div className="payslip-canvas-scroll-wrapper" id="live-payslip-print-target">
          {templateKey === 'new_aiims_template' ? (
            <NewAiimsPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              layoutConfig={layoutConfig}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
              onSizeSaved={handleLogoSaved}
            />
          ) : templateKey === 'aiims_govt_medical' ? (
            <AiimsGovtPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              layoutConfig={layoutConfig}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
              onSizeSaved={handleLogoSaved}
            />
          ) : templateKey === 'hcl_corporate_tech' ? (
            <HclCorporatePayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              layoutConfig={layoutConfig}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
              onSizeSaved={handleLogoSaved}
            />
          ) : templateKey === 'classic_tabular' ? (
            <ClassicTabularPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              template={templates.find((t) => t.templateKey === templateKey)}
              draft={draft}
              isEditable={true}
              layoutConfig={layoutConfig}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
              onSizeSaved={handleLogoSaved}
            />
          ) : templateKey === 'concentrix_daksh' ? (
            <ConcentrixDakshPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              layoutConfig={layoutConfig}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
              onSizeSaved={handleLogoSaved}
            />
          ) : templateKey === 'sushma_buildtech' ? (
            <SushmaBuildtechPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              layoutConfig={layoutConfig}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
              onSizeSaved={handleLogoSaved}
            />
          ) : templateKey === 'delhi_public_school' ? (
            <DelhiPublicSchoolPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              layoutConfig={layoutConfig}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
              onSizeSaved={handleLogoSaved}
            />
          ) : templateKey === 'haryana_education' ? (
            <HaryanaEducationPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              layoutConfig={layoutConfig}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
              onSizeSaved={handleLogoSaved}
            />
          ) : templateKey === 'nestle_india' ? (
            <NestleIndiaPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              layoutConfig={layoutConfig}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
              onSizeSaved={handleLogoSaved}
            />
          ) : (
          <div
            className={`payslip-sheet template-${templateKey}`}
            id="printable-payslip"
            style={{
              maxWidth: layoutConfig.slipWidth ? `${layoutConfig.slipWidth}px` : undefined,
              minHeight: layoutConfig.slipMinHeight ? `${layoutConfig.slipMinHeight}px` : undefined,
              padding: layoutConfig.slipPadding ? `${layoutConfig.slipPadding}px` : undefined,
              borderWidth: layoutConfig.slipBorderWidth !== undefined ? `${layoutConfig.slipBorderWidth}px` : undefined,
              borderStyle: layoutConfig.slipBorderStyle || undefined,
              borderColor: layoutConfig.slipBorderColor || undefined,
              borderRadius: layoutConfig.slipBorderRadius !== undefined ? `${layoutConfig.slipBorderRadius}px` : undefined,
              fontSize: layoutConfig.fontSizeScale ? `${layoutConfig.fontSizeScale * 0.0085}rem` : undefined,
            }}
          >
            
            {/* Header / Brand */}
            <div className="payslip-header">
              <div className="company-branding">
                <ResizableLogo
                  company={activeCompany}
                  isEditable={true}
                />
                <div>
                  <h1 className="company-title">{activeCompany?.name || 'Company Name'}</h1>
                  <p className="company-sub">{activeCompany?.fullAddress}</p>
                  <p className="company-sub">
                    {activeCompany?.email && `Email: ${activeCompany.email} • `}
                    {activeCompany?.phone && `Tel: ${activeCompany.phone}`}
                  </p>
                  {activeCompany?.gstin && <p className="company-sub">GSTIN: {activeCompany.gstin} | PAN: {activeCompany.pan}</p>}
                </div>
              </div>

              <div className="payslip-badge-box">
                <h2>SALARY SLIP</h2>
                <div className="pay-period-pill">{draft.payPeriod}</div>
              </div>
            </div>

            {/* Employee Metadata & Template Dynamic Fields */}
            <div className="payslip-meta-grid">
              <div className="meta-col">
                <div className="meta-row">
                  <span className="meta-label">Employee ID:</span>
                  <span className="meta-val">{selectedEmployeeObj?.empCode || 'N/A'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Employee Name:</span>
                  <span className="meta-val highlight">{selectedEmployeeObj?.fullName || 'N/A'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Designation:</span>
                  <span className="meta-val">{selectedEmployeeObj?.designation || 'N/A'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Department:</span>
                  <span className="meta-val">{selectedEmployeeObj?.department || 'General'}</span>
                </div>
              </div>

              <div className="meta-col">
                {/* Template Specific Dynamic Fields */}
                {selectedEmployeeObj?.dynamicFields?.panNumber && (
                  <div className="meta-row">
                    <span className="meta-label">PAN Number:</span>
                    <span className="meta-val">{selectedEmployeeObj.dynamicFields.panNumber}</span>
                  </div>
                )}
                {selectedEmployeeObj?.dynamicFields?.uanNumber && (
                  <div className="meta-row">
                    <span className="meta-label">UAN No:</span>
                    <span className="meta-val">{selectedEmployeeObj.dynamicFields.uanNumber}</span>
                  </div>
                )}
                {selectedEmployeeObj?.dynamicFields?.pfNumber && (
                  <div className="meta-row">
                    <span className="meta-label">PF Account:</span>
                    <span className="meta-val">{selectedEmployeeObj.dynamicFields.pfNumber}</span>
                  </div>
                )}
                {selectedEmployeeObj?.dynamicFields?.bankAccount && (
                  <div className="meta-row">
                    <span className="meta-label">Bank A/C:</span>
                    <span className="meta-val">{selectedEmployeeObj.dynamicFields.bankAccount}</span>
                  </div>
                )}
                {selectedEmployeeObj?.dynamicFields?.ifscCode && (
                  <div className="meta-row">
                    <span className="meta-label">IFSC Code:</span>
                    <span className="meta-val">{selectedEmployeeObj.dynamicFields.ifscCode}</span>
                  </div>
                )}
              </div>

              {/* Attendance & Working Days Inline Editing */}
              <div className="meta-col attendance-box">
                <div className="meta-row">
                  <span className="meta-label">Working Days:</span>
                  <input
                    type="number"
                    className="canvas-input-inline"
                    value={draft.workingDays}
                    onChange={(e) => handleDaysChange('workingDays', e.target.value)}
                  />
                </div>
                <div className="meta-row">
                  <span className="meta-label">Paid Days:</span>
                  <input
                    type="number"
                    className="canvas-input-inline"
                    value={draft.paidDays}
                    onChange={(e) => handleDaysChange('paidDays', e.target.value)}
                  />
                </div>
                <div className="meta-row">
                  <span className="meta-label">LOP Unpaid Leaves:</span>
                  <span className="meta-val" style={{ color: '#ef4444' }}>{draft.lopDays} days</span>
                </div>
              </div>
            </div>

            {/* Financials Two-Column Breakdown (Earnings vs Deductions) */}
            <div
              className="payslip-financials-grid"
              style={{
                gridTemplateColumns: `${layoutConfig.incomeColumnWidth}% ${100 - layoutConfig.incomeColumnWidth}%`,
              }}
            >
              
              {/* Earnings Table */}
              <div
                className="financial-section earnings-section"
                style={{
                  minHeight: layoutConfig.incomeDeductionMinHeight ? `${layoutConfig.incomeDeductionMinHeight}px` : undefined,
                }}
              >
                <div className="section-head">
                  <h3>EARNINGS</h3>
                  <button
                    type="button"
                    onClick={handleAddEarning}
                    className="canvas-add-btn no-print"
                    title="Add Custom Allowance"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                <table className="canvas-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount ({currencySymbol})</th>
                      <th className="no-print" style={{ width: '30px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.earnings.map((e, idx) => (
                      <tr key={idx} style={{ height: `${layoutConfig.incomeDeductionHeight}px` }}>
                        <td style={{ padding: `${Math.max(4, (layoutConfig.incomeDeductionHeight - 20) / 2)}px 0.75rem` }}>
                          <input
                            type="text"
                            className="canvas-table-input"
                            value={e.label}
                            onChange={(ev) => handleEarningChange(idx, 'label', ev.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'right', padding: `${Math.max(4, (layoutConfig.incomeDeductionHeight - 20) / 2)}px 0.75rem` }}>
                          <input
                            type="number"
                            className="canvas-table-input num-right"
                            value={e.amount}
                            onChange={(ev) => handleEarningChange(idx, 'amount', ev.target.value)}
                          />
                        </td>
                        <td className="no-print">
                          <button
                            type="button"
                            onClick={() => handleDeleteEarning(idx)}
                            className="canvas-del-btn"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Deductions Table */}
              <div
                className="financial-section deductions-section"
                style={{
                  minHeight: layoutConfig.incomeDeductionMinHeight ? `${layoutConfig.incomeDeductionMinHeight}px` : undefined,
                }}
              >
                <div className="section-head">
                  <h3>DEDUCTIONS</h3>
                  <button
                    type="button"
                    onClick={handleAddDeduction}
                    className="canvas-add-btn no-print"
                    title="Add Custom Deduction"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                <table className="canvas-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount ({currencySymbol})</th>
                      <th className="no-print" style={{ width: '30px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.deductions.map((d, idx) => (
                      <tr key={idx} style={{ height: `${layoutConfig.incomeDeductionHeight}px` }}>
                        <td style={{ padding: `${Math.max(4, (layoutConfig.incomeDeductionHeight - 20) / 2)}px 0.75rem` }}>
                          <input
                            type="text"
                            className="canvas-table-input"
                            value={d.label}
                            onChange={(ev) => handleDeductionChange(idx, 'label', ev.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'right', padding: `${Math.max(4, (layoutConfig.incomeDeductionHeight - 20) / 2)}px 0.75rem` }}>
                          <input
                            type="number"
                            className="canvas-table-input num-right"
                            value={d.amount}
                            onChange={(ev) => handleDeductionChange(idx, 'amount', ev.target.value)}
                          />
                        </td>
                        <td className="no-print">
                          <button
                            type="button"
                            onClick={() => handleDeleteDeduction(idx)}
                            className="canvas-del-btn"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Totals & Net Payable Box */}
            <div className="payslip-totals-summary">
              <div className="totals-row">
                <div className="total-cell">
                  <span>Gross Earnings:</span>
                  <strong>{currencySymbol}{draft.grossEarnings.toLocaleString('en-IN')}</strong>
                </div>
                <div className="total-cell">
                  <span>Total Deductions:</span>
                  <strong>{currencySymbol}{draft.totalDeductions.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="net-payable-highlight">
                <div className="net-left">
                  <span className="net-label">NET TAKE-HOME SALARY</span>
                  <div className="net-words">
                    In Words: {draft.netSalaryInWords || `${currencySymbol} ${draft.netSalary.toLocaleString('en-IN')}`}
                  </div>
                </div>
                <div className="net-amount">
                  {currencySymbol}{draft.netSalary.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Signatures & Footer Note */}
            <div className="payslip-footer">
              <div className="footer-note">
                <p>*This is a computer generated payslip and doesn't require signature or any company seal.</p>
                <p>Generated on: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="signature-box">
                <div className="signature-line" />
                <strong>{activeCompany?.signatoryName || 'Authorized Signatory'}</strong>
                <span>{activeCompany?.signatoryDesignation || 'Head of HR'}</span>
              </div>
            </div>

          </div>
          )}
          </div>
        </div>
      ) : mode === 'single' ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
          <p>Compiling interactive payslip preview canvas...</p>
        </div>
      ) : null}

      {/* CTC Breakdown & Tax Comparator Modal */}
      <CtcCalculatorModal
        isOpen={isCtcModalOpen}
        onClose={() => setIsCtcModalOpen(false)}
        initialCtc={selectedEmployeeObj?.ctcAnnual || 600000}
        initialState={selectedEmployeeObj?.ptState || activeCompany?.ptState || 'maharashtra'}
        onApplySalary={(data) => {
          if (!draft) return;
          const updatedEarnings = [
            { label: 'Basic Salary', amount: data.baselineSalary.basicPay },
            { label: 'House Rent Allowance (HRA)', amount: data.baselineSalary.hra },
            { label: 'Special Allowance', amount: data.baselineSalary.specialAllowance },
            { label: 'Conveyance Allowance', amount: data.baselineSalary.conveyanceAllowance },
            { label: 'Medical Allowance', amount: data.baselineSalary.medicalAllowance },
          ];
          const updatedDeductions = [
            { label: 'Provident Fund (PF 12%)', amount: data.baselineSalary.pfDeduction },
            ...(data.baselineSalary.esicDeduction > 0 ? [{ label: 'Employee State Insurance (ESIC 0.75%)', amount: data.baselineSalary.esicDeduction }] : []),
            { label: 'Professional Tax (PT)', amount: data.baselineSalary.professionalTax },
            ...(data.baselineSalary.tds > 0 ? [{ label: 'Income Tax / TDS', amount: data.baselineSalary.tds }] : []),
          ];

          const updated = {
            ...draft,
            earnings: updatedEarnings,
            deductions: updatedDeductions,
          };
          recalculateTotals(updated);
          showToast('Applied calculated CTC structure to current payslip draft!', 'success');
        }}
      />

      {/* Quick Add / Edit Employee Modal from Generator */}
      {isEmpModalOpen && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setIsEmpModalOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
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
                  {editingEmpObj ? 'Edit Employee Details' : 'Onboard New Employee'}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Active Template: <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{activeCompany?.name} ({(templateKey || '').replace(/_/g, ' ').toUpperCase()})</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEmpModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEmployeeRecord}>
              {templateKey === 'delhi_public_school' ? (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Users size={18} className="text-cyan" />
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-cyan)', margin: 0, fontWeight: 700 }}>
                        Delhi World Public School — Employee Credentials
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      {/* Left Column Box (Template Left Side) */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.35rem' }}>
                          Template Left Side Details
                        </div>

                        {/* 1. Name */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700 }}>Name *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. SUNAINA SHARMA"
                            value={empFormData.fullName}
                            onChange={(e) => setEmpFormData({ ...empFormData, fullName: e.target.value })}
                            required
                            autoFocus
                            id="gen-dwps-input-fullname"
                          />
                        </div>

                        {/* 2. Account No. */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700 }}>Account No. *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. 38570100006930"
                            value={empFormData.bankAccount || empFormData.dynamicFields?.accountNo || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEmpFormData((prev) => ({
                                ...prev,
                                bankAccount: val,
                                dynamicFields: { ...prev.dynamicFields, accountNo: val },
                              }));
                            }}
                            required
                            id="gen-dwps-input-accountno"
                          />
                        </div>

                        {/* 3. Joining Date */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700 }}>Joining Date *</label>
                          <input
                            type="date"
                            className="form-input"
                            value={empFormData.joiningDate}
                            onChange={(e) => setEmpFormData({ ...empFormData, joiningDate: e.target.value })}
                            required
                            id="gen-dwps-input-joiningdate"
                          />
                        </div>

                        {/* 4. Bank Details */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700 }}>Bank Details (Bank & IFSC) *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. BANK OF BARODA(IFSC Code: BARB0VJASHT)"
                            value={empFormData.dynamicFields?.bankDetails || ''}
                            onChange={(e) => setEmpFormData((prev) => ({
                              ...prev,
                              dynamicFields: { ...prev.dynamicFields, bankDetails: e.target.value },
                            }))}
                            required
                            id="gen-dwps-input-bankdetails"
                          />
                        </div>

                        {/* Bank Address */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700 }}>Bank Branch / Address</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. KANNOD ROAD, ASHTA, DIST.SEHORE, ASHTA - 466116"
                            value={empFormData.dynamicFields?.bankAddress || ''}
                            onChange={(e) => setEmpFormData((prev) => ({
                              ...prev,
                              dynamicFields: { ...prev.dynamicFields, bankAddress: e.target.value },
                            }))}
                            id="gen-dwps-input-bankaddress"
                          />
                        </div>
                      </div>

                      {/* Right Column Box (Template Right Side) */}
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.35rem' }}>
                          Template Right Side Details
                        </div>

                        {/* 5. Posting Office */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700 }}>Posting Office *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. DELHI WORLD PUBLIC SCHOOL, ASHTA"
                            value={empFormData.dynamicFields?.postingOffice || ''}
                            onChange={(e) => setEmpFormData((prev) => ({
                              ...prev,
                              dynamicFields: { ...prev.dynamicFields, postingOffice: e.target.value },
                            }))}
                            required
                            id="gen-dwps-input-postingofficer"
                          />
                        </div>

                        {/* 6. Designation */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700 }}>Designation *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. PRINCIPAL"
                            value={empFormData.designation}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEmpFormData((prev) => ({
                                ...prev,
                                designation: val,
                                dynamicFields: { ...prev.dynamicFields, designation: val },
                              }));
                            }}
                            required
                            id="gen-dwps-input-designation"
                          />
                        </div>

                        {/* 7. Emp ID */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700 }}>Emp ID *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. 4417"
                            value={empFormData.empCode || empFormData.dynamicFields?.empId || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEmpFormData((prev) => ({
                                ...prev,
                                empCode: val,
                                dynamicFields: { ...prev.dynamicFields, empId: val },
                              }));
                            }}
                            required
                            id="gen-dwps-input-empid"
                          />
                        </div>

                        {/* 8. PAN No */}
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 700 }}>PAN No *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. MKRPK2843N"
                            value={empFormData.pan || empFormData.panNumber || empFormData.dynamicFields?.panNo || ''}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setEmpFormData((prev) => ({
                                ...prev,
                                pan: val,
                                panNumber: val,
                                dynamicFields: { ...prev.dynamicFields, panNo: val },
                              }));
                            }}
                            required
                            id="gen-dwps-input-panno"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: DWPS Baseline Compensation Structure */}
                  <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <DollarSign size={18} className="text-cyan" />
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-cyan)', margin: 0, fontWeight: 700 }}>
                        Monthly Compensation Structure (DWPS Formula)
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Basic ({currencySymbol}) *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={empFormData.baselineSalary?.basicPay}
                          onChange={(e) => setEmpFormData((prev) => ({
                            ...prev,
                            baselineSalary: { ...prev.baselineSalary, basicPay: Number(e.target.value) || 0 },
                          }))}
                          required
                          id="gen-dwps-salary-basic"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Dearness Allowance ({currencySymbol})</label>
                        <input
                          type="number"
                          className="form-input"
                          value={empFormData.baselineSalary?.specialAllowance}
                          onChange={(e) => setEmpFormData((prev) => ({
                            ...prev,
                            baselineSalary: { ...prev.baselineSalary, specialAllowance: Number(e.target.value) || 0 },
                          }))}
                          id="gen-dwps-salary-da"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>House Rent Allowance ({currencySymbol})</label>
                        <input
                          type="number"
                          className="form-input"
                          value={empFormData.baselineSalary?.hra}
                          onChange={(e) => setEmpFormData((prev) => ({
                            ...prev,
                            baselineSalary: { ...prev.baselineSalary, hra: Number(e.target.value) || 0 },
                          }))}
                          id="gen-dwps-salary-hra"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Medical Allowance ({currencySymbol})</label>
                        <input
                          type="number"
                          className="form-input"
                          value={empFormData.baselineSalary?.medicalAllowance}
                          onChange={(e) => setEmpFormData((prev) => ({
                            ...prev,
                            baselineSalary: { ...prev.baselineSalary, medicalAllowance: Number(e.target.value) || 0 },
                          }))}
                          id="gen-dwps-salary-medical"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Provident Fund ({currencySymbol})</label>
                        <input
                          type="number"
                          className="form-input"
                          value={empFormData.baselineSalary?.pfDeduction}
                          onChange={(e) => setEmpFormData((prev) => ({
                            ...prev,
                            baselineSalary: { ...prev.baselineSalary, pfDeduction: Number(e.target.value) || 0 },
                          }))}
                          id="gen-dwps-salary-pf"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Income Tax / TDS ({currencySymbol})</label>
                        <input
                          type="number"
                          className="form-input"
                          value={empFormData.baselineSalary?.tds}
                          onChange={(e) => setEmpFormData((prev) => ({
                            ...prev,
                            baselineSalary: { ...prev.baselineSalary, tds: Number(e.target.value) || 0 },
                          }))}
                          id="gen-dwps-salary-tax"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Proffessional Tax ({currencySymbol})</label>
                        <input
                          type="number"
                          className="form-input"
                          value={empFormData.baselineSalary?.professionalTax}
                          onChange={(e) => setEmpFormData((prev) => ({
                            ...prev,
                            baselineSalary: { ...prev.baselineSalary, professionalTax: Number(e.target.value) || 0 },
                          }))}
                          id="gen-dwps-salary-pt"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Standard Template Form */
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. John Doe"
                        value={empFormData.fullName}
                        onChange={(e) => setEmpFormData({ ...empFormData, fullName: e.target.value })}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Employee ID / Code *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={empFormData.empCode}
                        onChange={(e) => setEmpFormData({ ...empFormData, empCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={empFormData.designation}
                        onChange={(e) => setEmpFormData({ ...empFormData, designation: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bank Account Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={empFormData.bankAccount}
                        onChange={(e) => setEmpFormData({ ...empFormData, bankAccount: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PAN Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={empFormData.pan}
                        onChange={(e) => setEmpFormData({ ...empFormData, pan: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Joining Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={empFormData.joiningDate}
                        onChange={(e) => setEmpFormData({ ...empFormData, joiningDate: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEmpModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingEmp}
                  id="gen-btn-save-emp-submit"
                >
                  {savingEmp ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                  <span>{editingEmpObj ? 'Update Employee' : 'Create Employee Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
