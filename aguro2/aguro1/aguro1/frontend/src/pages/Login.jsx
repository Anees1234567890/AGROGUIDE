import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, LogIn, AlertCircle, UserCheck, ShieldCheck, Tractor } from 'lucide-react';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const formatApiError = (err) => {
    if (!err) return 'An error occurred. Please try again.';
    const detail = err.response?.data?.detail;
    if (detail) {
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        return detail.map((d) => d.msg || d.detail || JSON.stringify(d)).join(', ');
      }
      return typeof detail === 'object' ? (detail.message || JSON.stringify(detail)) : String(detail);
    }
    if (err.response?.data?.message) return err.response.data.message;
    if (err.message === 'Network Error' || !err.response || (err.response?.status === 500 && !err.response?.data?.detail)) {
      return 'Unable to connect to AgroGuide backend server. Please ensure the backend server is running on port 8000.';
    }
    return err.message || 'An error occurred. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail.trim(), demoPassword, true);
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick demo login error:', err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div style={{ padding: '64px 20px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-light)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'var(--primary-700)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <Sprout size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('auth.welcome_back')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {t('auth.login_sub')}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#fff5f5',
              border: '1px solid #fed7d7',
              borderRadius: 'var(--radius-md)',
              color: '#c53030',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <input
              type="text"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or phone number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.88rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary-700)' }}
              />
              <span>Remember Me</span>
            </label>
            <button
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--primary-700)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Forgot Password?
              </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '24px' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : t('auth.login_btn')}</span>
          </button>
        </form>

        {/* Quick Demo Logins Container */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-light)', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', textAlign: 'center', marginBottom: '10px' }}>
            Quick Demo Accounts
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('farmer@agroguide.com', 'farmer123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 4px' }}
            >
              <Tractor size={14} color="#16a34a" />
              <span>Farmer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('expert@agroguide.com', 'expert123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 4px' }}
            >
              <UserCheck size={14} color="#0284c7" />
              <span>Expert</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@agroguide.com', 'admin123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 4px' }}
            >
              <ShieldCheck size={14} color="#dc2626" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <span>{t('auth.no_account')} </span>
          <Link to="/register" style={{ color: 'var(--primary-700)', fontWeight: 700, textDecoration: 'none' }}>
            {t('auth.register_btn')}
          </Link>
        </div>
      </div>
    </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </>
  );
};

export default Login;
