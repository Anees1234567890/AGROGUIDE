import React, { useState, useEffect } from 'react';
import { pestAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  ShieldAlert,
  Bug,
  Activity,
  Search,
  CheckCircle2,
  PhoneCall,
  Info,
  ShieldCheck,
  Filter
} from 'lucide-react';

const PestDiseaseGuide = () => {
  const [activeTab, setActiveTab] = useState('pests'); // 'pests' or 'diseases'
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pests') {
        const res = await pestAPI.getPests({ query: searchQuery.trim() || undefined });
        setItems(res.data);
      } else {
        const res = await pestAPI.getDiseases({ query: searchQuery.trim() || undefined });
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load pest/disease data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '10px',
          }}
        >
          <ShieldAlert size={15} />
          <span>Integrated Crop Protection</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-950)' }}>
          Pest & Disease Diagnosis Guide
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '750px' }}>
          Identify crop damage symptoms early and apply eco-friendly biological control, neem formulations, and cultural prevention measures.
        </p>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => {
              setActiveTab('pests');
              setSearchQuery('');
            }}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 700,
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeTab === 'pests' ? 'var(--primary-700)' : 'transparent',
              color: activeTab === 'pests' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Bug size={17} />
            <span>Crop Pests Catalog</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('diseases');
              setSearchQuery('');
            }}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 700,
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeTab === 'diseases' ? 'var(--primary-700)' : 'transparent',
              color: activeTab === 'diseases' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Activity size={17} />
            <span>Fungal & Bacterial Diseases</span>
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms or pest name (e.g. Stem borer, Wilt)..."
            className="form-input"
            style={{ paddingLeft: '38px', width: '100%' }}
          />
        </div>
      </div>

      {/* Safety Advisory Banner */}
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
        <ShieldCheck size={24} color="#ca8a04" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.86rem', color: '#854d0e', lineHeight: 1.5 }}>
          <strong>Organic & Safe Usage Guidelines:</strong> AgroGuide prioritizes cultural, mechanical, and biological bio-agents (such as Trichoderma, Pseudomonas, and Beauveria). For regulated chemical schedules, always consult certified officers at your regional Krishi Bhavan.
        </p>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <LoadingSpinner message="Consulting plant pathology and pest database..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No Diagnosis Found"
          description={`No recorded ${activeTab} match your search query '${searchQuery}'.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="grid-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '4px solid #dc2626',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-red">
                    {activeTab === 'pests' ? 'Pest Threat' : 'Pathogen Disease'}
                  </span>
                  {item.crop_name && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                      Affected: {item.crop_name}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
                  {item.name}
                </h3>

                {/* Symptoms Section */}
                <div style={{ marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Diagnostic Symptoms
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.symptoms}
                  </p>
                </div>

                {/* Prevention Section */}
                <div style={{ marginBottom: '14px', padding: '10px 12px', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-900)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Preventive Measures
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--primary-950)', lineHeight: 1.45 }}>
                    {item.prevention}
                  </p>
                </div>

                {/* Bio-Management Section */}
                <div style={{ marginBottom: '14px', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Eco-Friendly Management
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {item.management}
                  </p>
                </div>
              </div>

              {/* Consultation Notice */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <Info size={14} color="#ca8a04" style={{ flexShrink: 0 }} />
                <span>{item.professional_guidance}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PestDiseaseGuide;
