import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout,
  Sparkles,
  CloudSun,
  TrendingUp,
  ShieldAlert,
  Bot,
  Users,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileSpreadsheet,
  Globe2
} from 'lucide-react';

const Landing = () => {
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', paddingBottom: '64px' }}>
      {/* 1. Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
          paddingTop: '64px',
          paddingBottom: '64px',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="max-width-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '20px',
              }}
            >
              <Sprout size={16} />
              <span>Smart Farming. Better Decisions.</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                fontWeight: 800,
                color: 'var(--primary-950)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}
            >
              Unified Agricultural Advisory for Smarter, Data-Driven Farming.
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '32px',
              }}
            >
              AgroGuide brings personalized crop recommendations, localized weather forecasts, live mandi market prices, pest and disease diagnosis, and professional agronomist support together into one unified digital dashboard.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/crops" className="btn btn-secondary btn-lg">
                <span>Explore 100+ Crops</span>
              </Link>
            </div>

            {/* Trust Stats Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '40px' }}>
              {[
                { icon: '🌾', value: '500+', label: 'Crops Covered' },
                { icon: '🌐', value: '3', label: 'Languages' },
                { icon: '⚡', value: 'Free', label: 'Forever Plan' },
                { icon: '📡', value: '24/7', label: 'AI Support' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 18px',
                    backgroundColor: '#fff',
                    border: '1.5px solid var(--primary-100)',
                    borderRadius: '50px',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(22,163,74,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,163,74,0.08)'; }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{stat.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-800)', lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
      </section>

      {/* 2. Platform Features Section */}
      <section className="max-width-container">
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 48px auto' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Comprehensive Solutions
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
            Everything a Modern Farmer Needs, in One Simple Dashboard.
          </h2>
        </div>

        <div className="grid-3">
          {/* Card 1 */}
          <div className="card card-hover">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Smart Crop Recommendation
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Rule-based agronomic algorithm matches your soil type, pH levels, season, water access, and previous crop to suggest maximum-yield varieties.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card card-hover">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <CloudSun size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Live Weather & Rain Forecasting
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Real-time atmospheric insights, 5-day rainfall probability, and field spray advisories connected to OpenWeatherMap with demo fallback.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card card-hover">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Mandi Market Prices
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Benchmark daily modal rates, historical price trend indicators (↑ Rising, ↓ Falling, - Steady), and market filters across APMC mandis.
            </p>
          </div>

          {/* Card 4 */}
          <div className="card card-hover">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Pest & Disease Diagnosis
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Searchable guide of common agricultural pests and fungal/bacterial diseases with biological and preventive management strategies.
            </p>
          </div>

          {/* Card 5 */}
          <div className="card card-hover">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Bot size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              AgroGuide AI Assistant
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              24/7 conversational agricultural chatbot with intelligent offline agronomy knowledge answering queries in English, Malayalam, and Hindi.
            </p>
          </div>

          {/* Card 6 */}
          <div className="card card-hover">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Community & Expert Support
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Direct access to registered Krishi Bhavan officers and university scientists, plus a farmer forum for peer-to-peer discussions.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How It Works (4 Steps) */}
      <section style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', padding: '64px 0' }}>
        <div className="max-width-container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 48px auto' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Project Workflow
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
              How AgroGuide Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {/* Step 1 */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', position: 'relative' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-200)', marginBottom: '8px' }}>01</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Enter Farm Details</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Provide your location, soil type, pH level, water availability, and current season.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-200)', marginBottom: '8px' }}>02</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>AgroGuide Analyzes</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Our modular agronomy engine evaluates over 100 crops against weighted soil and climatic factors.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-200)', marginBottom: '8px' }}>03</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Receive Insights</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                View ranked suitability scores, weather alerts, cultivation calendars, and mandi trends.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-200)', marginBottom: '8px' }}>04</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Take Action</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Sow optimal crops, protect against pests with biological methods, and maximize market profit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Platform Capabilities Statistics */}
      <section className="max-width-container">
        <div style={{ backgroundColor: 'var(--primary-900)', borderRadius: 'var(--radius-xl)', padding: '48px 36px', color: '#ffffff', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '32px' }}>
            Engineered For Real-World Agricultural Impact
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '28px' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-300)' }}>105+</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginTop: '4px' }}>Structured Crops</div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>Cereals, pulses, vegetables, spices & fruits</p>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-300)' }}>3</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginTop: '4px' }}>Languages Supported</div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>English, മലയാളം & हिन्दी</p>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-300)' }}>24/7</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginTop: '4px' }}>AI & Expert Guidance</div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>Intelligent fallback knowledge engine</p>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-300)' }}>100%</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', marginTop: '4px' }}>Localized Advisory</div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>Tailored to Indian & Kerala agro-climates</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="max-width-container" style={{ textAlign: 'center', padding: '24px 0' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Ready to Make Smarter Farming Decisions?
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto 28px auto' }}>
          Create your free farm account in less than 2 minutes and experience data-driven agriculture today.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">
          <span>Create Free Account</span>
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
};

export default Landing;
