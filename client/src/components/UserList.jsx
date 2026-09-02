import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Trash2, Shield, Calendar, DollarSign, RefreshCw, Briefcase } from 'lucide-react';

export const UserList = ({ users, loading, onRefresh }) => {
  const { showToast, user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await api.deleteUser(id);
      showToast(res.message || 'User deleted successfully', 'info');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.designation && u.designation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-admin">🛡️ Admin</span>;
      case 'manager':
        return <span className="badge badge-manager">💼 Manager</span>;
      case 'hr':
        return <span className="badge badge-hr">📋 HR</span>;
      default:
        return <span className="badge badge-employee">👤 Employee</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Registered Users Directory</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredUsers.length} of {users.length} members in the database
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          title="Refresh List"
          disabled={loading}
          id="refresh-users-btn"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <div className="form-input-wrapper" style={{ flex: '1 1 200px' }}>
          <Search size={16} className="form-input-icon" />
          <input
            type="text"
            className="form-input has-icon"
            placeholder="Search by name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="user-search-input"
            style={{ padding: '0.55rem 0.75rem 0.55rem 2.5rem', fontSize: '0.85rem' }}
          />
        </div>

        <select
          className="form-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          id="role-filter-select"
          style={{ width: 'auto', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
        >
          <option value="all">All Roles</option>
          <option value="employee">Employees Only</option>
          <option value="manager">Managers Only</option>
          <option value="hr">HR Only</option>
          <option value="admin">Admins Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
            <p>Loading registered members...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p>No registered users found matching your criteria.</p>
          </div>
        ) : (
          <table className="custom-table" id="users-directory-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Designation / Dept</th>
                <th>Base Salary</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} id={`user-row-${u._id}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background:
                            u.role === 'admin'
                              ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                              : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#fff',
                        }}
                      >
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{u.designation || 'Team Member'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      {u.department || 'General'}
                    </div>
                  </td>
                  <td>
                    <span className="salary-text">
                      ${Number(u.baseSalary || 0).toLocaleString('en-US')}/yr
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {currentUser?._id !== u._id ? (
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        className="btn btn-danger-subtle btn-sm"
                        disabled={deletingId === u._id}
                        title="Delete User"
                        id={`delete-user-${u._id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                        (You)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
