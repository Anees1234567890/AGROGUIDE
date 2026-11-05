import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, Heart, ShieldAlert, PhoneCall } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer style={{ backgroundColor: 'var(--primary-950)', color: '#cbd5e1', paddingTop: '48px', paddingBottom: '28px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-width-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div className="brand-icon-box" style={{ width: '34px', height: '34px', backgroundColor: 'var(--primary-700)' }}>
                <Sprout size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>AgroGuide</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
              Smart farming advisory system empowering farmers with localized crop recommendations, live weather, APMC mandi trends, and pest diagnosis.
            </p>
            <LanguageSelector variant="dark" />
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>Platform Services</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <li><Link to="/recommendations" style={{ color: '#94a3b8', textDecoration: 'none' }}>Crop Recommendation Engine</Link></li>
              <li><Link to="/crops" style={{ color: '#94a3b8', textDecoration: 'none' }}>100+ Indian Crop Library</Link></li>
              <li><Link to="/weather" style={{ color: '#94a3b8', textDecoration: 'none' }}>Localized Weather Forecasts</Link></li>
              <li><Link to="/market-prices" style={{ color: '#94a3b8', textDecoration: 'none' }}>Live & Demo Mandi Prices</Link></li>
              <li><Link to="/pests" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pest & Disease Diagnosis</Link></li>
            </ul>
          </div>

          {/* Expert & Community */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>Support & Community</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <li><Link to="/assistant" style={{ color: '#94a3b8', textDecoration: 'none' }}>AgroGuide AI Assistant</Link></li>
              <li><Link to="/professionals" style={{ color: '#94a3b8', textDecoration: 'none' }}>Agricultural Extension Officers</Link></li>
              <li><Link to="/community" style={{ color: '#94a3b8', textDecoration: 'none' }}>Farmer Discussion Forum</Link></li>
              <li><Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About AgroGuide Platform</Link></li>
            </ul>
          </div>

          {/* Helpline & Safety Advisory */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>Farmer Support Line</h4>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-400)', fontWeight: 700, marginBottom: '6px' }}>
                <PhoneCall size={16} />
                <span>Kisan Call Center: 1800-180-1551</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Toll-free agricultural guidance across Indian languages (6:00 AM to 10:00 PM).
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', fontSize: '0.82rem', color: '#64748b' }}>
          <p>
            &copy; {new Date().getFullYear()} AgroGuide. Built for Indian & Kerala Agricultural Innovation.
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={14} color="#f59e0b" />
            <span>Advisory information only. Confirm treatments with local Krishi Bhavan.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
