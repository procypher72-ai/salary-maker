import React from 'react';

export const CapitalGainsTab = ({ formData, setFormData, recalculateComputation }) => {
  const currentCg = formData.headsOfIncome?.capitalGains || {};

  const handleCgChange = (field, value) => {
    const updated = recalculateComputation({
      ...formData,
      headsOfIncome: {
        ...formData.headsOfIncome,
        capitalGains: {
          ...currentCg,
          [field]: field === 'assetType' || field === 'natureOfAsset' || field.includes('date') || field === 'description' ? value : Number(value) || 0,
        },
      },
    });
    setFormData(updated);
  };

  return (
    <div>
      <div className="form-section-card">
        <div className="form-section-title">
          <span>Asset Particulars & Transaction Details</span>
          <span className="badge badge-employee">
            Net Capital Gains: ₹{Number(currentCg.netGains || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="form-grid-4">
          <div className="form-group">
            <label className="form-label">Asset Type</label>
            <select
              value={currentCg.assetType || 'Debentures'}
              onChange={(e) => handleCgChange('assetType', e.target.value)}
              className="form-select"
            >
              <option value="Debentures">Debentures</option>
              <option value="Listed Shares">Listed Equity Shares</option>
              <option value="Unlisted Shares">Unlisted Shares</option>
              <option value="Mutual Funds">Equity Mutual Funds</option>
              <option value="Immovable Property">Land / Building / House Property</option>
              <option value="Gold/Jewellery">Gold / Jewellery</option>
              <option value="Other">Other Capital Asset</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nature of Gain</label>
            <select
              value={currentCg.natureOfAsset || 'LTCG'}
              onChange={(e) => handleCgChange('natureOfAsset', e.target.value)}
              className="form-select"
            >
              <option value="LTCG">Long Term Capital Gain (LTCG)</option>
              <option value="STCG">Short Term Capital Gain (STCG)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Sale</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={currentCg.dateOfSale || ''}
              onChange={(e) => handleCgChange('dateOfSale', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Purchase</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={currentCg.dateOfPurchase || ''}
              onChange={(e) => handleCgChange('dateOfPurchase', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-grid-4" style={{ marginTop: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Full Value Consideration (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={currentCg.saleConsideration || ''}
              onChange={(e) => handleCgChange('saleConsideration', e.target.value)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cost of Acquisition / FMV (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={currentCg.purchaseCost || ''}
              onChange={(e) => handleCgChange('purchaseCost', e.target.value)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Transfer / Brokerage (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={currentCg.transferExpenses || ''}
              onChange={(e) => handleCgChange('transferExpenses', e.target.value)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Indexed Cost of Acquisition (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={currentCg.indexedCost || ''}
              onChange={(e) => handleCgChange('indexedCost', e.target.value)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}
            />
          </div>
        </div>
      </div>

      <div className="form-section-card">
        <div className="form-section-title">
          <span>Capital Gains Slabs & Net Heads of Income</span>
        </div>
        <div className="form-grid-4">
          <div className="form-group">
            <label className="form-label">Short Term (Normal Rates)</label>
            <input
              type="number"
              value={currentCg.shortTermNormal || 0}
              onChange={(e) => handleCgChange('shortTermNormal', e.target.value)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Short Term u/s 111A (15%)</label>
            <input
              type="number"
              value={currentCg.shortTerm15 || 0}
              onChange={(e) => handleCgChange('shortTerm15', e.target.value)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Long Term u/s 112A (10% / 12.5%)</label>
            <input
              type="number"
              value={currentCg.longTerm10 || 0}
              onChange={(e) => handleCgChange('longTerm10', e.target.value)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Long Term u/s 112 (20%)</label>
            <input
              type="number"
              value={currentCg.longTerm20 || 0}
              onChange={(e) => handleCgChange('longTerm20', e.target.value)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
