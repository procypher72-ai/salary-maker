import React from 'react';
import {
  Building2,
  Users,
  DollarSign,
  FileText,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const DashboardStats = ({
  companies = [],
  employees = [],
  payslips = [],
  activeCompany,
  setActiveTab,
}) => {
  const totalCompanies = companies.length;
  const totalEmployees = employees.length;
  const totalPayslips = payslips.length;

  const totalMonthlyPayroll = employees.reduce((acc, curr) => {
    const base = curr.baselineSalary || {};
    const monthlyGross =
      (base.basicPay || 0) +
      (base.hra || 0) +
      (base.specialAllowance || 0) +
      (base.conveyanceAllowance || 0) +
      (base.medicalAllowance || 0);
    return acc + monthlyGross;
  }, 0);

  const currencySymbol = activeCompany?.currency || '₹';

  return (
    <div>
      {/* Top Banner Stats */}
      <div className="stats-banner">
        <div className="glass-panel stat-card">
          <div
            className="stat-icon"
            style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}
          >
            <Building2 size={24} />
          </div>
          <div className="stat-meta">
            <h3>{totalCompanies}</h3>
            <p>Managed Companies</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div
            className="stat-icon"
            style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}
          >
            <Users size={24} />
          </div>
          <div className="stat-meta">
            <h3>{totalEmployees}</h3>
            <p>Active Staff & Employees</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div
            className="stat-icon"
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}
          >
            <DollarSign size={24} />
          </div>
          <div className="stat-meta">
            <h3 className="salary-text">
              {currencySymbol}
              {totalMonthlyPayroll.toLocaleString('en-IN')}
            </h3>
            <p>Monthly Payroll Volume</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div
            className="stat-icon"
            style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}
          >
            <FileText size={24} />
          </div>
          <div className="stat-meta">
            <h3>{totalPayslips}</h3>
            <p>Archived Payslips</p>
          </div>
        </div>
      </div>

      {/* Hero Welcome & Active Company Hub */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              <Sparkles size={14} /> Active Workspace
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              {activeCompany ? activeCompany.name : 'Select a Company'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '650px' }}>
              {activeCompany?.fullAddress || 'Manage payroll, custom templates, employee master records, and export pixel-perfect PDF payslips.'}
            </p>
            {activeCompany && (
              <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-admin">
                  Template: {activeCompany.templateKey.replace('_', ' ').toUpperCase()}
                </span>
                {activeCompany.gstin && (
                  <span className="badge badge-employee">GSTIN: {activeCompany.gstin}</span>
                )}
                {activeCompany.pan && (
                  <span className="badge badge-hr">PAN: {activeCompany.pan}</span>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px' }}>
            <button
              onClick={() => setActiveTab('generator')}
              className="btn btn-primary"
              id="quick-generate-btn"
            >
              <FileText size={16} />
              <span>Issue Salary Slip</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className="btn btn-secondary"
              id="quick-add-emp-btn"
            >
              <PlusCircle size={16} />
              <span>Add Employee</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
