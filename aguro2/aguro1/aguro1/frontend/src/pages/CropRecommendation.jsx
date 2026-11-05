import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { recommendationAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  Droplets,
  Calendar,
  Layers,
  Info,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  MapPin
} from 'lucide-react';

const KERALA_DISTRICTS = [
  'Palakkad',
  'Wayanad',
  'Idukki',
  'Thrissur',
  'Alappuzha',
  'Kottayam',
  'Ernakulam',
  'Kozhikode',
  'Malappuram',
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Kannur',
  'Kasaragod'
];

const DISASTER_OPTIONS = [
  'Normal (No Recent Disaster)',
  'Post-Flood Siltation & Waterlogging',
  'Landslide & Soil Erosion',
  'Coastal Salinity Intrusion',
  'Drought / Groundwater Depletion'
];

const CropRecommendation = () => {
  const { user, primaryFarm } = useAuth();
  const { t } = useLanguage();

  const [state, setState] = useState('Kerala');
  const [district, setDistrict] = useState(user?.district || 'Palakkad');
  const [soilType, setSoilType] = useState(primaryFarm?.soil_type || 'Laterite');
  const [soilPh, setSoilPh] = useState(primaryFarm?.soil_ph || 6.2);
  const [farmSize, setFarmSize] = useState(primaryFarm?.farm_size || 2.5);
  const [irrigation, setIrrigation] = useState(primaryFarm?.irrigation_type || 'Canal / River');
  const [disasterImpact, setDisasterImpact] = useState('Normal (No Recent Disaster)');
  const [previousCrop, setPreviousCrop] = useState('Rice (Paddy)');

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        state,
        district,
        soil_type: soilType,
        soil_ph: parseFloat(soilPh),
        farm_size: parseFloat(farmSize),
        irrigation_availability: irrigation,
        disaster_impact: disasterImpact,
        previous_crop: previousCrop
      };


      const res = await recommendationAPI.generate(payload);
      setResults(res.data);
    } catch (err) {
      console.error('Recommendation calculation error:', err);
      setError('Unable to compute crop suitability recommendations. Please verify field inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Header Banner */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: 'var(--primary-100)',
            color: 'var(--primary-800)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '10px',
          }}
        >
          <Sparkles size={15} />
          <span>Kerala Disaster & Soil-Aware Agronomic Engine</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-950)' }}>
          Kerala Specific Crop Recommendation
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '750px' }}>
          Get trusted, location-specific crop suitability scores calibrated for all 14 districts in Kerala, considering local soil pH, irrigation, and post-flood/disaster soil recovery conditions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Form Container */}
        <div
          className="card"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--primary-200)',
            boxShadow: 'var(--shadow-card)',
            padding: '28px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Sliders size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Select Your Kerala Field Parameters
              </h3>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              * KAU Advisory Verified
            </span>
          </div>

          <form onSubmit={handleGenerate}>
            {/* District & Soil Type */}
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Kerala District</label>
                <select className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d} District</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Kerala Soil Classification</label>
                <select className="form-select" value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                  <option value="Laterite">Laterite (Midlands / Western Ghats)</option>
                  <option value="Alluvial">Alluvial (Kuttanad / River Basins)</option>
                  <option value="Peaty / Kari">Peaty / Kari (Acidic Waterlogged)</option>
                  <option value="Forest Loamy">Forest Loamy (Highland Spices Zone)</option>
                  <option value="Coastal Sand">Coastal Sand (Sea Belt)</option>
                  <option value="Red Loamy">Red Loamy Soil</option>
                  <option value="Black Cotton">Black Cotton Soil (Chittoor / Palakkad)</option>
                  <option value="Loamy">Loamy / Garden Soil</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, color: '#dc2626' }}>Disaster / Soil Environmental Status</label>
                <select className="form-select" value={disasterImpact} onChange={(e) => setDisasterImpact(e.target.value)} style={{ borderColor: disasterImpact !== 'Normal (No Recent Disaster)' ? '#f87171' : 'var(--border-light)' }}>
                  {DISASTER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* pH & Irrigation */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Soil pH: {soilPh}</label>
                <input
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={soilPh}
                  onChange={(e) => setSoilPh(e.target.value)}
                  style={{ accentColor: 'var(--primary-700)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Acidic (4.0)</span>
                  <span>Neutral (6.2 - 7.0)</span>
                  <span>Alkaline (9.0)</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Irrigation Source</label>
                <select className="form-select" value={irrigation} onChange={(e) => setIrrigation(e.target.value)}>
                  <option value="Canal / River">Canal / River Water Pumping</option>
                  <option value="Drip">Drip Micro-Irrigation</option>
                  <option value="Borewell">Borewell / Open Well</option>
                  <option value="Rainfed">Strictly Rainfed (Monsoon)</option>
                </select>
              </div>
            </div>


            {/* Previous Crop & Farm Size */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Previous Crop in Field</label>
                <select className="form-select" value={previousCrop} onChange={(e) => setPreviousCrop(e.target.value)}>
                  <option value="None">None / Virgin Field</option>
                  <option value="Rice">Rice (Paddy)</option>
                  <option value="Banana">Banana (Nendran / Robusta)</option>
                  <option value="Tapioca">Tapioca (Cassava)</option>
                  <option value="Pulses">Pulses / Cowpea / Green Gram</option>
                  <option value="Vegetables">Vegetables / Gourds</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Farm Size (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-input"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  placeholder="2.5"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '12px', padding: '14px', fontSize: '1rem', fontWeight: 800 }}
            >
              <Sparkles size={20} />
              <span>{loading ? 'Evaluating Kerala Agro-Climatic Parameters...' : 'Generate Trusted Crop Suitability'}</span>
            </button>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && <LoadingSpinner message="Evaluating soil pH, seasonal windows, and disaster resilience against Kerala crop database..." />}

        {/* Error State */}
        {error && <ErrorState message={error} onRetry={handleGenerate} />}

        {/* Results Presentation */}
        {results && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Recommended Crops for {results.query_summary.district} District ({results.recommendations.length} Matches)
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Evaluated {results.total_evaluated} crops · {results.query_summary.soil_type} soil · {results.query_summary.disaster_impact}
                </p>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid-2">
              {results.recommendations.map((item, index) => {
                const scoreColor = item.match_percentage >= 78
                  ? '#16a34a'
                  : item.match_percentage >= 58
                  ? '#ca8a04'
                  : '#dc2626';

                return (
                  <div
                    key={item.crop.id}
                    className="card card-hover"
                    style={{
                      borderTop: `4px solid ${scoreColor}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '24px'
                    }}
                  >
                    <div>
                      {/* Top Row: Category & Score */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>
                          Rank #{index + 1} · {item.crop.category}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                            {item.match_percentage}%
                          </span>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                            {item.suitability_level}
                          </span>
                        </div>
                      </div>

                      {/* Match Score Bar */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ height: '6px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${item.match_percentage}%`,
                            background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)`,
                            borderRadius: '99px',
                            transition: 'width 0.6s ease'
                          }} />
                        </div>
                      </div>

                      {/* Crop Name & Botanical */}
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {item.crop.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 700, marginBottom: '2px' }}>
                        {item.crop.local_name}
                      </p>
                      <p style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        {item.crop.scientific_name}
                      </p>

                      {/* ML Factor Breakdown */}
                      {item.factors && item.factors.length > 0 && (
                        <div style={{ marginBottom: '14px', background: 'var(--bg-subtle, #f8fafc)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
                            ML Factor Analysis
                          </span>
                          {item.factors.map((f, fi) => {
                            const pct = Math.round((f.score / f.max_score) * 100);
                            const barColor = pct >= 80 ? '#16a34a' : pct >= 55 ? '#ca8a04' : '#dc2626';
                            return (
                              <div key={fi} style={{ marginBottom: fi < item.factors.length - 1 ? '8px' : 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{f.factor}</span>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: barColor }}>{pct}%</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '99px' }} />
                                </div>
                                <p style={{ fontSize: '0.70rem', color: 'var(--text-muted)', margin: '3px 0 0', lineHeight: 1.35 }}>{f.detail}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Why Recommended */}
                      <div style={{ padding: '10px 12px', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.70rem', fontWeight: 700, color: 'var(--primary-900)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                          Score Breakdown
                        </span>
                        <p style={{ fontSize: '0.80rem', color: 'var(--primary-950)', lineHeight: 1.45, margin: 0 }}>
                          {item.why_recommended}
                        </p>
                      </div>

                      {/* Rotation Benefit */}
                      {item.rotation_benefit && item.rotation_benefit !== 'Standard crop rotation' && (
                        <div style={{ padding: '8px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', marginBottom: '10px' }}>
                          <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', textTransform: 'uppercase' }}>
                            <Layers size={12} />
                            Crop Rotation
                          </span>
                          <p style={{ fontSize: '0.78rem', color: '#15803d', margin: 0, fontWeight: 600 }}>{item.rotation_benefit}</p>
                        </div>
                      )}

                      {/* Disaster Advisory */}
                      {item.disaster_advisory && !item.disaster_advisory.includes('Standard') && (
                        <div style={{ padding: '10px 12px', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                            <AlertTriangle size={12} />
                            Disaster Soil Advisory
                          </span>
                          <p style={{ fontSize: '0.78rem', color: '#78350f', lineHeight: 1.4, margin: 0, fontWeight: 600 }}>
                            {item.disaster_advisory}
                          </p>
                        </div>
                      )}

                      {/* Suitability Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                          <CheckCircle2 size={11} color="#16a34a" />
                          Soil: {item.soil_suitability}
                        </span>
                        <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                          <Calendar size={11} color="#2563eb" />
                          Season: {item.season_suitability}
                        </span>
                        <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                          <Droplets size={11} color="#0891b2" />
                          Water: {item.water_suitability}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/crops/${item.crop.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'space-between', fontWeight: 700 }}
                    >
                      <span>View Cultivation Guide</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <div style={{ padding: '16px 20px', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <ShieldAlert size={22} color="#ca8a04" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', color: '#854d0e', lineHeight: 1.5, margin: 0 }}>
                <strong>Important Advisory Notice:</strong> {results.disclaimer}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendation;
