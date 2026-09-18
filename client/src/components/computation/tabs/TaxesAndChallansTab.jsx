import React from 'react';
import { Plus, Trash2, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export const TaxesAndChallansTab = ({ formData, setFormData, recalculateComputation }) => {
  const taxCalc = formData.taxCalculation || {};
  const challans = formData.challans || [];

  const totalTaxWithCess = Number(taxCalc.totalTaxWithCess || 0);
  const totalInterest = Number(taxCalc.totalInterest || 0);
  const totalTaxAndInterest = Number(taxCalc.totalTaxAndInterest || (totalTaxWithCess + totalInterest));

  const prepaidTaxes = (Number(taxCalc.tdsSalary) || 0) + (Number(taxCalc.tdsOther) || 0) + (Number(taxCalc.advanceTax) || 0);
  const netDueBefore140A = Math.max(0, totalTaxAndInterest - prepaidTaxes);

  const autoCalculateInterest = taxCalc.autoCalculateInterest !== false;

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

  const handleInterestToggle = (checked) => {
    const updated = recalculateComputation({
      ...formData,
      taxCalculation: {
        ...taxCalc,
        autoCalculateInterest: checked,
      },
    });
    setFormData(updated);
  };

  const handleManualInterestChange = (field, value) => {
    const updated = recalculateComputation({
      ...formData,
      taxCalculation: {
        ...taxCalc,
        autoCalculateInterest: false,
        [field]: field.includes('Details') ? value : (Number(value) || 0),
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
      bankBranch: 'State Bank of India',
      bsrCode: '0002145',
      date: new Date().toLocaleDateString('en-GB'),
      challanNo: '00652',
      amount: netDueBefore140A > 0 ? netDueBefore140A : 0,
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

  const handleAutoFillChallan = () => {
    let list = [...challans];
    const targetAmount = netDueBefore140A;

    if (list.length > 0) {
      list[0] = {
        ...list[0],
        type: '140A',
        bankBranch: list[0].bankBranch || 'State Bank of India',
        bsrCode: list[0].bsrCode || '0002145',
        date: list[0].date || new Date().toLocaleDateString('en-GB'),
        challanNo: list[0].challanNo || '00652',
        amount: targetAmount,
      };
    } else {
      list.push({
        type: '140A',
        bankBranch: 'State Bank of India',
        bsrCode: '0002145',
        date: new Date().toLocaleDateString('en-GB'),
        challanNo: '00652',
        amount: targetAmount,
      });
    }

    const updated = recalculateComputation({
      ...formData,
      challans: list,
      taxCalculation: {
        ...taxCalc,
        taxDeposited140A: targetAmount,
      },
    });
    setFormData(updated);
  };

  return (
    <div>
      {/* Actual Tax Liability Formed Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(99,102,241,0.08) 100%)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '10px',
          padding: '1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Actual Tax Liability Formed (Total Due)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-color)', margin: '4px 0' }}>
            ₹{totalTaxAndInterest.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Normal Tax: <strong>₹{Number(taxCalc.taxAtNormalRates || 0).toLocaleString('en-IN')}</strong> + 
            Cess (4%): <strong>₹{Number(taxCalc.cess || 0).toLocaleString('en-IN')}</strong> + 
            Interest (234): <strong>₹{totalInterest.toLocaleString('en-IN')}</strong>
            {prepaidTaxes > 0 && (
              <span> | Prepaid (TDS/Adv Tax): <strong>-₹{prepaidTaxes.toLocaleString('en-IN')}</strong></span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleAutoFillChallan}
            className="btn btn-primary"
            style={{
              fontWeight: 700,
              padding: '0.65rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
            }}
          >
            <Zap size={16} fill="currentColor" /> Auto-Fill Challan 140A (₹{netDueBefore140A.toLocaleString('en-IN')})
          </button>
        </div>
      </div>

      {/* Taxes Deducted & Advance Tax Schedule */}
      <div className="form-section-card">
        <div className="form-section-title">
          <span>Taxes Deducted (TDS) & Advance Tax Paid</span>
          <span className="badge badge-admin">
            Total Prepaid: ₹{prepaidTaxes.toLocaleString('en-IN')}
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

      {/* Interest u/s 234A, 234B & 234C */}
      <div className="form-section-card">
        <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Interest under Section 234 (234B & 234C)</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={autoCalculateInterest}
              onChange={(e) => handleInterestToggle(e.target.checked)}
            />
            Auto-Calculate Statutory Interest (Recommended)
          </label>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">
              Interest u/s 234B (Default for Assessed Tax)
            </label>
            <input
              type="number"
              value={taxCalc.interest234B || 0}
              readOnly={autoCalculateInterest}
              onChange={(e) => handleManualInterestChange('interest234B', e.target.value)}
              className="form-input"
              style={{ fontWeight: 600 }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Formula Details: {taxCalc.interest234BDetails || 'N/A'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Interest u/s 234C (Installments Deferment)
            </label>
            <input
              type="number"
              value={taxCalc.interest234C || 0}
              readOnly={autoCalculateInterest}
              onChange={(e) => handleManualInterestChange('interest234C', e.target.value)}
              className="form-input"
              style={{ fontWeight: 600 }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Quarterly: ( {taxCalc.interest234CDetails || 'N/A'} )
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Interest u/s 234A (Delay in ITR filing)</label>
            <input
              type="number"
              placeholder="0"
              value={taxCalc.interest234A || ''}
              onChange={(e) => handleManualInterestChange('interest234A', e.target.value)}
              className="form-input"
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Total Interest: ₹{totalInterest.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Self Assessment Tax (140A) Challans */}
      <div className="form-section-card">
        <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span>Self Assessment Tax Challans (u/s 140A)</span>
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '10px' }}>
              Total Deposited: ₹{Number(taxCalc.taxDeposited140A || 0).toLocaleString('en-IN')}
            </span>
          </div>
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
                      placeholder="e.g. State Bank of India"
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
                      placeholder="e.g. 00652"
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
                      style={{ textAlign: 'right', fontWeight: 700 }}
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
                  <td colSpan={7} style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--text-muted)' }}>
                    No challans recorded yet. Click <strong>"Auto-Fill Challan 140A"</strong> above or <strong>"Add Challan"</strong> to deposit self-assessment tax.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Liability & Net Payable Status Summary Card */}
      <div className="form-section-card">
        <div className="form-section-title">
          <span>Net Tax Payable / Refundable Summary</span>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Total Tax with Cess</label>
            <input
              type="text"
              value={`₹${totalTaxWithCess.toLocaleString('en-IN')}`}
              readOnly
              className="form-input"
              style={{ fontWeight: 700 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Interest (234A/B/C)</label>
            <input
              type="text"
              value={`₹${totalInterest.toLocaleString('en-IN')}`}
              readOnly
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              {Number(taxCalc.amountRefundable) > 0
                ? 'Refund Due (u/s 288D)'
                : Number(taxCalc.amountPayable) > 0
                ? 'Net Tax Payable (u/s 288B)'
                : 'Net Amount Payable / Refund'}
            </label>
            <input
              type="text"
              value={
                Number(taxCalc.amountRefundable) > 0
                  ? `Refund: ₹${Number(taxCalc.amountRefundable).toLocaleString('en-IN')}`
                  : Number(taxCalc.amountPayable) > 0
                  ? `₹${Number(taxCalc.taxRoundedOff || taxCalc.amountPayable || 0).toLocaleString('en-IN')}`
                  : '₹0'
              }
              readOnly
              className="form-input"
              style={{
                background: Number(taxCalc.amountRefundable) > 0
                  ? 'rgba(16, 185, 129, 0.18)'
                  : Number(taxCalc.amountPayable) > 0
                  ? 'rgba(244, 63, 94, 0.15)'
                  : 'rgba(148, 163, 184, 0.15)',
                color: Number(taxCalc.amountRefundable) > 0
                  ? 'var(--accent-emerald)'
                  : Number(taxCalc.amountPayable) > 0
                  ? 'var(--accent-rose)'
                  : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '1.15rem',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
