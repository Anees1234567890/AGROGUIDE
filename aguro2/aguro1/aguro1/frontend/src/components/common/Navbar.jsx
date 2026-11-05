import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import {
  Sprout,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  LayoutDashboard,
  Sparkles,
  CloudSun,
  TrendingUp,
  ShieldAlert,
  Users,
  ShieldCheck,
  BookOpen,
  Activity,
  Stethoscope,
  LogIn
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isProfessional } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="max-width-container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <div className="brand-icon-box">
            <Sprout size={24} />
          </div>
          <div>
            <span style={{ color: 'var(--primary-900)' }}>Agro</span>
            <span style={{ color: 'var(--primary-600)' }}>Guide</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links nav-links-desktop">
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              {t('nav.home')}
            </NavLink>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={16} />
                  {t('nav.dashboard')}
                </NavLink>
              </li>
              {isProfessional && (
                <li>
                  <NavLink to="/expert-portal" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`} style={{ color: '#0d9488', fontWeight: 700 }}>
                    <Stethoscope size={16} />
                    Expert Portal
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/recommendations" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  <Sparkles size={16} />
                  Crop Recommender
                </NavLink>
              </li>

              <li>
                <NavLink to="/market-prices" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  <TrendingUp size={16} />
                  Mandi Prices
                </NavLink>
              </li>
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`} style={{ color: '#b91c1c', fontWeight: 700 }}>
                    <ShieldCheck size={16} />
                    Admin
                  </NavLink>
                </li>
              )}
            </>
          ) : (
            <>
              <li>
                <NavLink to="/about" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  {t('nav.about')}
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Right Actions: Language + Auth State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LanguageSelector />

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/notifications"
                style={{
                  color: 'var(--text-secondary)',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  position: 'relative'
                }}
                title={t('nav.notifications')}
              >
                <Bell size={19} />
              </Link>

              <Link
                to="/profile"
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <User size={15} />
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title={t('nav.logout')}
                style={{ padding: '8px' }}
              >
                <LogOut size={16} color="#dc2626" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <span>Create Account</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'none',
              padding: '6px',
            }}
            className="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-light)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">{t('nav.home')}</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">{t('nav.about')}</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">{t('nav.dashboard')}</Link>
              {isProfessional && <Link to="/expert-portal" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">Expert Portal</Link>}
              <Link to="/recommendations" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">Crop Recommendation</Link>

              <Link to="/market-prices" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">Live Mandi Prices</Link>
              <Link to="/weather" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">{t('nav.weather')}</Link>
              <Link to="/crops" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">{t('nav.crops')}</Link>
              <Link to="/professionals" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">{t('nav.experts')}</Link>
              <Link to="/community" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">{t('nav.community')}</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">Admin Dashboard</Link>}
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="nav-link-item">Create Account</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
