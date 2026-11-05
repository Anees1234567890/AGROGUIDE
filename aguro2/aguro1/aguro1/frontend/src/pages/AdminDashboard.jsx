import React, { useState, useEffect } from 'react';
import { adminAPI, cropsAPI, marketAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import {
  ShieldCheck,
  Users,
  Sprout,
  TrendingUp,
  MessageSquare,
  PlusCircle,
  Trash2,
  Edit,
  CheckCircle2,
  Search,
  BookOpen,
  DollarSign,
  TrendingDown,
  Minus,
  Save,
  Clock,
  Building2
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [cropQuery, setCropQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'market', 'crops'
  const [noticeMsg, setNoticeMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit/Add Market Price Modal State
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [mCropName, setMCropName] = useState('');
  const [mMarketName, setMMarketName] = useState('');
  const [mLocation, setMLocation] = useState('Palakkad, Kerala');
  const [mPrice, setMPrice] = useState(2500);
  const [mMinPrice, setMMinPrice] = useState(2400);
  const [mMaxPrice, setMMaxPrice] = useState(2600);
  const [mUnit, setMUnit] = useState('₹/Quintal');
  const [mTrend, setMTrend] = useState('up');
  const [mTrendPercent, setMTrendPercent] = useState(1.5);

  // Add/Edit Crop Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [editingCropId, setEditingCropId] = useState(null);
  const [cropName, setCropName] = useState('');
  const [localName, setLocalName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [suitableSoil, setSuitableSoil] = useState('Alluvial, Loamy');
  const [suitableSeason, setSuitableSeason] = useState('Year Round / All Season');
  const [phMin, setPhMin] = useState(5.5);
  const [phMax, setPhMax] = useState(7.5);
  const [waterRequirement, setWaterRequirement] = useState('Medium');
  const [duration, setDuration] = useState('90 - 120 days');
  const [cultivationInfo, setCultivationInfo] = useState('');
  const [expectedYield, setExpectedYield] = useState('20 - 30 Quintals/Acre');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, mRes, cRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ query: userQuery.trim() || undefined }),
        marketAPI.getPrices({ limit: 100 }),
        cropsAPI.getAll({ limit: 100 })
      ]);
      setStats(sRes.data);
      setUsers(uRes.data);
      setMarketPrices(mRes.data.items || []);
      setCrops(cRes.data.crops || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Change role error:', err);
    }
  };

  // Market Price Handlers
  const handleOpenNewPriceModal = () => {
    setEditingPriceId(null);
    setMCropName('');
    setMMarketName('');
    setMLocation('Palakkad, Kerala');
    setMPrice(2500);
    setMMinPrice(2400);
    setMMaxPrice(2600);
    setMUnit('₹/Quintal');
    setMTrend('up');
    setMTrendPercent(1.5);
    setIsMarketModalOpen(true);
  };

  const handleOpenEditPriceModal = (item) => {
    setEditingPriceId(item.id);
    setMCropName(item.crop_name);
    setMMarketName(item.market_name);
    setMLocation(item.location);
    setMPrice(item.price);
    setMMinPrice(item.min_price || item.price * 0.95);
    setMMaxPrice(item.max_price || item.price * 1.05);
    setMUnit(item.unit || '₹/Quintal');
    setMTrend(item.trend || 'up');
    setMTrendPercent(item.trend_percentage || 1.5);
    setIsMarketModalOpen(true);
  };

  const handleSaveMarketPrice = async (e) => {
    e.preventDefault();
    setNoticeMsg('');
    setErrorMsg('');
    try {
      const payload = {
        crop_name: mCropName.strip ? mCropName.strip() : mCropName.trim(),
        market_name: mMarketName.trim(),
        location: mLocation.trim(),
        price: parseFloat(mPrice),
        min_price: parseFloat(mMinPrice),
        max_price: parseFloat(mMaxPrice),
        unit: mUnit,
        trend: mTrend,
        trend_percentage: parseFloat(mTrendPercent)
      };

      if (editingPriceId) {
        await adminAPI.updateMarketPrice(editingPriceId, payload);
        setNoticeMsg(`Market price record for ${mCropName} updated successfully!`);
      } else {
        await adminAPI.createMarketPrice(payload);
        setNoticeMsg(`New mandi price for ${mCropName} saved to database and published live!`);
      }
      setIsMarketModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error('Market price save error:', err);
      const detail = err.response?.data?.detail || 'Failed to save market price. Please check input values.';
      setErrorMsg(detail);
    }
  };

  const handleDeleteMarketPrice = async (priceId) => {
    if (!window.confirm('Are you sure you want to delete this market price record?')) return;
    setNoticeMsg('');
    setErrorMsg('');
    try {
      await adminAPI.deleteMarketPrice(priceId);
      setMarketPrices((prev) => prev.filter((p) => p.id !== priceId));
      setNoticeMsg('Market price record deleted successfully.');
    } catch (err) {
      console.error('Delete price error:', err);
      setErrorMsg('Failed to delete market price record.');
    }
  };

  // Crop CRUD Handlers
  const handleOpenNewCropModal = () => {
    setEditingCropId(null);
    setCropName('');
    setLocalName('');
    setScientificName('');
    setCategory('Vegetables');
    setSuitableSoil('Alluvial, Loamy');
    setSuitableSeason('Year Round / All Season');
    setPhMin(5.5);
    setPhMax(7.5);
    setWaterRequirement('Medium');
    setDuration('90 - 120 days');
    setCultivationInfo('');
    setExpectedYield('20 - 30 Quintals/Acre');
    setIsCropModalOpen(true);
  };

  const handleOpenEditCropModal = (crop) => {
    setEditingCropId(crop.id);
    setCropName(crop.name);
    setLocalName(crop.local_name || '');
    setScientificName(crop.scientific_name || '');
    setCategory(crop.category || 'Vegetables');
    setSuitableSoil(crop.suitable_soil || 'Alluvial, Loamy');
    setSuitableSeason(crop.suitable_season || 'Year Round / All Season');
    setPhMin(crop.ph_min || 5.5);
    setPhMax(crop.ph_max || 7.5);
    setWaterRequirement(crop.water_requirement || 'Medium');
    setDuration(crop.duration || '90 - 120 days');
    setCultivationInfo(crop.cultivation_info || '');
    setExpectedYield(crop.expected_yield || '20 - 30 Quintals/Acre');
    setIsCropModalOpen(true);
  };

  const handleSaveCrop = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: cropName,
        local_name: localName,
        scientific_name: scientificName,
        category,
        suitable_soil: suitableSoil,
        suitable_season: suitableSeason,
        ph_min: parseFloat(phMin),
        ph_max: parseFloat(phMax),
        water_requirement: waterRequirement,
        duration,
        cultivation_info: cultivationInfo || `${cropName} agronomic cultivation details for Kerala farmers.`,
        expected_yield: expectedYield
      };

      if (editingCropId) {
        await cropsAPI.update(editingCropId, payload);
      } else {
        await cropsAPI.create(payload);
      }
      setIsCropModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error('Crop save error:', err);
      alert('Failed to save crop details. Please check required fields.');
    }
  };

  const handleDeleteCrop = async (cropId, name) => {
    if (!window.confirm(`Are you sure you want to delete crop '${name}'? This action will remove the crop record.`)) {
      return;
    }
    try {
      await cropsAPI.delete(cropId);
      setCrops((prev) => prev.filter((c) => c.id !== cropId));
      fetchAdminData();
    } catch (err) {
      console.error('Delete crop error:', err);
      alert('Failed to delete crop record.');
    }
  };

  const filteredCrops = crops.filter(
    (c) =>
      c.name.toLowerCase().includes(cropQuery.toLowerCase()) ||
      (c.local_name && c.local_name.toLowerCase().includes(cropQuery.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(cropQuery.toLowerCase()))
  );

  if (loading) return <LoadingSpinner message="Loading AgroGuide Administration Panel..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Distinct Admin Header Design */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1e1b4b 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
          borderLeft: '6px solid #dc2626'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(220, 38, 38, 0.25)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, color: '#fca5a5', marginBottom: '10px' }}>
          <ShieldCheck size={16} />
          <span>AGROGUIDE PLATFORM ADMIN CONTROL PANEL</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          System Administration & Crop Management
        </h1>
      </div>

      {noticeMsg && (
        <div style={{ padding: '14px 18px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span>{noticeMsg}</span>
          </div>
          <button onClick={() => setNoticeMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '14px 18px', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', color: '#c53030', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c53030', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Metrics Overview */}
      <div className="grid-4">
        <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>TOTAL USERS</span>
            <Users size={20} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {stats?.total_users || 0}
          </div>
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{stats?.total_farmers || 0} Farmers • {stats?.total_professionals || 0} Experts</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>MANDI PRICE RECORDS</span>
            <TrendingUp size={20} color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {marketPrices.length}
          </div>
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Live Prices Configured</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>CROPS DATABASE</span>
            <Sprout size={20} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {crops.length || stats?.total_crops || 0}
          </div>
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Active Cultivation Guides</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>FORUM POSTS</span>
            <MessageSquare size={20} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {stats?.total_posts || 0}
          </div>
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Community Discussions</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #cbd5e1' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 800,
            fontSize: '0.94rem',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'users' ? '3px solid #dc2626' : '3px solid transparent',
            color: activeTab === 'users' ? '#dc2626' : '#64748b',
            backgroundColor: activeTab === 'users' ? '#fef2f2' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} />
          <span>User & Role Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('market')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 800,
            fontSize: '0.94rem',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'market' ? '3px solid #dc2626' : '3px solid transparent',
            color: activeTab === 'market' ? '#dc2626' : '#64748b',
            backgroundColor: activeTab === 'market' ? '#fef2f2' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <TrendingUp size={18} />
          <span>Live Market Price Manager ({marketPrices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('crops')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 800,
            fontSize: '0.94rem',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'crops' ? '3px solid #dc2626' : '3px solid transparent',
            color: activeTab === 'crops' ? '#dc2626' : '#64748b',
            backgroundColor: activeTab === 'crops' ? '#fef2f2' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={18} />
          <span>Crop Database Management ({crops.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Platform Users & Access Control
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Assign roles (Farmer, Agricultural Professional, Admin) and toggle account status.
              </p>
            </div>

            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search user..."
                className="form-input"
                style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>User Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>District</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>System Role</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{u.name}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{u.district}, {u.state}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                      >
                        <option value="Farmer">Farmer</option>
                        <option value="Agricultural Professional">Expert</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem' }}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MARKET PRICE MANAGER */}
      {activeTab === 'market' && (
        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Kerala Mandi Market Price Manager
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Update daily mandi prices, min-max price ranges, price trends (Up/Down/Stable), and timestamps.
              </p>
            </div>

            <button onClick={handleOpenNewPriceModal} className="btn btn-primary" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', fontWeight: 700 }}>
              <PlusCircle size={16} />
              <span>Add New Commodity Price</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Crop / Commodity</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Market Mandi</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Location</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Modal Price</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Min / Max Range</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Trend</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {marketPrices.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>{p.crop_name}</td>
                    <td style={{ padding: '14px 16px', color: '#334155' }}>{p.market_name}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.location}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#16a34a' }}>
                      ₹{p.price.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.unit}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '0.84rem' }}>
                      {p.min_price && p.max_price ? `₹${p.min_price} - ₹${p.max_price}` : 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${p.trend === 'up' ? 'badge-green' : p.trend === 'down' ? 'badge-red' : 'badge-gray'}`}>
                        {p.trend === 'up' ? `▲ +${p.trend_percentage}%` : p.trend === 'down' ? `▼ ${p.trend_percentage}%` : '▬ Stable'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenEditPriceModal(p)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => handleDeleteMarketPrice(p.id)} className="btn btn-secondary btn-sm" style={{ color: '#dc2626', padding: '4px 8px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CROP DATABASE MANAGEMENT */}
      {activeTab === 'crops' && (
        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Crop Database Administration
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Full CRUD control: Add new crops, view details, edit crop specs, or safely delete crop records.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  value={cropQuery}
                  onChange={(e) => setCropQuery(e.target.value)}
                  placeholder="Search crop name..."
                  className="form-input"
                  style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
                />
              </div>

              <button onClick={handleOpenNewCropModal} className="btn btn-primary" style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', fontWeight: 700 }}>
                <PlusCircle size={16} />
                <span>Add New Crop</span>
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Crop Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Local Name (Malayalam)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Suitable Soil</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Soil pH Range</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrops.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                      {c.name}
                      <span style={{ display: 'block', fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', fontWeight: 400 }}>
                        {c.scientific_name}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#16a34a', fontWeight: 700 }}>{c.local_name || 'N/A'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-gray" style={{ fontSize: '0.78rem' }}>{c.category}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '0.84rem' }}>{c.suitable_soil}</td>
                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 700, fontSize: '0.84rem' }}>
                      {c.ph_min} - {c.ph_max}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenEditCropModal(c)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => handleDeleteCrop(c.id, c.name)} className="btn btn-secondary btn-sm" style={{ color: '#dc2626', padding: '4px 8px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MARKET PRICE EDIT/CREATE MODAL */}
      <Modal isOpen={isMarketModalOpen} onClose={() => setIsMarketModalOpen(false)} title={editingPriceId ? 'Edit Mandi Market Price Record' : 'Add New Mandi Price Record'}>
        <form onSubmit={handleSaveMarketPrice}>
          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Crop / Commodity Name</label>
              <input type="text" required className="form-input" value={mCropName} onChange={(e) => setMCropName(e.target.value)} placeholder="e.g. Black Pepper (Garbled)" />
            </div>

            <div className="form-group">
              <label className="form-label">Mandi / Market Name</label>
              <input type="text" required className="form-input" value={mMarketName} onChange={(e) => setMMarketName(e.target.value)} placeholder="e.g. Palakkad APMC Mandi" />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Location (District, State)</label>
              <input type="text" required className="form-input" value={mLocation} onChange={(e) => setMLocation(e.target.value)} placeholder="e.g. Palakkad, Kerala" />
            </div>

            <div className="form-group">
              <label className="form-label">Modal Price (₹)</label>
              <input type="number" required className="form-input" value={mPrice} onChange={(e) => setMPrice(e.target.value)} />
            </div>
          </div>

          <div className="grid-3" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Min Price (₹)</label>
              <input type="number" className="form-input" value={mMinPrice} onChange={(e) => setMMinPrice(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Max Price (₹)</label>
              <input type="number" className="form-input" value={mMaxPrice} onChange={(e) => setMMaxPrice(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={mUnit} onChange={(e) => setMUnit(e.target.value)}>
                <option value="₹/Quintal">₹/Quintal</option>
                <option value="₹/Kg">₹/Kg</option>
                <option value="₹/Piece">₹/Piece</option>
                <option value="₹/Bunch">₹/Bunch</option>
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '14px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Price Trend Direction</label>
              <select className="form-select" value={mTrend} onChange={(e) => setMTrend(e.target.value)}>
                <option value="up">▲ Price Up (Increasing)</option>
                <option value="down">▼ Price Down (Decreasing)</option>
                <option value="stable">▬ Stable (Unchanged)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Trend Variation %</label>
              <input type="number" step="0.1" className="form-input" value={mTrendPercent} onChange={(e) => setMTrendPercent(e.target.value)} placeholder="1.5" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setIsMarketModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}>
              <Save size={16} />
              <span>Save & Publish Price Live</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* CROP EDIT/CREATE MODAL */}
      <Modal isOpen={isCropModalOpen} onClose={() => setIsCropModalOpen(false)} title={editingCropId ? 'Edit Crop Profile' : 'Add New Crop to System Database'}>
        <form onSubmit={handleSaveCrop}>
          <div className="grid-3" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Crop Name (English)</label>
              <input type="text" required className="form-input" value={cropName} onChange={(e) => setCropName(e.target.value)} placeholder="e.g. Cardamom" />
            </div>

            <div className="form-group">
              <label className="form-label">Local Name (Malayalam)</label>
              <input type="text" className="form-input" value={localName} onChange={(e) => setLocalName(e.target.value)} placeholder="e.g. ഏലം (Elam)" />
            </div>

            <div className="form-group">
              <label className="form-label">Scientific Botanical Name</label>
              <input type="text" className="form-input" value={scientificName} onChange={(e) => setScientificName(e.target.value)} placeholder="e.g. Elettaria cardamomum" />
            </div>
          </div>

          <div className="grid-3" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Cereals & Grains">Cereals & Grains</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Spices & Plantation">Spices & Plantation</option>
                <option value="Fruits">Fruits</option>
                <option value="Pulses & Legumes">Pulses & Legumes</option>
                <option value="Cash Crops">Cash Crops</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Suitable Soil Type</label>
              <input type="text" required className="form-input" value={suitableSoil} onChange={(e) => setSuitableSoil(e.target.value)} placeholder="e.g. Laterite, Forest Loamy" />
            </div>

            <div className="form-group">
              <label className="form-label">Suitable Season / Climate</label>
              <input type="text" required className="form-input" value={suitableSeason} onChange={(e) => setSuitableSeason(e.target.value)} placeholder="e.g. Year Round / All Season" />
            </div>
          </div>

          <div className="grid-3" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Soil pH Min</label>
              <input type="number" step="0.1" className="form-input" value={phMin} onChange={(e) => setPhMin(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Soil pH Max</label>
              <input type="number" step="0.1" className="form-input" value={phMax} onChange={(e) => setPhMax(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Water Requirement</label>
              <input type="text" className="form-input" value={waterRequirement} onChange={(e) => setWaterRequirement(e.target.value)} placeholder="e.g. High / Medium" />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Cultivation Duration</label>
              <input type="text" className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 120 - 150 days" />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Yield</label>
              <input type="text" className="form-input" value={expectedYield} onChange={(e) => setExpectedYield(e.target.value)} placeholder="e.g. 25 Quintals/Acre" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Cultivation & Agronomic Overview</label>
            <textarea
              rows={4}
              required
              className="form-input"
              value={cultivationInfo}
              onChange={(e) => setCultivationInfo(e.target.value)}
              placeholder="Provide field spacing, land preparation, organic manures, and package of practices..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setIsCropModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}>
              <Save size={16} />
              <span>Save & Publish Crop Record</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
