import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const roleParam = roleFilter === 'all' ? null : roleFilter;
      const data = await adminService.getUsers(roleParam);
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user) => {
    const actionText = user.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} ${user.name}'s account?`)) {
      return;
    }

    try {
      setUpdatingUserId(user.id);
      const updated = await adminService.updateUser(user.id, {
        is_active: !user.is_active,
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user account status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.farmer_profile && u.farmer_profile.farm_name.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Platform User Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage registered farmers, consumers, and platform administrators.
          </p>
        </div>

        {/* Role Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Users' },
            { id: 'farmer', label: '🚜 Farmers' },
            { id: 'consumer', label: '🛒 Consumers' },
            { id: 'admin', label: '🛡️ Admins' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`btn btn-sm ${roleFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.825rem', padding: '0.35rem 0.85rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by name, email, or farm name..."
          className="form-input"
          style={{ maxWidth: '400px' }}
        />
      </div>

      {isLoading ? (
        <Loading message="Loading user directory..." />
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h4 className="empty-state-title">No users found</h4>
          <p className="empty-state-text">No accounts matched your search or role filter.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>User Identity</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Role</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Contact Info</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* User Identity */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {u.email}
                      </div>
                      {u.farmer_profile && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 600, marginTop: '2px' }}>
                          🏡 {u.farmer_profile.farm_name} ({u.farmer_profile.farm_location})
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        className="badge badge-role"
                        style={{
                          textTransform: 'capitalize',
                          backgroundColor:
                            u.role === 'admin' ? '#ede9fe' : u.role === 'farmer' ? '#fef3c7' : '#dcfce7',
                          color:
                            u.role === 'admin' ? '#6b21a8' : u.role === 'farmer' ? '#92400e' : '#166534',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Contact Info */}
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>
                      <div>{u.phone || 'No phone'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                        {u.address ? `${u.address.substring(0, 32)}...` : 'No address'}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${u.is_active ? 'badge-delivered' : 'badge-cancelled'}`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        disabled={updatingUserId === u.id || u.role === 'admin'}
                        className={`btn btn-sm ${u.is_active ? 'btn-secondary' : 'btn-primary'}`}
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.35rem 0.65rem',
                          color: u.is_active ? '#dc2626' : undefined,
                        }}
                      >
                        {updatingUserId === u.id
                          ? 'Updating...'
                          : u.is_active
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
