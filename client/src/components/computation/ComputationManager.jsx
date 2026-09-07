import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  Search,
  Filter,
  Printer,
  Edit2,
  Trash2,
  FileText,
  Building2,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { ComputationModal } from './ComputationModal';

export const ComputationManager = ({
  activeCompany,
  companies = [],
  employees = [],
  onOpenGlobalCtcModal,
}) => {
  const [computations, setComputations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFY, setSelectedFY] = useState('all');
  const [selectedRegime, setSelectedRegime] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComputation, setSelectedComputation] = useState(null);

  const fetchComputations = async () => {
    try {
      setLoading(true);
      const filter = {};
      if (activeCompany?._id) filter.companyId = activeCompany._id;
      const res = await api.getComputations(filter);
      setComputations(res.computations || []);
    } catch (err) {
      console.error('Failed to fetch computations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComputations();
  }, [activeCompany]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the computation for ${name || 'this employee'}?`)) {
      try {
        await api.deleteComputation(id);
        fetchComputations();
      } catch (err) {
        alert(err.message || 'Failed to delete computation');
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedComputation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (comp) => {
    setSelectedComputation(comp);
    setIsModalOpen(true);
  };

  // Filtered list
  const filteredComputations = computations.filter((c) => {
    const p = c.personalDetails || {};
    const nameMatch = (p.name || c.employeeId?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const panMatch = (p.pan || '').toLowerCase().includes(searchQuery.toLowerCase());
    const fyMatch = selectedFY === 'all' || c.financialYear === selectedFY;
    const regimeMatch = selectedRegime === 'all' || c.regime === selectedRegime;

    return (nameMatch || panMatch) && fyMatch && regimeMatch;
  });

  // Calculate stats
  const totalCount = computations.length;
  const totalGrossAssessed = computations.reduce((sum, c) => sum + (Number(c.grossTotalIncome) || 0), 0);
  const totalTaxCalculated = computations.reduce(
    (sum, c) => sum + (Number(c.taxCalculation?.taxRoundedOff || c.taxCalculation?.amountPayable || 0)),
    0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="glass-panel computation-header-card">
        <div className="computation-title-box">
          <div className="computation-title-icon">
            <Calculator size={24} />
          </div>
          <div className="computation-title-text">
            <h2>Income Tax Computations</h2>
            <p>
              Generate, manage, and export official Income Tax assessment sheets for employees across FY 2023-24 to 2026-27
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleCreateNew}
            className="btn btn-primary"
            id="create-computation-btn"
          >
            <Plus size={16} />
            <span>Create Computation</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Banner */}
      <div className="stats-banner">
        <div className="glass-panel stat-card">
          <div
            className="stat-icon"
            style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}
          >
            <FileText size={22} />
          </div>
          <div className="stat-meta">
            <h3>{totalCount}</h3>
            <p>Total Computations Assessed</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div
            className="stat-icon"
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}
          >
            <TrendingUp size={22} />
          </div>
          <div className="stat-meta">
            <h3 className="salary-text">₹{totalGrossAssessed.toLocaleString('en-IN')}</h3>
            <p>Combined Gross Assessed Income</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div
            className="stat-icon"
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}
          >
            <ShieldCheck size={22} />
          </div>
          <div className="stat-meta">
            <h3 style={{ color: 'var(--accent-amber)' }}>₹{totalTaxCalculated.toLocaleString('en-IN')}</h3>
            <p>Total Net Tax Assessed Liability</p>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="glass-panel computation-toolbar">
        <div className="form-input-wrapper" style={{ minWidth: '280px', flex: 1, maxWidth: '420px' }}>
          <Search size={16} className="form-input-icon" />
          <input
            type="text"
            className="form-input has-icon"
            placeholder="Search by Assessee Name or PAN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="computation-search-input"
          />
        </div>

        <div className="computation-filters">
          <div className="computation-filter-label">
            <Filter size={14} />
            <span>Filter FY:</span>
          </div>

          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.825rem' }}
          >
            <option value="all">All Financial Years</option>
            <option value="2026-2027">FY 2026-2027 (AY 2027-28)</option>
            <option value="2025-2026">FY 2025-2026 (AY 2026-27)</option>
            <option value="2024-2025">FY 2024-2025 (AY 2025-26)</option>
            <option value="2023-2024">FY 2023-2024 (AY 2024-25)</option>
          </select>

          <select
            value={selectedRegime}
            onChange={(e) => setSelectedRegime(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.825rem' }}
          >
            <option value="all">All Tax Regimes</option>
            <option value="new_115bac">New Regime (u/s 115BAC)</option>
            <option value="old">Old Tax Regime</option>
          </select>
        </div>
      </div>

      {/* Computations Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
              <p>Loading computations data...</p>
            </div>
          ) : filteredComputations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <Calculator size={48} style={{ margin: '0 auto 1rem', opacity: 0.35, color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
                No Tax Computations Found
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                Create a computation sheet for an employee to calculate their annual tax liability under Old or New Regime.
              </p>
              <button
                onClick={handleCreateNew}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Create First Computation</span>
              </button>
            </div>
          ) : (
            <table className="custom-table" id="computations-table">
              <thead>
                <tr>
                  <th>Assessee Details</th>
                  <th>Financial Year</th>
                  <th>Tax Regime</th>
                  <th style={{ textAlign: 'right' }}>Gross Total Income</th>
                  <th style={{ textAlign: 'right' }}>Net Tax Payable</th>
                  <th style={{ textAlign: 'center' }}>Template</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComputations.map((c) => {
                  const p = c.personalDetails || {};
                  const isNew = c.regime === 'new_115bac';
                  const taxPayable = c.taxCalculation?.taxRoundedOff || c.taxCalculation?.amountPayable || 0;

                  return (
                    <tr key={c._id} id={`computation-row-${c._id}`}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
                          {p.name || c.employeeId?.fullName || 'Assessee'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                            PAN: {p.pan || 'N/A'}
                          </span>
                          <span>•</span>
                          <span>{c.companyId?.name || 'Company'}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          FY {c.financialYear}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          AY {c.assessmentYear}
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${isNew ? 'badge-hr' : 'badge-manager'}`}>
                          {isNew ? 'New (115BAC)' : 'Old Regime'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ₹{(Number(c.grossTotalIncome) || 0).toLocaleString('en-IN')}
                      </td>

                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        ₹{Number(taxPayable).toLocaleString('en-IN')}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-employee">
                          {c.templateId === 'modern_executive'
                            ? 'Modern Executive'
                            : c.templateId === 'ca_audit'
                            ? 'CA Audit Workpaper'
                            : 'ZenIT / KDK Standard'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(c)}
                            title="View / Print Computation"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.4rem 0.6rem' }}
                          >
                            <Printer size={14} style={{ color: 'var(--primary)' }} />
                          </button>
                          <button
                            onClick={() => handleEdit(c)}
                            title="Edit"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.4rem 0.6rem' }}
                          >
                            <Edit2 size={14} style={{ color: 'var(--accent-cyan)' }} />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id, p.name || c.employeeId?.fullName)}
                            title="Delete"
                            className="btn btn-danger-subtle btn-sm"
                            style={{ padding: '0.4rem 0.6rem' }}
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

      {/* Interactive Modal */}
      <ComputationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComputation(null);
        }}
        computationToEdit={selectedComputation}
        companies={companies}
        employees={employees}
        activeCompany={activeCompany}
        onSaved={fetchComputations}
      />
    </div>
  );
};

