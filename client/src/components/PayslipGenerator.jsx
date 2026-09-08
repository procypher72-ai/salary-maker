import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClassicTabularPayslip } from './templates/ClassicTabularPayslip';
import { HclCorporatePayslip } from './templates/HclCorporatePayslip';
import { AiimsGovtPayslip } from './templates/AiimsGovtPayslip';
import { ConcentrixDakshPayslip } from './templates/ConcentrixDakshPayslip';
import { SushmaBuildtechPayslip } from './templates/SushmaBuildtechPayslip';
import { DelhiPublicSchoolPayslip } from './templates/DelhiPublicSchoolPayslip';
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

const YEARS = [2024, 2025, 2026, 2027];

export const PayslipGenerator = ({
  activeCompany,
  employees = [],
  templates = [],
  onPayslipGenerated,
  onCompanyUpdated,
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

  // Interactive Live Canvas State
  const [draft, setDraft] = useState(null);
  const [existingPayslipRecord, setExistingPayslipRecord] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isCtcModalOpen, setIsCtcModalOpen] = useState(false);
  const [overtimeHours, setOvertimeHours] = useState(0);

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

  // --- Inline Canvas Editing Handlers ---
  const handleDaysChange = (field, val) => {
    if (!draft) return;
    const num = Number(val) || 0;
    const updated = { ...draft, [field]: num };
    
    // Pro-rata recalculation if paid days changed
    const workingDays = field === 'workingDays' ? num : draft.workingDays;
    const paidDays = field === 'paidDays' ? num : draft.paidDays;
    const lopDays = Math.max(0, workingDays - paidDays);
    updated.lopDays = lopDays;

    recalculateTotals(updated);
  };

  const handleEarningChange = (index, field, val) => {
    if (!draft) return;
    const updatedEarnings = [...draft.earnings];
    updatedEarnings[index] = {
      ...updatedEarnings[index],
      [field]: field === 'amount' ? Number(val) || 0 : val,
    };
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

  const handleDeductionChange = (index, field, val) => {
    if (!draft) return;
    const updatedDeductions = [...draft.deductions];
    updatedDeductions[index] = {
      ...updatedDeductions[index],
      [field]: field === 'amount' ? Number(val) || 0 : val,
    };
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
    if (templateKey === 'aiims_govt_medical') {
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
      const basicVal = (base.basicPay !== undefined && base.basicPay !== '' && !isNaN(base.basicPay)) ? Number(base.basicPay) : 20000;
      const daVal = (base.specialAllowance !== undefined && base.specialAllowance !== '' && !isNaN(base.specialAllowance))
        ? Number(base.specialAllowance)
        : ((base.da !== undefined && base.da !== '' && !isNaN(base.da)) ? Number(base.da) : 10000);
      const hraVal = (base.hra !== undefined && base.hra !== '' && !isNaN(base.hra)) ? Number(base.hra) : 20000;

      const dwpsBaseEarnings = [
        { label: 'Basic', amount: basicVal },
        { label: 'D.A', amount: daVal },
        { label: 'H.R.A', amount: hraVal },
      ];
      if (base.otherAllowances && Number(base.otherAllowances) > 0) {
        dwpsBaseEarnings.push({ label: 'Other Allowance', amount: Number(base.otherAllowances) });
      }
      updatedEarnings = dwpsBaseEarnings.map((item) => ({
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
      const ptVal = (base.professionalTax !== undefined && base.professionalTax !== '' && !isNaN(base.professionalTax))
        ? Number(base.professionalTax)
        : 212;
      const updatedDeductions = [
        { label: 'Professsional Tax', amount: ptVal },
      ];
      if (base.tds && Number(base.tds) > 0) {
        updatedDeductions.push({ label: 'Income Tax / TDS', amount: Number(base.tds) });
      }
      if (base.pfDeduction && Number(base.pfDeduction) > 0) {
        updatedDeductions.push({ label: 'Provident Fund (PF)', amount: Number(base.pfDeduction) });
      }
      const updated = {
        ...draft,
        deductions: updatedDeductions,
      };
      recalculateTotals(updated);
      showToast('Autofilled Delhi Public School statutory deductions!', 'success');
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
        earnings: draft?.earnings,
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
      showToast(res.message || 'Bulk payslips generated successfully!', 'success');
      if (onPayslipGenerated) onPayslipGenerated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handlePrint = () => {
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
              <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
                <label className="form-label">Select Employee</label>
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
                  title="Print or Export to PDF via browser dialog"
                  id="print-payslip-btn"
                >
                  <Printer size={16} />
                  <span>Print</span>
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

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isBulkGenerating}
                  id="bulk-generate-submit-btn"
                  style={{ marginTop: '1.3rem' }}
                >
                  {isBulkGenerating ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Generating Batch...</span>
                    </>
                  ) : (
                    <>
                      <Layers size={16} />
                      <span>Issue Consecutive Payslips</span>
                    </>
                  )}
                </button>
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
          {templateKey === 'aiims_govt_medical' ? (
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
                <p>This is a system-generated salary slip and preserves immutable payroll compliance records.</p>
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
    </div>
  );
};
