import React, { useState, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SnapshotRenderer } from './common/SnapshotRenderer';
import { BulkPayslipViewerModal } from './common/BulkPayslipViewerModal';
import {
  History,
  Search,
  Printer,
  Trash2,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  Building,
  User,
  X,
  Layers,
  Download,
  Filter,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  FileDown,
  Edit,
  Save,
  Loader2,
} from 'lucide-react';
import { exportElementToPdf, exportToExcel } from '../utils/exportUtils';

export const PayslipHistory = ({
  payslips = [],
  activeCompany,
  onRefresh,
}) => {
  const { showToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpFilter, setSelectedEmpFilter] = useState('all');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [batchModalEmployee, setBatchModalEmployee] = useState(null);

  // Bulk & Date Range Modal State
  const [isBulkViewerOpen, setIsBulkViewerOpen] = useState(false);
  const [bulkViewerEmp, setBulkViewerEmp] = useState(null);

  // In-Place Edit State for Single Payslip Modal
  const [isEditingPayslip, setIsEditingPayslip] = useState(false);
  const [editSlipDraft, setEditSlipDraft] = useState(null);
  const [isUpdatingSlip, setIsUpdatingSlip] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingReports, setIsExportingReports] = useState(false);

  const handleOpenViewModal = (slip, startInEdit = false) => {
    setSelectedPayslip(slip);
    setIsEditingPayslip(startInEdit);
    setEditSlipDraft({
      ...slip,
      earnings: slip.earnings ? [...slip.earnings] : [],
      deductions: slip.deductions ? [...slip.deductions] : [],
    });
  };

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
      deductions: [...(editSlipDraft.deductions || []), { label: 'Adjustment / Advance', amount: 1000 }],
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
    if (selectedPayslip) {
      setSelectedPayslip((prev) => ({
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

  const handleSaveSlipUpdates = async () => {
    if (!selectedPayslip || !editSlipDraft) return;
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

      const res = await api.updatePayslip(selectedPayslip._id, payload);
      showToast(res.message || 'Salary slip updated successfully!', 'success');
      setSelectedPayslip(res.payslip);
      setEditSlipDraft(res.payslip);
      setIsEditingPayslip(false);
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update salary slip', 'error');
    } finally {
      setIsUpdatingSlip(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete this payslip record (${title})?`)) {
      return;
    }
    try {
      const res = await api.deletePayslip(id);
      showToast(res.message || 'Payslip record deleted', 'info');
      if (selectedPayslip?._id === id) {
        setSelectedPayslip(null);
      }
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const MONTHS_CHRONO = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getMonthVal = (mName, yNum) => {
    const idx = MONTHS_CHRONO.indexOf(mName);
    return (Number(yNum) || 0) * 12 + (idx >= 0 ? idx : 0);
  };

  // Group payslips by distinct employee & sort in chronological order (e.g. April, May, June...)
  const employeeGroups = useMemo(() => {
    const map = new Map();
    payslips.forEach((p) => {
      const empCode = p.snapshotData?.employee?.empCode || p.employeeId?.empCode || 'UNKNOWN';
      const fullName = p.snapshotData?.employee?.fullName || p.employeeId?.fullName || 'Employee';
      const key = empCode;
      if (!map.has(key)) {
        map.set(key, {
          empCode,
          fullName,
          payslips: [],
        });
      }
      map.get(key).payslips.push(p);
    });

    const groups = Array.from(map.values());
    groups.forEach((g) => {
      g.payslips.sort((a, b) => getMonthVal(a.month, a.year) - getMonthVal(b.month, b.year));
    });

    return groups;
  }, [payslips]);

  // Filtered payslips according to search and employee dropdown
  const filteredPayslips = useMemo(() => {
    return payslips.filter((p) => {
      const empName = p.snapshotData?.employee?.fullName || p.employeeId?.fullName || '';
      const empCode = p.snapshotData?.employee?.empCode || p.employeeId?.empCode || '';
      const period = p.payPeriod || '';

      if (selectedEmpFilter !== 'all' && empCode !== selectedEmpFilter) {
        return false;
      }

      const matches =
        empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        period.toLowerCase().includes(searchTerm.toLowerCase());

      return matches;
    });
  }, [payslips, selectedEmpFilter, searchTerm]);

  // Open Consolidated Batch Modal for a particular employee
  const handleOpenBatchModal = (empCode) => {
    const group = employeeGroups.find((g) => g.empCode === empCode);
    if (group && group.payslips.length > 0) {
      setBatchModalEmployee(group);
    }
  };

  const handleDownloadSinglePdf = async (slip) => {
    try {
      setIsExportingPdf(true);
      const filename = `Payslip_${slip.snapshotData?.employee?.fullName?.replace(/\s+/g, '_') || 'Employee'}_${slip.month}_${slip.year}.pdf`;
      await exportElementToPdf('single-payslip-canvas-view', filename);
      showToast('Downloaded PDF payslip successfully!', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadBatchPdf = async (group) => {
    try {
      setIsExportingPdf(true);
      const filename = `Consolidated_Payslips_${group?.fullName?.replace(/\s+/g, '_') || 'Employee'}.pdf`;
      await exportElementToPdf('batch-print-canvas-area', filename);
      showToast(`Downloaded all ${group.payslips.length} PDF payslips!`, 'success');
    } catch (err) {
      console.error('Batch PDF export error:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportBankAdvice = async () => {
    if (!activeCompany?._id) {
      showToast('Please select a company first', 'error');
      return;
    }
    const currentYear = new Date().getFullYear();
    const month = prompt('Enter Month for Bank Advice (e.g. August, July, June):', 'August');
    if (!month) return;
    const year = prompt('Enter Year:', String(currentYear));
    if (!year) return;

    try {
      setIsExportingReports(true);
      const res = await api.getBankAdviceReport(activeCompany._id, month, year);
      if (res.records && res.records.length > 0) {
        exportToExcel(
          res.records,
          `${activeCompany.name?.replace(/\s+/g, '_')}_Bank_Advice_${month}_${year}.xlsx`,
          'Bank Payment Advice'
        );
        showToast(`Exported Bank Payment Advice for ${res.records.length} employees (Total: ₹${res.totalPayout.toLocaleString('en-IN')})`, 'success');
      } else {
        showToast(`No payslips found for ${month} ${year} to generate bank advice.`, 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to export Bank Advice', 'error');
    } finally {
      setIsExportingReports(false);
    }
  };

  const handleExportEpfEcr = async () => {
    if (!activeCompany?._id) {
      showToast('Please select a company first', 'error');
      return;
    }
    const currentYear = new Date().getFullYear();
    const month = prompt('Enter Month for EPF ECR Report (e.g. August):', 'August');
    if (!month) return;
    const year = prompt('Enter Year:', String(currentYear));
    if (!year) return;

    try {
      setIsExportingReports(true);
      const res = await api.getEpfEcrReport(activeCompany._id, month, year);
      if (res.records && res.records.length > 0) {
        exportToExcel(
          res.records,
          `${activeCompany.name?.replace(/\s+/g, '_')}_EPF_ECR_${month}_${year}.xlsx`,
          'EPF ECR Schedule'
        );
        showToast(`Exported EPF ECR Report for ${res.records.length} members!`, 'success');
      } else {
        showToast(`No payslips found for ${month} ${year} to generate EPF ECR report.`, 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to export EPF ECR', 'error');
    } finally {
      setIsExportingReports(false);
    }
  };

  return (
    <div>
      {/* Header Bar */}
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Payslips Historical Repository</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Immutable payroll records, native PDF downloads, and 1-click Bank & EPFO statutory export schedules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => {
              setBulkViewerEmp(null);
              setIsBulkViewerOpen(true);
            }}
            className="btn btn-primary btn-sm"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              border: 'none',
              fontWeight: 700,
              boxShadow: '0 2px 10px rgba(6, 182, 212, 0.4)',
            }}
            id="open-bulk-range-viewer-btn"
            title="View salary slips across custom month range (e.g. Jan to Jun) and download consolidated multi-page PDF"
          >
            <Layers size={15} />
            <span>📅 Range / Bulk Multi-PDF View</span>
          </button>

          <button
            onClick={handleExportBankAdvice}
            disabled={isExportingReports}
            className="btn btn-secondary btn-sm"
            title="Export NEFT / RTGS Bank Transfer file with IFSC, Account No, and Net Salary"
          >
            <FileSpreadsheet size={15} />
            <span>Bank Payment Advice</span>
          </button>
          <button
            onClick={handleExportEpfEcr}
            disabled={isExportingReports}
            className="btn btn-secondary btn-sm"
            title="Export EPFO Monthly Electronic Challan Cum Return (ECR)"
          >
            <FileSpreadsheet size={15} />
            <span>EPF ECR Export</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Action Panel */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Employee Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            value={selectedEmpFilter}
            onChange={(e) => setSelectedEmpFilter(e.target.value)}
            className="form-select"
            style={{ width: '220px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            id="employee-filter-select"
          >
            <option value="all">👥 All Employees ({payslips.length} Slips)</option>
            {employeeGroups.map((g) => (
              <option key={g.empCode} value={g.empCode}>
                👤 {g.fullName} ({g.empCode}) • {g.payslips.length} Slips
              </option>
            ))}
          </select>
        </div>

        {/* Quick Batch Download Button if specific employee selected */}
        {selectedEmpFilter !== 'all' && (
          <button
            onClick={() => handleOpenBatchModal(selectedEmpFilter)}
            className="btn btn-primary btn-sm"
            title="Preview and Download all salary slips for this employee in 1-Click"
            id="batch-download-selected-emp-btn"
          >
            <Layers size={15} />
            <span>Preview & Download All ({filteredPayslips.length})</span>
          </button>
        )}

        {/* Search Box */}
        <div className="form-input-wrapper" style={{ maxWidth: '280px' }}>
          <Search size={16} className="form-input-icon" />
          <input
            type="text"
            className="form-input has-icon"
            placeholder="Search employee, period..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="archive-search-input"
          />
        </div>
      </div>

      {/* Employee Quick Batch Action Cards */}
      {selectedEmpFilter === 'all' && employeeGroups.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {employeeGroups.map((g) => (
            <div
              key={g.empCode}
              className="glass-panel"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{g.fullName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Emp Code: <strong style={{ color: 'var(--accent-cyan)' }}>{g.empCode}</strong> • {g.payslips.length} Slips Generated
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setBulkViewerEmp({ empCode: g.empCode, fullName: g.fullName });
                    setIsBulkViewerOpen(true);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                  title={`View custom range (e.g. Jan-Jun) and export combined PDF for ${g.fullName}`}
                  id={`bulk-range-btn-${g.empCode}`}
                >
                  <Calendar size={13} />
                  <span>Range PDF</span>
                </button>
                <button
                  onClick={() => handleOpenBatchModal(g.empCode)}
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                  title={`Preview and download all ${g.payslips.length} salary slips for ${g.fullName}`}
                >
                  <Layers size={13} />
                  <span>All ({g.payslips.length})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payslips Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-container">
          {filteredPayslips.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
              <History size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p>No archived payslips found matching your filter.</p>
            </div>
          ) : (
            <table className="custom-table" id="archive-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Company</th>
                  <th>Pay Period</th>
                  <th>Gross Earnings</th>
                  <th>Total Deductions</th>
                  <th>Net Take-Home</th>
                  <th>Template</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayslips.map((p) => {
                  const emp = p.snapshotData?.employee || p.employeeId;
                  const comp = p.snapshotData?.company || p.companyId;
                  const currency = comp?.currency || '₹';

                  return (
                    <tr key={p._id} id={`archive-row-${p._id}`}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{emp?.fullName || 'Employee'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          ID: {emp?.empCode || 'N/A'} • {emp?.designation}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{comp?.name || 'Company'}</div>
                      </td>
                      <td>
                        <span className="badge badge-employee">{p.payPeriod}</span>
                      </td>
                      <td>{currency}{p.grossEarnings.toLocaleString('en-IN')}</td>
                      <td style={{ color: '#fb7185' }}>
                        {currency}{p.totalDeductions.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <strong className="salary-text">
                          {currency}{p.netSalary.toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <span className="badge badge-admin">
                          {(p.snapshotData?.templateKey || 'corporate').replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenViewModal(p, false)}
                            className="btn btn-secondary btn-sm"
                            title="View Single Payslip"
                            id={`view-payslip-${p._id}`}
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleOpenViewModal(p, true)}
                            className="btn btn-secondary btn-sm"
                            title="Edit / Update Salary Slip"
                            style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                            id={`edit-payslip-btn-${p._id}`}
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleOpenBatchModal(emp?.empCode)}
                            className="btn btn-secondary btn-sm"
                            title="Preview All Slips for This Employee"
                            id={`view-batch-${p._id}`}
                          >
                            <Layers size={14} />
                            <span>All Slips</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, `${emp?.fullName} - ${p.payPeriod}`)}
                            className="btn btn-danger-subtle btn-sm"
                            title="Delete Record"
                            id={`delete-payslip-${p._id}`}
                          >
                            <Trash2 size={14} />
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
          1. SINGLE SNAPSHOT VIEW & EDIT MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedPayslip && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '980px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}
          >
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
                  id="history-toggle-edit-mode-btn"
                >
                  <Edit size={14} />
                  <span>{isEditingPayslip ? 'Editing Active' : 'Edit / Update Salary Slip'}</span>
                </button>

                {isEditingPayslip && (
                  <button
                    type="button"
                    onClick={handleSaveSlipUpdates}
                    disabled={isUpdatingSlip}
                    className="btn btn-primary btn-sm"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                    id="history-save-slip-updates-btn"
                  >
                    {isUpdatingSlip ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                    <span>{isUpdatingSlip ? 'Updating...' : 'Save & Update Slip'}</span>
                  </button>
                )}

                <button
                  onClick={() => handleDownloadSinglePdf(isEditingPayslip ? editSlipDraft : selectedPayslip)}
                  disabled={isExportingPdf}
                  className="btn btn-secondary btn-sm"
                >
                  <Download size={15} />
                  <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>
                <button onClick={handlePrint} className="btn btn-secondary btn-sm">
                  <Printer size={15} />
                  <span>Print</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedPayslip.snapshotData?.employee?.fullName} • {selectedPayslip.payPeriod}
                </span>
                <button
                  onClick={() => setSelectedPayslip(null)}
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
                  color: '#fff',
                }}
              >
                <strong>Edit Mode Active:</strong> You can modify line items, days, and amounts. Click <strong>"Save & Update Slip"</strong> to commit changes.
              </div>
            )}

            <div className="payslip-canvas-scroll-wrapper" id="single-payslip-canvas-view">
              <SnapshotRenderer
                payslip={isEditingPayslip ? editSlipDraft : selectedPayslip}
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
          2. CONSOLIDATED BATCH MODAL (PREVIEW & 1-CLICK COMBINED DOWNLOAD)
      ───────────────────────────────────────────────────────────── */}
      {batchModalEmployee && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '1020px', maxHeight: '94vh', overflowY: 'auto', padding: '1.75rem' }}
          >
            {/* Header with 1-Click Download Button */}
            <div
              className="no-print"
              style={{
                position: 'sticky',
                top: 0,
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                zIndex: 100,
                padding: '0.75rem 0',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} className="text-cyan" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    {batchModalEmployee.fullName} ({batchModalEmployee.empCode})
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Consolidated Repository • {batchModalEmployee.payslips.length} Total Monthly Salary Slips
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => handleDownloadBatchPdf(batchModalEmployee)}
                  disabled={isExportingPdf}
                  className="btn btn-primary"
                  id="batch-download-all-slips-btn"
                  style={{
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
                    fontWeight: 700,
                  }}
                >
                  <Download size={16} />
                  <span>{isExportingPdf ? 'Exporting PDF...' : `Download All (${batchModalEmployee.payslips.length}) Slips PDF`}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="btn btn-secondary"
                  title="Print all slips"
                >
                  <Printer size={16} />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setBatchModalEmployee(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* List of All Consecutive Payslips */}
            <div className="batch-payslips-container" id="batch-print-canvas-area" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
              {batchModalEmployee.payslips.map((slip, index) => (
                <div
                  key={slip._id || index}
                  className="batch-payslip-page"
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    pageBreakAfter: index < batchModalEmployee.payslips.length - 1 ? 'always' : 'auto',
                    breakAfter: index < batchModalEmployee.payslips.length - 1 ? 'page' : 'auto',
                  }}
                >
                  <div
                    className="no-print"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      maxWidth: '860px',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span className="badge badge-employee" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      Page {index + 1} of {batchModalEmployee.payslips.length} • {slip.payPeriod}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Net: {slip.snapshotData?.company?.currency || '₹'}{slip.netSalary.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <SnapshotRenderer payslip={slip} company={activeCompany} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bulk & Date-Range Salary Slip Multi-Page Viewer & Consolidated PDF Exporter Modal */}
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
