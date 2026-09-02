import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClassicTabularPayslip } from './templates/ClassicTabularPayslip';
import { HclCorporatePayslip } from './templates/HclCorporatePayslip';
import { AiimsGovtPayslip } from './templates/AiimsGovtPayslip';
import { ConcentrixDakshPayslip } from './templates/ConcentrixDakshPayslip';
import { SushmaBuildtechPayslip } from './templates/SushmaBuildtechPayslip';
import { ResizableLogo } from './common/ResizableLogo';
import {
  FileText,
  Calendar,
  User,
  Plus,
  Trash2,
  Printer,
  Save,
  Layers,
  Sparkles,
  RefreshCw,
  Building2,
  CheckCircle2,
  Loader2,
  HelpCircle,
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
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  // Set default employee when employees list is loaded
  useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0]._id);
    }
  }, [employees]);

  // Load draft preview whenever employee, month, or year changes in Single mode
  const fetchDraft = async () => {
    if (!selectedEmpId || !activeCompany) return;
    setLoadingDraft(true);
    try {
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

  // Save / Finalize Single Payslip
  const handleSavePayslip = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const res = await api.createPayslip(draft);
      showToast(res.message || 'Payslip saved & finalized!', 'success');
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

  const selectedEmployeeObj = employees.find((e) => e._id === selectedEmpId);
  const currencySymbol = activeCompany?.currency || '₹';
  const templateKey = activeCompany?.templateKey || 'corporate_detailed';

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
                  <span>Save Snapshot</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="btn btn-secondary"
                  title="Print or Export to PDF"
                  id="print-payslip-btn"
                >
                  <Printer size={16} />
                  <span>Print / PDF</span>
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
          LIVE EDITABLE PAYSLIP CANVAS PREVIEW
          Supports 3 distinct visual template layouts:
          1. Corporate Detailed
          2. Minimalist Startup
          3. Standard Industrial
      ───────────────────────────────────────────────────────────── */}
      {draft && mode === 'single' ? (
        <div className="payslip-canvas-container">
          {templateKey === 'aiims_govt_medical' ? (
            <AiimsGovtPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
            />
          ) : templateKey === 'hcl_corporate_tech' ? (
            <HclCorporatePayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
            />
          ) : templateKey === 'classic_tabular' ? (
            <ClassicTabularPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              template={templates.find((t) => t.templateKey === templateKey)}
              draft={draft}
              isEditable={true}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
            />
          ) : templateKey === 'concentrix_daksh' ? (
            <ConcentrixDakshPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
            />
          ) : templateKey === 'sushma_buildtech' ? (
            <SushmaBuildtechPayslip
              company={activeCompany}
              employee={selectedEmployeeObj}
              draft={draft}
              isEditable={true}
              onEarningChange={handleEarningChange}
              onDeductionChange={handleDeductionChange}
              onAddEarning={handleAddEarning}
              onDeleteEarning={handleDeleteEarning}
              onAddDeduction={handleAddDeduction}
              onDeleteDeduction={handleDeleteDeduction}
              onDaysChange={handleDaysChange}
            />
          ) : (
          <div className={`payslip-sheet template-${templateKey}`} id="printable-payslip">
            
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
            <div className="payslip-financials-grid">
              
              {/* Earnings Table */}
              <div className="financial-section earnings-section">
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
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            className="canvas-table-input"
                            value={e.label}
                            onChange={(ev) => handleEarningChange(idx, 'label', ev.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
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
              <div className="financial-section deductions-section">
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
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            className="canvas-table-input"
                            value={d.label}
                            onChange={(ev) => handleDeductionChange(idx, 'label', ev.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
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
      ) : mode === 'single' ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
          <p>Compiling interactive payslip preview canvas...</p>
        </div>
      ) : null}
    </div>
  );
};
