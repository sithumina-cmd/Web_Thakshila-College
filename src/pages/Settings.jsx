import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  UserPlus,
  Users,
  Activity,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  UserCheck,
  UserX,
  Mail,
  Phone,
  User,
  Clock,
  Monitor,
  BookOpen,
  Search
} from 'lucide-react';
import { authFetch } from '../utils/api';

function formatDateTime(iso) {
  if (!iso) return 'Never';
  try {
    return new Date(iso).toLocaleString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

function summarizeUserAgent(ua) {
  if (!ua) return 'Unknown Device';
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('Chrome/')) return 'Google Chrome';
  if (ua.includes('Firefox/')) return 'Mozilla Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  return ua.slice(0, 40);
}

function getActionBadgeClass(action) {
  if (!action) return 'badge-neutral';
  if (
    action.includes('FAILED') ||
    action.includes('LOCKED') ||
    action.includes('LOCKOUT') ||
    action.includes('DELETED') ||
    action.includes('FORCED_LOGOUT')
  ) {
    return 'badge-danger';
  }
  if (action.includes('SUCCESS') || action.includes('CREATED') || action.includes('UPDATED') || action.includes('CHANGED')) {
    return 'badge-success';
  }
  if (action.includes('STATUS') || action.includes('LOGOUT')) {
    return 'badge-warning';
  }
  return 'badge-neutral';
}

export default function Settings({ currentUser, onShowToast, onUserUpdated }) {
  const isDeveloper = currentUser?.role === 'developer';
  const [activeSection, setActiveSection] = useState('account');

  // Password Change State (All Admins & Developer)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState(null);

  // Master PIN Change State (Developer Only)
  const [pinPassword, setPinPassword] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState(null);

  // Developer Data States
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [studentConfig, setStudentConfig] = useState({ username: 'student', updatedAt: null, updatedBy: '' });
  const [devLoading, setDevLoading] = useState(false);

  // Add Admin Form State (Developer Only)
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    name: '',
    phone: '',
    gmail: ''
  });
  const [showNewAdminPw, setShowNewAdminPw] = useState(false);
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [adminFormMessage, setAdminFormMessage] = useState(null);

  // Student Credentials Update Form State (Developer Only)
  const [studentUsername, setStudentUsername] = useState('');
  const [studentNewPassword, setStudentNewPassword] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentMessage, setStudentMessage] = useState(null);

  // Audit Log Filters
  const [logActionFilter, setLogActionFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  const loadDeveloperData = useCallback(async (section = activeSection) => {
    if (!isDeveloper) return;
    setDevLoading(true);
    try {
      if (section === 'admins') {
        const res = await authFetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } else if (section === 'sessions') {
        const res = await authFetch('/api/admin/sessions');
        if (res.ok) {
          const data = await res.json();
          setSessions(Array.isArray(data) ? data : []);
        }
      } else if (section === 'audit') {
        const res = await authFetch('/api/admin/audit-logs');
        if (res.ok) {
          const data = await res.json();
          setAuditLogs(Array.isArray(data) ? data : []);
        }
      } else if (section === 'student') {
        const res = await authFetch('/api/admin/student-config');
        if (res.ok) {
          const data = await res.json();
          setStudentConfig(data);
          setStudentUsername(data.username || 'student');
        }
      }
    } catch (err) {
      console.error('Developer data load failed:', err);
    } finally {
      setDevLoading(false);
    }
  }, [isDeveloper, activeSection]);

  useEffect(() => {
    if (isDeveloper && activeSection !== 'account') {
      loadDeveloperData(activeSection);
    }
  }, [isDeveloper, activeSection, loadDeveloperData]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMessage(null);

    if (newPassword.length < 8) {
      setPwMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPwLoading(true);
    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMessage({ type: 'error', text: data.message || 'Could not update password.' });
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwMessage({ type: 'success', text: 'Password updated and encrypted securely.' });
      onShowToast?.('Your password has been updated securely.');
    } catch {
      setPwMessage({ type: 'error', text: 'Network error while updating password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const handlePinChange = async (e) => {
    e.preventDefault();
    setPinMessage(null);

    if (newPin.length < 6) {
      setPinMessage({ type: 'error', text: 'New Security PIN must be at least 6 characters long.' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage({ type: 'error', text: 'New PIN and confirmation do not match.' });
      return;
    }

    setPinLoading(true);
    try {
      const res = await authFetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pinPassword, currentPin, newPin })
      });
      const data = await res.json();
      if (!res.ok) {
        setPinMessage({ type: 'error', text: data.message || 'Could not update Master Security PIN.' });
        return;
      }

      setPinPassword('');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setPinMessage({ type: 'success', text: 'Master Security PIN updated successfully.' });
      onShowToast?.('Master Security PIN updated.');
    } catch {
      setPinMessage({ type: 'error', text: 'Network error while updating PIN.' });
    } finally {
      setPinLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminFormMessage(null);
    setCreateAdminLoading(true);

    try {
      const res = await authFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminFormMessage({ type: 'error', text: data.message || 'Failed to create administrator.' });
        return;
      }

      setNewAdmin({ username: '', password: '', name: '', phone: '', gmail: '' });
      setAdminFormMessage({
        type: 'success',
        text: `Administrator "${data.user.username}" added with encrypted credentials & contact data.`
      });
      onShowToast?.(`New administrator "${data.user.username}" added.`);
      loadDeveloperData('admins');
    } catch {
      setAdminFormMessage({ type: 'error', text: 'Network error creating administrator.' });
    } finally {
      setCreateAdminLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const res = await authFetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active })
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast?.(data.message || 'Failed to update status.');
        return;
      }
      onShowToast?.(`Administrator "${user.username}" ${data.user.active ? 'activated' : 'suspended & logged out'}.`);
      loadDeveloperData('admins');
    } catch {
      onShowToast?.('Network error updating administrator status.');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently remove administrator "${user.username}" (${user.name}) and terminate all their active sessions?`)) {
      return;
    }
    try {
      const res = await authFetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast?.(data.message || 'Failed to remove administrator.');
        return;
      }
      onShowToast?.(`Administrator "${user.username}" removed.`);
      loadDeveloperData('admins');
    } catch {
      onShowToast?.('Network error deleting administrator.');
    }
  };

  const handleForceLogout = async (session) => {
    try {
      const res = await authFetch(`/api/admin/sessions/${session.sid}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        onShowToast?.(data.message || 'Failed to revoke session.');
        return;
      }
      onShowToast?.(`Session for "${session.username}" terminated.`);
      loadDeveloperData('sessions');
    } catch {
      onShowToast?.('Network error revoking session.');
    }
  };

  const handleStudentConfigUpdate = async (e) => {
    e.preventDefault();
    setStudentMessage(null);
    setStudentLoading(true);

    try {
      const payload = { username: studentUsername.trim() };
      if (studentNewPassword.trim()) {
        payload.password = studentNewPassword;
      }
      const res = await authFetch('/api/admin/student-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setStudentMessage({ type: 'error', text: data.message || 'Failed to update student login.' });
        return;
      }

      setStudentNewPassword('');
      setStudentConfig({ username: data.username, updatedAt: data.updatedAt, updatedBy: currentUser?.username });
      setStudentMessage({ type: 'success', text: 'Common Student E-Library credentials updated.' });
      onShowToast?.('Student E-Library login updated.');
      onUserUpdated?.();
    } catch {
      setStudentMessage({ type: 'error', text: 'Network error updating student login.' });
    } finally {
      setStudentLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = logActionFilter === 'ALL' || log.action === logActionFilter;
    const q = logSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (log.username || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q) ||
      (log.ip || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q);
    return matchesAction && matchesSearch;
  });

  const navTabs = [
    { id: 'account', label: 'My Account & Password', icon: KeyRound }
  ];

  if (isDeveloper) {
    navTabs.push(
      { id: 'admins', label: 'Manage Admins', icon: Users },
      { id: 'sessions', label: 'Active Logins', icon: Monitor },
      { id: 'audit', label: 'Security Logs', icon: Activity },
      { id: 'student', label: 'Student Portal Login', icon: BookOpen }
    );
  }

  return (
    <div className="settings-page-root">
      {/* Header Banner */}
      <section className="settings-hero">
        <div className="container">
          <div className="settings-hero-inner">
            <div className="settings-hero-left">
              <div className="settings-hero-icon">
                {isDeveloper ? <ShieldCheck size={28} /> : <SettingsIcon size={28} />}
              </div>
              <div>
                <div className="settings-role-pill">
                  {isDeveloper ? 'MASTER DEVELOPER SECURITY CONSOLE' : 'ADMINISTRATOR SETTINGS'}
                </div>
                <h1>Website Security &amp; Settings</h1>
                <p>
                  {isDeveloper
                    ? 'Salted scrypt hashing, AES-256-GCM contact encryption, session revocation & audit telemetry.'
                    : 'Manage your encrypted administrator credentials. Usernames are permanently locked for audit integrity.'}
                </p>
              </div>
            </div>
            <div className="settings-user-chip">
              <User size={16} />
              <div>
                <strong>{currentUser?.name || currentUser?.username}</strong>
                <span>@{currentUser?.username} • {isDeveloper ? 'Master Developer' : 'Administrator'}</span>
              </div>
            </div>
          </div>

          <div className="settings-subnav" role="tablist">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeSection === tab.id}
                  className={`settings-subnav-btn ${activeSection === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="settings-content-section">
        <div className="container">
          {/* SECTION 1: MY ACCOUNT & PASSWORD */}
          {activeSection === 'account' && (
            <div className="settings-grid-2">
              <div className="settings-card">
                <div className="settings-card-header">
                  <User size={20} />
                  <div>
                    <h2>Account Identity</h2>
                    <p>Verified server session &amp; immutable identity details</p>
                  </div>
                </div>

                <div className="settings-profile-rows">
                  <div className="settings-profile-row">
                    <span className="row-label">Full Name</span>
                    <span className="row-value">{currentUser?.name || '—'}</span>
                  </div>
                  <div className="settings-profile-row">
                    <span className="row-label">Username</span>
                    <span className="row-value locked-username">
                      <Lock size={13} />
                      <code>{currentUser?.username}</code>
                      <small>(Cannot be changed)</small>
                    </span>
                  </div>
                  <div className="settings-profile-row">
                    <span className="row-label">Privilege Level</span>
                    <span className={`role-tag ${isDeveloper ? 'role-dev' : 'role-admin'}`}>
                      {isDeveloper ? 'Master Developer' : 'Administrator'}
                    </span>
                  </div>
                  <div className="settings-profile-row">
                    <span className="row-label">Phone Number</span>
                    <span className="row-value">{currentUser?.phone || 'Not provided'}</span>
                  </div>
                  <div className="settings-profile-row">
                    <span className="row-label">Gmail</span>
                    <span className="row-value">{currentUser?.gmail || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <KeyRound size={20} />
                  <div>
                    <h2>Change Password</h2>
                    <p>Passwords are salted &amp; hashed with scrypt before storage</p>
                  </div>
                </div>

                {pwMessage && (
                  <div className={`settings-alert ${pwMessage.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                    {pwMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span>{pwMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="settings-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password (min. 8 characters)</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter strong new password"
                      minLength={8}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      minLength={8}
                      required
                    />
                  </div>

                  <label className="settings-checkbox">
                    <input
                      type="checkbox"
                      checked={showPasswords}
                      onChange={(e) => setShowPasswords(e.target.checked)}
                    />
                    <span>Show passwords</span>
                  </label>

                  <button type="submit" className="btn-settings-primary" disabled={pwLoading}>
                    <Shield size={16} />
                    <span>{pwLoading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </form>
              </div>

              {isDeveloper && (
                <div className="settings-card settings-card-full">
                  <div className="settings-card-header">
                    <ShieldCheck size={20} />
                    <div>
                      <h2>Master Developer Security PIN</h2>
                      <p>Rotate your high-security secondary Master PIN used on /#/control-desk</p>
                    </div>
                  </div>

                  {pinMessage && (
                    <div className={`settings-alert ${pinMessage.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                      {pinMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                      <span>{pinMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handlePinChange} className="settings-form-row">
                    <div className="form-group">
                      <label>Developer Password</label>
                      <input
                        type="password"
                        value={pinPassword}
                        onChange={(e) => setPinPassword(e.target.value)}
                        placeholder="Verify password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Security PIN</label>
                      <input
                        type="password"
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value)}
                        placeholder="Current Master PIN"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>New Security PIN</label>
                      <input
                        type="password"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="New PIN (min 6 chars)"
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New PIN</label>
                      <input
                        type="password"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="Confirm New PIN"
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="form-group form-group-submit">
                      <button type="submit" className="btn-settings-primary" disabled={pinLoading}>
                        <Lock size={16} />
                        <span>{pinLoading ? 'Rotating...' : 'Update Security PIN'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: MANAGE ADMINS (DEVELOPER ONLY) */}
          {activeSection === 'admins' && isDeveloper && (
            <div className="settings-stack">
              <div className="settings-card">
                <div className="settings-card-header">
                  <UserPlus size={20} />
                  <div>
                    <h2>Add New Administrator</h2>
                    <p>Passwords are salted &amp; hashed (scrypt); Phone &amp; Gmail are encrypted at rest (AES-256-GCM).</p>
                  </div>
                </div>

                {adminFormMessage && (
                  <div className={`settings-alert ${adminFormMessage.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                    {adminFormMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span>{adminFormMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleCreateAdmin} className="settings-admin-create-grid">
                  <div className="form-group">
                    <label>Username <small>(Locked after creation)</small></label>
                    <input
                      type="text"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                      placeholder="e.g. principal_tcg"
                      pattern="[a-zA-Z0-9._-]{3,32}"
                      title="3-32 letters, numbers, dots, underscores or hyphens"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password <small>(Min. 8 chars)</small></label>
                    <div className="input-with-eye">
                      <input
                        type={showNewAdminPw ? 'text' : 'password'}
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        placeholder="Strong initial password"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        className="btn-eye-inline"
                        onClick={() => setShowNewAdminPw(!showNewAdminPw)}
                        title={showNewAdminPw ? 'Hide password' : 'Show password'}
                      >
                        {showNewAdminPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      placeholder="e.g. Mr. K. Perera"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={newAdmin.phone}
                      onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                      placeholder="e.g. 0771234567"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Gmail Address</label>
                    <input
                      type="email"
                      value={newAdmin.gmail}
                      onChange={(e) => setNewAdmin({ ...newAdmin, gmail: e.target.value })}
                      placeholder="e.g. admin@gmail.com"
                      required
                    />
                  </div>
                  <div className="form-group form-group-submit">
                    <button type="submit" className="btn-settings-primary" disabled={createAdminLoading}>
                      <UserPlus size={16} />
                      <span>{createAdminLoading ? 'Creating...' : 'Create Administrator'}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="settings-card">
                <div className="settings-card-header with-actions">
                  <div className="header-left">
                    <Users size={20} />
                    <div>
                      <h2>Authorized Accounts ({users.length})</h2>
                      <p>Administrators can edit website content &amp; change their own password, never their username.</p>
                    </div>
                  </div>
                  <button type="button" className="btn-settings-outline" onClick={() => loadDeveloperData('admins')}>
                    <RefreshCw size={14} className={devLoading ? 'spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="settings-table-wrap">
                  <table className="settings-table">
                    <thead>
                      <tr>
                        <th>Name &amp; Username</th>
                        <th>Role</th>
                        <th>Encrypted Contact Info</th>
                        <th>Last Login</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="table-primary-text">{u.name}</div>
                            <div className="table-secondary-text"><code>@{u.username}</code></div>
                          </td>
                          <td>
                            <span className={`role-tag ${u.role === 'developer' ? 'role-dev' : 'role-admin'}`}>
                              {u.role === 'developer' ? 'Developer' : 'Admin'}
                            </span>
                          </td>
                          <td>
                            <div className="contact-line"><Phone size={12} /> {u.phone || '—'}</div>
                            <div className="contact-line"><Mail size={12} /> {u.gmail || '—'}</div>
                          </td>
                          <td className="table-date">{formatDateTime(u.lastLoginAt)}</td>
                          <td>
                            <span className={`status-pill ${u.active ? 'status-active' : 'status-suspended'}`}>
                              {u.active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td>
                            {u.role === 'developer' ? (
                              <span className="muted-tag">Protected</span>
                            ) : (
                              <div className="table-action-btns">
                                <button
                                  type="button"
                                  className={`btn-tbl ${u.active ? 'btn-tbl-warn' : 'btn-tbl-ok'}`}
                                  onClick={() => handleToggleUserStatus(u)}
                                  title={u.active ? 'Suspend & force logout' : 'Reactivate account'}
                                >
                                  {u.active ? <UserX size={14} /> : <UserCheck size={14} />}
                                  <span>{u.active ? 'Suspend' : 'Activate'}</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn-tbl btn-tbl-danger"
                                  onClick={() => handleDeleteUser(u)}
                                  title="Delete administrator"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={6} className="empty-table-cell">No accounts loaded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ACTIVE SESSIONS (DEVELOPER ONLY) */}
          {activeSection === 'sessions' && isDeveloper && (
            <div className="settings-card">
              <div className="settings-card-header with-actions">
                <div className="header-left">
                  <Monitor size={20} />
                  <div>
                    <h2>Active Logged-In Sessions ({sessions.length})</h2>
                    <p>Monitor currently logged-in Admins &amp; Students and terminate suspicious sessions immediately.</p>
                  </div>
                </div>
                <button type="button" className="btn-settings-outline" onClick={() => loadDeveloperData('sessions')}>
                  <RefreshCw size={14} className={devLoading ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="settings-table-wrap">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>IP &amp; Browser</th>
                      <th>Logged In</th>
                      <th>Last Active</th>
                      <th>Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.sid} className={s.isCurrent ? 'current-session-row' : ''}>
                        <td>
                          <div className="table-primary-text">
                            {s.name} {s.isCurrent && <span className="this-device-badge">This Browser</span>}
                          </div>
                          <div className="table-secondary-text"><code>@{s.username}</code></div>
                        </td>
                        <td>
                          <span className={`role-tag role-${s.role}`}>
                            {s.role}
                          </span>
                        </td>
                        <td>
                          <div className="table-primary-text">{summarizeUserAgent(s.userAgent)}</div>
                          <div className="table-secondary-text">IP: {s.ip}</div>
                        </td>
                        <td className="table-date">{formatDateTime(s.loginAt)}</td>
                        <td className="table-date">{formatDateTime(s.lastActiveAt)}</td>
                        <td>
                          {s.isCurrent ? (
                            <span className="muted-tag">Current</span>
                          ) : (
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-danger"
                              onClick={() => handleForceLogout(s)}
                            >
                              <LogOut size={14} />
                              <span>Force Logout</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty-table-cell">No active sessions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 4: SECURITY AUDIT LOGS (DEVELOPER ONLY) */}
          {activeSection === 'audit' && isDeveloper && (
            <div className="settings-card">
              <div className="settings-card-header with-actions">
                <div className="header-left">
                  <Activity size={20} />
                  <div>
                    <h2>Security Audit Logs</h2>
                    <p>Chronological record of logins, logouts, 3-attempt lockouts, and admin changes.</p>
                  </div>
                </div>
                <button type="button" className="btn-settings-outline" onClick={() => loadDeveloperData('audit')}>
                  <RefreshCw size={14} className={devLoading ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="audit-filter-bar">
                <div className="audit-search">
                  <Search size={15} />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Filter by username, IP, or details..."
                  />
                </div>
                <select value={logActionFilter} onChange={(e) => setLogActionFilter(e.target.value)}>
                  <option value="ALL">All Events ({auditLogs.length})</option>
                  <option value="LOGIN_SUCCESS">Successful Logins</option>
                  <option value="LOGIN_FAILED">Failed Staff Logins</option>
                  <option value="STUDENT_LOGIN_FAILED">Failed Student Logins</option>
                  <option value="LOCKOUT_TRIGGERED">Staff 3x Lockouts</option>
                  <option value="STUDENT_LOCKED">Student 3x Lockouts</option>
                  <option value="LOGOUT">User Logouts</option>
                  <option value="FORCED_LOGOUT">Force Logouts</option>
                  <option value="ADMIN_CREATED">Admins Created</option>
                  <option value="ADMIN_SUSPENDED">Admins Suspended</option>
                  <option value="PASSWORD_CHANGED">Password Changes</option>
                </select>
              </div>

              <div className="settings-table-wrap">
                <table className="settings-table audit-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Event</th>
                      <th>User</th>
                      <th>IP / Client</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.slice(0, 120).map((log) => (
                      <tr key={log.id}>
                        <td className="table-date">
                          <Clock size={12} /> {formatDateTime(log.timestamp)}
                        </td>
                        <td>
                          <span className={`audit-badge ${getActionBadgeClass(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <div className="table-primary-text"><code>@{log.username}</code></div>
                          <div className="table-secondary-text">{log.role}</div>
                        </td>
                        <td>
                          <div className="table-primary-text">{log.ip}</div>
                          <div className="table-secondary-text">{summarizeUserAgent(log.userAgent)}</div>
                        </td>
                        <td className="audit-details">{log.details}</td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="empty-table-cell">No matching security events recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 5: STUDENT PORTAL CREDENTIALS (DEVELOPER ONLY) */}
          {activeSection === 'student' && isDeveloper && (
            <div className="settings-card settings-card-narrow">
              <div className="settings-card-header">
                <BookOpen size={20} />
                <div>
                  <h2>Common Student E-Library Login</h2>
                  <p>Shared credentials used by Thakshila College students to unlock E-Library past papers &amp; study packs.</p>
                </div>
              </div>

              {studentMessage && (
                <div className={`settings-alert ${studentMessage.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                  {studentMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  <span>{studentMessage.text}</span>
                </div>
              )}

              <div className="student-config-meta">
                <span>Current Username: <code>{studentConfig.username}</code></span>
                {studentConfig.updatedAt && (
                  <span>Last Updated: {formatDateTime(studentConfig.updatedAt)} ({studentConfig.updatedBy})</span>
                )}
              </div>

              <form onSubmit={handleStudentConfigUpdate} className="settings-form">
                <div className="form-group">
                  <label>Common Student Username</label>
                  <input
                    type="text"
                    value={studentUsername}
                    onChange={(e) => setStudentUsername(e.target.value)}
                    placeholder="e.g. student"
                    minLength={3}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Student Password <small>(Leave blank to keep existing password)</small></label>
                  <input
                    type="text"
                    value={studentNewPassword}
                    onChange={(e) => setStudentNewPassword(e.target.value)}
                    placeholder="Enter new shared password (min. 6 chars)"
                    minLength={6}
                  />
                </div>
                <button type="submit" className="btn-settings-primary" disabled={studentLoading}>
                  <CheckCircle2 size={16} />
                  <span>{studentLoading ? 'Saving...' : 'Save Student Credentials'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
