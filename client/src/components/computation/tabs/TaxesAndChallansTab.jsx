import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const TaxesAndChallansTab = ({ formData, setFormData, recalculateComputation }) => {
  const taxCalc = formData.taxCalculation || {};
  const challans = formData.challans || [];

  const handleTaxFieldChange = (field, value) => {
    const updated = recalculateComputation({
      ...formData,
      taxCalculation: {
        ...taxCalc,
        [field]: Number(value) || 0,
      },
    });
    setFormData(updated);
  };

  const handleChallanChange = (index, field, value) => {
    const list = [...challans];
    list[index] = {
      ...list[index],
      [field]: field === 'amount' ? Number(value) || 0 : value,
    };
    const updated = recalculateComputation({
      ...formData,
      challans: list,
    });
    setFormData(updated);
  };

  const addChallanRow = () => {
    const list = [...challans];
    list.push({
      type: '140A',
      bankBranch: '',
      bsrCode: '',
      date: new Date().toLocaleDateString('en-GB'),
      challanNo: '',
      amount: 0,
    });
    const updated = recalculateComputation({
      ...formData,
      challans: list,
    });
    setFormData(updated);
  };

  const removeChallanRow = (index) => {
    const list = challans.filter((_, i) => i !== index);
    const updated = recalculateComputation({
      ...formData,
      challans: list,
    });
    setFormData(updated);
  };

  return (
    <div>
      {/* Taxes Paid & Prepaid Schedule */}
      <div className="form-section-card">
        <div className="form-section-title">
          <span>Taxes Deducted (TDS) & Advance Tax Paid</span>
          <span className="badge badge-admin">
            Total Prepaid: ₹{Number(taxCalc.totalTaxesPaid || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">TDS on Salary (u/s 192)</label>
            <input
              type="number"
              placeholder="0"
              value={taxCalc.tdsSalary || ''}
              onChange={(e) => handleTaxFieldChange('tdsSalary', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">TDS on Other Income (194A/194J/194C)</label>
            <input
              type="number"
              placeholder="0"
              value={taxCalc.tdsOther || ''}
              onChange={(e) => handleTaxFieldChange('tdsOther', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Advance Tax Paid (208/209)</label>
            <input
              type="number"
              placeholder="0"
              value={taxCalc.advanceTax || ''}
              onChange={(e) => handleTaxFieldChange('advanceTax', e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Self Assessment Tax (140A) Challans */}
      <div className="form-section-card">
        <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Self Assessment Tax Challans (u/s 140A)</span>
          <button type="button" onClick={addChallanRow} className="btn btn-secondary btn-xs">
            <Plus size={12} /> Add Challan
          </button>
        </div>

        <div className="table-responsive">
          <table className="computation-item-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Bank & Branch</th>
                <th>BSR Code</th>
                <th>Date of Deposit</th>
                <th>Challan No.</th>
                <th>Amount (₹)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {challans.map((ch, idx) => (
                <tr key={idx}>
                  <td>
                    <select
                      value={ch.type || '140A'}
                      onChange={(e) => handleChallanChange(idx, 'type', e.target.value)}
                      className="form-select form-select-sm"
                    >
                      <option value="140A">140A (Self Assessment)</option>
                      <option value="100">100 (Advance Tax)</option>
                      <option value="400">400 (Regular Assessment)</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="e.g. SBI Main Branch"
                      value={ch.bankBranch || ''}
                      onChange={(e) => handleChallanChange(idx, 'bankBranch', e.target.value)}
                      className="form-input form-input-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="e.g. 0002145"
                      value={ch.bsrCode || ''}
                      onChange={(e) => handleChallanChange(idx, 'bsrCode', e.target.value)}
                      className="form-input form-input-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={ch.date || ''}
                      onChange={(e) => handleChallanChange(idx, 'date', e.target.value)}
                      className="form-input form-input-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="e.g. 05412"
                      value={ch.challanNo || ''}
                      onChange={(e) => handleChallanChange(idx, 'challanNo', e.target.value)}
                      className="form-input form-input-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="0"
                      value={ch.amount || 0}
                      onChange={(e) => handleChallanChange(idx, 'amount', e.target.value)}
                      className="form-input form-input-sm"
                      style={{ textAlign: 'right', fontWeight: 600 }}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => removeChallanRow(idx)}
                      className="icon-btn danger"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {challans.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                    No challans recorded. Click "Add Challan" to record self-assessment tax payments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Liability & Refund Status Summary Card */}
      <div className="form-section-card">
        <div className="form-section-title">
          <span>Net Tax Payable / Refundable Summary</span>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Total Tax with Cess</label>
            <input
              type="text"
              value={`₹${Number(taxCalc.totalTaxWithCess || 0).toLocaleString('en-IN')}`}
              readOnly
              className="form-input"
              style={{ fontWeight: 700 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Interest (234A/B/C)</label>
            <input
              type="text"
              value={`₹${Number(taxCalc.totalInterest || 0).toLocaleString('en-IN')}`}
              readOnly
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              {Number(taxCalc.amountPayable) > 0 ? 'Net Tax Payable (u/s 288B)' : 'Net Refundable'}
            </label>
            <input
              type="text"
              value={
                Number(taxCalc.amountPayable) > 0
                  ? `₹${Number(taxCalc.taxRoundedOff || taxCalc.amountPayable || 0).toLocaleString('en-IN')}`
                  : `₹${Number(taxCalc.amountRefundable || 0).toLocaleString('en-IN')}`
              }
              readOnly
              className="form-input"
              style={{
                background: Number(taxCalc.amountPayable) > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: Number(taxCalc.amountPayable) > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
