import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import {
  Tractor,
  User,
  MapPin,
  Layers,
  Droplets,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  History,
  PlusCircle,
  Trash2,
  DollarSign,
  Sprout,
  FileText,
  Clock,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const MyFarmPage = () => {
  const { user, primaryFarm, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'profile'

  // User details state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState(user?.state || 'Kerala');
  const [district, setDistrict] = useState(user?.district || 'Palakkad');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferred_language || 'en');

  // Farm details state
  const [farmName, setFarmName] = useState(primaryFarm?.farm_name || 'My Primary Farm');
  const [farmSize, setFarmSize] = useState(primaryFarm?.farm_size || 2.5);
  const [soilType, setSoilType] = useState(primaryFarm?.soil_type || 'Alluvial');
  const [soilPh, setSoilPh] = useState(primaryFarm?.soil_ph || 6.5);
  const [irrigationType, setIrrigationType] = useState(primaryFarm?.irrigation_type || 'Canal / River');
  const [currentSeason, setCurrentSeason] = useState(primaryFarm?.current_season || 'Kharif');
  const [currentCrops, setCurrentCrops] = useState(primaryFarm?.current_crops || 'Rice (Paddy), Banana');

  // History records state
  const [farmHistory, setFarmHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // New History Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [histSeason, setHistSeason] = useState('Kharif 2025');
  const [histCropName, setHistCropName] = useState('Rice (Paddy - Jyothi)');
  const [histArea, setHistArea] = useState(2.5);
  const [histYield, setHistYield] = useState('4,200 kg');
  const [histSowingDate, setHistSowingDate] = useState('June 2025');
  const [histHarvestDate, setHistHarvestDate] = useState('October 2025');
  const [histFertilizers, setHistFertilizers] = useState('FYM 5t + NPK 90:45:45 kg/ha');
  const [histPestIssues, setHistPestIssues] = useState('Minor leaf folder; sprayed Pseudomonas');
  const [histRevenue, setHistRevenue] = useState(96600);
  const [histNotes, setHistNotes] = useState('Recorded peak grain weight and excellent market price.');

  const [saving, setSaving] = useState(false);
  const [submittingHistory, setSubmittingHistory] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setState(user.state || 'Kerala');
      setDistrict(user.district || 'Palakkad');
      setPreferredLanguage(user.preferred_language || 'en');
    }
    if (primaryFarm) {
      setFarmName(primaryFarm.farm_name || 'My Primary Farm');
      setFarmSize(primaryFarm.farm_size || 2.5);
      setSoilType(primaryFarm.soil_type || 'Alluvial');
      setSoilPh(primaryFarm.soil_ph || 6.5);
      setIrrigationType(primaryFarm.irrigation_type || 'Canal / River');
      setCurrentSeason(primaryFarm.current_season || 'Kharif');
      setCurrentCrops(primaryFarm.current_crops || 'Rice (Paddy), Banana');
    }
  }, [user, primaryFarm]);

  const fetchFarmHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await authAPI.getFarmHistory();
      setFarmHistory(res.data || []);
    } catch (err) {
      console.error('Failed to load farm history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchFarmHistory();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await authAPI.updateProfile({
        name,
        phone,
        state,
        district,
        preferred_language: preferredLanguage,
      });

      await authAPI.updateFarm({
        farm_name: farmName,
        farm_size: parseFloat(farmSize),
        soil_type: soilType,
        soil_ph: parseFloat(soilPh),
        irrigation_type: irrigationType,
        location: `${district}, ${state}`,
        current_season: currentSeason,
        current_crops: currentCrops,
      });

      await refreshUser();
      setSuccessMsg('Farm profile and farmer preferences updated successfully!');
    } catch (err) {
      console.error('Update farm error:', err);
      setErrorMsg('Failed to update farm profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddHistory = async (e) => {
    e.preventDefault();
    setSubmittingHistory(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        season: histSeason,
        crop_name: histCropName,
        area_cultivated: parseFloat(histArea) || 1.0,
        yield_harvested: histYield,
        sowing_date: histSowingDate,
        harvest_date: histHarvestDate,
        fertilizers_used: histFertilizers,
        pest_issues: histPestIssues,
        revenue_earned: parseFloat(histRevenue) || 0,
        notes: histNotes
      };

      await authAPI.addFarmHistory(payload);
      setSuccessMsg(`Historical record for ${histCropName} (${histSeason}) added successfully!`);
      setIsAddModalOpen(false);
      fetchFarmHistory();
    } catch (err) {
      console.error('Add farm history error:', err);
      setErrorMsg('Failed to add historical farm record.');
    } finally {
      setSubmittingHistory(false);
    }
  };

  const handleDeleteHistory = async (id, cropName, season) => {
    if (!window.confirm(`Are you sure you want to delete the record for ${cropName} (${season})?`)) return;
    try {
      await authAPI.deleteFarmHistory(id);
      setFarmHistory((prev) => prev.filter((item) => item.id !== id));
      setSuccessMsg('Farm history record deleted successfully.');
    } catch (err) {
      console.error('Delete history error:', err);
      setErrorMsg('Failed to delete history record.');
    }
  };

  const totalRevenue = farmHistory.reduce((sum, item) => sum + (item.revenue_earned || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
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
          <Tractor size={15} />
          <span>Farmer Management & Farm Records</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-950)' }}>
          My Farm & Previous Crop History
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          View previous crop cycles, past harvest yields, historical fertilizer usage, pest logs, and update current farm profile settings.
        </p>
      </div>

      {/* Notice Banners */}
      {successMsg && (
        <div style={{ padding: '14px 18px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', color: '#166534', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '14px 18px', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 'var(--radius-md)', color: '#c53030', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c53030', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--border-light)' }}>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 800,
            fontSize: '0.94rem',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'history' ? '3px solid var(--primary-700)' : '3px solid transparent',
            color: activeTab === 'history' ? 'var(--primary-800)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'history' ? 'var(--primary-50)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <History size={18} />
          <span>Previous Farm History & Harvest Logs ({farmHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 800,
            fontSize: '0.94rem',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'profile' ? '3px solid var(--primary-700)' : '3px solid transparent',
            color: activeTab === 'profile' ? 'var(--primary-800)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'profile' ? 'var(--primary-50)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Tractor size={18} />
          <span>Current Farm Profile & Settings</span>
        </button>
      </div>

      {/* TAB 1: PREVIOUS FARM HISTORY & HARVEST LOGS */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Stat Cards */}
          <div className="grid-3">
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <History size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Past Seasons Logged</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#14532d', margin: 0 }}>{farmHistory.length} Cycles</h3>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Cumulative Past Revenue</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#075985', margin: 0 }}>₹{totalRevenue.toLocaleString('en-IN')}</h3>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#fefce8', border: '1px solid #fef08a' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef9c3', color: '#a16207', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sprout size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase' }}>Primary Land Area</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#713f12', margin: 0 }}>{farmSize} Acres ({soilType})</h3>
              </div>
            </div>
          </div>

          {/* Action Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Historical Crop & Harvest Records
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                Detailed record of crops grown, fertilizers applied, pest control interventions, and harvest yields.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary"
              style={{ fontWeight: 800, padding: '10px 18px' }}
            >
              <PlusCircle size={18} />
              <span>Log Previous Crop Cycle</span>
            </button>
          </div>

          {loadingHistory ? (
            <LoadingSpinner message="Loading historical farm records..." />
          ) : farmHistory.length === 0 ? (
            <EmptyState
              title="No Farm History Logged Yet"
              description="Click 'Log Previous Crop Cycle' to record your past crops, yield, fertilizers, and pest history."
              actionLabel="Add First Historical Record"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {farmHistory.map((item) => (
                <div
                  key={item.id}
                  className="card card-hover"
                  style={{
                    padding: '22px',
                    borderLeft: '5px solid var(--primary-700)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  {/* Top Bar: Season, Crop Name, Revenue, Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span className="badge badge-green" style={{ fontWeight: 800, fontSize: '0.82rem' }}>
                          {item.season}
                        </span>
                        {item.area_cultivated && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            • {item.area_cultivated} Acres Cultivated
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {item.crop_name}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {item.revenue_earned > 0 && (
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                            Harvest Revenue
                          </span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>
                            ₹{item.revenue_earned.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteHistory(item.id, item.crop_name, item.season)}
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Detail Grid */}
                  <div className="grid-4" style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', gap: '14px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                        Yield Harvested
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {item.yield_harvested || 'Not recorded'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                        Sowing to Harvest
                      </span>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {item.sowing_date || 'N/A'} → {item.harvest_date || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                        Fertilizers & NPK Applied
                      </span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {item.fertilizers_used || 'Standard local dosage'}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                        Pest & Disease Control
                      </span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {item.pest_issues || 'No severe pest outbreak'}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={15} color="var(--primary-700)" />
                      <span><strong>Farmer Observation Notes:</strong> "{item.notes}"</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CURRENT FARM PROFILE & SETTINGS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1: Farmer Personal Details */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="var(--primary-700)" />
              <span>Personal & Account Preferences</span>
            </h3>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Login ID)</label>
                <input
                  type="email"
                  disabled
                  className="form-input"
                  value={user?.email || ''}
                  style={{ backgroundColor: 'var(--bg-subtle)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <input
                  type="text"
                  className="form-input"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Interface Language</label>
                <select
                  className="form-select"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="ml">മലയാളം (Malayalam)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Farm & Soil Characterization */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tractor size={20} color="var(--primary-700)" />
              <span>Farm Land & Agronomic Conditions</span>
            </h3>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Farm / Holding Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Land Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-input"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Soil Type</label>
                <select
                  className="form-select"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                >
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

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Tested Soil pH: {soilPh}</label>
                <input
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={soilPh}
                  onChange={(e) => setSoilPh(e.target.value)}
                  style={{ accentColor: 'var(--primary-700)', cursor: 'pointer' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Irrigation Method</label>
                <select
                  className="form-select"
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value)}
                >
                  <option value="Canal / River">Canal / River</option>
                  <option value="Drip">Drip Micro-Irrigation</option>
                  <option value="Sprinkler">Overhead Sprinkler</option>
                  <option value="Borewell">Borewell / Well</option>
                  <option value="Rainfed">Rainfed (Dryland)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Active Season Cycle</label>
                <select
                  className="form-select"
                  value={currentSeason}
                  onChange={(e) => setCurrentSeason(e.target.value)}
                >
                  <option value="Kharif">Kharif / Virippu (Monsoon)</option>
                  <option value="Rabi">Rabi / Mundakan (Winter)</option>
                  <option value="Zaid / Summer">Zaid / Puncha (Summer)</option>
                  <option value="Whole Year">Whole Year (Perennial)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Currently Cultivated Crops</label>
              <input
                type="text"
                className="form-input"
                value={currentCrops}
                onChange={(e) => setCurrentCrops(e.target.value)}
                placeholder="e.g. Rice (Paddy), Banana (Nendran), Black Pepper"
              />
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
              <Save size={18} />
              <span>{saving ? 'Saving Changes...' : 'Save Farm Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ADD PREVIOUS FARM HISTORY MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Previous Farm Cycle & Harvest Record"
      >
        <form onSubmit={handleAddHistory}>
          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Season & Year</label>
              <input
                type="text"
                required
                className="form-input"
                value={histSeason}
                onChange={(e) => setHistSeason(e.target.value)}
                placeholder="e.g. Kharif 2025 / Rabi 2024-25"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Crop Name & Variety</label>
              <input
                type="text"
                required
                className="form-input"
                value={histCropName}
                onChange={(e) => setHistCropName(e.target.value)}
                placeholder="e.g. Rice (Uma) / Banana (Nendran)"
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Area Cultivated (Acres)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                className="form-input"
                value={histArea}
                onChange={(e) => setHistArea(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Harvested Yield</label>
              <input
                type="text"
                className="form-input"
                value={histYield}
                onChange={(e) => setHistYield(e.target.value)}
                placeholder="e.g. 4,200 kg / 650 bunches"
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Sowing Date / Month</label>
              <input
                type="text"
                className="form-input"
                value={histSowingDate}
                onChange={(e) => setHistSowingDate(e.target.value)}
                placeholder="e.g. June 2025"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Harvest Date / Month</label>
              <input
                type="text"
                className="form-input"
                value={histHarvestDate}
                onChange={(e) => setHistHarvestDate(e.target.value)}
                placeholder="e.g. October 2025"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Fertilizers & Bio-inputs Applied</label>
            <input
              type="text"
              className="form-input"
              value={histFertilizers}
              onChange={(e) => setHistFertilizers(e.target.value)}
              placeholder="e.g. FYM 5t + NPK 90:45:45 + Jeevamrutha biweekly"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pest / Disease History & Treatments</label>
            <input
              type="text"
              className="form-input"
              value={histPestIssues}
              onChange={(e) => setHistPestIssues(e.target.value)}
              placeholder="e.g. Stem borer; controlled with Pseudomonas spray"
            />
          </div>

          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Revenue Earned (₹)</label>
              <input
                type="number"
                step="100"
                className="form-input"
                value={histRevenue}
                onChange={(e) => setHistRevenue(e.target.value)}
                placeholder="e.g. 96600"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Harvest Notes & Observations</label>
              <input
                type="text"
                className="form-input"
                value={histNotes}
                onChange={(e) => setHistNotes(e.target.value)}
                placeholder="e.g. High grain quality; good market demand"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submittingHistory || !histCropName.trim() || !histSeason.trim()} className="btn btn-primary">
              <PlusCircle size={16} />
              <span>{submittingHistory ? 'Saving Record...' : 'Save Historical Record'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyFarmPage;
