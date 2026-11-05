import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { cropsAPI } from '../services/api';
import CropCard from '../components/crops/CropCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, BookOpen, Layers, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Cereals',
  'Pulses',
  'Vegetables',
  'Fruits',
  'Spices',
  'Plantation Crops',
  'Commercial Crops',
  'Tubers',
  'Oilseeds',
  'Medicinal & Aromatic',
  'Medicinal & Aromatic Plants',
  'Flowers & Ornamental Crops',
  'Fodder & Forage Crops',
  'Nuts & Beverage Crops'
];

const CropLibrary = () => {
  const { t } = useLanguage();

  const [crops, setCrops] = useState([]);
  const [totalCrops, setTotalCrops] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 12;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [selectedSoil, setSelectedSoil] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        query: searchQuery.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        season: selectedSeason !== 'All' ? selectedSeason : undefined,
        soil: selectedSoil !== 'All' ? selectedSoil : undefined,
      };
      const res = await cropsAPI.getAll(params);
      setCrops(res.data.crops);
      setTotalCrops(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error('Failed to fetch crops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [page, selectedCategory, selectedSeason, selectedSoil]);

  // Debounced search on typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCrops();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
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
            <BookOpen size={15} />
            <span>Structured Agricultural Knowledge Base</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-950)' }}>
            Indian & Kerala Crop Library
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Browse structured cultivation guides, soil pH tolerances, seasons, and market units for 500+ crops.
          </p>
        </div>

        {/* Count Badge */}
        <div
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-card)',
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--primary-800)',
          }}
        >
          {totalCrops} Crops Available
        </div>
      </div>

      {/* Search & Category Filter Navigation */}
      <div
        className="card"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Search Bar + Secondary Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop name (e.g. Rice, Pepper, Banana)..."
              className="form-input"
              style={{ paddingLeft: '38px', width: '100%' }}
            />
          </div>

          {/* Season Filter */}
          <div>
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ width: '100%' }}
            >
              <option value="All">All Seasons</option>
              <option value="Kharif">Kharif / Virippu</option>
              <option value="Rabi">Rabi / Mundakan</option>
              <option value="Summer">Summer / Puncha</option>
              <option value="Whole Year">Perennial / Whole Year</option>
            </select>
          </div>

          {/* Soil Filter */}
          <div>
            <select
              value={selectedSoil}
              onChange={(e) => {
                setSelectedSoil(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ width: '100%' }}
            >
              <option value="All">All Soil Types</option>
              <option value="Alluvial">Alluvial</option>
              <option value="Laterite">Laterite</option>
              <option value="Red">Red Loam</option>
              <option value="Black">Black Cotton</option>
              <option value="Clay">Heavy Clay</option>
              <option value="Loamy">Loamy</option>
              <option value="Sandy">Sandy</option>
            </select>
          </div>
        </div>

        {/* Category Pills Carousel */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              style={{
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '7px 16px',
                borderRadius: '9999px',
                border: selectedCategory === cat ? '1px solid var(--primary-700)' : '1px solid var(--border-light)',
                backgroundColor: selectedCategory === cat ? 'var(--primary-700)' : 'var(--bg-surface)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Crops Grid */}
      {loading ? (
        <LoadingSpinner message="Searching 100+ crop agronomic records..." />
      ) : crops.length === 0 ? (
        <EmptyState
          title="No Crops Found"
          description={`No crops matched your query '${searchQuery}' or current filter selections.`}
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setSelectedSeason('All');
            setSelectedSoil('All');
          }}
        />
      ) : (
        <>
          <div className="grid-3">
            {crops.map((crop) => (
              <CropCard key={crop.id} crop={crop} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-secondary btn-sm"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CropLibrary;
