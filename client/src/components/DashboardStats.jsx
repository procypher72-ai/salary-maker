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
  PieChart,
  Layers,
  Download,
  Calculator,
  Briefcase,
  TrendingUp,
  Percent,
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

  // Department distribution
  const deptMap = employees.reduce((acc, emp) => {
    const dept = emp.department || 'General';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentList = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

  // Tax regime breakdown
  const newRegimeCount = employees.filter((e) => e.taxRegime === 'new' || !e.taxRegime).length;
  const oldRegimeCount = employees.filter((e) => e.taxRegime === 'old').length;

  // Statutory Withholdings
  const statutoryTotals = employees.reduce(
    (acc, curr) => {
      const base = curr.baselineSalary || {};
      acc.epf += Number(base.pfDeduction || 0);
      acc.esic += Number(base.esicDeduction || 0);
      acc.pt += Number(base.professionalTax || 0);
      acc.tds += Number(base.tds || 0);
      return acc;
    },
    { epf: 0, esic: 0, pt: 0, tds: 0 }
  );

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
                  Template: {(activeCompany.templateKey || 'corporate_detailed').replace('_', ' ').toUpperCase()}
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
              <span>Add / Import Employees</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics & Statutory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Statutory Monthly Deductions Summary */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--accent-cyan)" />
              <span>Statutory Compliance Run</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Monthly</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EPF Contribution</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {currencySymbol}{statutoryTotals.epf.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ESIC Fund</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {currencySymbol}{statutoryTotals.esic.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Professional Tax (PT)</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {currencySymbol}{statutoryTotals.pt.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TDS Withholding</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                {currencySymbol}{statutoryTotals.tds.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Tax Regime & Department Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Percent size={18} color="var(--primary)" />
              <span>Tax Regime Distribution</span>
            </h3>
            <button
              onClick={() => setActiveTab('computations')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
            >
              <Calculator size={12} /> Tax Engine
            </button>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span>New Regime (Sec 115BAC)</span>
              <strong>{newRegimeCount} staff ({totalEmployees ? Math.round((newRegimeCount / totalEmployees) * 100) : 0}%)</strong>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${totalEmployees ? (newRegimeCount / totalEmployees) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span>Old Regime (Exemptions)</span>
              <strong>{oldRegimeCount} staff ({totalEmployees ? Math.round((oldRegimeCount / totalEmployees) * 100) : 0}%)</strong>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${totalEmployees ? (oldRegimeCount / totalEmployees) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                }}
              />
            </div>
          </div>

          {departmentList.length > 0 && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top Departments:</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {departmentList.slice(0, 4).map(([dept, count]) => (
                  <span key={dept} className="badge badge-employee" style={{ fontSize: '0.75rem' }}>
                    {dept}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
