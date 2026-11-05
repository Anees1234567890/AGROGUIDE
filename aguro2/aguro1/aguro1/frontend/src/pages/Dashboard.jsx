import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { weatherAPI, marketAPI, recommendationAPI } from '../services/api';
import WeatherCard from '../components/dashboard/WeatherCard';
import MarketPriceCard from '../components/dashboard/MarketPriceCard';
import RecommendationCard from '../components/dashboard/RecommendationCard';
import AlertCard from '../components/dashboard/AlertCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Sparkles,
  CloudSun,
  TrendingUp,
  Bot,
  BookOpen,
  ShieldAlert,
  Tractor,
  Layers,
  Calendar,
  Droplets,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const Dashboard = () => {
  const { user, primaryFarm, isAdmin, isProfessional } = useAuth();
  const { t } = useLanguage();

  if (user?.role === 'Admin' || isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'Agricultural Professional' || isProfessional) {
    return <Navigate to="/expert-portal" replace />;
  }


  const [weather, setWeather] = useState(null);
  const [marketPrices, setMarketPrices] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const district = 'Kerala (All Districts)';
        
        const [wRes, mRes, rRes] = await Promise.allSettled([
          weatherAPI.getWeather(district),
          marketAPI.getPrices({ limit: 4 }),
          recommendationAPI.generate({
            state: user?.state || 'Kerala',
            district: district,
            soil_type: primaryFarm?.soil_type || 'Alluvial',
            soil_ph: primaryFarm?.soil_ph || 6.5,
            farm_size: primaryFarm?.farm_size || 2.5,
            irrigation_availability: primaryFarm?.irrigation_type || 'Canal / River',
          }),

        ]);

        if (wRes.status === 'fulfilled') setWeather(wRes.value.data);
        if (mRes.status === 'fulfilled') setMarketPrices(mRes.value.data.items || []);
        if (rRes.status === 'fulfilled') setRecommendations(rRes.value.data.recommendations || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, primaryFarm]);

  if (loading) {
    return <LoadingSpinner message="Assembling your personalized agricultural dashboard..." />;
  }

  const farmerName = user?.name ? user.name.split(' ')[0] : 'Farmer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Dashboard Greeting Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-950)' }}>
            Good Day, {farmerName} 👋
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Here is your daily farm health summary, field climate, and APMC market overview.
          </p>
        </div>

        <Link to="/recommendations" className="btn btn-primary">
          <Sparkles size={18} />
          <span>New Crop Assessment</span>
        </Link>
      </div>

      {/* 1. Farm Summary Banner */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-card)',
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tractor size={20} color="var(--primary-700)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {primaryFarm?.farm_name || 'My Primary Farm'}
            </h3>
          </div>
          <Link to="/profile" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-700)', textDecoration: 'none' }}>
            Edit Farm Details →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Location</span>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem', marginTop: '2px' }}>
              {primaryFarm?.location || `${user?.district || 'Palakkad'}, ${user?.state || 'Kerala'}`}
            </p>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Soil Profile</span>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem', marginTop: '2px' }}>
              {primaryFarm?.soil_type || 'Alluvial'} (pH {primaryFarm?.soil_ph || 6.5})
            </p>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Farm Size & Irrigation</span>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem', marginTop: '2px' }}>
              {primaryFarm?.farm_size || 2.5} Acres • {primaryFarm?.irrigation_type || 'Canal'}
            </p>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Current Crops</span>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem', marginTop: '2px' }}>
              {primaryFarm?.current_crops || 'Rice (Paddy), Banana'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Bar */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Quick Farming Tools
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
          <Link
            to="/recommendations"
            className="card card-hover"
            style={{
              padding: '16px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
            }}
          >
            <Sparkles size={24} color="var(--primary-700)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-900)' }}>Find Suitable Crop</span>
          </Link>

          <Link
            to="/weather"
            className="card card-hover"
            style={{
              padding: '16px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
            }}
          >
            <CloudSun size={24} color="#0284c7" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a8a' }}>Check Weather</span>
          </Link>

          <Link
            to="/market-prices"
            className="card card-hover"
            style={{
              padding: '16px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#fefce8',
              border: '1px solid #fef08a',
            }}
          >
            <TrendingUp size={24} color="#ca8a04" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#854d0e' }}>Mandi Prices</span>
          </Link>

          <Link
            to="/assistant"
            className="card card-hover"
            style={{
              padding: '16px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#f3e8ff',
              border: '1px solid #e9d5ff',
            }}
          >
            <Bot size={24} color="#7e22ce" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#581c87' }}>Ask AgroGuide AI</span>
          </Link>

          <Link
            to="/crops"
            className="card card-hover"
            style={{
              padding: '16px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
            }}
          >
            <BookOpen size={24} color="#059669" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#064e3b' }}>100+ Crop Library</span>
          </Link>
        </div>

      </div>

      {/* 3. Core Dashboard Cards Grid (Weather, Mandi Prices, Recommendation, Alerts) */}
      <div className="grid-2">
        <WeatherCard weather={weather} />
        <MarketPriceCard prices={marketPrices} />
      </div>

      <div className="grid-2">
        <RecommendationCard farm={primaryFarm} recommendations={recommendations} />
        <AlertCard />
      </div>
    </div>
  );
};

export default Dashboard;
