import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sprout,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  CloudSun,
  TrendingUp,
  ShieldAlert,
  Activity,
  Bot,
  Users,
  UserCheck,
  Tractor,
  Bell,
  ShieldCheck,
  LogOut,
  Info,
  Stethoscope
} from 'lucide-react';

const Sidebar = ({ mobileOpen, closeMobile }) => {
  const { user, logout, isAdmin, isProfessional } = useAuth();
  const { t } = useLanguage();

  return (
    <aside className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="brand-icon-box" style={{ width: '36px', height: '36px' }}>
          <Sprout size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
            Agro<span style={{ color: 'var(--primary-400)' }}>Guide</span>
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {user?.role === 'Agricultural Professional'
              ? 'Expert Advisory Hub'
              : user?.role === 'Admin'
              ? 'Admin Control Center'
              : 'Kerala Smart Farming'}
          </span>
        </div>
      </div>

      {/* Menu Navigation */}
      <ul className="sidebar-menu">
        {/* ROLE 1: AGRICULTURAL PROFESSIONAL (EXPERT) */}
        {user?.role === 'Agricultural Professional' ? (
          <>
            <li>
              <NavLink to="/expert-portal" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ color: '#5eead4', fontWeight: 700 }}>
                <Stethoscope size={18} color="#14b8a6" />
                <span>Expert Workspace</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/market-prices" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <TrendingUp size={18} />
                <span>Mandi Prices</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/pests" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ShieldAlert size={18} />
                <span>Pest & Disease Guide</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/crops" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <BookOpen size={18} />
                <span>{t('nav.crops')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/community" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>{t('nav.community')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/notifications" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Bell size={18} />
                <span>{t('nav.notifications')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Info size={18} />
                <span>{t('nav.about')}</span>
              </NavLink>
            </li>
          </>
        ) : user?.role === 'Admin' ? (
          /* ROLE 2: ADMIN */
          <>
            <li>
              <NavLink to="/admin" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ color: '#fca5a5', fontWeight: 700 }}>
                <ShieldCheck size={18} color="#ef4444" />
                <span>Admin Control Panel</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/market-prices" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <TrendingUp size={18} />
                <span>Live Mandi Price Manager</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/crops" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <BookOpen size={18} />
                <span>Crop Database</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/pests" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ShieldAlert size={18} />
                <span>Pest & Disease Database</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/community" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>Community Moderation</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/notifications" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Bell size={18} />
                <span>System Broadcasts</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Info size={18} />
                <span>{t('nav.about')}</span>
              </NavLink>
            </li>
          </>
        ) : (
          /* ROLE 3: FARMER (DEFAULT) */
          <>
            <li>
              <NavLink to="/dashboard" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>{t('nav.dashboard')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/recommendations" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Sparkles size={18} />
                <span>Crop Recommendation</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/market-prices" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <TrendingUp size={18} />
                <span>Live Mandi Prices</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/weather" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <CloudSun size={18} />
                <span>{t('nav.weather')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/crops" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <BookOpen size={18} />
                <span>{t('nav.crops')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/pests" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ShieldAlert size={18} />
                <span>Pest & Disease Guide</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/assistant" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Bot size={18} />
                <span>{t('nav.assistant')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/professionals" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <UserCheck size={18} />
                <span>Agri Experts</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/community" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>{t('nav.community')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Tractor size={18} />
                <span>{t('nav.my_farm')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/notifications" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Bell size={18} />
                <span>{t('nav.notifications')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Info size={18} />
                <span>{t('nav.about')}</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>


      {/* Sidebar Footer User Badge */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>{user?.name || 'Farmer Guest'}</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {user?.role ? `${user.role} • ` : ''}
              {user?.district ? `${user.district}, Kerala` : 'Kerala, India'}
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#ef4444',
              padding: '6px',
              borderRadius: '6px'
            }}
            title={t('nav.logout')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
