import React from 'react';
import { Link } from 'react-router-dom';
import { CloudSun, Droplets, Wind, CloudRain, ArrowRight, ShieldAlert } from 'lucide-react';

const WeatherCard = ({ weather }) => {
  if (!weather) return null;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Field Climate
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {weather.location}
            </h3>
          </div>
          <span className={`badge ${weather.is_demo_mode ? 'badge-amber' : 'badge-green'}`}>
            {weather.is_demo_mode ? 'Demo Mode' : 'Live Data'}
          </span>
        </div>

        {/* Big Temperature & Condition */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloudSun size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {Math.round(weather.temperature)}°C
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
              {weather.condition} • Feels like {Math.round(weather.feels_like)}°C
            </div>
          </div>
        </div>

        {/* Sub-Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#0284c7', fontSize: '0.78rem', fontWeight: 700 }}>
              <Droplets size={14} />
              <span>Humidity</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '2px' }}>
              {weather.humidity}%
            </div>
          </div>

          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#059669', fontSize: '0.78rem', fontWeight: 700 }}>
              <CloudRain size={14} />
              <span>Rain Chance</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '2px' }}>
              {Math.round(weather.rainfall_probability)}%
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#7c3aed', fontSize: '0.78rem', fontWeight: 700 }}>
              <Wind size={14} />
              <span>Wind</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '2px' }}>
              {weather.wind_speed} km/h
            </div>
          </div>
        </div>

        {/* Advisory Warning Snippet */}
        {weather.advisory_alert && (
          <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
            <ShieldAlert size={16} color="#ca8a04" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.8rem', color: '#854d0e', lineHeight: 1.4 }}>{weather.advisory_alert}</p>
          </div>
        )}
      </div>

      <Link
        to="/weather"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textDecoration: 'none',
          color: 'var(--primary-700)',
          fontWeight: 700,
          fontSize: '0.9rem',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <span>5-Day Full Forecast</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default WeatherCard;
