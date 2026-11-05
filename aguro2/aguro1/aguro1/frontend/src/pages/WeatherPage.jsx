import React, { useState, useEffect } from 'react';
import { weatherAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import {
  CloudSun,
  Search,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  ShieldAlert,
  Calendar,
  Compass,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';

const QUICK_DISTRICTS = [
  'Kerala (All Districts)',
  'Palakkad',
  'Wayanad',
  'Idukki',
  'Munnar',
  'Ernakulam',
  'Thrissur',
  'Alappuzha',
  'Kottayam',
  'Kozhikode',
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Malappuram',
  'Kannur',
  'Kasaragod'
];

const WeatherPage = () => {
  const [location, setLocation] = useState('Palakkad');
  const [searchInput, setSearchInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async (loc) => {
    setLoading(true);
    setError('');
    try {
      const res = await weatherAPI.getWeather(loc);
      setWeather(res.data);
    } catch (err) {
      console.error('Weather error:', err);
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : `Location "${loc}" not found. Please select a valid Kerala district or agricultural region (e.g. Palakkad, Wayanad, Idukki, Munnar, Ernakulam).`;
      setError(msg);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput.trim());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <CloudSun size={15} />
            <span>Agrometeorological Intelligence</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-950)' }}>
            Live Agricultural Weather & Forecast
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Accurate hyper-local temperature, rainfall probability, and field spray advisories.
          </p>
        </div>

        {/* Location Search Form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', minWidth: '280px' }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter district (e.g. Wayanad)..."
            className="form-input"
            style={{ padding: '9px 14px', fontSize: '0.9rem' }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Quick District Selector Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {QUICK_DISTRICTS.map((dist) => (
          <button
            key={dist}
            onClick={() => {
              setLocation(dist);
              setSearchInput('');
            }}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: '9999px',
              border: location.toLowerCase() === dist.toLowerCase() ? '1.5px solid var(--primary-700)' : '1px solid var(--border-light)',
              backgroundColor: location.toLowerCase() === dist.toLowerCase() ? 'var(--primary-50)' : 'var(--bg-surface)',
              color: location.toLowerCase() === dist.toLowerCase() ? 'var(--primary-900)' : 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <MapPin size={13} color={location.toLowerCase() === dist.toLowerCase() ? '#15803d' : '#64748b'} />
            <span>{dist}</span>
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner message={`Fetching meteorological updates for ${location}...`} />}
      {error && <ErrorState message={error} onRetry={() => fetchWeather(location)} />}

      {weather && !loading && (
        <>
          {/* Demo Mode Notice Banner */}
          {weather.is_demo_mode && (
            <div
              style={{
                padding: '12px 18px',
                backgroundColor: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: '#854d0e',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} color="#ca8a04" />
                <span><strong>Demo Weather Mode:</strong> {weather.notice || 'Live weather is unavailable. Showing the latest Kerala demo forecast.'}</span>
              </div>
              <span className="badge badge-amber">Demo Active</span>
            </div>
          )}

          {/* Current Weather Card */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
              color: '#ffffff',
              padding: '36px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MapPin size={20} color="#86efac" />
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{weather.location}</h2>
                  {weather.state && <span style={{ color: '#d1fae5', fontSize: '1rem' }}>, {weather.state}</span>}
                </div>
                <p style={{ color: '#a7f3d0', fontSize: '0.9rem' }}>
                  Updated: {new Date(weather.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginTop: '16px' }}>
                  <span style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1 }}>
                    {Math.round(weather.temperature)}°C
                  </span>
                  <div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, display: 'block' }}>{weather.condition}</span>
                    <span style={{ fontSize: '0.88rem', color: '#d1fae5' }}>Feels like {Math.round(weather.feels_like)}°C • High: {weather.temp_max}° / Low: {weather.temp_min}°</span>
                  </div>
                </div>
              </div>

              {/* Weather Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', minWidth: '280px' }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a7f3d0', textTransform: 'uppercase' }}>Humidity</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>{weather.humidity}%</p>
                </div>

                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a7f3d0', textTransform: 'uppercase' }}>Rain Probability</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>{Math.round(weather.rainfall_probability)}%</p>
                </div>

                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a7f3d0', textTransform: 'uppercase' }}>Wind Speed</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>{weather.wind_speed} km/h</p>
                </div>

                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a7f3d0', textTransform: 'uppercase' }}>Air Quality</span>
                  <p style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '2px', color: '#86efac' }}>{weather.air_quality}</p>
                </div>
              </div>
            </div>

            {/* Advisory Alert Inside Card */}
            {weather.advisory_alert && (
              <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={20} color="#fde047" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.9rem', color: '#fef08a' }}>
                  <strong>Field Farming Advisory:</strong> {weather.advisory_alert}
                </p>
              </div>
            )}
          </div>

          {/* 24-Hour Timeline */}
          {weather.hourly_forecast?.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--primary-700)" />
                <span>Today's Hourly Temperature & Rain Probability</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                {weather.hourly_forecast.map((hf, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 8px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{hf.time}</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
                      {Math.round(hf.temp)}°C
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, display: 'block' }}>
                      {Math.round(hf.rain_chance)}% Rain
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5-Day Extended Daily Forecast */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary-700)" />
              <span>5-Day Agricultural Weather Outlook</span>
            </h3>

            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
              {weather.daily_forecast.map((df, idx) => (
                <div key={idx} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{df.day}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{df.date}</span>
                    </div>

                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-800)', marginBottom: '4px' }}>
                      {Math.round(df.temp_max)}° / <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{Math.round(df.temp_min)}°</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      {df.condition} • {Math.round(df.rain_probability)}% Rain
                    </p>
                  </div>

                  <div style={{ padding: '10px', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-100)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-900)', textTransform: 'uppercase' }}>Farming Advice</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--primary-950)', marginTop: '2px' }}>{df.farming_tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherPage;
