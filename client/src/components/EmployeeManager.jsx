import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export const EmployeeManager = ({
  employees = [],
  activeCompany,
  templates = [],
  onRefresh,
}) => {
  const { showToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [loading, setLoading] = useState(false);

  // Active template metadata
  const activeTemplate = templates.find(
    (t) => t.templateKey === (activeCompany?.templateKey || 'corporate_detailed')
  );

  const initialForm = {
    empCode: '',
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    department: 'Engineering',
    joiningDate: new Date().toISOString().split('T')[0],
    dynamicFields: {},
    baselineSalary: {
      basicPay: 50000,
      hra: 20000,
      specialAllowance: 10000,
      conveyanceAllowance: 1600,
      medicalAllowance: 1250,
      otherAllowances: 0,
      pfDeduction: 1800,
      professionalTax: 200,
      tds: 2500,
      otherDeductions: 0,
    },
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenCreate = () => {
    setEditingEmp(null);
    setFormData(initialForm);
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
      dynamicFields: emp.dynamicFields || {},
      baselineSalary: emp.baselineSalary || initialForm.baselineSalary,
    });
    setIsModalOpen(true);
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
    if (!formData.empCode || !formData.fullName || !formData.designation) {
      showToast('Please fill in Employee ID, Full Name, and Designation', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
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

  // Filter employees for active company and search query
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const currencySymbol = activeCompany?.currency || '₹';

  return (
    <div>
      {/* Top Banner & Schema Engine Notice */}
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
              {activeCompany?.templateKey.replace('_', ' ').toUpperCase()}
            </span>
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          id="add-employee-btn"
        >
          <UserPlus size={16} />
          <span>Onboard New Employee</span>
        </button>
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
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Employee"
                            id={`edit-emp-${emp._id}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id, emp.fullName)}
                            className="btn btn-danger-subtle btn-sm"
                            title="Delete Employee"
                            id={`delete-emp-${emp._id}`}
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

      {/* Onboard / Edit Employee Dynamic Modal */}
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

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="emp@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Designation *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior Software Architect"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    required
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

              {/* Section 2: DYNAMIC TEMPLATE-SPECIFIC FIELDS */}
              <h4
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--accent-cyan)',
                  marginTop: '1.25rem',
                  marginBottom: '0.85rem',
                }}
              >
                2. Template Dynamic Fields ({activeTemplate?.name || 'Active Template'})
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {activeTemplate?.requiredFields && activeTemplate.requiredFields.length > 0 ? (
                  activeTemplate.requiredFields.map((field) => (
                    <div key={field.key} className="form-group">
                      <label className="form-label">
                        {field.label} {field.required && '*'}
                      </label>
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        className="form-input"
                        placeholder={field.placeholder || `Enter ${field.label}`}
                        value={formData.dynamicFields?.[field.key] || ''}
                        onChange={(e) => handleDynamicFieldChange(field.key, e.target.value)}
                        required={field.required}
                      />
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No extra dynamic fields required for this template.
                  </p>
                )}
              </div>

              {/* Section 3: Baseline Monthly Compensation Structure */}
              <h4
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--accent-emerald)',
                  marginTop: '1.5rem',
                  marginBottom: '0.85rem',
                }}
              >
                3. Baseline Monthly Earnings & Deductions ({currencySymbol})
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '1rem',
                  borderRadius: '10px',
                }}
              >
                {/* Earnings Column */}
                <div>
                  <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Earnings Components
                  </h5>
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
                    <label className="form-label">Conveyance / Medical / Other</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.baselineSalary.conveyanceAllowance}
                      onChange={(e) => handleSalaryChange('conveyanceAllowance', e.target.value)}
                    />
                  </div>
                </div>

                {/* Deductions Column */}
                <div>
                  <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Standard Deductions
                  </h5>
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
                    <label className="form-label">Income Tax (TDS)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.baselineSalary.tds}
                      onChange={(e) => handleSalaryChange('tds', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Other Deductions</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.baselineSalary.otherDeductions}
                      onChange={(e) => handleSalaryChange('otherDeductions', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  id="save-employee-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Saving Employee...</span>
                    </>
                  ) : (
                    <span>{editingEmp ? 'Save Changes' : 'Complete Onboarding'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
