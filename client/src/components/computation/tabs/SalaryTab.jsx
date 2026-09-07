import React from 'react';
import { Sparkles, Plus, Trash2 } from 'lucide-react';

export const SalaryTab = ({
  formData,
  setFormData,
  recalculateComputation,
  selectedEmployeeId,
  isFetchingSalary,
  handleAutoFetchSalary,
}) => {
  const salary = formData.headsOfIncome?.salary || {};

  const handleSalaryFieldChange = (field, value) => {
    const num = Number(value) || 0;
    const updatedSalary = { ...salary, [field]: num };

    if (field === 'basicSalary' || field === 'allowances') {
      updatedSalary.totalGross = (Number(updatedSalary.basicSalary) || 0) + (Number(updatedSalary.allowances) || 0);
    }

    const updated = recalculateComputation({
      ...formData,
      headsOfIncome: {
        ...formData.headsOfIncome,
        salary: updatedSalary,
      },
    });
    setFormData(updated);
  };

  const handleBreakdownChange = (index, field, value) => {
    const list = [...(salary.salaryBreakdown || [])];
    list[index] = {
      ...list[index],
      [field]: field === 'particular' ? value : Number(value) || 0,
      taxableAmount: field === 'particular'
        ? list[index].taxableAmount
        : Math.max(0, (field === 'totalAmount' ? Number(value) || 0 : list[index].totalAmount) - (field === 'exemptedAmount' ? Number(value) || 0 : list[index].exemptedAmount)),
    };

    const updated = recalculateComputation({
      ...formData,
      headsOfIncome: {
        ...formData.headsOfIncome,
        salary: {
          ...salary,
          salaryBreakdown: list,
        },
      },
    });
    setFormData(updated);
  };

  const addBreakdownRow = () => {
    const list = [...(salary.salaryBreakdown || [])];
    list.push({ particular: '', totalAmount: 0, exemptedAmount: 0, taxableAmount: 0 });
    const updated = recalculateComputation({
      ...formData,
      headsOfIncome: {
        ...formData.headsOfIncome,
        salary: { ...salary, salaryBreakdown: list },
      },
    });
    setFormData(updated);
  };

  const removeBreakdownRow = (index) => {
    const list = (salary.salaryBreakdown || []).filter((_, i) => i !== index);
    const updated = recalculateComputation({
      ...formData,
      headsOfIncome: {
        ...formData.headsOfIncome,
        salary: { ...salary, salaryBreakdown: list },
      },
    });
    setFormData(updated);
  };

  return (
    <div>
      {/* Auto-aggregate bar */}
      <div className="autofetch-bar">
        <div className="autofetch-info">
          <h4>
            <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span>Auto-Aggregate Salary from Historical Payslips</span>
          </h4>
          <p>
            Automatically sync monthly earnings, statutory allowances, and TDS deductions from generated payslips in the database.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAutoFetchSalary}
          disabled={isFetchingSalary || !selectedEmployeeId}
          className="btn btn-primary btn-sm"
          id="autofetch-salary-btn"
        >
          <Sparkles size={14} />
          <span>{isFetchingSalary ? 'Aggregating Payslips...' : 'Auto-Fetch from Payslips'}</span>
        </button>
      </div>

      <div className="form-section-card">
        <div className="form-section-title">
          <span>Employer & Salary Overview</span>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Employer Name</label>
            <input
              type="text"
              value={salary.employerName || ''}
              onChange={(e) => {
                const updated = recalculateComputation({
                  ...formData,
                  headsOfIncome: {
                    ...formData.headsOfIncome,
                    salary: { ...salary, employerName: e.target.value },
                  },
                });
                setFormData(updated);
              }}
              className="form-input"
              placeholder="e.g. Nexus Tech Global Ltd."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gross Basic Salary (Annual ₹)</label>
            <input
              type="number"
              value={salary.basicSalary || 0}
              onChange={(e) => handleSalaryFieldChange('basicSalary', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Total Allowances (Annual ₹)</label>
            <input
              type="number"
              value={salary.allowances || 0}
              onChange={(e) => handleSalaryFieldChange('allowances', e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Salary Breakdown Schedule */}
      <div className="form-section-card">
        <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Salary Allowances & Components Schedule</span>
          <button type="button" onClick={addBreakdownRow} className="btn btn-secondary btn-xs">
            <Plus size={12} /> Add Component
          </button>
        </div>
        <div className="table-responsive">
          <table className="computation-item-table">
            <thead>
              <tr>
                <th>Component / Particular</th>
                <th style={{ width: '150px' }}>Total Amount (₹)</th>
                <th style={{ width: '150px' }}>Exempted u/s 10 (₹)</th>
                <th style={{ width: '150px' }}>Taxable Amount (₹)</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {(salary.salaryBreakdown || []).map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      value={row.particular || ''}
                      onChange={(e) => handleBreakdownChange(idx, 'particular', e.target.value)}
                      className="form-input form-input-sm"
                      placeholder="e.g. House Rent Allowance"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.totalAmount || 0}
                      onChange={(e) => handleBreakdownChange(idx, 'totalAmount', e.target.value)}
                      className="form-input form-input-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.exemptedAmount || 0}
                      onChange={(e) => handleBreakdownChange(idx, 'exemptedAmount', e.target.value)}
                      className="form-input form-input-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.taxableAmount || 0}
                      readOnly
                      className="form-input form-input-sm"
                      style={{ background: 'rgba(0,0,0,0.2)', fontWeight: 600 }}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => removeBreakdownRow(idx)}
                      className="icon-btn danger"
                      title="Remove Row"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Deductions Summary Card */}
      <div className="form-section-card">
        <div className="form-section-title">
          <span>Salary Deductions (u/s 16) & Net Taxable Salary</span>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Standard Deduction u/s 16(ia)</label>
            <input
              type="number"
              value={salary.standardDeduction || 75000}
              readOnly
              className="form-input"
              style={{ background: 'rgba(0,0,0,0.25)', fontWeight: 700 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Professional Tax u/s 16(iii)</label>
            <input
              type="number"
              value={salary.professionalTax || 0}
              onChange={(e) => handleSalaryFieldChange('professionalTax', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Net Taxable Salary (Heads of Income)</label>
            <input
              type="number"
              value={salary.taxableSalary || 0}
              readOnly
              className="form-input"
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                fontSize: '1.05rem',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
