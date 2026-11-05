import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, UserPlus, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('Kerala');
  const [district, setDistrict] = useState('Palakkad');
  const [role, setRole] = useState('Farmer');
  const [preferredLanguage, setPreferredLanguage] = useState('en');  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirm_password: confirmPassword,
        state,
        district,
        role,
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

  return (
    <div style={{ padding: '64px 20px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
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
            {t('auth.create_account')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {t('auth.register_sub')}
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
          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">{t('auth.full_name')}</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sreeraj Menon"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.user_type')}</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Farmer">{t('auth.farmer')}</option>
                <option value="Agricultural Professional">{t('auth.expert')}</option>
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">{t('auth.state')}</label>
              <input
                type="text"
                className="form-input"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Kerala"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.district')}</label>
              <input
                type="text"
                className="form-input"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.confirm_password')}</label>
              <input
                type="password"
                required
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '12px', marginBottom: '20px' }}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : t('auth.register_btn')}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <span>{t('auth.have_account')} </span>
          <Link to="/login" style={{ color: 'var(--primary-700)', fontWeight: 700, textDecoration: 'none' }}>
            {t('auth.login_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
