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
    logoPosition: 'left',
    logoOffsetX: 0,
    logoOffsetY: 0,
    signatureUrl: '',
    signatureWidth: 120,
    signatureHeight: 50,
    signatureOffsetX: 0,
    signatureOffsetY: 0,
    showSignature: true,
    stampUrl: '',
    stampWidth: 90,
    stampHeight: 90,
    stampOffsetX: 0,
    stampOffsetY: 0,
    stampOpacity: 85,
    showStamp: true,
    ptState: 'maharashtra',
    defaultTaxRegime: 'new',
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
      signatureUrl: comp.signatureUrl || '',
      signatureWidth: comp.signatureWidth || 120,
      signatureHeight: comp.signatureHeight || 50,
      signatureOffsetX: comp.signatureOffsetX || 0,
      signatureOffsetY: comp.signatureOffsetY || 0,
      showSignature: comp.showSignature !== undefined ? comp.showSignature : true,
      stampUrl: comp.stampUrl || '',
      stampWidth: comp.stampWidth || 90,
      stampHeight: comp.stampHeight || 90,
      stampOffsetX: comp.stampOffsetX || 0,
      stampOffsetY: comp.stampOffsetY || 0,
      stampOpacity: comp.stampOpacity !== undefined ? comp.stampOpacity : 85,
      showStamp: comp.showStamp !== undefined ? comp.showStamp : true,
      ptState: comp.ptState || 'maharashtra',
      defaultTaxRegime: comp.defaultTaxRegime || 'new',
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

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Signature file size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, signatureUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Stamp file size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, stampUrl: reader.result }));
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
                        {(comp.templateKey || 'corporate_detailed').replace('_', ' ').toUpperCase()}
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

              {/* Digital Signature & Official Company Stamp Section */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginTop: '1.25rem',
                }}
              >
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  ✍️ Digital Signature & Official Company Seal / Stamp
                </h4>

                {/* 1. Digital Signature */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Authorized Signatory Signature (PNG)</label>
                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.showSignature}
                        onChange={(e) => setFormData({ ...formData, showSignature: e.target.checked })}
                      />
                      <span>Show on Payslips</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {formData.signatureUrl ? (
                      <img
                        src={formData.signatureUrl}
                        alt="Signature Preview"
                        style={{
                          width: `${formData.signatureWidth || 100}px`,
                          height: `${formData.signatureHeight || 40}px`,
                          objectFit: 'contain',
                          background: '#fff',
                          borderRadius: '4px',
                          padding: '3px',
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No signature uploaded</div>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleSignatureUpload}
                      className="form-input"
                      style={{ padding: '0.4rem', flex: '1 1 180px' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Width</label>
                        <input
                          type="number"
                          min="40"
                          max="250"
                          value={formData.signatureWidth || 120}
                          onChange={(e) => setFormData({ ...formData, signatureWidth: Number(e.target.value) })}
                          className="form-input"
                          style={{ width: '70px', padding: '0.35rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Height</label>
                        <input
                          type="number"
                          min="20"
                          max="120"
                          value={formData.signatureHeight || 50}
                          onChange={(e) => setFormData({ ...formData, signatureHeight: Number(e.target.value) })}
                          className="form-input"
                          style={{ width: '70px', padding: '0.35rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Official Seal / Stamp */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Company Official Stamp / Round Seal (PNG)</label>
                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.showStamp}
                        onChange={(e) => setFormData({ ...formData, showStamp: e.target.checked })}
                      />
                      <span>Show on Payslips</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {formData.stampUrl ? (
                      <img
                        src={formData.stampUrl}
                        alt="Stamp Preview"
                        style={{
                          width: `${formData.stampWidth || 70}px`,
                          height: `${formData.stampHeight || 70}px`,
                          objectFit: 'contain',
                          background: '#fff',
                          borderRadius: '4px',
                          padding: '3px',
                          opacity: (formData.stampOpacity || 85) / 100,
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No stamp uploaded</div>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleStampUpload}
                      className="form-input"
                      style={{ padding: '0.4rem', flex: '1 1 180px' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Size (px)</label>
                        <input
                          type="number"
                          min="40"
                          max="180"
                          value={formData.stampWidth || 90}
                          onChange={(e) => setFormData({ ...formData, stampWidth: Number(e.target.value), stampHeight: Number(e.target.value) })}
                          className="form-input"
                          style={{ width: '70px', padding: '0.35rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Opacity %</label>
                        <input
                          type="number"
                          min="10"
                          max="100"
                          value={formData.stampOpacity || 85}
                          onChange={(e) => setFormData({ ...formData, stampOpacity: Number(e.target.value) })}
                          className="form-input"
                          style={{ width: '70px', padding: '0.35rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Compliance Defaults */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Default PT State Slab</label>
                  <select
                    className="form-select"
                    value={formData.ptState}
                    onChange={(e) => setFormData({ ...formData, ptState: e.target.value })}
                  >
                    <option value="maharashtra">Maharashtra (₹200/mo)</option>
                    <option value="karnataka">Karnataka (₹200/mo)</option>
                    <option value="tamil_nadu">Tamil Nadu (Up to ₹208/mo)</option>
                    <option value="west_bengal">West Bengal (Up to ₹200/mo)</option>
                    <option value="telangana">Telangana (₹200/mo)</option>
                    <option value="andhra_pradesh">Andhra Pradesh (₹200/mo)</option>
                    <option value="gujarat">Gujarat (₹200/mo)</option>
                    <option value="delhi">Delhi (Exempt / ₹0)</option>
                    <option value="other">Other (Exempt / ₹0)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Income Tax Regime</label>
                  <select
                    className="form-select"
                    value={formData.defaultTaxRegime}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRegime: e.target.value })}
                  >
                    <option value="new">New Tax Regime (Default u/s 115BAC)</option>
                    <option value="old">Old Tax Regime (With 80C/80D/HRA)</option>
                  </select>
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
