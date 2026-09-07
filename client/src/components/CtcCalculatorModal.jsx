import React, { useState, useMemo } from 'react';
import { calculateCtcStructure, PT_STATES } from '../utils/statutoryRules';
import { compareTaxRegimes } from '../utils/taxEngine';
import {
  Calculator,
  DollarSign,
  ShieldCheck,
  Building,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  X,
  TrendingUp,
  Percent,
  Copy,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const CtcCalculatorModal = ({
  isOpen,
  onClose,
  onApplySalary,
  initialCtc = 600000,
  initialState = 'maharashtra',
}) => {
  const [annualCtc, setAnnualCtc] = useState(initialCtc || 600000);
  const [basicPercent, setBasicPercent] = useState(40);
  const [hraPercent, setHraPercent] = useState(50);
  const [ptState, setPtState] = useState(initialState || 'maharashtra');
  const [restrictPfCap, setRestrictPfCap] = useState(false);
  const [includeEmployerPfInCtc, setIncludeEmployerPfInCtc] = useState(true);
  const [includeGratuityInCtc, setIncludeGratuityInCtc] = useState(true);
  const [gender, setGender] = useState('M');

  // Tax regime inputs
  const [section80C, setSection80C] = useState(150000);
  const [section80D, setSection80D] = useState(25000);
  const [hraExemption, setHraExemption] = useState(0);
  const [copied, setCopied] = useState(false);

  // Active view tab: 'structure' | 'tax'
  const [viewTab, setViewTab] = useState('structure');

  // Calculate CTC breakdown
  const ctcData = useMemo(() => {
    return calculateCtcStructure({
      annualCtc: Number(annualCtc) || 0,
      basicPercent,
      hraPercent,
      ptState,
      restrictPfCap,
      includeEmployerPfInCtc,
      includeGratuityInCtc,
      gender,
    });
  }, [
    annualCtc,
    basicPercent,
    hraPercent,
    ptState,
    restrictPfCap,
    includeEmployerPfInCtc,
    includeGratuityInCtc,
    gender,
  ]);

  // Calculate Tax Comparison
  const taxData = useMemo(() => {
    return compareTaxRegimes({
      annualGross: ctcData.annualSummary.annualGross,
      section80C,
      section80D,
      hraExemption,
    });
  }, [ctcData.annualSummary.annualGross, section80C, section80D, hraExemption]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (onApplySalary) {
      onApplySalary({
        ctcAnnual: annualCtc,
        baselineSalary: {
          basicPay: ctcData.earnings.basicPay,
          hra: ctcData.earnings.hra,
          specialAllowance: ctcData.earnings.specialAllowance,
          conveyanceAllowance: ctcData.earnings.conveyanceAllowance,
          medicalAllowance: ctcData.earnings.medicalAllowance,
          pfDeduction: ctcData.deductions.pfDeduction,
          esicDeduction: ctcData.deductions.esicDeduction,
          professionalTax: ctcData.deductions.professionalTax,
          tds: taxData.recommendedMonthlyTds,
          otherDeductions: 0,
        },
        taxRegime: taxData.recommendedRegime,
        ptState,
      });
    }
    onClose();
  };

  const handleCopySummary = () => {
    const summaryText = `CTC Structure Summary (Annual CTC: ₹${Number(annualCtc).toLocaleString('en-IN')})
Monthly Gross: ₹${ctcData.earnings.grossEarnings.toLocaleString('en-IN')}
• Basic Pay: ₹${ctcData.earnings.basicPay.toLocaleString('en-IN')}
• HRA: ₹${ctcData.earnings.hra.toLocaleString('en-IN')}
• Conveyance: ₹${ctcData.earnings.conveyanceAllowance.toLocaleString('en-IN')}
• Medical: ₹${ctcData.earnings.medicalAllowance.toLocaleString('en-IN')}
• Special Allowance: ₹${ctcData.earnings.specialAllowance.toLocaleString('en-IN')}

Monthly Deductions: ₹${ctcData.deductions.totalDeductions.toLocaleString('en-IN')}
• EPF: ₹${ctcData.deductions.pfDeduction.toLocaleString('en-IN')}
• ESIC: ₹${ctcData.deductions.esicDeduction.toLocaleString('en-IN')}
• PT: ₹${ctcData.deductions.professionalTax.toLocaleString('en-IN')}
• Recommended TDS: ₹${taxData.recommendedMonthlyTds.toLocaleString('en-IN')}

Net In-Hand Take-Home: ₹${(ctcData.netTakeHome - taxData.recommendedMonthlyTds).toLocaleString('en-IN')}/month`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '1.5rem',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content glass-panel"
        style={{
          backgroundColor: '#0d1322',
          color: '#f8fafc',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          maxWidth: '1020px',
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          zIndex: 1000000,
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                padding: '0.6rem',
                borderRadius: '10px',
                color: '#fff',
                display: 'flex',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Calculator size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                CTC to Monthly Breakdown & Statutory Tax Engine
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2px 0 0' }}>
                Automated Indian compliance calculation for EPF, ESIC, State PT, and Old vs New Tax Regimes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.6rem', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${viewTab === 'structure' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewTab('structure')}
            style={{ flex: '1 1 220px' }}
          >
            <Layers size={16} />
            <span>Salary Structure & Net Take-Home</span>
          </button>
          <button
            type="button"
            className={`btn ${viewTab === 'tax' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewTab('tax')}
            style={{ flex: '1 1 220px' }}
          >
            <ShieldCheck size={16} />
            <span>Old vs New Tax Regime Comparator</span>
          </button>
        </div>

        {/* Input Parameters Section */}
        <div
          style={{
            padding: '1.25rem',
            marginBottom: '1.5rem',
            backgroundColor: '#131b2e',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Annual CTC */}
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Annual CTC (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: '28px', fontSize: '1.1rem', fontWeight: 800 }}
                  value={annualCtc}
                  onChange={(e) => setAnnualCtc(Number(e.target.value))}
                  step="10000"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {[360000, 600000, 900000, 1200000, 1800000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`btn-chip ${annualCtc === val ? 'active' : ''}`}
                    onClick={() => setAnnualCtc(val)}
                  >
                    ₹{(val / 100000).toFixed(1)}L
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Pay % */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Basic Salary % of CTC</label>
                <span className="badge badge-admin">{basicPercent}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="60"
                step="5"
                value={basicPercent}
                onChange={(e) => setBasicPercent(Number(e.target.value))}
                className="toolbar-range-slider"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Standard: 40% (₹{(ctcData.earnings.basicPay).toLocaleString('en-IN')}/mo)
              </div>
            </div>

            {/* HRA % */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label className="form-label" style={{ margin: 0 }}>HRA % of Basic</label>
                <span className="badge badge-employee">{hraPercent}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="50"
                step="10"
                value={hraPercent}
                onChange={(e) => setHraPercent(Number(e.target.value))}
                className="toolbar-range-slider"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                50% Metro (Delhi, Mumbai, Kolkata, Chennai) / 40% Non-Metro
              </div>
            </div>

            {/* State for Professional Tax */}
            <div>
              <label className="form-label">Professional Tax State</label>
              <select
                className="form-input"
                value={ptState}
                onChange={(e) => setPtState(e.target.value)}
              >
                {PT_STATES.map((st) => (
                  <option key={st.key} value={st.key}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Statutory Options Toggles */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              fontSize: '0.85rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={restrictPfCap}
                onChange={(e) => setRestrictPfCap(e.target.checked)}
              />
              <span>Cap PF at ₹15,000 Wage Ceiling (₹1,800/mo)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeEmployerPfInCtc}
                onChange={(e) => setIncludeEmployerPfInCtc(e.target.checked)}
              />
              <span>Include Employer PF in CTC</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeGratuityInCtc}
                onChange={(e) => setIncludeGratuityInCtc(e.target.checked)}
              />
              <span>Include Gratuity in CTC (4.81%)</span>
            </label>
          </div>
        </div>

        {/* 1. STRUCTURE VIEW */}
        {viewTab === 'structure' && (
          <div>
            {/* Top Net Take Home Summary Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(6, 182, 212, 0.18))',
                backgroundColor: '#131b2e',
                border: '1px solid rgba(99, 102, 241, 0.45)',
                padding: '1.25rem 1.75rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Estimated Monthly In-Hand Take Home
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-emerald)', lineHeight: 1.1 }}>
                  ₹{(ctcData.netTakeHome - taxData.recommendedMonthlyTds).toLocaleString('en-IN')}
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}> / month</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Annual In-Hand: ₹{((ctcData.netTakeHome - taxData.recommendedMonthlyTds) * 12).toLocaleString('en-IN')} (Post EPF, PT, ESIC & Est. TDS)
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="badge badge-admin" style={{ marginBottom: '0.4rem' }}>
                  Recommended Tax: {taxData.recommendedRegime.toUpperCase()} REGIME
                </div>
                <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>
                  Est. Monthly TDS: ₹{taxData.recommendedMonthlyTds.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* 3-Column Breakdown Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Earnings Column */}
              <div style={{ backgroundColor: '#131b2e', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                  <TrendingUp size={18} />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>Monthly Earnings (Gross)</h3>
                </div>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>Basic Salary</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.earnings.basicPay.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>House Rent Allowance (HRA)</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.earnings.hra.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>Conveyance Allowance</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.earnings.conveyanceAllowance.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>Medical Allowance</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.earnings.medicalAllowance.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>Special Allowance</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.earnings.specialAllowance.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      <td style={{ padding: '0.6rem 0' }}>Total Gross Salary</td>
                      <td style={{ textAlign: 'right' }}>₹{ctcData.earnings.grossEarnings.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deductions Column */}
              <div style={{ backgroundColor: '#131b2e', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f87171' }}>
                  <ShieldCheck size={18} />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>Monthly Deductions</h3>
                </div>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>Employee PF (12%)</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.deductions.pfDeduction.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>
                        ESIC (0.75%) {ctcData.deductions.esicDeduction === 0 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(N/A &gt; ₹21k)</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.deductions.esicDeduction.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>Professional Tax (PT)</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.deductions.professionalTax.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>Est. Income Tax / TDS</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{taxData.recommendedMonthlyTds.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ fontWeight: 800, color: '#f87171' }}>
                      <td style={{ padding: '0.6rem 0' }}>Total Deductions</td>
                      <td style={{ textAlign: 'right' }}>
                        ₹{(ctcData.deductions.totalDeductions + taxData.recommendedMonthlyTds).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Employer Contributions Column */}
              <div style={{ backgroundColor: '#131b2e', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-purple)' }}>
                  <Building size={18} />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>Employer Benefits (CTC Part)</h3>
                </div>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>Employer EPF (3.67% + 8.33% EPS)</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.employerContributions.employerPf.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>Employer ESIC (3.25%)</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.employerContributions.employerEsic.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.4rem 0' }}>Gratuity Provision (4.81%)</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ctcData.employerContributions.gratuity.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style={{ fontWeight: 800, color: 'var(--accent-purple)' }}>
                      <td style={{ padding: '0.6rem 0' }}>Total Employer Benefits</td>
                      <td style={{ textAlign: 'right' }}>₹{ctcData.employerContributions.totalEmployerBenefits.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. TAX COMPARATOR VIEW */}
        {viewTab === 'tax' && (
          <div>
            {/* Tax Exemption Inputs */}
            <div
              style={{
                padding: '1.25rem',
                marginBottom: '1.5rem',
                backgroundColor: '#131b2e',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>
                Old Regime Exemption Declarations (Optional)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">Section 80C (EPF/PPF/ELSS, max ₹1.5L)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={section80C}
                    onChange={(e) => setSection80C(Number(e.target.value))}
                    max="150000"
                  />
                </div>
                <div>
                  <label className="form-label">Section 80D (Health Insurance, max ₹75k)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={section80D}
                    onChange={(e) => setSection80D(Number(e.target.value))}
                    max="75000"
                  />
                </div>
                <div>
                  <label className="form-label">Annual HRA Exemption</label>
                  <input
                    type="number"
                    className="form-input"
                    value={hraExemption}
                    onChange={(e) => setHraExemption(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison Table */}
            <div style={{ padding: '1.5rem', overflowX: 'auto', backgroundColor: '#131b2e', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Income Tax Component</th>
                    <th style={{ padding: '0.75rem', background: taxData.recommendedRegime === 'new' ? 'rgba(99, 102, 241, 0.15)' : 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>New Tax Regime (Default)</span>
                        {taxData.recommendedRegime === 'new' && (
                          <span className="badge badge-admin">RECOMMENDED</span>
                        )}
                      </div>
                    </th>
                    <th style={{ padding: '0.75rem', background: taxData.recommendedRegime === 'old' ? 'rgba(16, 185, 129, 0.15)' : 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Old Tax Regime</span>
                        {taxData.recommendedRegime === 'old' && (
                          <span className="badge badge-employee">RECOMMENDED</span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.6rem 0.75rem' }}>Annual Gross Salary</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>₹{taxData.newRegime.annualGross.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>₹{taxData.oldRegime.annualGross.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.6rem 0.75rem' }}>Standard Deduction</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--accent-emerald)' }}>- ₹{taxData.newRegime.standardDeduction.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--accent-emerald)' }}>- ₹{taxData.oldRegime.standardDeduction.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.6rem 0.75rem' }}>80C + 80D + HRA Exemptions</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>₹0 (Not Applicable)</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--accent-emerald)' }}>
                      - ₹{(taxData.oldRegime.totalDeductions - taxData.oldRegime.standardDeduction).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.6rem 0.75rem' }}>Net Taxable Income</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800 }}>₹{taxData.newRegime.taxableIncome.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800 }}>₹{taxData.oldRegime.taxableIncome.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.6rem 0.75rem' }}>Base Income Tax</td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>₹{taxData.newRegime.baseTax.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>₹{taxData.oldRegime.baseTax.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.6rem 0.75rem' }}>Section 87A Rebate</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--accent-emerald)' }}>
                      {taxData.newRegime.rebate87A > 0 ? `- ₹${taxData.newRegime.rebate87A.toLocaleString('en-IN')}` : '₹0'}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--accent-emerald)' }}>
                      {taxData.oldRegime.rebate87A > 0 ? `- ₹${taxData.oldRegime.rebate87A.toLocaleString('en-IN')}` : '₹0'}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.6rem 0.75rem' }}>Health & Education Cess (4%)</td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>₹{taxData.newRegime.cess.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>₹{taxData.oldRegime.cess.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', fontSize: '1.05rem', fontWeight: 800 }}>
                    <td style={{ padding: '0.75rem' }}>Total Annual Tax Liability</td>
                    <td
                      style={{
                        padding: '0.75rem',
                        color: taxData.recommendedRegime === 'new' ? 'var(--accent-emerald)' : '#f87171',
                      }}
                    >
                      ₹{taxData.newRegime.totalTax.toLocaleString('en-IN')}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        color: taxData.recommendedRegime === 'old' ? 'var(--accent-emerald)' : '#f87171',
                      }}
                    >
                      ₹{taxData.oldRegime.totalTax.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    <td style={{ padding: '0.75rem' }}>Recommended Monthly TDS</td>
                    <td style={{ padding: '0.75rem', color: 'var(--accent-cyan)' }}>
                      ₹{taxData.newRegime.monthlyTds.toLocaleString('en-IN')}/mo
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--accent-cyan)' }}>
                      ₹{taxData.oldRegime.monthlyTds.toLocaleString('en-IN')}/mo
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={handleCopySummary}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {onApplySalary && (
              <button type="button" className="btn btn-primary" onClick={handleApply}>
                <Sparkles size={16} />
                <span>Apply Breakdown to Profile</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
