import React from 'react';
import { AlertCircle, CloudRain, TrendingUp, ShieldAlert } from 'lucide-react';

const AlertCard = ({ alerts = [] }) => {
  const defaultAlerts = [
    {
      id: 1,
      type: 'weather',
      title: 'Monsoon Transition Approaching',
      text: 'Pre-monsoon rainfall expected across coastal districts. Ensure proper drainage channels in low-lying paddy plots.',
      time: 'Today',
    },
    {
      id: 2,
      type: 'pest',
      title: 'Stem Borer Advisory in Rice',
      text: 'Moderate stem borer incidence reported in regional paddy tracts. Install light and pheromone traps.',
      time: 'Yesterday',
    },
    {
      id: 3,
      type: 'market',
      title: 'Black Pepper & Cardamom Bullish',
      text: 'Strong auction demand for Malabar pepper and Vandanmedu cardamom capsules.',
      time: '2 days ago',
    },
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  return (
    <div className="card" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Advisories
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Real-Time Farm Alerts
          </h3>
        </div>
        <span className="badge badge-amber">3 Active</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayAlerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: alert.type === 'weather' ? '#f0fdf4' : alert.type === 'pest' ? '#fefce8' : '#eff6ff',
              border: `1px solid ${alert.type === 'weather' ? '#bbf7d0' : alert.type === 'pest' ? '#fef08a' : '#bfdbfe'}`,
              display: 'flex',
              gap: '12px',
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {alert.type === 'weather' && <CloudRain size={18} color="#16a34a" />}
              {alert.type === 'pest' && <ShieldAlert size={18} color="#ca8a04" />}
              {alert.type === 'market' && <TrendingUp size={18} color="#2563eb" />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{alert.title}</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{alert.time}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>
                {alert.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertCard;
