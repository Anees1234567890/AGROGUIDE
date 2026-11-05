import React, { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  MapPin,
  RefreshCw,
  Star,
  Clock,
  Building2
} from 'lucide-react';

const KERALA_DISTRICTS = [
  'All',
  'Palakkad',
  'Kozhikode',
  'Wayanad',
  'Thrissur',
  'Idukki',
  'Kottayam',
  'Ernakulam',
  'Thiruvananthapuram',
  'Kollam',
  'Alappuzha',
  'Kasaragod'
];

const MarketPricesPage = () => {
  const { user } = useAuth();
  const userDistrict = user?.district || 'Palakkad';

  const [prices, setPrices] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recorded_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const params = {
        query: searchQuery.trim() || undefined,
        location: locationFilter !== 'All' ? locationFilter : undefined,
        sort_by: sortBy,
        order: sortOrder,
        limit: 50,
      };
      const res = await marketAPI.getPrices(params);
      setPrices(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Market prices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [locationFilter, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrices();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Updated Today at 09:30 AM';
    try {
      const d = new Date(dateStr);
      return `Updated ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Updated Today at 09:30 AM';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            <TrendingUp size={15} />
            <span>KERALA STATE AGRI-MARKETING LIVE BOARD</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-950)' }}>
            Live Kerala Mandi Market Prices
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Daily commodity arrival rates, min-max price ranges, price trend variations (▲/▼), and nearest APMC mandi highlighting for your district.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={fetchPrices}
          disabled={loading}
          style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 700 }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Refresh Live Rates</span>
        </button>
      </div>

      {/* User Nearest Mandi Highlight Banner */}
      <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ★ YOUR NEAREST MARKET DISTRICT
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14532d', margin: '2px 0 0 0' }}>
              {userDistrict} APMC Central Mandi Feed
            </h4>
          </div>
        </div>

        <button
          onClick={() => setLocationFilter(userDistrict)}
          className="btn btn-sm"
          style={{ backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, border: 'none' }}
        >
          View {userDistrict} Market Rates Only
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop (e.g. Pepper, Rice, Rubber)..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* District Filter */}
          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="form-select"
            >
              {KERALA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Kerala Mandis' : `${d} District`}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select">
              <option value="recorded_at">Sort by: Latest Updated Time</option>
              <option value="price">Sort by: Highest Price</option>
              <option value="crop_name">Sort by: Crop Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Market Table */}
      {loading ? (
        <LoadingSpinner message="Fetching daily Kerala APMC mandi price updates..." />
      ) : prices.length === 0 ? (
        <EmptyState
          title="No Market Prices Found"
          description={`No commodity records match your query '${searchQuery}'.`}
          actionLabel="Show All Prices"
          onAction={() => {
            setSearchQuery('');
            setLocationFilter('All');
          }}
        />
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Commodity / Crop</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Market (Mandi)</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Location</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Modal Price</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Min / Max Range</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Price Trend</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p, idx) => {
                const isUserDistrict = p.location.toLowerCase().includes(userDistrict.toLowerCase());
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: isUserDistrict ? '#f0fdf4' : idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isUserDistrict && <Star size={14} color="#16a34a" fill="#16a34a" />}
                        <span>{p.crop_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#334155', fontWeight: 600 }}>
                      {p.market_name}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="#64748b" />
                        <span>{p.location}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 900, color: '#15803d', fontSize: '1.05rem' }}>
                      ₹{p.price.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{p.unit}</span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#475569', fontSize: '0.86rem' }}>
                      {p.min_price && p.max_price ? `₹${p.min_price.toLocaleString()} - ₹${p.max_price.toLocaleString()}` : 'N/A'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          backgroundColor: p.trend === 'up' ? '#dcfce7' : p.trend === 'down' ? '#fee2e2' : '#f1f5f9',
                          color: p.trend === 'up' ? '#15803d' : p.trend === 'down' ? '#b91c1c' : '#475569',
                        }}
                      >
                        {p.trend === 'up' && <TrendingUp size={14} />}
                        {p.trend === 'down' && <TrendingDown size={14} />}
                        {p.trend === 'stable' && <Minus size={14} />}
                        <span>{p.trend === 'up' ? `+${p.trend_percentage}%` : p.trend === 'down' ? `${p.trend_percentage}%` : 'Stable'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.78rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color="#94a3b8" />
                        <span>{formatDate(p.recorded_at)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarketPricesPage;
