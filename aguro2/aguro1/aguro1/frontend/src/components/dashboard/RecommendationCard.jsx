import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const RecommendationCard = ({ farm, recommendations = [] }) => {
  const topRec = recommendations[0];

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid var(--primary-600)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Field Suitability Match
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Crop Recommendation
            </h3>
          </div>
          <span className="badge badge-green" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)' }}>
            <Sparkles size={12} />
            <span>AI Rule Match</span>
          </span>
        </div>

        {topRec ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                  {topRec.crop.name}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {topRec.crop.local_name || topRec.crop.scientific_name}
                </p>
              </div>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-50)',
                  border: '3px solid var(--primary-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: 'var(--primary-800)',
                }}
              >
                {topRec.match_percentage}%
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              {topRec.why_recommended}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} color="#16a34a" />
                <span>Soil: {topRec.soil_suitability}</span>
              </span>
              <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} color="#16a34a" />
                <span>Season: {topRec.season_suitability}</span>
              </span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
              Run the recommendation algorithm to analyze crops tailored to your soil and current season.
            </p>
          </div>
        )}
      </div>

      <Link
        to="/recommendations"
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
        <span>Run Crop Assessment</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default RecommendationCard;
