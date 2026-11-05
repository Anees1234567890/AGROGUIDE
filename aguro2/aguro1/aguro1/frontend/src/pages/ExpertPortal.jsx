import React, { useState, useEffect } from 'react';
import { professionalsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  AlertTriangle,
  FileText,
  UserCheck,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Calendar,
  Eye,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return cleanPath;
};

const ExpertPortal = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queries'); // 'queries', 'advisory'
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Response Form State
  const [suspectedDisease, setSuspectedDisease] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [treatment, setTreatment] = useState('');
  const [preventiveMeasures, setPreventiveMeasures] = useState('');
  const [responseStatus, setResponseStatus] = useState('Responded');

  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Advisory Form State
  const [advisoryTitle, setAdvisoryTitle] = useState('');
  const [advisoryDistrict, setAdvisoryDistrict] = useState('All Kerala');
  const [advisoryContent, setAdvisoryContent] = useState('');
  const [advisoryCategory, setAdvisoryCategory] = useState('Pest & Disease Alert');

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    setLoading(true);
    try {
      const res = await professionalsAPI.getMyRequests();
      setRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch expert requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = (req) => {
    setSelectedRequest(req);
    setSuspectedDisease(req.suspected_disease || '');
    setResponseMessage(req.response || '');
    setTreatment(req.treatment || '');
    setPreventiveMeasures(req.preventive_measures || '');
    setResponseStatus(req.status === 'Pending' ? 'Responded' : req.status);
    setSuccessNotice('');
  };

  const handleUpdateStatusToInReview = async (reqId) => {
    try {
      await professionalsAPI.updateSupportRequestStatus(reqId, 'In Review');
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: 'In Review' } : r))
      );
      if (selectedRequest && selectedRequest.id === reqId) {
        setSelectedRequest((prev) => ({ ...prev, status: 'In Review' }));
      }
      setSuccessNotice(`Consultation status updated to 'In Review'`);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseMessage.trim() || !selectedRequest) return;
    setSubmitting(true);
    try {
      const payload = {
        response: responseMessage,
        suspected_disease: suspectedDisease,
        treatment: treatment,
        preventive_measures: preventiveMeasures,
        status: responseStatus
      };

      await professionalsAPI.respondSupportRequest(selectedRequest.id, payload);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                response: responseMessage,
                suspected_disease: suspectedDisease,
                treatment: treatment,
                preventive_measures: preventiveMeasures,
                status: responseStatus
              }
            : r
        )
      );
      setSuccessNotice(`Official diagnosis and treatment plan submitted to farmer successfully!`);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to send response:', err);
      alert('Failed to send response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishAdvisory = (e) => {
    e.preventDefault();
    if (!advisoryTitle || !advisoryContent) return;
    setSuccessNotice(`Official Advisory "${advisoryTitle}" published for ${advisoryDistrict}!`);
    setAdvisoryTitle('');
    setAdvisoryContent('');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Distinct Expert Portal Header Design */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #047857 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.3)',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.18)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '12px' }}>
            <Stethoscope size={16} />
            <span>KERALA AGRICULTURAL SPECIALIST WORKSPACE</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Welcome, {user?.name || 'Agricultural Officer'}
          </h1>
          <p style={{ fontSize: '0.94rem', opacity: 0.9, margin: 0, maxWidth: '680px' }}>
            Official Agricultural Specialist & Krishi Officer Portal for Kerala. Examine uploaded disease photos, issue verified diagnostic recommendations, and respond directly to farmer field queries.
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      {successNotice && (
        <div style={{ padding: '14px 18px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#15803d', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={20} />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('queries')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 700,
            fontSize: '0.94rem',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'queries' ? '3px solid #0d9488' : '3px solid transparent',
            color: activeTab === 'queries' ? '#0f766e' : '#64748b',
            backgroundColor: activeTab === 'queries' ? '#ccfbf1' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MessageSquare size={18} />
          <span>Farmer Disease Consultations ({requests.filter(r => r.status === 'Pending' || r.status === 'In Review').length} Action Required)</span>
        </button>

        <button
          onClick={() => setActiveTab('advisory')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 700,
            fontSize: '0.94rem',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'advisory' ? '3px solid #0d9488' : '3px solid transparent',
            color: activeTab === 'advisory' ? '#0f766e' : '#64748b',
            backgroundColor: activeTab === 'advisory' ? '#ccfbf1' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={18} />
          <span>Publish Regional Advisory</span>
        </button>
      </div>

      {/* TAB 1: FARMER DISEASE CONSULTATIONS */}
      {activeTab === 'queries' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedRequest ? '1fr 1.2fr' : '1fr', gap: '20px' }}>
          {/* Query List */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#0d9488" />
              <span>Incoming Farmer Disease Consultations ({requests.length})</span>
            </h3>

            {requests.map((req) => (
              <div
                key={req.id}
                onClick={() => handleOpenRequest(req)}
                style={{
                  padding: '18px',
                  backgroundColor: selectedRequest?.id === req.id ? '#f0fdfa' : '#ffffff',
                  borderRadius: '12px',
                  border: selectedRequest?.id === req.id ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  marginBottom: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f766e', backgroundColor: '#ccfbf1', padding: '3px 8px', borderRadius: '4px' }}>
                    {req.consultation_code || `AGC-${1000 + req.id}`} • {req.crop_name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      backgroundColor:
                        req.status === 'Responded' || req.status === 'Resolved'
                          ? '#dcfce7'
                          : req.status === 'In Review'
                          ? '#e0f2fe'
                          : '#fef3c7',
                      color:
                        req.status === 'Responded' || req.status === 'Resolved'
                          ? '#15803d'
                          : req.status === 'In Review'
                          ? '#0369a1'
                          : '#b45309'
                    }}
                  >
                    {req.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {req.image_url && (
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                      <img src={getImageUrl(req.image_url)} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{req.subject}</h4>
                    <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {req.message}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><UserCheck size={14} /> {req.farmer_name || 'Farmer'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {req.farmer_district || 'Kerala'}</span>
                  </div>

                  {req.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatusToInReview(req.id);
                      }}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Mark In Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Response Form Panel */}
          {selectedRequest && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0d9488' }}>
                    CONSULTATION ID: {selectedRequest.consultation_code || `AGC-${1000 + selectedRequest.id}`}
                  </span>
                  <span className="badge badge-gray">{selectedRequest.status}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
                  {selectedRequest.crop_name} - {selectedRequest.subject}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 10px 0' }}>
                  Submitted by {selectedRequest.farmer_name || 'Farmer'} ({selectedRequest.farmer_district || 'Kerala'})
                </p>

                {/* Photo Display */}
                {selectedRequest.image_url && (
                  <div style={{ marginBottom: '14px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '10px', textAlign: 'center' }}>
                    <img src={getImageUrl(selectedRequest.image_url)} alt="Submitted Disease Photo" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' }} />
                    <div style={{ marginTop: '8px' }}>
                      <a
                        href={getImageUrl(selectedRequest.image_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={14} /> View High-Resolution Full Size Photo
                      </a>
                    </div>
                  </div>
                )}

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #0d9488' }}>
                  <strong style={{ fontSize: '0.78rem', color: '#0f766e', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Farmer's Problem Description:
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.45 }}>
                    "{selectedRequest.message}"
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendResponse}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                    Suspected Disease / Crop Problem
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={suspectedDisease}
                    onChange={(e) => setSuspectedDisease(e.target.value)}
                    placeholder="e.g. Bacterial Leaf Blight / Phytophthora Quick Wilt"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                    Detailed Diagnosis Overview
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="form-input"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Provide diagnostic verification details based on observed symptoms..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                    Recommended Treatment & Dosage
                  </label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="e.g. Spray 1% Bordeaux mixture or Pseudomonas fluorescens @ 20g/litre water..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                    Preventive Measures & Cultural Practices
                  </label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={preventiveMeasures}
                    onChange={(e) => setPreventiveMeasures(e.target.value)}
                    placeholder="e.g. Improve field drainage, avoid excessive nitrogen fertilizer during monsoon..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#0f172a' }}>
                    Update Consultation Status
                  </label>
                  <select className="form-select" value={responseStatus} onChange={(e) => setResponseStatus(e.target.value)}>
                    <option value="In Review">In Review (Keep Inquiry Open for Further Field Testing)</option>
                    <option value="Responded">Responded (Complete Diagnosis Sent to Farmer)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setSelectedRequest(null)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn" style={{ backgroundColor: '#0d9488', color: '#ffffff', fontWeight: 700 }}>
                    <Send size={16} />
                    <span>{submitting ? 'Sending Advisory...' : 'Submit Expert Response to Farmer'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUBLISH REGIONAL ADVISORY */}
      {activeTab === 'advisory' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '28px', maxWidth: '750px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#0d9488" />
            <span>Issue Official Krishi Advisory Bulletin</span>
          </h3>

          <form onSubmit={handlePublishAdvisory}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Advisory Headline / Subject</label>
              <input
                type="text"
                required
                className="form-input"
                value={advisoryTitle}
                onChange={(e) => setAdvisoryTitle(e.target.value)}
                placeholder="e.g. High Monsoon Humid Spike: Phytophthora Quick Wilt Alert for Pepper Farmers"
              />
            </div>

            <div className="grid-2" style={{ gap: '14px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Target District in Kerala</label>
                <select className="form-select" value={advisoryDistrict} onChange={(e) => setAdvisoryDistrict(e.target.value)}>
                  <option value="All Kerala">All 14 Districts (Statewide Alert)</option>
                  <option value="Palakkad">Palakkad District</option>
                  <option value="Wayanad">Wayanad District</option>
                  <option value="Idukki">Idukki District</option>
                  <option value="Thrissur">Thrissur District</option>
                  <option value="Alappuzha">Alappuzha (Kuttanad)</option>
                  <option value="Kozhikode">Kozhikode District</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Advisory Type</label>
                <select className="form-select" value={advisoryCategory} onChange={(e) => setAdvisoryCategory(e.target.value)}>
                  <option value="Pest & Disease Alert">Pest & Disease Alert</option>
                  <option value="Monsoon & Weather Protocol">Monsoon & Weather Protocol</option>
                  <option value="Soil & Fertilizer Advisory">Soil & Fertilizer Advisory</option>
                  <option value="Harvest & Mandi Price Trends">Harvest & Mandi Price Trends</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Detailed Agronomic Guidance</label>
              <textarea
                rows={6}
                required
                className="form-input"
                value={advisoryContent}
                onChange={(e) => setAdvisoryContent(e.target.value)}
                placeholder="Specify symptoms to watch for, prophylactic bio-spray recipes (e.g., 1% Bordeaux mixture, Pseudomonas fluorescens @ 20g/L), field drainage protocols, and Krishi Bhavan contact numbers..."
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0d9488', borderColor: '#0d9488', width: '100%', padding: '12px' }}>
              <FileText size={18} />
              <span>Broadcast Official Advisory to Farmers</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExpertPortal;
