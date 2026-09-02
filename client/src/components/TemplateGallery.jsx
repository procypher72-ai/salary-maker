import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClassicTabularPayslip } from './templates/ClassicTabularPayslip';
import { HclCorporatePayslip } from './templates/HclCorporatePayslip';
import { AiimsGovtPayslip } from './templates/AiimsGovtPayslip';
import { ConcentrixDakshPayslip } from './templates/ConcentrixDakshPayslip';
import { SushmaBuildtechPayslip } from './templates/SushmaBuildtechPayslip';
import { ResizableLogo } from './common/ResizableLogo';
import {
  LayoutTemplate,
  CheckCircle2,
  Eye,
  Sparkles,
  ShieldCheck,
  Check,
  Building,
  Layers,
  ArrowRight,
  X,
  CreditCard,
  FileCheck,
  Pencil,
  Move,
  Settings2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sliders,
} from 'lucide-react';

export const TemplateGallery = ({
  templates = [],
  activeCompany,
  setActiveCompany,
  onCompanyUpdated,
}) => {
  const { showToast } = useAuth();
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState(null);
  const [assigningKey, setAssigningKey] = useState(null);

  // Rename Template State
  const [renamingTemplate, setRenamingTemplate] = useState(null);
  const [renameForm, setRenameForm] = useState({ name: '', badge: '', description: '' });
  const [isSavingRename, setIsSavingRename] = useState(false);

  // Dynamic Fields Customizer State
  const [customizingTemplate, setCustomizingTemplate] = useState(null);
  const [fieldsList, setFieldsList] = useState([]);
  const [isSavingFields, setIsSavingFields] = useState(false);
  const [newFieldForm, setNewFieldForm] = useState({
    key: '',
    label: '',
    type: 'text',
    section: 'job',
    required: false,
  });

  const handleOpenFieldsCustomizer = (tpl) => {
    setCustomizingTemplate(tpl);
    const currentFields = tpl.requiredFields && tpl.requiredFields.length > 0
      ? tpl.requiredFields.map(f => ({
          key: f.key,
          label: f.label,
          type: f.type || 'text',
          section: f.section || 'job',
          required: !!f.required,
        }))
      : [
          { key: 'empNo', label: 'EMP NO', type: 'text', section: 'job', required: true },
          { key: 'name', label: 'NAME', type: 'text', section: 'personal', required: true },
          { key: 'company', label: 'COMPANY', type: 'text', section: 'job', required: false },
          { key: 'vertical', label: 'VERTICAL', type: 'text', section: 'job', required: false },
          { key: 'designation', label: 'DESIGNATION', type: 'text', section: 'job', required: true },
          { key: 'dempDoj', label: 'DEMP DOJ', type: 'text', section: 'job', required: false },
          { key: 'location', label: 'LOCATION', type: 'text', section: 'job', required: false },
          { key: 'bankName', label: 'BANK NAME', type: 'text', section: 'banking', required: false },
          { key: 'bankAccount', label: 'A/C NO', type: 'text', section: 'banking', required: false },
          { key: 'gender', label: 'GENDER', type: 'text', section: 'personal', required: false },
          { key: 'panNumber', label: 'EMP PAN', type: 'text', section: 'statutory', required: false },
          { key: 'pfNumber', label: 'PF_NO', type: 'text', section: 'statutory', required: false },
          { key: 'uanNumber', label: 'UAN', type: 'text', section: 'statutory', required: false },
        ];
    setFieldsList(currentFields);
    setNewFieldForm({ key: '', label: '', type: 'text', section: 'job', required: false });
  };

  const handleFieldLabelChange = (index, newLabel) => {
    setFieldsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], label: newLabel };
      return updated;
    });
  };

  const handleDeleteField = (index) => {
    setFieldsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveField = (index, direction) => {
    setFieldsList(prev => {
      const updated = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleAddNewField = (e) => {
    e.preventDefault();
    if (!newFieldForm.label.trim()) {
      showToast('Please enter a field label', 'error');
      return;
    }
    const derivedKey = newFieldForm.key.trim()
      ? newFieldForm.key.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
      : newFieldForm.label.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!derivedKey) {
      showToast('Please provide a valid field key/identifier', 'error');
      return;
    }

    if (fieldsList.some(f => f.key === derivedKey)) {
      showToast(`A field with key "${derivedKey}" already exists.`, 'error');
      return;
    }

    setFieldsList(prev => [
      ...prev,
      {
        key: derivedKey,
        label: newFieldForm.label.trim(),
        type: newFieldForm.type || 'text',
        section: newFieldForm.section || 'job',
        required: !!newFieldForm.required,
      },
    ]);
    setNewFieldForm({ key: '', label: '', type: 'text', section: 'job', required: false });
    showToast(`Added field "${newFieldForm.label.trim()}"! Click "Save Template Schema" to apply.`, 'info');
  };

  const handleSaveFieldsSchema = async () => {
    if (!customizingTemplate) return;
    setIsSavingFields(true);
    try {
      const res = await api.updateTemplate(customizingTemplate.templateKey, {
        requiredFields: fieldsList,
      });
      showToast(`Saved ${fieldsList.length} dynamic fields for "${customizingTemplate.name}"!`, 'success');
      setCustomizingTemplate(null);
      if (onCompanyUpdated) onCompanyUpdated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSavingFields(false);
    }
  };

  const handleOpenRenameModal = (tpl) => {
    setRenamingTemplate(tpl);
    setRenameForm({
      name: tpl.name || '',
      badge: tpl.badge || '',
      description: tpl.description || '',
    });
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!renamingTemplate || !renameForm.name.trim()) {
      showToast('Please provide a valid template name', 'error');
      return;
    }

    setIsSavingRename(true);
    try {
      const res = await api.updateTemplate(renamingTemplate.templateKey, renameForm);
      showToast(res.message || 'Template renamed successfully!', 'success');
      setRenamingTemplate(null);
      if (onCompanyUpdated) onCompanyUpdated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSavingRename(false);
    }
  };

  const handleAssignTemplate = async (templateKey) => {
    if (!activeCompany) {
      showToast('Please select an active company first', 'error');
      return;
    }

    setAssigningKey(templateKey);
    try {
      const res = await api.updateCompany(activeCompany._id, {
        templateKey,
      });
      showToast(`Assigned "${templateKey.replace('_', ' ').toUpperCase()}" template to ${activeCompany.name}!`, 'success');
      setActiveCompany(res.company);
      if (onCompanyUpdated) onCompanyUpdated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAssigningKey(null);
    }
  };

  return (
    <div>
      {/* Header */}
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Salary Slip Templates Library</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Explore visual structures, dynamic compliance rules, and assign layouts to active companies
          </p>
        </div>

        {activeCompany && (
          <div
            className="glass-panel"
            style={{
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Company:</span>
            <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{activeCompany.name}</strong>
            <span className="badge badge-admin" style={{ fontSize: '0.65rem' }}>
              {activeCompany.templateKey.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Templates Catalog Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {templates.map((tpl) => {
          const isCurrentlyAssigned = activeCompany?.templateKey === tpl.templateKey;

          return (
            <div
              key={tpl.templateKey}
              className="glass-panel template-catalog-card"
              style={{
                border: isCurrentlyAssigned
                  ? '2px solid var(--accent-cyan)'
                  : '1px solid var(--border-subtle)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.75rem',
                overflow: 'hidden',
              }}
            >
              {/* Top Accent Bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background:
                    tpl.templateKey === 'corporate_detailed'
                      ? 'linear-gradient(90deg, #1e3a8a, #3b82f6)'
                      : tpl.templateKey === 'minimalist_startup'
                      ? 'linear-gradient(90deg, #0f766e, #14b8a6)'
                      : 'linear-gradient(90deg, #4c1d95, #8b5cf6)',
                }}
              />

              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background:
                          tpl.templateKey === 'corporate_detailed'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : tpl.templateKey === 'minimalist_startup'
                            ? 'rgba(20, 184, 166, 0.15)'
                            : 'rgba(139, 92, 246, 0.15)',
                        color:
                          tpl.templateKey === 'corporate_detailed'
                            ? '#3b82f6'
                            : tpl.templateKey === 'minimalist_startup'
                            ? '#14b8a6'
                            : '#8b5cf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LayoutTemplate size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{tpl.name}</h3>
                        <button
                          onClick={() => handleOpenRenameModal(tpl)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: '0.15rem 0.45rem',
                            fontSize: '0.7rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.08)',
                          }}
                          title={`Rename "${tpl.name}"`}
                          id={`rename-tpl-${tpl.templateKey}`}
                        >
                          <Pencil size={11} className="text-cyan" />
                          <span>Rename</span>
                        </button>
                      </div>
                      <span className="badge badge-employee" style={{ marginTop: '0.25rem' }}>
                        {tpl.badge}
                      </span>
                    </div>
                  </div>

                  {isCurrentlyAssigned && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: 'rgba(6, 182, 212, 0.2)',
                        color: 'var(--accent-cyan)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} /> ACTIVE
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  {tpl.description}
                </p>

                {/* Key Capabilities / Features */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Form & Payslip Fields ({tpl.requiredFields?.length || 0})
                    </h4>
                    <button
                      onClick={() => handleOpenFieldsCustomizer(tpl)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.68rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                      }}
                      title={`Edit / Add / Delete Fields for ${tpl.name}`}
                      id={`customize-fields-btn-${tpl.templateKey}`}
                    >
                      <Sliders size={11} className="text-cyan" />
                      <span>Edit Fields</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {tpl.requiredFields && tpl.requiredFields.length > 0 ? (
                      tpl.requiredFields.map((f) => (
                        <span
                          key={f.key}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-main)',
                          }}
                        >
                          {f.label}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Standard core fields only</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  gap: '0.75rem',
                }}
              >
                <button
                  onClick={() => setSelectedPreviewTemplate(tpl)}
                  className="btn btn-secondary btn-sm"
                  id={`preview-template-${tpl.templateKey}`}
                >
                  <Eye size={14} />
                  <span>Interactive Sample Preview</span>
                </button>

                <button
                  onClick={() => handleAssignTemplate(tpl.templateKey)}
                  className={`btn btn-sm ${isCurrentlyAssigned ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={isCurrentlyAssigned || assigningKey === tpl.templateKey}
                  id={`assign-template-${tpl.templateKey}`}
                >
                  {isCurrentlyAssigned ? (
                    <>
                      <Check size={14} />
                      <span>Active for Company</span>
                    </>
                  ) : (
                    <span>Assign to Active</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Sample Preview Modal */}
      {selectedPreviewTemplate && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '880px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.85rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  {selectedPreviewTemplate.name} • Visual Preview
                </h3>
                <span className="badge badge-admin" style={{ marginTop: '0.2rem' }}>
                  {selectedPreviewTemplate.badge}
                </span>
              </div>
              <button
                onClick={() => setSelectedPreviewTemplate(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Live Logo Customizer Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.65rem 1rem',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.82rem',
                color: 'var(--text-main)',
              }}
            >
              <Move size={16} className="text-cyan" />
              <span>
                <strong>Live Brand Logo Customizer:</strong> Drag the logo anywhere to move, drag the bottom-right corner to resize, or upload your logo. Click <strong>"Save Layout"</strong> on the logo toolbar to permanently apply this to {activeCompany?.name || 'your active company'}.
              </span>
            </div>

            {/* Render sample sheet in this template */}
            {selectedPreviewTemplate.templateKey === 'aiims_govt_medical' ? (
              <AiimsGovtPayslip
                company={activeCompany || {
                  name: 'All India Institute Of Medical Sciences',
                }}
                isEditable={true}
                onSizeSaved={(updatedComp) => {
                  setActiveCompany(updatedComp);
                  if (onCompanyUpdated) onCompanyUpdated();
                }}
                employee={{
                  empCode: 'E0400345',
                  fullName: 'AMITESH KUMAR YADAV',
                  designation: 'Senior Programmer',
                  department: 'IT',
                  joiningDate: new Date('2021-08-01'),
                  dynamicFields: {
                    dealingOffice: 'Faculty Cell',
                    payDetails: 'Level 10(15600 - 5400 - 39100)',
                    oldSalaryCode: 'JHN163',
                    pfmsNo: 'VAININ00359313',
                    panNumber: 'AKLPY8113F',
                    bankName: 'SBI',
                    bankAccount: '20457116529',
                    ifscCode: 'SBIN00033211',
                    department: 'IT',
                    reportDateTime: '02-Mar-2026&11:28 AM',
                  },
                }}
                draft={{
                  month: 'September',
                  year: 2025,
                  workingDays: 30,
                  paidDays: 30,
                  lopDays: 0,
                  earnings: [
                    { label: 'Basic', amount: 67400 },
                    { label: 'Dearness Allowance', amount: 26960 },
                    { label: 'Travelling Allowance', amount: 4800 },
                    { label: 'TADA', amount: 1512 },
                    { label: 'ICU Allowance', amount: 540 },
                    { label: 'Deputation Pay Allowance', amount: 1280 },
                    { label: 'Uniform Allowance', amount: 2800 },
                    { label: 'Medical Allowance', amount: 3200 },
                    { label: 'Nps Employer Earning Share', amount: 15224 },
                    { label: 'Other Allowance', amount: 10650 },
                  ],
                  deductions: [
                    { label: 'Association Fund Category Amount', amount: 20 },
                    { label: 'Emp Health Scheme', amount: 650 },
                    { label: 'Emp Insurance Scheme', amount: 60 },
                    { label: 'Income Tax', amount: 7357 },
                    { label: 'Miscellaneous Recovery NA', amount: 967 },
                    { label: 'New Pension Scehme-110001989995', amount: 10874 },
                    { label: 'Nps Employer Ded Share', amount: 15224 },
                    { label: 'Water Charges', amount: 82 },
                  ],
                  grossEarnings: 134366,
                  totalDeductions: 35234,
                  netSalary: 99132,
                  netSalaryInWords: 'Ninety Nine Thousand One Hundred Thirty Two Only',
                }}
              />
            ) : selectedPreviewTemplate.templateKey === 'hcl_corporate_tech' ? (
              <HclCorporatePayslip
                company={activeCompany || {
                  name: 'HCL Technologies Ltd.',
                }}
                isEditable={true}
                onSizeSaved={(updatedComp) => {
                  setActiveCompany(updatedComp);
                  if (onCompanyUpdated) onCompanyUpdated();
                }}
                employee={{
                  empCode: 'S285679',
                  fullName: 'Hardeep Singh',
                  designation: 'Software Engineer',
                  department: 'IT',
                  joiningDate: new Date('2023-11-01'),
                  dynamicFields: {
                    dojGender: '01.11.2023 / Male',
                    panNumber: 'KEJPS3652M',
                    pfPensionNo: 'HIL EPF Trust-GN/GGN/5572/635481',
                    uanNumber: '100417097851',
                    bankNameAccount: 'BOI BANK 600810110006820',
                    location: 'Chandigarh',
                    department: 'IT',
                    band: 'S2',
                  },
                }}
                draft={{
                  month: 'January',
                  year: 2026,
                  payPeriod: '01.01.2026 to 31.01.2026',
                  workingDays: 31,
                  paidDays: 31,
                  lopDays: 0,
                  earnings: [
                    { label: 'Basic Salary', amount: 87450 },
                    { label: 'HRA', amount: 34980 },
                    { label: 'Travel Allowance', amount: 22600 },
                    { label: 'Holiday Allowance', amount: 9500 },
                    { label: 'Food Wallet', amount: 4500 },
                    { label: 'Incentives', amount: 45213 },
                  ],
                  deductions: [
                    { label: 'Ee PF contribution', amount: 10494 },
                    { label: 'Prof Tax - split period', amount: 200 },
                    { label: 'Income Tax', amount: 36586 },
                  ],
                  grossEarnings: 204243,
                  totalDeductions: 47280,
                  netSalary: 156963,
                }}
              />
            ) : selectedPreviewTemplate.templateKey === 'classic_tabular' ? (
              <ClassicTabularPayslip
                company={activeCompany || {
                  name: 'Arunima Constructions Private Limited',
                }}
                template={selectedPreviewTemplate}
                isEditable={true}
                onSizeSaved={(updatedComp) => {
                  setActiveCompany(updatedComp);
                  if (onCompanyUpdated) onCompanyUpdated();
                }}
                employee={{
                  empCode: '51410',
                  fullName: 'HARWINDER SINGH',
                  designation: 'Land Surveyor',
                  department: 'Survey',
                  joiningDate: new Date('2023-11-01'),
                  dynamicFields: {
                    vertical: 'Survey',
                    location: 'Chandigarh',
                    dempDoj: '01/11/2023',
                    gender: 'M',
                    panNumber: 'NQBPS8394P',
                    pfNumber: 'PB/CHD/29780/38554',
                    uanNumber: '101719643698',
                    bankName: 'BOI BANK',
                    bankAccount: '600810110006756',
                  },
                }}
                draft={{
                  month: 'January',
                  year: 2026,
                  workingDays: 31,
                  paidDays: 31,
                  lopDays: 0,
                  earnings: [
                    { label: 'Basic', amount: 97000, rate: 97000, arrear: 0 },
                    { label: 'House Rent Allowance', amount: 48500, rate: 48500, arrear: 0 },
                    { label: 'Other Allowance', amount: 24250, rate: 24250, arrear: 0 },
                    { label: 'Leave Travel Allowance', amount: 8080, rate: 8080, arrear: 0 },
                    { label: 'Performance Bonus', amount: 24700, rate: 0, arrear: 0 },
                  ],
                  deductions: [
                    { label: 'Provident Fund', amount: 17460 },
                    { label: 'Professional Tax', amount: 200 },
                    { label: 'Income Tax', amount: 31547 },
                  ],
                  grossEarnings: 202530,
                  totalDeductions: 49207,
                  netSalary: 153323,
                  netSalaryInWords: 'RUPEES ONE LAKH FIFTY THREE THOUSAND THREE HUNDRED TWENTY THREE ONLY',
                }}
              />
            ) : selectedPreviewTemplate.templateKey === 'concentrix_daksh' ? (
              <ConcentrixDakshPayslip
                company={activeCompany || {
                  name: 'CONCENTRIX DAKSH SERVICES INDIA PRIVATE LIMITED',
                  fullAddress: '1st Floor, Red Fort Capital Parsvnath Towers, Bhai Vir Singh Marg, Gole Market, Connaught Place, New Delhi110001, India',
                }}
                isEditable={true}
                onSizeSaved={(updatedComp) => {
                  setActiveCompany(updatedComp);
                  if (onCompanyUpdated) onCompanyUpdated();
                }}
                employee={{
                  empCode: '306007',
                  fullName: 'Pankaj Sharma',
                  designation: 'Lead Business Analyst',
                  department: 'Business Analysis',
                  joiningDate: new Date('2022-10-10'),
                  dynamicFields: {
                    joiningDateStr: '10 Oct 2022',
                    location: 'Chandigarh',
                    bankName: 'SBI',
                    bankAccount: '40777179100',
                    panNumber: 'NJSPS5596H',
                    pfNumber: 'PB/CHD/29780/38538',
                    uanNumber: '101719643567',
                  },
                }}
                draft={{
                  month: 'April',
                  year: 2025,
                  workingDays: 30,
                  paidDays: 30,
                  lopDays: 0,
                  earnings: [
                    { label: 'BASIC', amount: 98000, fullAmount: 98000 },
                    { label: 'HRA', amount: 39200, fullAmount: 39200 },
                    { label: 'LTA', amount: 16337, fullAmount: 16337 },
                    { label: 'SPECIAL ALLOWANCE', amount: 41905, fullAmount: 41905 },
                    { label: 'RMEDICAL ALLOWANCE', amount: 2500, fullAmount: 2500 },
                  ],
                  deductions: [
                    { label: 'PF', amount: 1800 },
                    { label: 'PROF TAX', amount: 200 },
                    { label: 'INCOME TAX', amount: 39647 },
                  ],
                  grossEarnings: 197942,
                  totalDeductions: 41647,
                  netSalary: 156295,
                  netSalaryInWords: 'Rupees One Lakh Fifty Six Thousand Two Hundred Ninety Five Only',
                }}
              />
            ) : selectedPreviewTemplate.templateKey === 'sushma_buildtech' ? (
              <SushmaBuildtechPayslip
                company={activeCompany || {
                  name: 'Sushma Buildtech Limited',
                  fullAddress: 'B-107, First Floor, Business Complex at Elante Mall, Industrial Area-1,Chandigarh-160002',
                }}
                isEditable={true}
                onSizeSaved={(updatedComp) => {
                  setActiveCompany(updatedComp);
                  if (onCompanyUpdated) onCompanyUpdated();
                }}
                employee={{
                  empCode: 'S10187',
                  fullName: 'SURJEET SINGH',
                  designation: 'Sales Analyst',
                  department: 'SALES OPERATION',
                  joiningDate: new Date('2020-06-01'),
                  dynamicFields: {
                    employeeCode: 'S10187',
                    dateOfJoiningStr: '01 June 2020',
                    grade: '28',
                    location: 'Chandigarh',
                    panNumber: 'FWUPS9092F',
                    uanNumber: '101719643698',
                    pfNumber: 'PB/CHD/29780/38554',
                    esicNumber: '',
                    bankAccount: '600810110006815',
                    ifscCode: 'BKID0006791',
                    standardDays: '31.00',
                    lwopDays: '0.00',
                    daysWorked: '31.00',
                  },
                }}
                draft={{
                  month: 'August',
                  year: 2025,
                  workingDays: 31,
                  paidDays: 31,
                  lopDays: 0,
                  earnings: [
                    { label: 'Basic Salary', amount: 62000, rate: 62000 },
                    { label: 'House Rent Allowance', amount: 31000, rate: 31000 },
                    { label: 'Other Allowance', amount: 15400, rate: 15400 },
                    { label: 'Leave Travel Allowance', amount: 8080, rate: 8080 },
                    { label: 'Performance Bonus', amount: 30750 },
                  ],
                  deductions: [
                    { label: 'Provident Fund', amount: 7440 },
                    { label: 'Professional Tax', amount: 200 },
                    { label: 'Income Tax', amount: 11930 },
                  ],
                  grossEarnings: 147230,
                  totalDeductions: 19570,
                  netSalary: 127660,
                  netSalaryInWords: 'One Lakh Twenty Seven Thousand Six Hundred Sixty Only',
                }}
              />
            ) : (
            <div className={`payslip-sheet template-${selectedPreviewTemplate.templateKey}`} style={{ margin: '0 auto' }}>
              
              <div className="payslip-header">
                <div className="company-branding">
                  <ResizableLogo
                    company={activeCompany || {
                      name: 'Acme Global Corporation',
                      fullAddress: '100 Tech Park Boulevard, Silicon City, CA',
                    }}
                    isEditable={true}
                    onSizeSaved={(updatedComp) => {
                      setActiveCompany(updatedComp);
                      if (onCompanyUpdated) onCompanyUpdated();
                    }}
                  />
                  <div>
                    <h1 className="company-title">{activeCompany?.name || 'Acme Global Corporation'}</h1>
                    <p className="company-sub">{activeCompany?.fullAddress || '100 Tech Park Boulevard, Silicon City, CA'}</p>
                    <p className="company-sub">GSTIN: {activeCompany?.gstin || '29ABCDE1234F1Z5'} • PAN: {activeCompany?.pan || 'ABCDE1234F'}</p>
                  </div>
                </div>

                <div className="payslip-badge-box">
                  <h2>SALARY SLIP</h2>
                  <div className="pay-period-pill">August 2026</div>
                </div>
              </div>

              <div className="payslip-meta-grid">
                <div className="meta-col">
                  <div className="meta-row">
                    <span className="meta-label">Emp ID:</span>
                    <span className="meta-val">EMP-9021</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Name:</span>
                    <span className="meta-val highlight">Jordan Reynolds</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Designation:</span>
                    <span className="meta-val">Staff Systems Architect</span>
                  </div>
                </div>

                <div className="meta-col">
                  <div className="meta-row">
                    <span className="meta-label">PAN Number:</span>
                    <span className="meta-val">BNZPS8821K</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Bank Account:</span>
                    <span className="meta-val">••••582910</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">IFSC Code:</span>
                    <span className="meta-val">HDFC0001234</span>
                  </div>
                </div>

                <div className="meta-col attendance-box">
                  <div className="meta-row">
                    <span className="meta-label">Working Days:</span>
                    <span className="meta-val">30</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Paid Days:</span>
                    <span className="meta-val">30</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">LOP Leaves:</span>
                    <span className="meta-val" style={{ color: '#10b981' }}>0</span>
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
                        <th style={{ textAlign: 'right' }}>Amount ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Basic Salary</td>
                        <td style={{ textAlign: 'right' }}>8,500.00</td>
                      </tr>
                      <tr>
                        <td>House Rent Allowance (HRA)</td>
                        <td style={{ textAlign: 'right' }}>3,400.00</td>
                      </tr>
                      <tr>
                        <td>Special Project Allowance</td>
                        <td style={{ textAlign: 'right' }}>1,800.00</td>
                      </tr>
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
                        <th style={{ textAlign: 'right' }}>Amount ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Tax Withholding (TDS)</td>
                        <td style={{ textAlign: 'right' }}>1,850.00</td>
                      </tr>
                      <tr>
                        <td>Provident / Retirement Fund</td>
                        <td style={{ textAlign: 'right' }}>650.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="payslip-totals-summary">
                <div className="totals-row">
                  <div className="total-cell">
                    <span>Gross Earnings:</span>
                    <strong>$13,700.00</strong>
                  </div>
                  <div className="total-cell">
                    <span>Total Deductions:</span>
                    <strong>$2,500.00</strong>
                  </div>
                </div>

                <div className="net-payable-highlight">
                  <div className="net-left">
                    <span className="net-label">NET TAKE-HOME SALARY</span>
                    <div className="net-words">In Words: Dollars Eleven Thousand Two Hundred Only</div>
                  </div>
                  <div className="net-amount">$11,200.00</div>
                </div>
              </div>

              <div className="payslip-footer">
                <div className="footer-note">
                  <p>Sample demonstration of {selectedPreviewTemplate.name}.</p>
                </div>
                <div className="signature-box">
                  <div className="signature-line" />
                  <strong>Authorized Signatory</strong>
                  <span>Head of HR</span>
                </div>
              </div>

            </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={() => {
                  handleAssignTemplate(selectedPreviewTemplate.templateKey);
                  setSelectedPreviewTemplate(null);
                }}
                className="btn btn-primary"
              >
                <span>Assign This Template to {activeCompany?.name || 'Active Company'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Template Modal */}
      {renamingTemplate && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '520px', padding: '1.75rem' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pencil size={18} className="text-cyan" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                  Rename Template
                </h3>
              </div>
              <button
                onClick={() => setRenamingTemplate(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRename}>
              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Template Display Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={renameForm.name}
                  onChange={(e) => setRenameForm({ ...renameForm, name: e.target.value })}
                  placeholder="e.g. Concentrix Daksh Format"
                  required
                  autoFocus
                  id="rename-template-name-input"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.35rem', display: 'block' }}>
                  System Key: <code>{renamingTemplate.templateKey}</code>
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Category Badge / Subtitle</label>
                <input
                  type="text"
                  className="form-input"
                  value={renameForm.badge}
                  onChange={(e) => setRenameForm({ ...renameForm, badge: e.target.value })}
                  placeholder="e.g. Full vs. Actual Corporate"
                  id="rename-template-badge-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Description (Optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={renameForm.description}
                  onChange={(e) => setRenameForm({ ...renameForm, description: e.target.value })}
                  placeholder="Brief description of this template layout..."
                  id="rename-template-desc-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRenamingTemplate(null)}
                  className="btn btn-secondary"
                  disabled={isSavingRename}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingRename || !renameForm.name.trim()}
                  id="save-template-rename-btn"
                >
                  {isSavingRename ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save Template Name</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Fields & Schema Customizer Modal */}
      {customizingTemplate && (
        <div className="modal-overlay">
          <div
            className="modal-content glass-panel"
            style={{ maxWidth: '720px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '1.75rem' }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sliders size={20} className="text-cyan" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Customize Template Fields • {customizingTemplate.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Edit display text (e.g. rename DEMP DOJ to DOJ), add custom fields (e.g. Area), reorder, or delete fields.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCustomizingTemplate(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Fields List */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.35rem', marginBottom: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    Configured Template Fields ({fieldsList.length})
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    Labels update dynamically on payslips & employee forms
                  </span>
                </div>

                {fieldsList.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No fields configured yet. Add your first field below!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {fieldsList.map((field, idx) => (
                      <div
                        key={`${field.key}-${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '0.6rem 0.85rem',
                        }}
                      >
                        {/* Position Index */}
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: 'var(--text-subtle)',
                            width: '20px',
                            textAlign: 'center',
                          }}
                        >
                          {idx + 1}
                        </span>

                        {/* Editable Field Label */}
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                            Display Text / Field Label:
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', fontWeight: 600 }}
                            value={field.label}
                            onChange={(e) => handleFieldLabelChange(idx, e.target.value)}
                            placeholder="e.g. DOJ"
                          />
                        </div>

                        {/* System Key Pill */}
                        <div style={{ minWidth: '120px' }}>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                            Key:
                          </label>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '0.72rem',
                              fontFamily: 'monospace',
                              padding: '0.35rem 0.6rem',
                              background: 'rgba(0,0,0,0.3)',
                              borderRadius: '4px',
                              border: '1px solid rgba(255,255,255,0.06)',
                              color: 'var(--accent-cyan)',
                              width: '100%',
                              boxSizing: 'border-box',
                            }}
                          >
                            {field.key}
                          </span>
                        </div>

                        {/* Section Pill */}
                        <div style={{ minWidth: '85px' }}>
                          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                            Section:
                          </label>
                          <span className="badge badge-employee" style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                            {field.section || 'job'}
                          </span>
                        </div>

                        {/* Reorder Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button
                            type="button"
                            onClick={() => handleMoveField(idx, 'up')}
                            disabled={idx === 0}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: idx === 0 ? 'rgba(255,255,255,0.15)' : 'var(--text-muted)',
                              cursor: idx === 0 ? 'default' : 'pointer',
                              padding: '2px',
                            }}
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveField(idx, 'down')}
                            disabled={idx === fieldsList.length - 1}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: idx === fieldsList.length - 1 ? 'rgba(255,255,255,0.15)' : 'var(--text-muted)',
                              cursor: idx === fieldsList.length - 1 ? 'default' : 'pointer',
                              padding: '2px',
                            }}
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteField(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: '0.4rem',
                            color: '#ef4444',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.08)',
                          }}
                          title={`Delete field "${field.label}"`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Custom Field Section */}
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.04)',
                  border: '1px dashed rgba(6, 182, 212, 0.3)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginTop: '1.25rem',
                }}
              >
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={15} /> Add New Field to Template (e.g. Area, Grade, Branch)
                </h4>

                <form onSubmit={handleAddNewField} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px auto', gap: '0.6rem', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Field Label *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Area"
                      value={newFieldForm.label}
                      onChange={(e) => setNewFieldForm({ ...newFieldForm, label: e.target.value })}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Field Key (Identifier)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. area (auto)"
                      value={newFieldForm.key}
                      onChange={(e) => setNewFieldForm({ ...newFieldForm, key: e.target.value })}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Section
                    </label>
                    <select
                      className="form-input"
                      value={newFieldForm.section}
                      onChange={(e) => setNewFieldForm({ ...newFieldForm, section: e.target.value })}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    >
                      <option value="job">Job</option>
                      <option value="personal">Personal</option>
                      <option value="statutory">Statutory</option>
                      <option value="banking">Banking</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Type
                    </label>
                    <select
                      className="form-input"
                      value={newFieldForm.type}
                      onChange={(e) => setNewFieldForm({ ...newFieldForm, type: e.target.value })}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {fieldsList.length} fields will be active for this template
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setCustomizingTemplate(null)}
                  className="btn btn-secondary"
                  disabled={isSavingFields}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFieldsSchema}
                  className="btn btn-primary"
                  disabled={isSavingFields}
                  id="save-template-fields-schema-btn"
                >
                  {isSavingFields ? (
                    <span>Saving Schema...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save Template Schema</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
