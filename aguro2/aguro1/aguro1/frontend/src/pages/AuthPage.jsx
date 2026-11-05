import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, LogIn, UserPlus, AlertCircle, UserCheck, ShieldCheck, Tractor } from 'lucide-react';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { t } = useLanguage();

  // Mode state synced with URL path
  const [isRegisterMode, setIsRegisterMode] = useState(location.pathname === '/register');

  useEffect(() => {
    setIsRegisterMode(location.pathname === '/register');
  }, [location.pathname]);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regState, setRegState] = useState('Kerala');
  const [regDistrict, setRegDistrict] = useState('Palakkad');
  const [regRole, setRegRole] = useState('Farmer');
  const [adminAccessKey, setAdminAccessKey] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  // General Error & Loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatApiError = (err) => {
    if (!err) return 'An error occurred. Please try again.';
    const detail = err.response?.data?.detail;
    if (detail) {
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        return detail.map((d) => d.msg || d.detail || JSON.stringify(d)).join(', ');
      }
      if (typeof detail === 'object') return detail.message || JSON.stringify(detail);
    }
    if (err.response?.data?.message) return err.response.data.message;
    if (err.message === 'Network Error' || !err.response || (err.response?.status === 500 && !err.response?.data?.detail)) {
      return 'Unable to connect to AgroGuide backend server. Please ensure the backend server is running on port 8000.';
    }
    return err.message || 'An error occurred. Please try again.';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginEmail.trim(), loginPassword, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (regRole === 'Admin' && !adminAccessKey.trim()) {
      setError('Admin registration requires an Admin Access Passcode.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        confirm_password: regConfirmPassword,
        state: regState,
        district: regDistrict,
        role: regRole,
        admin_access_key: adminAccessKey.trim(),
        preferred_language: preferredLanguage,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setIsRegisterMode(false);
    setLoginEmail(demoEmail);
    setLoginPassword(demoPassword);
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
    <div style={{ padding: '48px 20px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: isRegisterMode ? '560px' : '480px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-light)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
              margin: '0 auto 14px auto',
            }}
          >
            <Sprout size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            AgroGuide Platform Access
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isRegisterMode ? t('auth.register_sub') : t('auth.login_sub')}
          </p>
        </div>

        {/* Unified Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--primary-50)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            border: '1px solid var(--primary-100)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.92rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: !isRegisterMode ? '#ffffff' : 'transparent',
              color: !isRegisterMode ? 'var(--primary-800)' : 'var(--text-secondary)',
              boxShadow: !isRegisterMode ? 'var(--shadow-subtle)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.92rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: isRegisterMode ? '#ffffff' : 'transparent',
              color: isRegisterMode ? 'var(--primary-800)' : 'var(--text-secondary)',
              boxShadow: isRegisterMode ? 'var(--shadow-subtle)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </button>
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

        {/* MODE 1: SIGN IN FORM */}
        {!isRegisterMode ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <input
                type="email"
                required
                className="form-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="farmer@agroguide.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input
                type="password"
                required
                className="form-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
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
              <span style={{ color: 'var(--text-muted)' }}>Forgot Password?</span>
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

            {/* Quick Demo Accounts */}
            <div style={{ paddingTop: '18px', borderTop: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', textAlign: 'center', marginBottom: '10px' }}>
                Quick Demo One-Click Access
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
          </form>
        ) : (
          /* MODE 2: CREATE ACCOUNT FORM */
          <form onSubmit={handleRegisterSubmit}>
            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t('auth.full_name')}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Sreeraj Menon"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.email')}</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="farmer@domain.com"
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t('auth.phone')}</label>
                <input
                  type="tel"
                  className="form-input"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.user_type')}</label>
                <select
                  className="form-select"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                >
                  <option value="Farmer">{t('auth.farmer')}</option>
                  <option value="Agricultural Professional">{t('auth.expert')}</option>
                  <option value="Admin">{t('auth.admin')}</option>
                </select>
              </div>
            </div>

            {regRole === 'Admin' && (
              <div className="form-group" style={{ backgroundColor: '#fffbe6', padding: '14px', borderRadius: '8px', border: '1px solid #ffe58f' }}>
                <label className="form-label" style={{ color: '#873800', fontWeight: 700 }}>
                  🛡️ Secret Admin Access Passcode
                </label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={adminAccessKey}
                  onChange={(e) => setAdminAccessKey(e.target.value)}
                  placeholder="Enter secret admin key"
                />
              </div>
            )}

            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t('auth.state')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={regState}
                  onChange={(e) => setRegState(e.target.value)}
                  placeholder="Kerala"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.district')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  placeholder="Palakkad"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.preferred_language')}</label>
              <select
                className="form-select"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="hi">ഹിन्दी (Hindi)</option>
              </select>
            </div>

            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t('auth.password')}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-input"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.confirm_password')}</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '12px' }}
            >
              <UserPlus size={18} />
              <span>{loading ? 'Creating Account...' : t('auth.register_btn')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
