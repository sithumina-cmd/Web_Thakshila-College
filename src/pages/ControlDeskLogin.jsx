import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  User,
  Lock,
  ArrowLeft,
  AlertTriangle,
  Eye,
  EyeOff,
  Terminal
} from 'lucide-react';
import SchoolCrest from '../components/SchoolCrest';

export default function ControlDeskLogin({
  settings,
  onControlDeskLogin,
  onReturnHome
}) {
  const [loginMode, setLoginMode] = useState('admin'); // 'admin' | 'developer'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLocked(false);
    setLoading(true);
    try {
      const res = await onControlDeskLogin({
        username,
        password,
        securityPin: loginMode === 'developer' ? securityPin : '',
        loginMode
      });
      if (!res.success) {
        setError(res.message || 'Authentication rejected.');
        setIsLocked(Boolean(res.locked));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="control-desk-screen">
      <div className="control-desk-card">
        <button
          type="button"
          className="btn-back-public"
          onClick={onReturnHome}
        >
          <ArrowLeft size={15} />
          <span>Return to Website</span>
        </button>

        <div className="control-desk-header">
          <SchoolCrest size={64} src={settings?.schoolLogo || '/Pictures/School Logo.png'} />
          <span className="control-desk-badge">RESTRICTED SYSTEM ACCESS</span>
          <h2>Thakshila Control Desk</h2>
          <p>Authorized Staff & Master Developer Authentication</p>
        </div>

        {/* Mode Switcher: Administrator vs Developer Master */}
        <div className="login-tabs-header">
          <button
            type="button"
            className={`login-tab-pill ${loginMode === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setLoginMode('admin');
              setError('');
            }}
          >
            <ShieldCheck size={16} />
            <span>Administrator</span>
          </button>

          <button
            type="button"
            className={`login-tab-pill special-tab ${loginMode === 'developer' ? 'active' : ''}`}
            onClick={() => {
              setLoginMode('developer');
              setError('');
            }}
          >
            <Terminal size={16} />
            <span>Developer Master</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="special-login-form">
          {error && (
            <div className={`login-error-alert ${isLocked ? 'locked-alert' : ''}`}>
              {isLocked && <AlertTriangle size={16} style={{ flexShrink: 0 }} />}
              <span>{error}</span>
            </div>
          )}

          <div className="login-field">
            <label>Username</label>
            <div className="input-with-icon">
              <User size={17} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={loginMode === 'developer' ? 'Enter developer username' : 'Enter administrator username'}
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
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {loginMode === 'developer' && (
            <div className="login-field">
              <label>Master Security PIN</label>
              <div className="input-with-icon pin-input-wrap">
                <KeyRound size={17} />
                <input
                  type={showPin ? 'text' : 'password'}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="Enter high-security Master PIN"
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-pin"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? 'Hide Security PIN' : 'Show Security PIN'}
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-admin-submit"
          >
            <ShieldCheck size={18} />
            <span>
              {loading
                ? 'Verifying Cryptography...'
                : loginMode === 'developer'
                ? 'Authenticate Developer Master'
                : 'Sign In to Administrator Panel'}
            </span>
          </button>

          <p className="security-policy-note">
            Protected by salted scrypt hashing, session token signing & 3-attempt brute-force lockout (15 min).
          </p>
        </form>
      </div>
    </div>
  );
}
