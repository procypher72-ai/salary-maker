import React from 'react';
import { Sparkles, Check, TrendingUp, ShieldCheck } from 'lucide-react';
import { getRegimeComparison } from '../../../utils/computationTaxCalculator';

export const DeductionsTab = ({ formData, setFormData, recalculateComputation, handleRegimeChange }) => {
  const structDed = formData.structuredDeductions || {};
  const regimeComp = getRegimeComparison(formData);

  const handleStructuredDeductionChange = (key, val) => {
    const num = Number(val) || 0;
    const newStructured = { ...structDed, [key]: num };

    // Auto update Chapter VI-A rows
    const rows = [];
    if (newStructured.sec80C > 0) {
      const allowed = Math.min(newStructured.sec80C, 150000);
      rows.push({ section: '80C', description: 'Life Insurance, PPF, EPF, ELSS, Tuition Fees', grossAmount: newStructured.sec80C, deductibleAmount: allowed });
    }
    if (newStructured.sec80CCC > 0) {
      rows.push({ section: '80CCC', description: 'Contribution to Pension Fund', grossAmount: newStructured.sec80CCC, deductibleAmount: newStructured.sec80CCC });
    }
    if (newStructured.sec80CCD1B > 0) {
      const allowed = Math.min(newStructured.sec80CCD1B, 50000);
      rows.push({ section: '80CCD(1B)', description: 'National Pension Scheme (NPS Extra)', grossAmount: newStructured.sec80CCD1B, deductibleAmount: allowed });
    }
    if (newStructured.sec80CCD2 > 0) {
      rows.push({ section: '80CCD(2)', description: 'Employer Contribution to NPS (Eligible in both New & Old)', grossAmount: newStructured.sec80CCD2, deductibleAmount: newStructured.sec80CCD2 });
    }
    if (newStructured.sec80D > 0) {
      rows.push({ section: '80D', description: 'Medical Insurance Premium (Self / Parents)', grossAmount: newStructured.sec80D, deductibleAmount: newStructured.sec80D });
    }
    if (newStructured.sec80E > 0) {
      rows.push({ section: '80E', description: 'Interest on higher education loan', grossAmount: newStructured.sec80E, deductibleAmount: newStructured.sec80E });
    }
    if (newStructured.sec80G > 0) {
      rows.push({ section: '80G', description: 'Donations to eligible charitable institutions', grossAmount: newStructured.sec80G, deductibleAmount: newStructured.sec80G });
    }
    if (newStructured.sec80TTA > 0) {
      const allowed = Math.min(newStructured.sec80TTA, 10000);
      rows.push({ section: '80TTA', description: 'Interest on savings account deposits', grossAmount: newStructured.sec80TTA, deductibleAmount: allowed });
    }
    if (newStructured.sec80TTB > 0) {
      const allowed = Math.min(newStructured.sec80TTB, 50000);
      rows.push({ section: '80TTB', description: 'Interest on deposits (Senior Citizens)', grossAmount: newStructured.sec80TTB, deductibleAmount: allowed });
    }

    const updated = recalculateComputation({
      ...formData,
      structuredDeductions: newStructured,
      deductionsChapterVIA: rows,
    });
    setFormData(updated);
  };

  return (
    <div>
      {/* Live Side-by-Side Regime Comparison & Optimizer */}
      <div className="regime-comparison-card">
        <div className={`regime-savings-banner ${regimeComp.recommended === 'old' ? 'old-wins' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} style={{ color: regimeComp.recommended === 'new_115bac' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>
                {regimeComp.recommended === 'new_115bac'
                  ? `New Regime (115BAC) is more beneficial! Saves ₹${regimeComp.savings.toLocaleString('en-IN')} in taxes`
                  : regimeComp.recommended === 'old'
                  ? `Old Regime is more beneficial! Saves ₹${regimeComp.savings.toLocaleString('en-IN')} in taxes`
                  : 'Both Old & New Regimes yield the exact same tax liability.'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Standard Deduction: New Regime ₹{formData.headsOfIncome?.salary?.standardDeduction?.toLocaleString('en-IN') || '75,000'} vs Old Regime ₹50,000
              </div>
            </div>
          </div>

          {formData.regime !== regimeComp.recommended && regimeComp.recommended !== 'equal' && (
            <button
              type="button"
              onClick={() => handleRegimeChange(regimeComp.recommended)}
              className="btn btn-primary btn-sm"
              style={{ background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)', color: '#000', fontWeight: 700 }}
            >
              <Check size={14} />
              <span>Switch to {regimeComp.recommended === 'new_115bac' ? 'New (115BAC)' : 'Old Regime'}</span>
            </button>
          )}
        </div>

        <div className="regime-comparison-grid">
          {/* New Regime Column */}
          <div className={`regime-col ${formData.regime === 'new_115bac' ? 'is-active' : ''} ${regimeComp.recommended === 'new_115bac' ? 'is-recommended' : ''}`}>
            <div className="regime-col-header">
              <div className="regime-col-title">
                <TrendingUp size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span>New Regime (u/s 115BAC)</span>
              </div>
              {formData.regime === 'new_115bac' && (
                <span className="badge badge-admin" style={{ fontSize: '0.65rem' }}>Active Selection</span>
              )}
            </div>

            <div className="regime-metric-row">
              <span>Gross Total Income</span>
              <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>₹{Number(regimeComp.newRegimeData.grossTotalIncome || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="regime-metric-row">
              <span>Standard Deduction</span>
              <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>-₹{Number(regimeComp.newRegimeData.headsOfIncome?.salary?.standardDeduction || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="regime-metric-row">
              <span>Chapter VI-A Deductions</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>₹{Number(regimeComp.newRegimeData.totalDeductionsChapterVIA || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="regime-metric-row">
              <span>Taxable Income (288A)</span>
              <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>₹{Number(regimeComp.newRegimeData.roundedTotalIncome || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="regime-metric-row">
              <span>Tax Rebate u/s 87A</span>
              <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>-₹{Number(regimeComp.newRegimeData.taxCalculation?.rebate87A || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="regime-metric-row total">
              <span>Net Tax Liability</span>
              <span style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>₹{Number(regimeComp.newTaxPayable).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Old Regime Column */}
          <div className={`regime-col ${formData.regime === 'old' ? 'is-active' : ''} ${regimeComp.recommended === 'old' ? 'is-recommended' : ''}`}>
            <div className="regime-col-header">
              <div className="regime-col-title">
                <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                <span>Old Tax Regime</span>
              </div>
              {formData.regime === 'old' && (
                <span className="badge badge-manager" style={{ fontSize: '0.65rem' }}>Active Selection</span>
              )}
            </div>

            <div className="regime-metric-row">
              <span>Gross Total Income</span>
              <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>₹{Number(regimeComp.oldRegimeData.grossTotalIncome || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="regime-metric-row">
              <span>Standard Deduction</span>
              <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>-₹{Number(regimeComp.oldRegimeData.headsOfIncome?.salary?.standardDeduction || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="regime-metric-row">
              <span>Chapter VI-A Deductions</span>
              <span style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>-₹{Number(regimeComp.oldRegimeData.totalDeductionsChapterVIA || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="regime-metric-row">
              <span>Taxable Income (288A)</span>
              <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>₹{Number(regimeComp.oldRegimeData.roundedTotalIncome || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="regime-metric-row">
              <span>Tax Rebate u/s 87A</span>
              <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>-₹{Number(regimeComp.oldRegimeData.taxCalculation?.rebate87A || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="regime-metric-row total">
              <span>Net Tax Liability</span>
              <span style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>₹{Number(regimeComp.oldTaxPayable).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter VI-A Deductions Form */}
      <div className="form-section-card">
        <div className="form-section-title">
          <span>Chapter VI-A Deductions Slabs</span>
          <span className="badge badge-employee">
            Total Claimed: ₹{Number(formData.totalDeductionsChapterVIA || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Section 80C (PPF, EPF, LIC, ELSS - Max ₹1.5L)</label>
            <input
              type="number"
              placeholder="0"
              value={structDed.sec80C || ''}
              onChange={(e) => handleStructuredDeductionChange('sec80C', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Section 80CCD(1B) (NPS Extra - Max ₹50k)</label>
            <input
              type="number"
              placeholder="0"
              value={structDed.sec80CCD1B || ''}
              onChange={(e) => handleStructuredDeductionChange('sec80CCD1B', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Section 80CCD(2) (Employer NPS - Both Regimes)</label>
            <input
              type="number"
              placeholder="0"
              value={structDed.sec80CCD2 || ''}
              onChange={(e) => handleStructuredDeductionChange('sec80CCD2', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Section 80D (Health Insurance Premium)</label>
            <input
              type="number"
              placeholder="0"
              value={structDed.sec80D || ''}
              onChange={(e) => handleStructuredDeductionChange('sec80D', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Section 80E (Higher Education Loan Interest)</label>
            <input
              type="number"
              placeholder="0"
              value={structDed.sec80E || ''}
              onChange={(e) => handleStructuredDeductionChange('sec80E', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Section 80G (Charitable Donations)</label>
            <input
              type="number"
              placeholder="0"
              value={structDed.sec80G || ''}
              onChange={(e) => handleStructuredDeductionChange('sec80G', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Section 80TTA (Savings Interest - Max ₹10k)</label>
            <input
              type="number"
              placeholder="0"
              value={structDed.sec80TTA || ''}
              onChange={(e) => handleStructuredDeductionChange('sec80TTA', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Section 80TTB (Senior Citizens Interest - Max ₹50k)</label>
            <input
              type="number"
              placeholder="0"
              value={structDed.sec80TTB || ''}
              onChange={(e) => handleStructuredDeductionChange('sec80TTB', e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
