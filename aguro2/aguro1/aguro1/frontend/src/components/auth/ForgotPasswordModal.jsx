import React, { useState } from 'react';
import { X, Mail, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';

// ── Shared inline styles ──────────────────────────────────────────────────────
const errorStyle = {
  display: 'flex', alignItems: 'flex-start', gap: '8px',
  padding: '10px 12px', backgroundColor: '#fff5f5',
  border: '1px solid #fed7d7', borderRadius: '8px',
  color: '#c53030', fontSize: '0.85rem', marginBottom: '16px',
};

const infoStyle = {
  display: 'flex', alignItems: 'flex-start', gap: '8px',
  padding: '10px 12px', backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0', borderRadius: '8px',
  color: '#15803d', fontSize: '0.85rem', marginBottom: '16px',
};

const devTokenStyle = {
  display: 'flex', alignItems: 'flex-start', gap: '8px',
  padding: '10px 12px', backgroundColor: '#fffbeb',
  border: '1px solid #fcd34d', borderRadius: '8px',
  color: '#92400e', fontSize: '0.85rem', marginBottom: '16px',
};

/**
 * ForgotPasswordModal
 * A two-step modal:
 *  Step 1 – Enter email  →  request reset token
 *  Step 2 – Enter token + new password  →  confirm reset
 */
const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1 = email entry, 2 = token + new password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Step 1: Request Reset Token ───────────────────────────────────────────
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email.trim());
      const data = res.data;

      // Dev/demo mode: backend returns the token directly when SMTP is not configured
      if (data.dev_token) {
        setToken(data.dev_token);
        setSuccess(
          '✅ Dev mode: No SMTP configured — your reset token has been auto-filled below. ' +
          'In production, this would be sent to your email.'
        );
      } else {
        setSuccess(
          'A reset token has been sent to your email. ' +
          'Check your inbox and paste the token below.'
        );
      }
      setStep(2);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Submit Token + New Password ──────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token.trim(), newPassword);
      setSuccess('Password reset successfully! You can now sign in with your new password.');
      setStep(3);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Invalid or expired token. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      {/* Modal card – stop propagation so clicks inside don't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-light)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={20} />
        </button>

        {/* ── STEP 1: Email Entry ─────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto',
                }}
              >
                <KeyRound size={24} color="var(--primary-700)" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Forgot Password?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Enter your registered email address and we'll send you a reset token.
              </p>
            </div>

            {error && (
              <div style={errorStyle}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestReset}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                <span>{loading ? 'Sending...' : 'Send Reset Token'}</span>
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: '16px' }}>
              Already have a token?{' '}
              <button
                onClick={() => { setError(''); setStep(2); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Enter it here
              </button>
            </p>
          </>
        )}

        {/* ── STEP 2: Token + New Password ────────────────────────────── */}
        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto',
                }}
              >
                <KeyRound size={24} color="var(--primary-700)" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Reset Password
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {token
                  ? 'Token auto-filled (dev mode). Just set your new password below.'
                  : 'Paste the token from your email and choose a new password.'}
              </p>
            </div>

            {/* Info tip shown after step-1 email submission */}
            {success && (
              <div style={token ? devTokenStyle : infoStyle}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div style={errorStyle}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">Reset Token</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setError(''); }}
                  placeholder="Paste your reset token here"
                  style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    style={{ paddingRight: '40px' }}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Repeat new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token.trim() || !newPassword || !confirmPassword}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '4px' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: '14px' }}>
              Didn't get a token?{' '}
              <button
                onClick={() => { setError(''); setSuccess(''); setStep(1); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Request again
              </button>
            </p>
          </>
        )}

        {/* ── STEP 3: Success ──────────────────────────────────────────── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle2 size={52} color="#16a34a" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Password Reset!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={onClose}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
