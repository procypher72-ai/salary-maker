import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { DashboardStats } from './components/DashboardStats';
import { TemplateGallery } from './components/TemplateGallery';
import { CompanyManager } from './components/CompanyManager';
import { EmployeeManager } from './components/EmployeeManager';
import { PayslipGenerator } from './components/PayslipGenerator';
import { PayslipHistory } from './components/PayslipHistory';
import { api } from './services/api';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  DollarSign,
} from 'lucide-react';

const VALID_TABS = ['dashboard', 'templates', 'companies', 'employees', 'generator', 'history'];

const getInitialTab = () => {
  const hash = window.location.hash.replace('#', '').trim();
  if (VALID_TABS.includes(hash)) {
    return hash;
  }
  const saved = localStorage.getItem('salarymaker_active_tab');
  if (VALID_TABS.includes(saved)) {
    return saved;
  }
  return 'dashboard';
};

export function App() {
  const { user, token, loading: authLoading, toasts, removeToast } = useAuth();

  // Navigation State: 'dashboard' | 'templates' | 'companies' | 'employees' | 'generator' | 'history'
  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const setActiveTab = (tab) => {
    if (VALID_TABS.includes(tab)) {
      setActiveTabState(tab);
      localStorage.setItem('salarymaker_active_tab', tab);
      if (window.location.hash !== `#${tab}`) {
        window.history.replaceState(null, '', `#${tab}`);
      }
    }
  };

  // Synchronize hash on browser back/forward or direct hash modification
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (VALID_TABS.includes(hash)) {
        setActiveTabState(hash);
        localStorage.setItem('salarymaker_active_tab', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Ensure URL has current hash on initial load
    if (!window.location.hash && user) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab, user]);

  // Multi-Company System State
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompanyState] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [payslips, setPayslips] = useState([]);

  const setActiveCompany = (comp) => {
    setActiveCompanyState(comp);
    if (comp?._id) {
      localStorage.setItem('salarymaker_active_company_id', comp._id);
    }
  };

  // Fetch full system state
  const fetchAllData = async () => {
    if (!token) return;
    try {
      // 1. Templates
      const tplRes = await api.getTemplates();
      setTemplates(tplRes.templates || []);

      // 2. Companies
      const compRes = await api.getCompanies();
      const compList = compRes.companies || [];
      setCompanies(compList);

      let currentCompany = activeCompany;
      const savedCompanyId = localStorage.getItem('salarymaker_active_company_id');
      if (compList.length > 0) {
        if (!currentCompany || !compList.some((c) => c._id === currentCompany._id)) {
          const matched = compList.find((c) => c._id === savedCompanyId);
          currentCompany = matched || compList[0];
          setActiveCompanyState(currentCompany);
        }
      }

      // 3. Employees for active company
      if (currentCompany?._id) {
        const empRes = await api.getEmployees(currentCompany._id);
        setEmployees(empRes.employees || []);
      } else {
        const empRes = await api.getEmployees();
        setEmployees(empRes.employees || []);
      }

      // 4. Payslips
      const payRes = await api.getPayslips(currentCompany?._id ? { companyId: currentCompany._id } : {});
      setPayslips(payRes.payslips || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  // Re-fetch when active company changes
  useEffect(() => {
    if (token && user) {
      fetchAllData();
    }
  }, [token, user, activeCompany?._id]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-icon spin" style={{ margin: '0 auto 1rem' }}>
            <DollarSign size={24} />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Initializing Salary Maker Enterprise Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {user ? (
        <>
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            companies={companies}
            activeCompany={activeCompany}
            setActiveCompany={(comp) => {
              setActiveCompany(comp);
            }}
          />

          <main className="main-content">
            {activeTab === 'dashboard' && (
              <DashboardStats
                companies={companies}
                employees={employees}
                payslips={payslips}
                activeCompany={activeCompany}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'templates' && (
              <TemplateGallery
                templates={templates}
                activeCompany={activeCompany}
                setActiveCompany={setActiveCompany}
                onCompanyUpdated={fetchAllData}
              />
            )}

            {activeTab === 'companies' && (
              <CompanyManager
                companies={companies}
                templates={templates}
                activeCompany={activeCompany}
                setActiveCompany={setActiveCompany}
                onRefresh={fetchAllData}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeeManager
                employees={employees}
                activeCompany={activeCompany}
                templates={templates}
                onRefresh={fetchAllData}
              />
            )}

            {activeTab === 'generator' && (
              <PayslipGenerator
                activeCompany={activeCompany}
                employees={employees}
                templates={templates}
                onPayslipGenerated={() => {
                  fetchAllData();
                  setActiveTab('history');
                }}
              />
            )}

            {activeTab === 'history' && (
              <PayslipHistory
                payslips={payslips}
                activeCompany={activeCompany}
                onRefresh={fetchAllData}
              />
            )}
          </main>
        </>
      ) : (
        <main className="main-content">
          <Login />
        </main>
      )}

      {/* Global Toast Notifications */}
      <aside className="toast-container no-print" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span style={{ flex: 1, fontSize: '0.85rem' }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.8 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </aside>
    </div>
  );
}

export default App;
