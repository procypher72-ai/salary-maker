import React from 'react';

export const HousePropertyTab = ({ formData, setFormData, recalculateComputation }) => {
  const currentHp = formData.headsOfIncome?.houseProperty || {};

  const handleHpChange = (field, value) => {
    const updated = recalculateComputation({
      ...formData,
      headsOfIncome: {
        ...formData.headsOfIncome,
        houseProperty: {
          ...currentHp,
          [field]: value,
        },
      },
    });
    setFormData(updated);
  };

  return (
    <div>
      {/* Property Type Pills */}
      <div className="zenit-pill-tabs">
        <button
          type="button"
          onClick={() => handleHpChange('propertyType', 'let_out')}
          className={`zenit-pill-btn ${currentHp.propertyType === 'let_out' ? 'active' : ''}`}
        >
          Let Out
        </button>
        <button
          type="button"
          onClick={() => handleHpChange('propertyType', 'self_occupied')}
          className={`zenit-pill-btn ${currentHp.propertyType === 'self_occupied' ? 'active' : ''}`}
        >
          Self Occupied Property
        </button>
        <button
          type="button"
          onClick={() => handleHpChange('propertyType', 'deemed_let_out')}
          className={`zenit-pill-btn ${currentHp.propertyType === 'deemed_let_out' ? 'active' : ''}`}
        >
          Deemed Let Out
        </button>
      </div>

      {/* Section: Address of Property */}
      <div className="form-section-card">
        <div className="form-section-title">
          <span>Address of Property</span>
        </div>
        <div className="form-grid-3">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Address</label>
            <input
              type="text"
              value={currentHp.address || ''}
              onChange={(e) => handleHpChange('address', e.target.value)}
              placeholder="House No, Street, Landmark"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              value={currentHp.city || ''}
              onChange={(e) => handleHpChange('city', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input
              type="text"
              value={currentHp.state || 'HARYANA'}
              onChange={(e) => handleHpChange('state', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Pin Code</label>
            <input
              type="text"
              value={currentHp.pin || ''}
              onChange={(e) => handleHpChange('pin', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Owner of Property</label>
            <select
              value={currentHp.ownerOfProperty || 'Self'}
              onChange={(e) => handleHpChange('ownerOfProperty', e.target.value)}
              className="form-select"
            >
              <option value="Self">Self</option>
              <option value="Co-Owner">Co-Owner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Tenant Detail & Ownership */}
      <div className="form-section-card">
        <div className="form-section-title">
          <span>Tenant Detail & Assessee Ownership</span>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Tenant Name</label>
            <input
              type="text"
              value={currentHp.tenantName || ''}
              onChange={(e) => handleHpChange('tenantName', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tenant PAN</label>
            <input
              type="text"
              value={currentHp.tenantPan || ''}
              onChange={(e) => handleHpChange('tenantPan', e.target.value.toUpperCase())}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">% of Ownership</label>
            <input
              type="number"
              value={currentHp.ownershipShare || 100}
              onChange={(e) => handleHpChange('ownershipShare', Number(e.target.value) || 100)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}
            />
          </div>
        </div>
      </div>

      {/* Section: Annual Value & Deductions Grid */}
      <div className="zenit-dual-column-grid">
        <div className="form-section-card">
          <div className="form-section-title">
            <span>Annual Value Calculation</span>
          </div>
          <div className="zenit-field-row">
            <span className="zenit-field-label">Rent Received (Annual)</span>
            <input
              type="number"
              value={currentHp.rentReceived || ''}
              onChange={(e) => handleHpChange('rentReceived', e.target.value)}
              placeholder="0"
              className="zenit-input-box"
            />
          </div>
          <div className="zenit-field-row">
            <span className="zenit-field-label">Municipal Valuation</span>
            <input
              type="number"
              value={currentHp.municipalValuation || ''}
              onChange={(e) => handleHpChange('municipalValuation', e.target.value)}
              placeholder="0"
              className="zenit-input-box"
            />
          </div>
          <div className="zenit-field-row">
            <span className="zenit-field-label">Municipal Taxes Paid</span>
            <input
              type="number"
              value={currentHp.municipalTaxes || ''}
              onChange={(e) => handleHpChange('municipalTaxes', e.target.value)}
              placeholder="0"
              className="zenit-input-box"
            />
          </div>
          <div className="zenit-field-row" style={{ fontWeight: 700 }}>
            <span className="zenit-field-label"><strong>Net Annual Value (NAV)</strong></span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              ₹{Number(currentHp.annualValue || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="form-section-card">
          <div className="form-section-title">
            <span>Deductions u/s 24</span>
          </div>
          <div className="zenit-field-row">
            <span className="zenit-field-label">Standard Deduction (30% of NAV)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              ₹{Number(currentHp.standardDeduction30 || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="zenit-field-row">
            <span className="zenit-field-label">Interest on Housing Loan</span>
            <input
              type="number"
              value={currentHp.currentYearInterest || currentHp.interestOnHousingLoan || ''}
              onChange={(e) => handleHpChange('currentYearInterest', e.target.value)}
              placeholder="0"
              className="zenit-input-box"
            />
          </div>
          <div className="zenit-field-row" style={{ fontWeight: 700, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
            <span className="zenit-field-label"><strong>Net Income from House Property</strong></span>
            <span style={{ fontFamily: 'var(--font-mono)', color: Number(currentHp.netIncome) < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontSize: '1.05rem' }}>
              ₹{Number(currentHp.netIncome || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
