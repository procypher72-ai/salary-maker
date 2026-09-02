import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Key, Briefcase, Building2, DollarSign, Loader2, Shuffle } from 'lucide-react';

export const UserRegisterForm = ({ onUserAdded }) => {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    designation: 'Software Developer',
    department: 'Engineering',
    baseSalary: '65000',
  });
  const [loading, setLoading] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.registerUser(formData);
      showToast(res.message || 'User successfully registered!', 'success');
      
      // Reset form with standard defaults
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        designation: '',
        department: 'Engineering',
        baseSalary: '',
      });

      if (onUserAdded) {
        onUserAdded();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UserPlus size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Register New User</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Add an employee, manager, or admin to the Salary Maker system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} id="register-user-form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="user-name">
              Full Name *
            </label>
            <div className="form-input-wrapper">
              <User size={17} className="form-input-icon" />
              <input
                id="user-name"
                name="name"
                type="text"
                className="form-input has-icon"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-email">
              Email Address *
            </label>
            <div className="form-input-wrapper">
              <Mail size={17} className="form-input-icon" />
              <input
                id="user-email"
                name="email"
                type="email"
                className="form-input has-icon"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" htmlFor="user-password">
              Temporary Password *
            </label>
            <button
              type="button"
              onClick={generateRandomPassword}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 600,
              }}
            >
              <Shuffle size={12} /> Auto Generate
            </button>
          </div>
          <div className="form-input-wrapper">
            <Key size={17} className="form-input-icon" />
            <input
              id="user-password"
              name="password"
              type="text"
              className="form-input has-icon"
              placeholder="Enter secure initial password (min 6 chars)"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="user-role">
              System Role *
            </label>
            <select
              id="user-role"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR Administrator</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-department">
              Department
            </label>
            <div className="form-input-wrapper">
              <Building2 size={17} className="form-input-icon" />
              <input
                id="user-department"
                name="department"
                type="text"
                className="form-input has-icon"
                placeholder="e.g. Finance, IT, Sales"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="user-designation">
              Job Title / Designation
            </label>
            <div className="form-input-wrapper">
              <Briefcase size={17} className="form-input-icon" />
              <input
                id="user-designation"
                name="designation"
                type="text"
                className="form-input has-icon"
                placeholder="e.g. Senior Analyst"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-salary">
              Base Salary ($ USD / Yr)
            </label>
            <div className="form-input-wrapper">
              <DollarSign size={17} className="form-input-icon" />
              <input
                id="user-salary"
                name="baseSalary"
                type="number"
                min="0"
                step="500"
                className="form-input has-icon"
                placeholder="e.g. 75000"
                value={formData.baseSalary}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
          id="submit-register-user-btn"
          style={{ marginTop: '0.75rem', height: '44px' }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spin" />
              <span>Registering User...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Register User Account</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
