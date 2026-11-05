import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cropsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import {
  Sprout,
  ArrowLeft,
  Calendar,
  Layers,
  Droplets,
  Thermometer,
  Clock,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  BookOpen,
  Sparkles
} from 'lucide-react';

const CropDetails = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCropDetails = async () => {
      setLoading(true);
      try {
        const res = await cropsAPI.getById(id);
        setCrop(res.data);
      } catch (err) {
        console.error('Failed to fetch crop details:', err);
        setError('Unable to load crop profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCropDetails();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading full crop cultivation profile..." />;
  if (error || !crop) return <ErrorState message={error || 'Crop not found'} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Back Button */}
      <div>
        <Link
          to="/crops"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--primary-700)',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Crop Library</span>
        </Link>
      </div>

      {/* Main Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--primary-900), var(--primary-800))',
          color: '#ffffff',
          padding: '36px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <span
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'var(--primary-200)',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {crop.category}
            </span>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '12px', lineHeight: 1.1 }}>
              {crop.name}
            </h1>

            {crop.local_name && (
              <p style={{ fontSize: '1.2rem', color: 'var(--primary-300)', fontWeight: 600, marginTop: '6px' }}>
                {crop.local_name}
              </p>
            )}

            <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#cbd5e1', marginTop: '4px' }}>
              Scientific Name: {crop.scientific_name || 'N/A'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', padding: '12px 18px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Duration</span>
              <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{crop.duration}</p>
            </div>

            <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', padding: '12px 18px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Expected Yield</span>
              <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-300)', marginTop: '2px' }}>{crop.expected_yield}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agronomic Conditions Overview Grid */}
      <div className="grid-4">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Suitable Soil</span>
            <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{crop.suitable_soil}</p>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 600 }}>pH: {crop.ph_min} - {crop.ph_max}</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Planting Season</span>
            <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{crop.suitable_season}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Thermometer size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Optimal Temp</span>
            <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{crop.temperature_min}°C - {crop.temperature_max}°C</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Water Demand</span>
            <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{crop.water_requirement}</p>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{crop.rainfall_min} - {crop.rainfall_max} mm</span>
          </div>
        </div>
      </div>

      {/* Cultivation Guidance & Field Operations */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--primary-700)" />
            <span>Cultivation & Agronomic Practices</span>
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {crop.cultivation_info}
          </p>

          {crop.irrigation_requirement && (
            <div style={{ marginTop: '20px', padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Irrigation Scheduling
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {crop.irrigation_requirement}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sowing Information */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Sowing & Spacing Details
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {crop.sowing_info || 'Standard spacing according to package of practices for the state.'}
            </p>
          </div>

          {/* Harvesting Information */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Harvesting & Maturity Indicators
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {crop.harvest_info || 'Harvest when maturity symptoms are reached; cure appropriately for storage or transport.'}
            </p>
          </div>

          {/* Market & Economics */}
          <div className="card" style={{ backgroundColor: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-900)', marginBottom: '8px' }}>
              Market Information
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--primary-950)' }}>
              <strong>Standard Market Trading Unit:</strong> {crop.market_unit}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Check the Market Prices page for localized APMC mandi benchmarks.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#fefce8',
          border: '1px solid #fef08a',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <ShieldAlert size={22} color="#ca8a04" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', color: '#854d0e', lineHeight: 1.5 }}>
          <strong>Agricultural Safety Notice:</strong> For fertilizer dosages and chemical pest treatments, always verify with your local Krishi Bhavan or Agricultural Extension Officer based on your farm's specific soil test report.
        </p>
      </div>
    </div>
  );
};

export default CropDetails;
