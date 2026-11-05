import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Droplets, Calendar, Layers, ArrowRight } from 'lucide-react';

const categoryColorMap = {
  Cereals: { bg: '#fef3c7', text: '#b45309' },
  Pulses: { bg: '#dcfce7', text: '#15803d' },
  Vegetables: { bg: '#dbeafe', text: '#1d4ed8' },
  Fruits: { bg: '#ffedd5', text: '#c2410c' },
  Spices: { bg: '#f3e8ff', text: '#7e22ce' },
  'Plantation Crops': { bg: '#ccfbf1', text: '#0f766e' },
  'Commercial Crops': { bg: '#fee2e2', text: '#b91c1c' },
  Oilseeds: { bg: '#fef9c3', text: '#a16207' },
  Tubers: { bg: '#fae8ff', text: '#86198f' },
};

const CropCard = ({ crop }) => {
  const catStyle = categoryColorMap[crop.category] || { bg: '#f1f5f9', text: '#475569' };

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Category Badge & Duration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span
            style={{
              backgroundColor: catStyle.bg,
              color: catStyle.text,
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
            }}
          >
            {crop.category}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {crop.duration}
          </span>
        </div>

        {/* Crop Title & Botanical Name */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {crop.name}
        </h3>
        {crop.local_name && (
          <p style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 600, marginBottom: '4px' }}>
            {crop.local_name}
          </p>
        )}
        <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {crop.scientific_name}
        </p>

        {/* Metadata Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Layers size={14} color="#64748b" />
            <span><strong>Soil:</strong> {crop.suitable_soil} (pH {crop.ph_min} - {crop.ph_max})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Calendar size={14} color="#64748b" />
            <span><strong>Season:</strong> {crop.suitable_season}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Droplets size={14} color="#0284c7" />
            <span><strong>Water Need:</strong> {crop.water_requirement}</span>
          </div>
        </div>

        {/* Cultivation preview snippet */}
        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          {crop.cultivation_info}
        </p>
      </div>

      <Link
        to={`/crops/${crop.id}`}
        className="btn btn-secondary btn-sm"
        style={{
          width: '100%',
          justifyContent: 'space-between',
          fontWeight: 700,
          color: 'var(--primary-800)',
          backgroundColor: 'var(--primary-50)',
          borderColor: 'var(--primary-200)',
        }}
      >
        <span>Full Crop Guide</span>
        <ArrowRight size={15} />
      </Link>
    </div>
  );
};

export default CropCard;
