import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Users,
  FileText,
  History,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  companies = [],
  activeCompany,
  setActiveCompany,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div
            className="brand"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="brand-icon">
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>$</span>
            </div>
            <div className="brand-text">
              <h1>Salary Maker</h1>
              <span>Multi-Company Payroll</span>
            </div>
          </div>

          {/* Company Switcher Dropdown */}
          {companies.length > 0 && (
            <div className="company-switcher-container">
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
                      🏢 {c.name} ({c.templateKey.replace('_', ' ').toUpperCase()})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="dropdown-arrow" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            id="tab-dashboard"
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
            id="tab-templates"
          >
            <LayoutTemplate size={15} />
            <span>Templates</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
            id="tab-companies"
          >
            <Building2 size={15} />
            <span>Companies</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
            id="tab-employees"
          >
            <Users size={15} />
            <span>Employees</span>
          </button>

          <button
            className={`nav-tab-btn highlight ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
            id="tab-generator"
          >
            <FileText size={15} />
            <span>Generate Payslip</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            id="tab-history"
          >
            <History size={15} />
            <span>Archive</span>
          </button>
        </nav>

        {/* User Badge & Logout */}
        <div className="user-nav-actions">
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
      </div>
    </header>
  );
};
