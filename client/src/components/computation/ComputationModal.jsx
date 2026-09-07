import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Calculator,
  Save,
  Printer,
  FileText,
  AlertCircle,
  Download,
  FileCheck,
  TrendingUp,
  Home,
  Briefcase,
  Coins,
  ShieldCheck,
  Receipt,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { recalculateComputation, getRegimeComparison } from '../../utils/computationTaxCalculator';
import { exportElementToPdf } from '../../utils/exportUtils';
import { KdkZenitTemplate } from './templates/KdkZenitTemplate';
import { ModernExecutiveTemplate } from './templates/ModernExecutiveTemplate';
import { CaAuditTemplate } from './templates/CaAuditTemplate';
import { Form16PartBTemplate } from './templates/Form16PartBTemplate';

// Modular Tabs
import { SalaryTab } from './tabs/SalaryTab';
import { HousePropertyTab } from './tabs/HousePropertyTab';
import { BusinessTab } from './tabs/BusinessTab';
import { CapitalGainsTab } from './tabs/CapitalGainsTab';
import { OtherSourcesTab } from './tabs/OtherSourcesTab';
import { DeductionsTab } from './tabs/DeductionsTab';
import { TaxesAndChallansTab } from './tabs/TaxesAndChallansTab';

const FINANCIAL_YEARS = ['2026-2027', '2025-2026', '2024-2025', '2023-2024'];

const INITIAL_COMPUTATION_STATE = {
  financialYear: '2025-2026',
  assessmentYear: '2026-2027',
  regime: 'new_115bac',
  returnType: 'ORIGINAL',
  filingSection: '139(1)',
  filingDueDate: '31/07/2026',
  interestCalculatedUpto: '27/07/2026',
  templateId: 'kdk_zenit',
  personalDetails: {
    name: '',
    fathersName: '',
    officeAddress: '',
    residentialAddress: '',
    pan: '',
    dob: '',
    gender: 'Male',
    status: 'Individual',
    residentStatus: 'Resident',
  },
  headsOfIncome: {
    salary: {
      employerName: '',
      employmentMonths: 12,
      basicSalary: 0,
      allowances: 0,
      totalGross: 0,
      exemptedAllowances: 0,
      standardDeduction: 75000,
      professionalTax: 0,
      taxableSalary: 0,
      salaryBreakdown: [
        { particular: 'Basic Salary', totalAmount: 0, exemptedAmount: 0, taxableAmount: 0 },
      ],
    },
    houseProperty: {
      propertyType: 'let_out',
      address: '',
      city: '',
      state: 'HARYANA',
      country: 'India',
      pin: '',
      ownerOfProperty: 'Self',
      tenantName: '',
      tenantPan: '',
      ownershipShare: 100,
      rentReceived: 0,
      municipalValuation: 0,
      fairRent: 0,
      unrealisedRent: 0,
      annualValue: 0,
      currentYearInterest: 0,
      municipalTaxes: 0,
      standardDeduction30: 0,
      netIncome: 0,
    },
    businessProfession: {
      subType: 'ordinary',
      entries: [],
      businessName: '',
      natureOfBusiness: '',
      profitOrLoss: 0,
      turnover: 0,
      netProfit: 0,
    },
    capitalGains: {
      assetType: 'Debentures',
      natureOfAsset: 'LTCG',
      saleConsideration: 0,
      purchaseCost: 0,
      indexedCost: 0,
      transferExpenses: 0,
      shortTermNormal: 0,
      shortTerm15: 0,
      longTerm10: 0,
      longTerm20: 0,
      netGains: 0,
    },
    otherSources: {
      category: 'normal',
      interestSavings: 0,
      interestFdr: 0,
      otherInterest: 0,
      dividendIncome: 0,
      otherIncome: 0,
      totalOtherSources: 0,
      breakdown: [],
    },
  },
  grossTotalIncome: 0,
  deductionsChapterVIA: [],
  totalDeductionsChapterVIA: 0,
  structuredDeductions: {
    sec80C: 0,
    sec80CCC: 0,
    sec80CCD1B: 0,
    sec80CCD2: 0,
    sec80D: 0,
    sec80E: 0,
    sec80G: 0,
    sec80TTA: 0,
    sec80TTB: 0,
  },
  totalIncome: 0,
  roundedTotalIncome: 0,
  taxCalculation: {
    basicExemptionLimit: 400000,
    taxAtNormalRates: 0,
    taxAtSpecialRates: 0,
    totalTax: 0,
    rebate87A: 0,
    taxAfterRebate: 0,
    cess: 0,
    totalTaxWithCess: 0,
    totalInterest: 0,
    totalTaxAndInterest: 0,
    tdsSalary: 0,
    tdsOther: 0,
    advanceTax: 0,
    totalTaxesPaid: 0,
    amountPayable: 0,
    amountRefundable: 0,
    taxRoundedOff: 0,
  },
  challans: [],
  verifiedBy: '',
  notes: '',
};

