import React, { useState, useMemo } from 'react';
import {
  BadgePercent,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  calculateTaxOnNormalIncome,
  getStandardDeduction,
  getBasicExemptionLimit,
  calculateRebate87A,
} from '../utils/computationTaxCalculator';

// ─── Constants ────────────────────────────────────────────────────────────────

const FINANCIAL_YEARS = [
  { label: 'FY 2026-27 (AY 2027-28)', value: '2026-2027' },
  { label: 'FY 2025-26 (AY 2026-27)', value: '2025-2026' },
  { label: 'FY 2024-25 (AY 2025-26)', value: '2024-2025' },
  { label: 'FY 2023-24 (AY 2024-25)', value: '2023-2024' },
];

const AGE_CATEGORIES = [
  { label: 'Below 60 years (General)', value: 30 },
  { label: '60–79 years (Senior Citizen)', value: 65 },
  { label: '80+ years (Super Senior Citizen)', value: 82 },
];

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const pct = (n) => `${Number(n || 0).toFixed(2)}%`;

// ─── Tax Calculation Logic ─────────────────────────────────────────────────────

function computeSurcharge(baseTax, totalIncome) {
  const income = Number(totalIncome) || 0;
  let rate = 0;
  if (income > 50000000) rate = 0.37; // > 5 Cr
  else if (income > 20000000) rate = 0.25; // > 2 Cr
  else if (income > 10000000) rate = 0.15; // > 1 Cr
  else if (income > 5000000) rate = 0.10;  // > 50 L
  return Math.round(baseTax * rate);
}

function getNewRegimeSlabs(fy) {
  if (fy === '2025-2026' || fy === '2026-2027') {
    return [
      { from: 0, to: 400000, rate: 0, label: '₹0 – ₹4,00,000' },
      { from: 400000, to: 800000, rate: 5, label: '₹4,00,001 – ₹8,00,000' },
      { from: 800000, to: 1200000, rate: 10, label: '₹8,00,001 – ₹12,00,000' },
      { from: 1200000, to: 1600000, rate: 15, label: '₹12,00,001 – ₹16,00,000' },
      { from: 1600000, to: 2000000, rate: 20, label: '₹16,00,001 – ₹20,00,000' },
      { from: 2000000, to: Infinity, rate: 30, label: 'Above ₹20,00,000' },
    ];
  }
  if (fy === '2024-2025') {
    return [
      { from: 0, to: 300000, rate: 0, label: '₹0 – ₹3,00,000' },
      { from: 300000, to: 700000, rate: 5, label: '₹3,00,001 – ₹7,00,000' },
      { from: 700000, to: 1000000, rate: 10, label: '₹7,00,001 – ₹10,00,000' },
      { from: 1000000, to: 1200000, rate: 15, label: '₹10,00,001 – ₹12,00,000' },
      { from: 1200000, to: 1500000, rate: 20, label: '₹12,00,001 – ₹15,00,000' },
      { from: 1500000, to: Infinity, rate: 30, label: 'Above ₹15,00,000' },
    ];
  }
  // FY 2023-24
  return [
    { from: 0, to: 300000, rate: 0, label: '₹0 – ₹3,00,000' },
    { from: 300000, to: 600000, rate: 5, label: '₹3,00,001 – ₹6,00,000' },
    { from: 600000, to: 900000, rate: 10, label: '₹6,00,001 – ₹9,00,000' },
    { from: 900000, to: 1200000, rate: 15, label: '₹9,00,001 – ₹12,00,000' },
    { from: 1200000, to: 1500000, rate: 20, label: '₹12,00,001 – ₹15,00,000' },
    { from: 1500000, to: Infinity, rate: 30, label: 'Above ₹15,00,000' },
  ];
}

function getOldRegimeSlabs(age) {
  const exemption = age >= 80 ? 500000 : age >= 60 ? 300000 : 250000;
  return [
    { from: 0, to: exemption, rate: 0, label: `₹0 – ${fmt(exemption)}` },
    { from: exemption, to: 500000, rate: 5, label: `${fmt(exemption + 1)} – ₹5,00,000` },
    { from: 500000, to: 1000000, rate: 20, label: '₹5,00,001 – ₹10,00,000' },
    { from: 1000000, to: Infinity, rate: 30, label: 'Above ₹10,00,000' },
  ];
}

