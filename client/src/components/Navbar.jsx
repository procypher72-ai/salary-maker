import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SalaryMakerLogo } from './common/SalaryMakerLogo';
import {
  Building2,
  Users,
  FileText,
  History,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  ChevronDown,
  Calculator,
  Menu,
  X,
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  companies = [],
  activeCompany,
  setActiveCompany,
  onOpenCtcCalc,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand & Logo */}
        <div className="navbar-brand-group">
          <SalaryMakerLogo
            variant="full"
            size="md"
            onClick={() => handleTabClick('dashboard')}
            className="navbar-brand-logo hover-glow"
          />

          {/* Company Switcher Dropdown (Desktop) */}
          {companies.length > 0 && (
            <div className="company-switcher-container desktop-only">
              <div className="company-select-pill">
                <Building2 size={16} className="text-cyan" />
                <select
                  value={activeCompany?._id || ''}
                  onChange={(e) => {
                    const selected = companies.find((c) => c._id === e.target.value);
                    if (selected) setActiveCompany(selected);
                  }}
                  className="company-select-dropdown"
                  id="global-company-select"
                >
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      🏢 {c.name} ({(c.templateKey || 'corporate_detailed').replace('_', ' ').toUpperCase()})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="dropdown-arrow" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="nav-tabs desktop-only">
          <button
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
            id="tab-dashboard"
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => handleTabClick('templates')}
            id="tab-templates"
          >
            <LayoutTemplate size={15} />
            <span>Templates</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => handleTabClick('companies')}
            id="tab-companies"
          >
            <Building2 size={15} />
            <span>Companies</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => handleTabClick('employees')}
            id="tab-employees"
          >
            <Users size={15} />
            <span>Employees</span>
          </button>

          <button
            className={`nav-tab-btn highlight ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => handleTabClick('generator')}
            id="tab-generator"
          >
            <FileText size={15} />
            <span>Generate Payslip</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'computations' ? 'active' : ''}`}
            onClick={() => handleTabClick('computations')}
            id="tab-computations"
          >
            <Calculator size={15} />
            <span>Tax Computation</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabClick('history')}
            id="tab-history"
          >
            <History size={15} />
            <span>Archive</span>
          </button>
        </nav>

        {/* User Badge, Tools & Logout (Desktop) */}
        <div className="user-nav-actions desktop-only">
          <button
            onClick={onOpenCtcCalc}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
            title="CTC & Tax Engine Calculator"
            id="navbar-ctc-calc-btn"
          >
            <Calculator size={14} />
            <span>CTC & Tax Tool</span>
          </button>

          {user && (
            <div className="user-badge">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="user-meta">
                <span className="user-name">{user.name}</span>
                <span className="user-role-tag">🛡️ {user.role}</span>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Sign Out"
            id="logout-btn"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Header Actions (Mobile & Tablet) */}
        <div className="mobile-header-actions mobile-only">
          <button
            onClick={onOpenCtcCalc}
            className="mobile-quick-btn"
            title="CTC & Tax Engine Calculator"
            id="mobile-ctc-btn"
          >
            <Calculator size={18} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger-btn"
            aria-label="Toggle Navigation Menu"
            id="mobile-hamburger-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-drawer-content glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-header">
              <SalaryMakerLogo variant="full" size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-drawer-close"
                aria-label="Close Menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Company Switcher */}
            {companies.length > 0 && (
              <div className="mobile-drawer-section">
                <label className="mobile-section-label">Active Organization</label>
                <div className="mobile-company-select-wrap">
                  <Building2 size={16} className="text-cyan" />
                  <select
                    value={activeCompany?._id || ''}
                    onChange={(e) => {
                      const selected = companies.find((c) => c._id === e.target.value);
                      if (selected) setActiveCompany(selected);
                    }}
                    className="mobile-company-dropdown"
                    id="mobile-company-select"
                  >
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        🏢 {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="dropdown-arrow" />
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="mobile-drawer-section">
              <label className="mobile-section-label">Navigation</label>
              <nav className="mobile-nav-list">
                <button
                  className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => handleTabClick('dashboard')}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </button>

                <button
                  className={`mobile-nav-item ${activeTab === 'generator' ? 'active' : ''}`}
                  onClick={() => handleTabClick('generator')}
                >
                  <FileText size={18} />
                  <span>Generate Payslip</span>
                  <span className="mobile-nav-pill">Live Canvas</span>
                </button>

                <button
                  className={`mobile-nav-item ${activeTab === 'templates' ? 'active' : ''}`}
                  onClick={() => handleTabClick('templates')}
                >
                  <LayoutTemplate size={18} />
                  <span>Templates Gallery</span>
                </button>

                <button
                  className={`mobile-nav-item ${activeTab === 'companies' ? 'active' : ''}`}
                  onClick={() => handleTabClick('companies')}
                >
                  <Building2 size={18} />
                  <span>Company Profiles</span>
                </button>

                <button
                  className={`mobile-nav-item ${activeTab === 'employees' ? 'active' : ''}`}
                  onClick={() => handleTabClick('employees')}
                >
                  <Users size={18} />
                  <span>Staff & Employees</span>
                </button>

                <button
                  className={`mobile-nav-item ${activeTab === 'computations' ? 'active' : ''}`}
                  onClick={() => handleTabClick('computations')}
                >
                  <Calculator size={18} />
                  <span>Tax Computation</span>
                </button>

                <button
                  className={`mobile-nav-item ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => handleTabClick('history')}
                >
                  <History size={18} />
                  <span>Payslip Archive</span>
                </button>
              </nav>
            </div>

            {/* Mobile Tools & User Section */}
            <div className="mobile-drawer-footer">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCtcCalc();
                }}
                className="btn btn-secondary btn-block mobile-ctc-launch-btn"
              >
                <Calculator size={16} />
                <span>CTC & Tax Engine Tool</span>
              </button>

              {user && (
                <div className="mobile-user-card">
                  <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="user-meta" style={{ flex: 1 }}>
                    <span className="user-name">{user.name}</span>
                    <span className="user-role-tag">🛡️ {user.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="btn btn-danger-subtle btn-sm"
                    title="Sign Out"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
