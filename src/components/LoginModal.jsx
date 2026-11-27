import React, { useState } from 'react';
import {
  Lock,
  User,
  X,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import SchoolCrest from './SchoolCrest';

export default function LoginModal({
  isOpen,
  onClose,
  onStudentLogin,
  currentUser,
  onLogout,
  onOpenELibrary,
  settings
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isAuthenticated = Boolean(currentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLocked(false);
    setLoading(true);
    try {
      const res = await onStudentLogin(username, password);
      if (res.success) {
        setUsername('');
        setPassword('');
        onClose();
      } else {
        setError(res.message || 'Invalid student credentials.');
        setIsLocked(Boolean(res.locked));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn abs-top-right"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Brand Header */}
        <div className="login-modal-header">
          <SchoolCrest size={64} src={settings.schoolLogo || '/Pictures/School Logo.png'} />
          <h3>Thakshila College - Gampaha</h3>
          <p className="login-modal-subtitle">
            Student E-Library & Academic Resources Portal
          </p>
        </div>

        <div className="special-tab-content">
          {isAuthenticated ? (
            <div className="already-logged-in-box">
              <CheckCircle2 size={36} className="success-icon" />
              <h4>Student E-Library Access Active</h4>
              <p>
                Signed in as <strong>{currentUser.name || currentUser.username}</strong>. You can now download Past Papers, Term Test Papers, and Study Resources.
              </p>
              <div className="logged-in-actions">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenELibrary) onOpenELibrary();
                  }}
                  className="btn-continue-editing"
                >
                  <BookOpen size={16} />
                  <span>Open E-Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="btn-admin-logout"
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="special-login-form">
              <div className="student-portal-banner">
                <GraduationCap size={18} />
                <span>
                  Sign in with your <strong>Student Portal</strong> credentials to access and download Past Papers and Study Notes in the <strong>E-Library</strong>.
                  <br />
                  <small style={{ opacity: 0.85, display: 'inline-block', marginTop: '4px' }}>
                    Standard student access: Username <strong>student</strong> • Password <strong>thakshila2026</strong>
                  </small>
                </span>
              </div>

              {error && (
                <div className={`login-error-alert ${isLocked ? 'locked-alert' : ''}`}>
                  {isLocked && <AlertTriangle size={16} style={{ flexShrink: 0 }} />}
                  <span>{error}</span>
                </div>
              )}

              <div className="login-field">
                <label>Student Username</label>
                <div className="input-with-icon">
                  <User size={17} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter student username"
                    autoComplete="username"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="login-field">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={17} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter student password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-admin-submit"
              >
                <BookOpen size={18} />
                <span>{loading ? 'Signing In...' : 'Sign In to E-Library'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
