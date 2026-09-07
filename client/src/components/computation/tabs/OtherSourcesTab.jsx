import React, { useState } from 'react';

export const OtherSourcesTab = ({ formData, setFormData, recalculateComputation }) => {
  const currentOs = formData.headsOfIncome?.otherSources || {};
  const [activeOsTab, setActiveOsTab] = useState('div_int');

  const handleOsFieldChange = (field, value) => {
    const updated = recalculateComputation({
      ...formData,
      headsOfIncome: {
        ...formData.headsOfIncome,
        otherSources: {
          ...currentOs,
          [field]: field === 'category' ? value : Number(value) || 0,
        },
      },
    });
    setFormData(updated);
  };

  return (
    <div>
      {/* Top Category Pills */}
      <div className="zenit-pill-tabs">
        <button
          type="button"
          onClick={() => handleOsFieldChange('category', 'normal')}
          className={`zenit-pill-btn ${currentOs.category === 'normal' || !currentOs.category ? 'active' : ''}`}
        >
          Income Chargeable at Normal Rate
        </button>
        <button
          type="button"
          onClick={() => handleOsFieldChange('category', 'agriculture')}
          className={`zenit-pill-btn ${currentOs.category === 'agriculture' ? 'active' : ''}`}
        >
          Agriculture Income
        </button>
        <button
          type="button"
          onClick={() => handleOsFieldChange('category', 'exempt')}
          className={`zenit-pill-btn ${currentOs.category === 'exempt' ? 'active' : ''}`}
        >
          Exempt Income
        </button>
        <button
          type="button"
          onClick={() => handleOsFieldChange('category', 'special_rate')}
          className={`zenit-pill-btn ${currentOs.category === 'special_rate' ? 'active' : ''}`}
        >
          Special Rate Income
        </button>
      </div>

      {/* Sub Pills */}
      <div className="zenit-pill-tabs" style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveOsTab('div_int')}
          className={`zenit-pill-btn ${activeOsTab === 'div_int' ? 'active-blue' : ''}`}
        >
          Dividend / Interest Income
        </button>
        <button
          type="button"
          onClick={() => setActiveOsTab('other_details')}
          className={`zenit-pill-btn ${activeOsTab === 'other_details' ? 'active-blue' : ''}`}
        >
          Other Income Schedule
        </button>
      </div>

      {activeOsTab === 'div_int' ? (
        <div>
          {/* Interest Income Details */}
          <div className="form-section-card">
            <div className="form-section-title">
              <span>Interest Income Schedule</span>
              <span className="badge badge-manager">
                Total Other Sources: ₹{Number(currentOs.totalOtherSources || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="zenit-dual-column-grid">
              <div>
                <div className="zenit-field-row">
                  <span className="zenit-field-label"><strong>Saving Bank Interest</strong></span>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentOs.interestSavings || ''}
                    onChange={(e) => handleOsFieldChange('interestSavings', e.target.value)}
                    className="zenit-input-box"
                  />
                </div>
                <div className="zenit-field-row">
                  <span className="zenit-field-label"><strong>Interest on Bank FDR / Term Deposit</strong></span>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentOs.interestFdr || ''}
                    onChange={(e) => handleOsFieldChange('interestFdr', e.target.value)}
                    className="zenit-input-box"
                  />
                </div>
                <div className="zenit-field-row">
                  <span className="zenit-field-label">Other Interest Income</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentOs.otherInterest || ''}
                    onChange={(e) => handleOsFieldChange('otherInterest', e.target.value)}
                    className="zenit-input-box"
                  />
                </div>
              </div>

              <div>
                <div className="zenit-field-row">
                  <span className="zenit-field-label">Dividend Income</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentOs.dividendIncome || ''}
                    onChange={(e) => handleOsFieldChange('dividendIncome', e.target.value)}
                    className="zenit-input-box"
                  />
                </div>
                <div className="zenit-field-row">
                  <span className="zenit-field-label">Other Income / Casual Receipts</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentOs.otherIncome || ''}
                    onChange={(e) => handleOsFieldChange('otherIncome', e.target.value)}
                    className="zenit-input-box"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="form-section-card">
          <div className="form-section-title">
            <span>Other Income Breakdown</span>
          </div>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Winning from Lottery / Puzzles</label>
              <input
                type="number"
                value={currentOs.lotteryWinnings || 0}
                onChange={(e) => handleOsFieldChange('lotteryWinnings', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Commission / Brokerage</label>
              <input
                type="number"
                value={currentOs.commissionIncome || 0}
                onChange={(e) => handleOsFieldChange('commissionIncome', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Agricultural Income (Net)</label>
              <input
                type="number"
                value={currentOs.agricultureIncome || 0}
                onChange={(e) => handleOsFieldChange('agricultureIncome', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