function computeSlabBreakdown(taxableIncome, slabs) {
  const income = Math.max(0, Number(taxableIncome) || 0);
  const rows = [];
  slabs.forEach((slab) => {
    if (income <= slab.from) return;
    const taxableInSlab = Math.min(income, slab.to === Infinity ? income : slab.to) - slab.from;
    if (taxableInSlab <= 0) return;
    rows.push({
      label: slab.label,
      rate: slab.rate,
      taxableAmount: taxableInSlab,
      tax: Math.round(taxableInSlab * slab.rate / 100),
    });
  });
  return rows;
}

function computeFullTax({ grossIncome, otherIncome, regime, fy, age, deductions }) {
  const totalGross = (Number(grossIncome) || 0) + (Number(otherIncome) || 0);
  const stdDed = getStandardDeduction(regime, fy);

  let totalDeductions = stdDed;
  if (regime === 'old') {
    const c80C = Math.min(Number(deductions.d80C) || 0, 150000);
    const c80D = Math.min(Number(deductions.d80D) || 0, 75000);
    const hra = Math.max(0, Number(deductions.hra) || 0);
    const c80TTA = Math.min(Number(deductions.d80TTA) || 0, 10000);
    const nps = Math.min(Number(deductions.nps) || 0, 50000);
    const other = Math.max(0, Number(deductions.other) || 0);
    totalDeductions = stdDed + c80C + c80D + hra + c80TTA + nps + other;
  }

  const taxableIncome = Math.max(0, totalGross - totalDeductions);
  const baseTax = calculateTaxOnNormalIncome(taxableIncome, regime, fy, age);
  const rebate = calculateRebate87A(taxableIncome, baseTax, regime, fy);
  const taxAfterRebate = Math.max(0, baseTax - rebate);
  const surcharge = computeSurcharge(taxAfterRebate, taxableIncome);
  const cess = Math.round((taxAfterRebate + surcharge) * 0.04);
  const totalTax = taxAfterRebate + surcharge + cess;
  const monthlyTds = Math.round(totalTax / 12);
  const effectiveRate = totalGross > 0 ? ((totalTax / totalGross) * 100).toFixed(2) : '0.00';

  const slabs = regime === 'new_115bac' ? getNewRegimeSlabs(fy) : getOldRegimeSlabs(age);
  const slabBreakdown = computeSlabBreakdown(taxableIncome, slabs);

  return {
    totalGross,
    stdDed,
    totalDeductions,
    taxableIncome,
    baseTax,
    rebate,
    taxAfterRebate,
    surcharge,
    cess,
    totalTax,
    monthlyTds,
    effectiveRate,
    slabBreakdown,
  };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const InputGroup = ({ label, id, value, onChange, max, placeholder, hint, prefix = '₹' }) => (
  <div className="itc-input-group">
    <label htmlFor={id} className="itc-label">
      {label}
      {max && <span className="itc-label-cap">Max: {fmt(max)}</span>}
    </label>
    <div className="itc-input-wrap">
      <span className="itc-input-prefix">{prefix}</span>
      <input
        id={id}
        type="number"
        min="0"
        max={max || undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '0'}
        className="itc-input"
      />
    </div>
    {hint && <p className="itc-hint">{hint}</p>}
  </div>
);

const ResultRow = ({ label, value, highlight, muted, bold }) => (
  <div className={`itc-result-row ${highlight ? 'itc-result-row--highlight' : ''} ${muted ? 'itc-result-row--muted' : ''} ${bold ? 'itc-result-row--bold' : ''}`}>
    <span className="itc-result-label">{label}</span>
    <span className="itc-result-value">{value}</span>
  </div>
);

const SlabTable = ({ rows, regime }) => (
  <div className="itc-slab-table-wrap">
    <table className="itc-slab-table">
      <thead>
        <tr>
          <th>Income Slab</th>
          <th>Rate</th>
          <th>Taxable Amount</th>
          <th>Tax</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={4} style={{ textAlign: 'center', color: 'var(--accent-emerald)', padding: '1rem' }}>
              ✅ No tax on any slab
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={i}>
              <td>{row.label}</td>
              <td>
                <span className={`itc-rate-badge itc-rate-${row.rate}`}>{row.rate}%</span>
              </td>
              <td>{fmt(row.taxableAmount)}</td>
              <td className={row.tax > 0 ? 'itc-slab-tax' : 'itc-slab-nil'}>{fmt(row.tax)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export const IncomeTaxCalculator = () => {
  // Inputs
  const [fy, setFy] = useState('2025-2026');
  const [ageValue, setAgeValue] = useState(30);
  const [grossIncome, setGrossIncome] = useState('');
  const [otherIncome, setOtherIncome] = useState('');

  // Deductions (Old Regime)
  const [d80C, setD80C] = useState('150000');
  const [d80D, setD80D] = useState('25000');
  const [hra, setHra] = useState('');
  const [d80TTA, setD80TTA] = useState('');
  const [nps, setNps] = useState('');
  const [dOther, setDOther] = useState('');

  const [activeView, setActiveView] = useState('new_115bac'); // 'new_115bac' | 'old' | 'compare'

  const deductions = { d80C, d80D, hra, d80TTA, nps, other: dOther };

  // Compute for both regimes
  const newResult = useMemo(() => computeFullTax({
    grossIncome, otherIncome, regime: 'new_115bac', fy, age: Number(ageValue), deductions,
  }), [grossIncome, otherIncome, fy, ageValue]);

  const oldResult = useMemo(() => computeFullTax({
    grossIncome, otherIncome, regime: 'old', fy, age: Number(ageValue), deductions,
  }), [grossIncome, otherIncome, fy, ageValue, d80C, d80D, hra, d80TTA, nps, dOther]);

  const recommended = newResult.totalTax <= oldResult.totalTax ? 'new_115bac' : 'old';
  const savings = Math.abs(newResult.totalTax - oldResult.totalTax);

  const displayResult = activeView === 'compare' ? null : (activeView === 'new_115bac' ? newResult : oldResult);

  const handleReset = () => {
    setGrossIncome('');
    setOtherIncome('');
    setD80C('150000');
    setD80D('25000');
    setHra('');
    setD80TTA('');
    setNps('');
    setDOther('');
  };

  const fyLabel = FINANCIAL_YEARS.find((f) => f.value === fy)?.label || fy;

  return (
    <div className="itc-page">
      {/* Page Header */}
      <div className="itc-header">
        <div className="itc-header-icon">
          <BadgePercent size={28} />
        </div>
        <div>
          <h1 className="itc-title">Income Tax Calculator</h1>
          <p className="itc-subtitle">
            Compute your exact tax liability under Old & New Regime as per Government of India rules.
          </p>
        </div>
      </div>

      <div className="itc-layout">
        {/* ── LEFT PANEL: Inputs ── */}
        <aside className="itc-panel itc-panel--inputs glass-panel">
          {/* FY & Age Controls */}
          <div className="itc-section">
            <h2 className="itc-section-title">
              <Layers size={16} /> Assessment Details
            </h2>

            <div className="itc-input-group">
              <label htmlFor="itc-fy" className="itc-label">Financial Year</label>
              <div className="itc-select-wrap">
                <select
                  id="itc-fy"
                  value={fy}
                  onChange={(e) => setFy(e.target.value)}
                  className="itc-select"
                >
                  {FINANCIAL_YEARS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="itc-select-arrow" />
              </div>
            </div>

            <div className="itc-input-group">
              <label htmlFor="itc-age" className="itc-label">Taxpayer Age Category</label>
              <div className="itc-select-wrap">
                <select
                  id="itc-age"
                  value={ageValue}
                  onChange={(e) => setAgeValue(Number(e.target.value))}
                  className="itc-select"
                >
                  {AGE_CATEGORIES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="itc-select-arrow" />
              </div>
            </div>
          </div>

          {/* Income Inputs */}
          <div className="itc-section">
            <h2 className="itc-section-title">
              <IndianRupee size={16} /> Income Details
            </h2>
            <InputGroup
              label="Annual Gross Salary / Income"
              id="itc-gross"
              value={grossIncome}
              onChange={setGrossIncome}
              placeholder="e.g. 1200000"
              hint="Total CTC or annual income before any deductions"
            />
            <InputGroup
              label="Other Income"
              id="itc-other-income"
              value={otherIncome}
              onChange={setOtherIncome}
              placeholder="0"
              hint="Interest income, rental income, freelance earnings, etc."
            />
          </div>

          {/* Deductions — Old Regime only */}
          <div className="itc-section">
            <h2 className="itc-section-title">
              <ShieldCheck size={16} /> Deductions (Old Regime)
              <span className="itc-section-badge">Not applicable to New Regime</span>
            </h2>

            <InputGroup label="Section 80C" id="itc-80c" value={d80C} onChange={setD80C} max={150000}
              hint="PF, ELSS, LIC, PPF, home loan principal, tuition fees, etc." />
            <InputGroup label="Section 80D (Health Insurance)" id="itc-80d" value={d80D} onChange={setD80D} max={75000}
              hint="Your own + family premium (max ₹25K) + parents (max ₹50K if senior)" />
            <InputGroup label="HRA Exemption" id="itc-hra" value={hra} onChange={setHra}
              hint="House Rent Allowance exemption (u/s 10(13A))" />
            <InputGroup label="Section 80TTA (Savings Interest)" id="itc-80tta" value={d80TTA} onChange={setD80TTA} max={10000}
              hint="Interest on savings bank account (max ₹10,000)" />
            <InputGroup label="NPS — Section 80CCD(1B)" id="itc-nps" value={nps} onChange={setNps} max={50000}
              hint="Additional NPS contribution over 80C limit (max ₹50,000)" />
            <InputGroup label="Other Deductions" id="itc-other-ded" value={dOther} onChange={setDOther}
              hint="80G donations, 80E education loan interest, 80TTA, etc." />
          </div>

          <button onClick={handleReset} className="btn btn-secondary itc-reset-btn" id="itc-reset-btn">
            <RefreshCw size={14} />
            Reset All
          </button>
        </aside>

        {/* ── RIGHT PANEL: Results ── */}
        <section className="itc-panel itc-panel--results">
          {/* Regime Selector Tabs */}
          <div className="itc-view-tabs">
            <button
              id="itc-tab-new"
              className={`itc-view-tab ${activeView === 'new_115bac' ? 'active' : ''}`}
              onClick={() => setActiveView('new_115bac')}
            >
              <Zap size={14} /> New Regime
            </button>
            <button
              id="itc-tab-old"
              className={`itc-view-tab ${activeView === 'old' ? 'active' : ''}`}
              onClick={() => setActiveView('old')}
            >
              <ShieldCheck size={14} /> Old Regime
            </button>
            <button
              id="itc-tab-compare"
              className={`itc-view-tab ${activeView === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveView('compare')}
            >
              <Layers size={14} /> Compare
            </button>
          </div>

          {/* ── COMPARE VIEW ── */}
          {activeView === 'compare' && (
            <div className="itc-compare-grid">
              {/* Recommendation Banner */}
              <div className={`itc-recommend-banner itc-recommend--${recommended}`}>
                {recommended === 'new_115bac' ? <Zap size={18} /> : <ShieldCheck size={18} />}
                <div>
                  <strong>{recommended === 'new_115bac' ? 'New Regime' : 'Old Regime'} is better for you</strong>
                  <span> — saves {fmt(savings)} in tax for {fyLabel}</span>
                </div>
                <span className="itc-recommended-badge">✓ Recommended</span>
              </div>

              <div className="itc-compare-cards">
                {/* New Regime Card */}
                <div className={`itc-compare-card glass-panel ${recommended === 'new_115bac' ? 'itc-compare-card--winner' : ''}`}>
                  <div className="itc-compare-card-header">
                    <Zap size={16} />
                    <span>New Regime (115BAC)</span>
                    {recommended === 'new_115bac' && <span className="itc-winner-tag">Best</span>}
                  </div>
                  <div className="itc-compare-stat">
                    <span>Taxable Income</span>
                    <strong>{fmt(newResult.taxableIncome)}</strong>
                  </div>
                  <div className="itc-compare-stat">
                    <span>Standard Deduction</span>
                    <strong>{fmt(newResult.stdDed)}</strong>
                  </div>
                  <div className="itc-compare-stat">
                    <span>Base Tax</span>
                    <strong>{fmt(newResult.baseTax)}</strong>
                  </div>
                  {newResult.rebate > 0 && (
                    <div className="itc-compare-stat itc-compare-stat--green">
                      <span>Rebate u/s 87A</span>
                      <strong>- {fmt(newResult.rebate)}</strong>
                    </div>
                  )}
                  {newResult.surcharge > 0 && (
                    <div className="itc-compare-stat">
                      <span>Surcharge</span>
                      <strong>{fmt(newResult.surcharge)}</strong>
                    </div>
                  )}
                  <div className="itc-compare-stat">
                    <span>Health & Education Cess (4%)</span>
                    <strong>{fmt(newResult.cess)}</strong>
                  </div>
                  <div className="itc-compare-total">
                    <span>Total Tax</span>
                    <strong className={newResult.totalTax === 0 ? 'text-emerald' : ''}>{fmt(newResult.totalTax)}</strong>
                  </div>
                  <div className="itc-compare-meta">
                    <span>Effective Rate: <b>{pct(newResult.effectiveRate)}</b></span>
                    <span>Monthly TDS: <b>{fmt(newResult.monthlyTds)}</b></span>
                  </div>
                </div>

                {/* Old Regime Card */}
                <div className={`itc-compare-card glass-panel ${recommended === 'old' ? 'itc-compare-card--winner' : ''}`}>
                  <div className="itc-compare-card-header">
                    <ShieldCheck size={16} />
                    <span>Old Regime</span>
                    {recommended === 'old' && <span className="itc-winner-tag">Best</span>}
                  </div>
                  <div className="itc-compare-stat">
                    <span>Taxable Income</span>
                    <strong>{fmt(oldResult.taxableIncome)}</strong>
                  </div>
                  <div className="itc-compare-stat">
                    <span>Total Deductions</span>
                    <strong>- {fmt(oldResult.totalDeductions)}</strong>
                  </div>
                  <div className="itc-compare-stat">
                    <span>Base Tax</span>
                    <strong>{fmt(oldResult.baseTax)}</strong>
                  </div>
                  {oldResult.rebate > 0 && (
                    <div className="itc-compare-stat itc-compare-stat--green">
                      <span>Rebate u/s 87A</span>
                      <strong>- {fmt(oldResult.rebate)}</strong>
                    </div>
                  )}
                  {oldResult.surcharge > 0 && (
                    <div className="itc-compare-stat">
                      <span>Surcharge</span>
                      <strong>{fmt(oldResult.surcharge)}</strong>
                    </div>
                  )}
                  <div className="itc-compare-stat">
                    <span>Health & Education Cess (4%)</span>
                    <strong>{fmt(oldResult.cess)}</strong>
                  </div>
                  <div className="itc-compare-total">
                    <span>Total Tax</span>
                    <strong className={oldResult.totalTax === 0 ? 'text-emerald' : ''}>{fmt(oldResult.totalTax)}</strong>
                  </div>
                  <div className="itc-compare-meta">
                    <span>Effective Rate: <b>{pct(oldResult.effectiveRate)}</b></span>
                    <span>Monthly TDS: <b>{fmt(oldResult.monthlyTds)}</b></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SINGLE REGIME VIEW ── */}
          {activeView !== 'compare' && displayResult && (
            <div className="itc-result-panel">
              {/* Summary KPI Cards */}
              <div className="itc-kpi-row">
                <div className="itc-kpi glass-panel">
                  <div className="itc-kpi-label">Gross Income</div>
                  <div className="itc-kpi-value">{fmt(displayResult.totalGross)}</div>
                </div>
                <div className="itc-kpi glass-panel">
                  <div className="itc-kpi-label">Total Deductions</div>
                  <div className="itc-kpi-value text-cyan">- {fmt(displayResult.totalDeductions)}</div>
                </div>
                <div className="itc-kpi glass-panel">
                  <div className="itc-kpi-label">Taxable Income</div>
                  <div className="itc-kpi-value text-amber">{fmt(displayResult.taxableIncome)}</div>
                </div>
                <div className={`itc-kpi glass-panel ${displayResult.totalTax === 0 ? 'itc-kpi--zero' : 'itc-kpi--tax'}`}>
                  <div className="itc-kpi-label">Total Tax Payable</div>
                  <div className={`itc-kpi-value ${displayResult.totalTax === 0 ? 'text-emerald' : 'text-rose'}`}>
                    {fmt(displayResult.totalTax)}
                  </div>
                </div>
              </div>

              {/* Tax Breakdown */}
              <div className="itc-breakdown-card glass-panel">
                <h3 className="itc-breakdown-title">Tax Computation Breakdown</h3>

                <div className="itc-result-rows">
                  <ResultRow label="Gross Annual Income" value={fmt(displayResult.totalGross)} />
                  <ResultRow label={`Standard Deduction (u/s 16)`} value={`- ${fmt(displayResult.stdDed)}`} muted />
                  {activeView === 'old' && (
                    <>
                      <ResultRow label="80C (PF, ELSS, LIC, PPF…)" value={`- ${fmt(Math.min(Number(d80C) || 0, 150000))}`} muted />
                      <ResultRow label="80D (Health Insurance)" value={`- ${fmt(Math.min(Number(d80D) || 0, 75000))}`} muted />
                      {Number(hra) > 0 && <ResultRow label="HRA Exemption u/s 10(13A)" value={`- ${fmt(hra)}`} muted />}
                      {Number(d80TTA) > 0 && <ResultRow label="80TTA (Savings Interest)" value={`- ${fmt(Math.min(Number(d80TTA), 10000))}`} muted />}
                      {Number(nps) > 0 && <ResultRow label="80CCD(1B) NPS" value={`- ${fmt(Math.min(Number(nps), 50000))}`} muted />}
                      {Number(dOther) > 0 && <ResultRow label="Other Deductions" value={`- ${fmt(dOther)}`} muted />}
                    </>
                  )}
                  <ResultRow label="Net Taxable Income" value={fmt(displayResult.taxableIncome)} bold highlight />
                  <ResultRow label="Income Tax (before rebate)" value={fmt(displayResult.baseTax)} />
                  {displayResult.rebate > 0 && (
                    <ResultRow label="Rebate u/s 87A" value={`- ${fmt(displayResult.rebate)}`} muted />
                  )}
                  <ResultRow label="Tax after Rebate" value={fmt(displayResult.taxAfterRebate)} />
                  {displayResult.surcharge > 0 && (
                    <ResultRow label="Surcharge" value={fmt(displayResult.surcharge)} />
                  )}
                  <ResultRow label="Health & Education Cess @ 4%" value={fmt(displayResult.cess)} />
                  <ResultRow label="Total Tax Payable" value={fmt(displayResult.totalTax)} bold highlight />
                  <ResultRow label="Effective Tax Rate" value={pct(displayResult.effectiveRate)} />
                  <ResultRow label="Monthly TDS" value={fmt(displayResult.monthlyTds)} />
                </div>
              </div>

              {/* Slab-wise Breakdown */}
              <div className="itc-slab-card glass-panel">
                <h3 className="itc-breakdown-title">
                  Slab-wise Tax Breakdown
                  <span className="itc-fy-badge">{fyLabel}</span>
                </h3>
                <SlabTable rows={displayResult.slabBreakdown} regime={activeView} />
              </div>

              {/* Info Note */}
              <div className="itc-info-note">
                <Info size={14} />
                <span>
                  Calculations are based on official Government of India Income Tax slabs for {fyLabel}.
                  Surcharge applies on incomes above ₹50 lakh. Marginal relief is applied automatically.
                </span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!displayResult && activeView !== 'compare' && (
            <div className="itc-empty-state">
              <BadgePercent size={48} style={{ opacity: 0.3 }} />
              <p>Enter your income details to see the tax computation.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default IncomeTaxCalculator;
