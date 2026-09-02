import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  ShieldAlert,
  Loader2,
  X,
} from 'lucide-react';

export const CompanyManager = ({
  companies = [],
  templates = [],
  activeCompany,
  setActiveCompany,
  onRefresh,
}) => {
  const { showToast } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialForm = {
    name: '',
    email: '',
    phone: '',
    fullAddress: '',
    gstin: '',
    pan: '',
    website: '',
    logoUrl: '',
    logoWidth: 65,
    logoHeight: 65,
    templateKey: 'corporate_detailed',
    currency: '₹',
    currencyCode: 'INR',
    signatoryName: 'Authorized Signatory',
    signatoryDesignation: 'Head of HR',
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name || '',
      email: comp.email || '',
      phone: comp.phone || '',
      fullAddress: comp.fullAddress || '',
      gstin: comp.gstin || '',
      pan: comp.pan || '',
      website: comp.website || '',
      logoUrl: comp.logoUrl || '',
      logoWidth: comp.logoWidth || 65,
      logoHeight: comp.logoHeight || 65,
      logoPosition: comp.logoPosition || 'left',
      logoOffsetX: comp.logoOffsetX || 0,
      logoOffsetY: comp.logoOffsetY || 0,
      templateKey: comp.templateKey || 'corporate_detailed',
      currency: comp.currency || '₹',
      currencyCode: comp.currencyCode || 'INR',
      signatoryName: comp.signatoryName || 'Authorized Signatory',
      signatoryDesignation: comp.signatoryDesignation || 'Head of HR',
    });
    setIsModalOpen(true);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo file size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Company Name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingCompany) {
        const res = await api.updateCompany(editingCompany._id, formData);
        showToast(res.message || 'Company updated successfully!', 'success');
        if (activeCompany?._id === editingCompany._id) {
          setActiveCompany(res.company);
        }
      } else {
        const res = await api.createCompany(formData);
        showToast(res.message || 'Company created successfully!', 'success');
        setActiveCompany(res.company);
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
    if (!window.confirm(`Are you sure you want to delete "${name}" and all its records?`)) {
      return;
    }

    try {
      const res = await api.deleteCompany(id);
      showToast(res.message || 'Company deleted', 'info');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Company Profiles & Branding</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage organizations, assign dynamic salary slip templates, and configure corporate identity
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          id="add-company-btn"
        >
          <Plus size={16} />
          <span>Register New Company</span>
        </button>
      </div>

      {/* Companies Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {companies.map((comp) => {
          const isActive = activeCompany?._id === comp._id;
          return (
            <div
              key={comp._id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                border: isActive
                  ? '2px solid var(--accent-cyan)'
                  : '1px solid var(--border-subtle)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {comp.logoUrl ? (
                      <img
                        src={comp.logoUrl}
                        alt={comp.name}
                        style={{
                          width: '48px',
                          height: '48px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          background: '#fff',
                          padding: '4px',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                        }}
                      >
                        {comp.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{comp.name}</h3>
                      <span className="badge badge-admin" style={{ marginTop: '0.25rem' }}>
                        {comp.templateKey.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: 'rgba(6, 182, 212, 0.2)',
                        color: 'var(--accent-cyan)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    margin: '1rem 0',
                  }}
                >
                  {comp.fullAddress && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} className="text-muted" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {comp.fullAddress}
                      </span>
                    </div>
                  )}
                  {comp.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} className="text-muted" />
                      <span>{comp.email}</span>
                    </div>
                  )}
                  {comp.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} className="text-muted" />
                      <span>{comp.phone}</span>
                    </div>
                  )}
                  {comp.gstin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileCheck size={14} className="text-muted" />
                      <span>GSTIN: {comp.gstin}</span>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: '0.5rem',
                }}
              >
                <button
                  onClick={() => setActiveCompany(comp)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  id={`select-company-${comp._id}`}
                >
                  {isActive ? 'Current Active' : 'Switch to Company'}
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenEdit(comp)}
                    className="btn btn-secondary btn-sm"
                    title="Edit Profile"
                    id={`edit-company-${comp._id}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(comp._id, comp.name)}
                    className="btn btn-danger-subtle btn-sm"
                    title="Delete Company"
                    id={`delete-company-${comp._id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Company Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Building2 size={22} className="text-cyan" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {editingCompany ? 'Edit Company Profile' : 'Register New Company'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acme Innovations Corp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Registered Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="payroll@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Website</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://acme.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Registered Address</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Street, City, State, ZIP code"
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="29ABCDE1234F1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ABCDE1234F"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  />
                </div>
              </div>

              {/* Logo Upload & Sizing */}
              <div className="form-group">
                <label className="form-label">Company Brand Logo (PNG / JPG)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {formData.logoUrl && (
                    <img
                      src={formData.logoUrl}
                      alt="Preview"
                      style={{
                        width: `${formData.logoWidth || 50}px`,
                        height: `${formData.logoHeight || 50}px`,
                        objectFit: 'contain',
                        borderRadius: '6px',
                        background: '#fff',
                        padding: '4px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="form-input"
                    style={{ padding: '0.45rem', flex: '1 1 200px' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Width (px)</label>
                      <input
                        type="number"
                        min="20"
                        max="300"
                        value={formData.logoWidth || 65}
                        onChange={(e) => setFormData({ ...formData, logoWidth: Number(e.target.value) })}
                        className="form-input"
                        style={{ width: '75px', padding: '0.35rem 0.5rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Height (px)</label>
                      <input
                        type="number"
                        min="20"
                        max="300"
                        value={formData.logoHeight || 65}
                        onChange={(e) => setFormData({ ...formData, logoHeight: Number(e.target.value) })}
                        className="form-input"
                        style={{ width: '75px', padding: '0.35rem 0.5rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Alignment</label>
                      <select
                        value={formData.logoPosition || 'left'}
                        onChange={(e) => setFormData({ ...formData, logoPosition: e.target.value })}
                        className="form-select"
                        style={{ width: '100px', padding: '0.35rem 0.5rem' }}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Association Picker */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.75rem', fontWeight: 700 }}>
                  Assign Salary Slip Template *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                  {templates.map((tpl) => {
                    const isSelected = formData.templateKey === tpl.templateKey;
                    return (
                      <div
                        key={tpl.templateKey}
                        onClick={() => setFormData({ ...formData, templateKey: tpl.templateKey })}
                        style={{
                          border: isSelected
                            ? '2px solid var(--accent-cyan)'
                            : '1px solid var(--border-subtle)',
                          borderRadius: '10px',
                          padding: '0.85rem',
                          background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'rgba(0,0,0,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                            {tpl.name.replace(' Template', '')}
                          </span>
                          {isSelected && <Check size={16} className="text-cyan" />}
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                          {tpl.badge}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Signatory Settings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Currency Symbol</label>
                  <select
                    className="form-select"
                    value={formData.currency}
                    onChange={(e) => {
                      const curr = e.target.value;
                      setFormData({
                        ...formData,
                        currency: curr,
                        currencyCode: curr === '₹' ? 'INR' : curr === '$' ? 'USD' : curr === '€' ? 'EUR' : 'GBP',
                      });
                    }}
                  >
                    <option value="₹">₹ (INR - Rupee)</option>
                    <option value="$">$ (USD - Dollar)</option>
                    <option value="€">€ (EUR - Euro)</option>
                    <option value="£">£ (GBP - Pound)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Signatory Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.signatoryName}
                    onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Signatory Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.signatoryDesignation}
                    onChange={(e) => setFormData({ ...formData, signatoryDesignation: e.target.value })}
                  />
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
                  id="save-company-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCompany ? 'Save Changes' : 'Create Company Profile'}</span>
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
