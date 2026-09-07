import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const BusinessTab = ({ formData, setFormData, recalculateComputation }) => {
  const currentBp = formData.headsOfIncome?.businessProfession || {};

  const [newBizName, setNewBizName] = useState('');
  const [newBizNature, setNewBizNature] = useState('');
  const [newBizTurnover, setNewBizTurnover] = useState('');
  const [newBizProfit, setNewBizProfit] = useState('');

  const handleSubTypeChange = (subType) => {
    const updated = recalculateComputation({
      ...formData,
      headsOfIncome: {
        ...formData.headsOfIncome,
        businessProfession: { ...currentBp, subType },
      },
    });
    setFormData(updated);
  };

  const handleAddEntry = () => {
    if (!newBizName.trim()) return;
    const entries = [...(currentBp.entries || [])];
    const profit = Number(newBizProfit) || 0;
    entries.push({
      businessName: newBizName.trim(),
      natureOfBusiness: newBizNature.trim() || 'General Business',
      turnover: Number(newBizTurnover) || 0,
      profitOrLoss: profit,
      subType: currentBp.subType || 'ordinary',
    });

    const totalProfit = entries.reduce((sum, e) => sum + (Number(e.profitOrLoss) || 0), 0);
    const updated = recalculateComputation({
      ...formData,
      headsOfIncome: {
        ...formData.headsOfIncome,
        businessProfession: {
          ...currentBp,
          entries,
          netProfit: totalProfit,
        },
      },
    });
    setFormData(updated);
    setNewBizName('');
    setNewBizNature('');
    setNewBizTurnover('');
    setNewBizProfit('');
  };

  const handleRemoveEntry = (index) => {
    const entries = (currentBp.entries || []).filter((_, i) => i !== index);
    const totalProfit = entries.reduce((sum, e) => sum + (Number(e.profitOrLoss) || 0), 0);
    const updated = recalculateComputation({
      ...formData,
      headsOfIncome: {
        ...formData.headsOfIncome,
        businessProfession: {
          ...currentBp,
          entries,
          netProfit: totalProfit,
        },
      },
    });
    setFormData(updated);
  };

  return (
    <div>
      <div className="zenit-pill-tabs">
        <button
          type="button"
          onClick={() => handleSubTypeChange('ordinary')}
          className={`zenit-pill-btn ${currentBp.subType === 'ordinary' ? 'active' : ''}`}
        >
          Ordinary / Regular Accounts
        </button>
        <button
          type="button"
          onClick={() => handleSubTypeChange('presumptive_44ad')}
          className={`zenit-pill-btn ${currentBp.subType === 'presumptive_44ad' ? 'active' : ''}`}
        >
          44AD (Presumptive Business)
        </button>
        <button
          type="button"
          onClick={() => handleSubTypeChange('presumptive_44ada')}
          className={`zenit-pill-btn ${currentBp.subType === 'presumptive_44ada' ? 'active' : ''}`}
        >
          44ADA (Presumptive Profession)
        </button>
        <button
          type="button"
          onClick={() => handleSubTypeChange('presumptive_44ae')}
          className={`zenit-pill-btn ${currentBp.subType === 'presumptive_44ae' ? 'active' : ''}`}
        >
          44AE (Goods Carriage)
        </button>
      </div>

      <div className="form-section-card">
        <div className="form-section-title">
          <span>Business & Profession Schedule</span>
          <span className="badge badge-manager">
            Total Profit / Loss: ₹{Number(currentBp.netProfit || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <table className="breakdown-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Business Name</th>
              <th style={{ width: '25%' }}>Nature of Business</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Turnover / Receipt (₹)</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Profit / Loss (₹)</th>
              <th style={{ width: '5%', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {(currentBp.entries || []).map((biz, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{biz.businessName}</td>
                <td>{biz.natureOfBusiness}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  ₹{Number(biz.turnover || 0).toLocaleString('en-IN')}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: Number(biz.profitOrLoss) < 0 ? '#fb7185' : '#4ade80' }}>
                  ₹{Number(biz.profitOrLoss || 0).toLocaleString('en-IN')}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry(idx)}
                    className="btn btn-danger-subtle btn-sm"
                    style={{ padding: '0.25rem 0.4rem' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {(currentBp.entries || []).length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  No businesses added yet. Use the form below to add ordinary or presumptive business income.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Quick Add Business Row */}
        <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
            + Add New Business / Profession
          </div>
          <div className="form-grid-4">
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input
                type="text"
                placeholder="e.g. M/s ABC Enterprises"
                value={newBizName}
                onChange={(e) => setNewBizName(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nature of Business</label>
              <input
                type="text"
                placeholder="e.g. Retail Trading / Consulting"
                value={newBizNature}
                onChange={(e) => setNewBizNature(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Turnover / Gross Receipts (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={newBizTurnover}
                onChange={(e) => {
                  setNewBizTurnover(e.target.value);
                  if (currentBp.subType === 'presumptive_44ad' && !newBizProfit) {
                    setNewBizProfit(Math.round(Number(e.target.value) * 0.06));
                  } else if (currentBp.subType === 'presumptive_44ada' && !newBizProfit) {
                    setNewBizProfit(Math.round(Number(e.target.value) * 0.50));
                  }
                }}
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Declared Net Profit (₹)</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="number"
                  placeholder="0"
                  value={newBizProfit}
                  onChange={(e) => setNewBizProfit(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}
                />
                <button
                  type="button"
                  onClick={handleAddEntry}
                  className="btn btn-primary btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