export const ComputationModal = ({
  isOpen,
  onClose,
  computationToEdit = null,
  activeCompany,
  companies = [],
  employees = [],
  onSaved,
}) => {
  const [formData, setFormData] = useState(INITIAL_COMPUTATION_STATE);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('basic'); // 'basic' | 'heads' | 'deductions' | 'preview' | 'form16'
  const [activeHead, setActiveHead] = useState('salary'); // 'salary' | 'house_property' | 'business_profession' | 'capital_gains' | 'other_sources'
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isFetchingSalary, setIsFetchingSalary] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize on mount or when editing
  useEffect(() => {
    if (computationToEdit) {
      setFormData(recalculateComputation(computationToEdit));
      setSelectedCompanyId(computationToEdit.companyId?._id || computationToEdit.companyId || '');
      setSelectedEmployeeId(computationToEdit.employeeId?._id || computationToEdit.employeeId || '');
    } else {
      const defaultCompId = activeCompany?._id || (companies[0] ? companies[0]._id : '');
      setSelectedCompanyId(defaultCompId);

      const matchedEmployees = employees.filter((e) => (e.companyId?._id || e.companyId) === defaultCompId);
      const defaultEmp = matchedEmployees[0];
      setSelectedEmployeeId(defaultEmp ? defaultEmp._id : '');

      const initial = recalculateComputation({
        ...INITIAL_COMPUTATION_STATE,
        companyId: defaultCompId,
        employeeId: defaultEmp ? defaultEmp._id : '',
        personalDetails: {
          ...INITIAL_COMPUTATION_STATE.personalDetails,
          name: defaultEmp ? defaultEmp.fullName : '',
          pan: defaultEmp ? (defaultEmp.dynamicFields?.panNumber || defaultEmp.panNumber || '') : '',
          officeAddress: activeCompany?.fullAddress || '',
        },
        headsOfIncome: {
          ...INITIAL_COMPUTATION_STATE.headsOfIncome,
          salary: {
            ...INITIAL_COMPUTATION_STATE.headsOfIncome.salary,
            employerName: activeCompany?.name || '',
          },
        },
      });
      setFormData(initial);
    }
  }, [computationToEdit, activeCompany, isOpen]);

  if (!isOpen) return null;

  const companyEmployees = employees.filter(
    (e) => (e.companyId?._id || e.companyId) === selectedCompanyId
  );

  const handleFYChange = (fy) => {
    const parts = fy.split('-').map((p) => parseInt(p.trim(), 10));
    const ay = `${parts[0] + 1}-${parts[1] + 1}`;
    const updated = recalculateComputation({
      ...formData,
      financialYear: fy,
      assessmentYear: ay,
    });
    setFormData(updated);
  };

  const handleRegimeChange = (regime) => {
    const updated = recalculateComputation({
      ...formData,
      regime,
    });
    setFormData(updated);
  };

  const handleAutoFetchSalary = async () => {
    if (!selectedEmployeeId) {
      alert('Please select an employee first to fetch their salary records.');
      return;
    }
    try {
      setIsFetchingSalary(true);
      const res = await api.aggregateSalaryForFY(selectedEmployeeId, formData.financialYear);
      if (res.success && res.data) {
        const { personalDetails, salaryDetails, taxesPaid } = res.data;
        const updated = recalculateComputation({
          ...formData,
          personalDetails: { ...formData.personalDetails, ...personalDetails },
          headsOfIncome: {
            ...formData.headsOfIncome,
            salary: {
              ...formData.headsOfIncome.salary,
              ...salaryDetails,
            },
          },
          taxCalculation: {
            ...formData.taxCalculation,
            tdsSalary: taxesPaid?.tdsSalary || 0,
          },
        });
        setFormData(updated);
      }
    } catch (err) {
      console.error('Failed to auto-fetch salary:', err);
      alert(err.message || 'Failed to auto-fetch salary details');
    } finally {
      setIsFetchingSalary(false);
    }
  };

  const handleSaveComputation = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');
      const finalPayload = recalculateComputation({
        ...formData,
        companyId: selectedCompanyId,
        employeeId: selectedEmployeeId,
      });

      if (computationToEdit?._id) {
        await api.updateComputation(computationToEdit._id, finalPayload);
      } else {
        await api.createComputation(finalPayload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving computation:', err);
      setErrorMessage(err.message || 'Failed to save computation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      const targetId = activeSubTab === 'form16' ? 'form16-certificate-view' : 'computation-sheet-preview';
      const filename = `Tax_Computation_${formData.personalDetails?.name?.replace(/\s+/g, '_') || 'Employee'}_FY${formData.financialYear}.pdf`;
      await exportElementToPdf(targetId, filename);
    } catch (err) {
      console.error('PDF Export failed:', err);
      window.print(); // Fallback to browser print
    } finally {
      setIsExportingPdf(false);
    }
  };

  const selectedCompany = companies.find((c) => c._id === selectedCompanyId) || activeCompany || {};

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-computation-container">
        {/* Header */}
        <div className="modal-computation-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calculator size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {computationToEdit ? 'Edit Income Tax Computation' : 'Create Income Tax Computation'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                ZenIT Assessment Architecture • FY {formData.financialYear} (AY {formData.assessmentYear}) • Regime: {formData.regime === 'new_115bac' ? '115BAC New' : 'Old'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="btn btn-secondary btn-sm"
              title="Download PDF directly"
            >
              <Download size={14} />
              <span>{isExportingPdf ? 'Exporting PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              title="Browser Print"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              onClick={handleSaveComputation}
              disabled={isSaving}
              className="btn btn-primary btn-sm"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Sheet'}</span>
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="modal-computation-nav">
          <div className="modal-subtab-group">
            <button
              type="button"
              onClick={() => setActiveSubTab('basic')}
              className={`modal-subtab-btn ${activeSubTab === 'basic' ? 'active' : ''}`}
            >
              <FileText size={14} />
              <span>1. Assessee & FY</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('heads')}
              className={`modal-subtab-btn ${activeSubTab === 'heads' ? 'active' : ''}`}
            >
              <Layers size={14} />
              <span>2. 5 Heads of Income</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('deductions')}
              className={`modal-subtab-btn ${activeSubTab === 'deductions' ? 'active' : ''}`}
            >
              <ShieldCheck size={14} />
              <span>3. Deductions & Regime Optimizer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('taxes')}
              className={`modal-subtab-btn ${activeSubTab === 'taxes' ? 'active' : ''}`}
            >
              <Receipt size={14} />
              <span>4. Taxes & Challans</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('preview')}
              className={`modal-subtab-btn ${activeSubTab === 'preview' ? 'active' : ''}`}
            >
              <Printer size={14} />
              <span>5. Tax Sheet Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('form16')}
              className={`modal-subtab-btn ${activeSubTab === 'form16' ? 'active' : ''}`}
              style={{ color: activeSubTab === 'form16' ? '#fff' : 'var(--accent-cyan)' }}
            >
              <FileCheck size={14} />
              <span>Form 16 Part B</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(244, 63, 94, 0.15)',
              borderBottom: '1px solid var(--accent-rose)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-computation-body">
          {/* TAB 1: BASIC ASSESSEE & FY */}
          {activeSubTab === 'basic' && (
            <div>
              <div className="form-section-card">
                <div className="form-section-title">
                  <span>Target Workspace & Assessee Selection</span>
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => {
                        setSelectedCompanyId(e.target.value);
                        const comp = companies.find((c) => c._id === e.target.value);
                        if (comp) {
                          setFormData((prev) => ({
                            ...prev,
                            headsOfIncome: {
                              ...prev.headsOfIncome,
                              salary: { ...prev.headsOfIncome.salary, employerName: comp.name },
                            },
                            personalDetails: {
                              ...prev.personalDetails,
                              officeAddress: comp.fullAddress || '',
                            },
                          }));
                        }
                      }}
                      className="form-select"
                    >
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employee</label>
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => {
                        setSelectedEmployeeId(e.target.value);
                        const emp = employees.find((emp) => emp._id === e.target.value);
                        if (emp) {
                          const dyn = emp.dynamicFields instanceof Map ? Object.fromEntries(emp.dynamicFields) : emp.dynamicFields || {};
                          setFormData((prev) => ({
                            ...prev,
                            personalDetails: {
                              ...prev.personalDetails,
                              name: emp.fullName,
                              fathersName: dyn.fathersName || dyn.fatherName || prev.personalDetails.fathersName,
                              pan: dyn.panNumber || dyn.pan || emp.panNumber || prev.personalDetails.pan,
                              dob: dyn.dob || dyn.dateOfBirth || prev.personalDetails.dob,
                              residentialAddress: dyn.residentialAddress || dyn.address || prev.personalDetails.residentialAddress,
                            },
                            verifiedBy: emp.fullName,
                          }));
                        }
                      }}
                      className="form-select"
                    >
                      {companyEmployees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.fullName} ({emp.empCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Financial Year (FY)</label>
                    <select
                      value={formData.financialYear}
                      onChange={(e) => handleFYChange(e.target.value)}
                      className="form-select"
                      style={{ fontWeight: 700 }}
                    >
                      {FINANCIAL_YEARS.map((fy) => (
                        <option key={fy} value={fy}>
                          FY {fy} (AY {parseInt(fy.split('-')[0], 10) + 1}-{parseInt(fy.split('-')[1], 10) + 1})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-3" style={{ marginTop: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Assessee Full Name</label>
                    <input
                      type="text"
                      value={formData.personalDetails.name || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalDetails: { ...prev.personalDetails, name: e.target.value },
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Permanent Account Number (PAN)</label>
                    <input
                      type="text"
                      value={formData.personalDetails.pan || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalDetails: { ...prev.personalDetails, pan: e.target.value.toUpperCase() },
                        }))
                      }
                      className="form-input"
                      style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax Regime</label>
                    <div className="segmented-control" style={{ width: '100%' }}>
                      <button
                        type="button"
                        onClick={() => handleRegimeChange('new_115bac')}
                        className={`segmented-btn ${formData.regime === 'new_115bac' ? 'active' : ''}`}
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        New (115BAC)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegimeChange('old')}
                        className={`segmented-btn ${formData.regime === 'old' ? 'active' : ''}`}
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        Old Regime
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5 HEADS OF INCOME */}
          {activeSubTab === 'heads' && (
            <div>
              <div className="zenit-pill-tabs">
                <button
                  type="button"
                  onClick={() => setActiveHead('salary')}
                  className={`zenit-subnav-btn ${activeHead === 'salary' ? 'active' : ''}`}
                >
                  <Briefcase size={14} />
                  <span>1. Salary (₹{Number(formData.headsOfIncome.salary.taxableSalary || 0).toLocaleString('en-IN')})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHead('house_property')}
                  className={`zenit-subnav-btn ${activeHead === 'house_property' ? 'active' : ''}`}
                >
                  <Home size={14} />
                  <span>2. House Property (₹{Number(formData.headsOfIncome.houseProperty.netIncome || 0).toLocaleString('en-IN')})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHead('business_profession')}
                  className={`zenit-subnav-btn ${activeHead === 'business_profession' ? 'active' : ''}`}
                >
                  <Briefcase size={14} />
                  <span>3. Business (₹{Number(formData.headsOfIncome.businessProfession.netProfit || 0).toLocaleString('en-IN')})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHead('capital_gains')}
                  className={`zenit-subnav-btn ${activeHead === 'capital_gains' ? 'active' : ''}`}
                >
                  <TrendingUp size={14} />
                  <span>4. Capital Gains (₹{Number(formData.headsOfIncome.capitalGains.netGains || 0).toLocaleString('en-IN')})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHead('other_sources')}
                  className={`zenit-subnav-btn ${activeHead === 'other_sources' ? 'active' : ''}`}
                >
                  <Coins size={14} />
                  <span>5. Other Sources (₹{Number(formData.headsOfIncome.otherSources.totalOtherSources || 0).toLocaleString('en-IN')})</span>
                </button>
              </div>

              {activeHead === 'salary' && (
                <SalaryTab
                  formData={formData}
                  setFormData={setFormData}
                  recalculateComputation={recalculateComputation}
                  selectedEmployeeId={selectedEmployeeId}
                  isFetchingSalary={isFetchingSalary}
                  handleAutoFetchSalary={handleAutoFetchSalary}
                />
              )}

              {activeHead === 'house_property' && (
                <HousePropertyTab
                  formData={formData}
                  setFormData={setFormData}
                  recalculateComputation={recalculateComputation}
                />
              )}

              {activeHead === 'business_profession' && (
                <BusinessTab
                  formData={formData}
                  setFormData={setFormData}
                  recalculateComputation={recalculateComputation}
                />
              )}

              {activeHead === 'capital_gains' && (
                <CapitalGainsTab
                  formData={formData}
                  setFormData={setFormData}
                  recalculateComputation={recalculateComputation}
                />
              )}

              {activeHead === 'other_sources' && (
                <OtherSourcesTab
                  formData={formData}
                  setFormData={setFormData}
                  recalculateComputation={recalculateComputation}
                />
              )}
            </div>
          )}

          {/* TAB 3: DEDUCTIONS & OPTIMIZER */}
          {activeSubTab === 'deductions' && (
            <DeductionsTab
              formData={formData}
              setFormData={setFormData}
              recalculateComputation={recalculateComputation}
              handleRegimeChange={handleRegimeChange}
            />
          )}

          {/* TAB 4: TAXES & CHALLANS */}
          {activeSubTab === 'taxes' && (
            <TaxesAndChallansTab
              formData={formData}
              setFormData={setFormData}
              recalculateComputation={recalculateComputation}
            />
          )}

          {/* TAB 5: PREVIEW SCHEDULE */}
          {activeSubTab === 'preview' && (
            <div id="computation-sheet-preview">
              <div className="preview-template-toolbar" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, templateId: 'kdk_zenit' }))}
                  className={`btn btn-sm ${formData.templateId === 'kdk_zenit' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  KDK ZenIT Official Style
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, templateId: 'modern_executive' }))}
                  className={`btn btn-sm ${formData.templateId === 'modern_executive' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Modern Executive Layout
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, templateId: 'ca_audit' }))}
                  className={`btn btn-sm ${formData.templateId === 'ca_audit' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Chartered Accountant Audit Format
                </button>
              </div>

              {formData.templateId === 'kdk_zenit' && (
                <KdkZenitTemplate computation={formData} company={selectedCompany} />
              )}
              {formData.templateId === 'modern_executive' && (
                <ModernExecutiveTemplate computation={formData} company={selectedCompany} />
              )}
              {formData.templateId === 'ca_audit' && (
                <CaAuditTemplate computation={formData} company={selectedCompany} />
              )}
            </div>
          )}

          {/* TAB 6: FORM 16 PART B */}
          {activeSubTab === 'form16' && (
            <div style={{ background: '#fff', color: '#000', padding: '24px', borderRadius: 'var(--radius-sm)' }}>
              <Form16PartBTemplate computation={formData} company={selectedCompany} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComputationModal;
