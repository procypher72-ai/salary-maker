import React, { useState, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClassicTabularPayslip } from './templates/ClassicTabularPayslip';
import { HclCorporatePayslip } from './templates/HclCorporatePayslip';
import { AiimsGovtPayslip } from './templates/AiimsGovtPayslip';
import { ConcentrixDakshPayslip } from './templates/ConcentrixDakshPayslip';
import { SushmaBuildtechPayslip } from './templates/SushmaBuildtechPayslip';
import { ResizableLogo } from './common/ResizableLogo';
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
} from 'lucide-react';

// Sub-component to render any payslip snapshot according to its template
const SnapshotRenderer = ({ payslip }) => {
  const tplKey = payslip?.snapshotData?.templateKey || payslip?.snapshotData?.company?.templateKey || 'corporate_detailed';

  if (tplKey === 'aiims_govt_medical') {
    return (
      <AiimsGovtPayslip
        company={payslip.snapshotData?.company}
        employee={payslip.snapshotData?.employee}
        draft={{
          month: payslip.month,
          year: payslip.year,
          payPeriod: payslip.payPeriod,
          workingDays: payslip.workingDays,
          paidDays: payslip.paidDays,
          lopDays: payslip.lopDays,
          earnings: payslip.earnings,
          deductions: payslip.deductions,
          grossEarnings: payslip.grossEarnings,
          totalDeductions: payslip.totalDeductions,
          netSalary: payslip.netSalary,
          netSalaryInWords: payslip.netSalaryInWords,
        }}
        isEditable={false}
      />
    );
  }

  if (tplKey === 'hcl_corporate_tech') {
    return (
      <HclCorporatePayslip
        company={payslip.snapshotData?.company}
        employee={payslip.snapshotData?.employee}
        draft={{
          month: payslip.month,
          year: payslip.year,
          payPeriod: payslip.payPeriod,
          workingDays: payslip.workingDays,
          paidDays: payslip.paidDays,
          lopDays: payslip.lopDays,
          earnings: payslip.earnings,
          deductions: payslip.deductions,
          grossEarnings: payslip.grossEarnings,
          totalDeductions: payslip.totalDeductions,
          netSalary: payslip.netSalary,
          netSalaryInWords: payslip.netSalaryInWords,
        }}
        isEditable={false}
      />
    );
  }

  if (tplKey === 'classic_tabular') {
    return (
      <ClassicTabularPayslip
        company={payslip.snapshotData?.company}
        employee={payslip.snapshotData?.employee}
        draft={{
          month: payslip.month,
          year: payslip.year,
          payPeriod: payslip.payPeriod,
          workingDays: payslip.workingDays,
          paidDays: payslip.paidDays,
          lopDays: payslip.lopDays,
          earnings: payslip.earnings,
          deductions: payslip.deductions,
          grossEarnings: payslip.grossEarnings,
          totalDeductions: payslip.totalDeductions,
          netSalary: payslip.netSalary,
          netSalaryInWords: payslip.netSalaryInWords,
        }}
        isEditable={false}
      />
    );
  }

  if (tplKey === 'concentrix_daksh') {
    return (
      <ConcentrixDakshPayslip
        company={payslip.snapshotData?.company}
        employee={payslip.snapshotData?.employee}
        draft={{
          month: payslip.month,
          year: payslip.year,
          payPeriod: payslip.payPeriod,
          workingDays: payslip.workingDays,
          paidDays: payslip.paidDays,
          lopDays: payslip.lopDays,
          earnings: payslip.earnings,
          deductions: payslip.deductions,
          grossEarnings: payslip.grossEarnings,
          totalDeductions: payslip.totalDeductions,
          netSalary: payslip.netSalary,
          netSalaryInWords: payslip.netSalaryInWords,
        }}
        isEditable={false}
      />
    );
  }

  if (tplKey === 'sushma_buildtech') {
    return (
      <SushmaBuildtechPayslip
        company={payslip.snapshotData?.company}
        employee={payslip.snapshotData?.employee}
        draft={{
          month: payslip.month,
          year: payslip.year,
          payPeriod: payslip.payPeriod,
          workingDays: payslip.workingDays,
          paidDays: payslip.paidDays,
          lopDays: payslip.lopDays,
          earnings: payslip.earnings,
          deductions: payslip.deductions,
          grossEarnings: payslip.grossEarnings,
          totalDeductions: payslip.totalDeductions,
          netSalary: payslip.netSalary,
          netSalaryInWords: payslip.netSalaryInWords,
        }}
        isEditable={false}
      />
    );
  }

  // Standard Template Renderer
  return (
    <div className={`payslip-sheet template-${tplKey}`}>
      <div className="payslip-header">
        <div className="company-branding">
          <ResizableLogo
            company={payslip.snapshotData?.company}
            isEditable={false}
          />
          <div>
            <h1 className="company-title">
              {payslip.snapshotData?.company?.name || 'Company Name'}
            </h1>
            <p className="company-sub">{payslip.snapshotData?.company?.fullAddress}</p>
            <p className="company-sub">
              GSTIN: {payslip.snapshotData?.company?.gstin || 'N/A'} | PAN: {payslip.snapshotData?.company?.pan || 'N/A'}
            </p>
          </div>
        </div>

        <div className="payslip-badge-box">
          <h2>SALARY SLIP</h2>
          <div className="pay-period-pill">{payslip.payPeriod}</div>
        </div>
      </div>

      <div className="payslip-meta-grid">
        <div className="meta-col">
          <div className="meta-row">
            <span className="meta-label">Employee ID:</span>
            <span className="meta-val">{payslip.snapshotData?.employee?.empCode}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Name:</span>
            <span className="meta-val highlight">{payslip.snapshotData?.employee?.fullName}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Designation:</span>
            <span className="meta-val">{payslip.snapshotData?.employee?.designation}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Department:</span>
            <span className="meta-val">{payslip.snapshotData?.employee?.department}</span>
          </div>
        </div>

        <div className="meta-col">
          {payslip.snapshotData?.employee?.dynamicFields?.panNumber && (
            <div className="meta-row">
              <span className="meta-label">PAN:</span>
              <span className="meta-val">{payslip.snapshotData.employee.dynamicFields.panNumber}</span>
            </div>
          )}
          {payslip.snapshotData?.employee?.dynamicFields?.uanNumber && (
            <div className="meta-row">
              <span className="meta-label">UAN:</span>
              <span className="meta-val">{payslip.snapshotData.employee.dynamicFields.uanNumber}</span>
            </div>
          )}
          {payslip.snapshotData?.employee?.dynamicFields?.bankAccount && (
            <div className="meta-row">
              <span className="meta-label">Bank A/C:</span>
              <span className="meta-val">{payslip.snapshotData.employee.dynamicFields.bankAccount}</span>
            </div>
          )}
          {payslip.snapshotData?.employee?.dynamicFields?.ifscCode && (
            <div className="meta-row">
              <span className="meta-label">IFSC:</span>
              <span className="meta-val">{payslip.snapshotData.employee.dynamicFields.ifscCode}</span>
            </div>
          )}
        </div>

        <div className="meta-col attendance-box">
          <div className="meta-row">
            <span className="meta-label">Working Days:</span>
            <span className="meta-val">{payslip.workingDays}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Paid Days:</span>
            <span className="meta-val">{payslip.paidDays}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">LOP Leaves:</span>
            <span className="meta-val">{payslip.lopDays}</span>
          </div>
        </div>
      </div>

      <div className="payslip-financials-grid">
        <div className="financial-section earnings-section">
          <div className="section-head">
            <h3>EARNINGS</h3>
          </div>
          <table className="canvas-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payslip.earnings.map((e, i) => (
                <tr key={i}>
                  <td>{e.label}</td>
                  <td style={{ textAlign: 'right' }}>{e.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="financial-section deductions-section">
          <div className="section-head">
            <h3>DEDUCTIONS</h3>
          </div>
          <table className="canvas-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payslip.deductions.map((d, i) => (
                <tr key={i}>
                  <td>{d.label}</td>
                  <td style={{ textAlign: 'right' }}>{d.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="payslip-totals-summary">
        <div className="totals-row">
          <div className="total-cell">
            <span>Gross Earnings:</span>
            <strong>{payslip.snapshotData?.company?.currency || '₹'}{payslip.grossEarnings.toLocaleString('en-IN')}</strong>
          </div>
          <div className="total-cell">
            <span>Total Deductions:</span>
            <strong>{payslip.snapshotData?.company?.currency || '₹'}{payslip.totalDeductions.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="net-payable-highlight">
          <div className="net-left">
            <span className="net-label">NET TAKE-HOME SALARY</span>
            <div className="net-words">In Words: {payslip.netSalaryInWords}</div>
          </div>
          <div className="net-amount">
            {payslip.snapshotData?.company?.currency || '₹'}{payslip.netSalary.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="payslip-footer">
        <div className="footer-note">
          <p>Archived Payroll Snapshot. Retains historical state.</p>
        </div>
        <div className="signature-box">
          <div className="signature-line" />
          <strong>{payslip.snapshotData?.company?.signatoryName || 'Authorized Signatory'}</strong>
          <span>{payslip.snapshotData?.company?.signatoryDesignation || 'Head of HR'}</span>
        </div>
      </div>
    </div>
  );
};

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

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete this payslip record (${title})?`)) {
      return;
    }
    try {
      const res = await api.deletePayslip(id);
      showToast(res.message || 'Payslip record deleted', 'info');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group payslips by distinct employee
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
    return Array.from(map.values());
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
            Immutable historical payroll records with locked snapshot data, bulk previews, and 1-click batch PDF exports
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
                            onClick={() => setSelectedPayslip(p)}
                            className="btn btn-secondary btn-sm"
                            title="View Single Payslip"
                            id={`view-payslip-${p._id}`}
                          >
                            <Eye size={14} />
                            <span>View</span>
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
          1. SINGLE SNAPSHOT VIEW & PRINT MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedPayslip && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '980px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}
          >
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button onClick={handlePrint} className="btn btn-primary btn-sm">
                  <Printer size={15} />
                  <span>Print / Download Single PDF</span>
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedPayslip.snapshotData?.employee?.fullName} • {selectedPayslip.payPeriod}
                </span>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <SnapshotRenderer payslip={selectedPayslip} />
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
                  onClick={handlePrint}
                  className="btn btn-primary"
                  id="batch-download-all-slips-btn"
                  style={{
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
                    fontWeight: 700,
                  }}
                >
                  <Printer size={16} />
                  <span>Download All ({batchModalEmployee.payslips.length}) Slips in 1-Click (Combined PDF)</span>
                </button>

                <button
                  onClick={() => setBatchModalEmployee(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* List of All Consecutive Payslips with Clean Page Breaks */}
            <div className="batch-payslips-container">
              {batchModalEmployee.payslips.map((slip, index) => (
                <div
                  key={slip._id || index}
                  className="batch-payslip-page"
                  style={{
                    marginBottom: '2.5rem',
                    paddingBottom: '2.5rem',
                    borderBottom: index < batchModalEmployee.payslips.length - 1 ? '2px dashed rgba(255,255,255,0.1)' : 'none',
                  }}
                >
                  <div
                    className="no-print"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
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

                  <SnapshotRenderer payslip={slip} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
