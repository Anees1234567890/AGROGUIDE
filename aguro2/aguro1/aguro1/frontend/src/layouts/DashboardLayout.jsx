import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import LanguageSelector from '../components/common/LanguageSelector';
import FloatingChat from '../components/chat/FloatingChat';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Menu, Bell, User, LogOut } from 'lucide-react';

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, primaryFarm, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileSidebarOpen} closeMobile={() => setMobileSidebarOpen(false)} />

      {/* Main Dashboard Panel */}
      <div className="dashboard-main">
        {/* Top bar with farm switcher, notifications, language & profile */}
        <header className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'none',
                color: 'var(--text-primary)',
              }}
              className="mobile-menu-toggle"
            >
              <Menu size={24} />
            </button>

          </div>

          {/* Right Header Utilities */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <LanguageSelector />

            <Link
              to="/notifications"
              style={{
                color: 'var(--text-secondary)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
              title="Notifications"
            >
              <Bell size={20} />
            </Link>

            <Link
              to="/profile"
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={15} />
              <span>{user?.name || 'Farmer'}</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Dynamic View */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>

      <FloatingChat />
    </div>
  );
};

export default DashboardLayout;
