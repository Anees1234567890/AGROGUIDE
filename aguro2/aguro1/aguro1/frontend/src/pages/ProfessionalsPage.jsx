import React, { useState, useEffect } from 'react';
import { professionalsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import axios from 'axios';
import {
  UserCheck,
  Search,
  MapPin,
  Clock,
  Languages,
  Award,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Upload,
  FileImage,
  Stethoscope,
  Eye,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

const EXPERTISE_CATEGORIES = [
  'All',
  'Soil Health',
  'Pest & Disease',
  'Irrigation',
  'Organic Farming',
  'Plantation Crops'
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return cleanPath;
};

const ProfessionalsPage = () => {
  const { isAuthenticated, user } = useAuth();

  const [activeTab, setActiveTab] = useState('consultations'); // 'consultations' or 'directory'
  const [professionals, setProfessionals] = useState([]);
  const [myConsultations, setMyConsultations] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New Consultation Form State
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [selectedPro, setSelectedPro] = useState(null);
  const [cropName, setCropName] = useState('Rice (Paddy)');
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // View Consultation Detail Modal State
  const [viewingConsultation, setViewingConsultation] = useState(null);

  const fetchMyConsultations = async () => {
    try {
      const res = await professionalsAPI.getMyRequests();
      setMyConsultations(res.data || []);
    } catch (err) {
      console.error('Failed to load my consultations:', err);
    }
  };

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const params = {
        query: searchQuery.trim() || undefined,
        expertise: selectedExpertise !== 'All' ? selectedExpertise : undefined,
      };
      const res = await professionalsAPI.getAll(params);
      setProfessionals(res.data || []);
    } catch (err) {
      console.error('Failed to load professionals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyConsultations();
    fetchProfessionals();
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [selectedExpertise]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfessionals();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSubmitError('');

    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setSubmitError('Invalid file type. Only JPG, PNG, and WEBP images are allowed.');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSubmitError('File size exceeds 5 MB. Please select a smaller photo.');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleOpenConsultModal = (pro = null) => {
    setSelectedPro(pro);
    setSubmitSuccess(false);
    setSubmitError('');
    setMessage('');
    setSelectedFile(null);
    setFilePreview(null);
    setIsConsultModalOpen(true);
  };

  const handleSendConsultation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      let uploadedImageUrl = null;

      // 1. Upload photo if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const token = localStorage.getItem('agroguide_token');
        const uploadRes = await axios.post('/api/support-requests/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        uploadedImageUrl = uploadRes.data.image_url;
      }

      // 2. Submit consultation details to backend
      const payload = {
        professional_id: selectedPro ? selectedPro.id : undefined,
        subject: `Crop Disease Consultation: ${cropName}`,
        crop_name: cropName,
        message: message,
        image_url: uploadedImageUrl
      };

      await professionalsAPI.createSupportRequest(payload);
      setSubmitSuccess(true);
      fetchMyConsultations();
    } catch (err) {
      console.error('Consultation submission error:', err);
      const msg = err.response?.data?.detail || 'Failed to submit crop disease consultation. Please verify your inputs.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
            backgroundColor: '#dcfce7',
            color: '#15803d',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '10px',
          }}
        >
          <Stethoscope size={15} />
          <span>Agricultural Expert Advisory Hub</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-950)' }}>
          Crop Disease Consultation & Expert Support
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '750px' }}>
          Upload crop disease photos, describe observed symptoms, and get verified diagnostic solutions & treatment advice from certified agronomists.
        </p>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--border-light)' }}>
        <button
          onClick={() => setActiveTab('consultations')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 800,
            fontSize: '0.94rem',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'consultations' ? '3px solid var(--primary-700)' : '3px solid transparent',
            color: activeTab === 'consultations' ? 'var(--primary-800)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'consultations' ? 'var(--primary-50)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Stethoscope size={18} />
          <span>My Disease Consultations ({myConsultations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 800,
            fontSize: '0.94rem',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'directory' ? '3px solid var(--primary-700)' : '3px solid transparent',
            color: activeTab === 'directory' ? 'var(--primary-800)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'directory' ? 'var(--primary-50)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserCheck size={18} />
          <span>Krishi Experts Directory</span>
        </button>
      </div>

      {/* TAB 1: MY CROP DISEASE CONSULTATIONS */}
      {activeTab === 'consultations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Your Submitted Crop Consultations
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                Track expert review status (Pending, In Review, Responded) and view diagnosed treatments.
              </p>
            </div>

            <button
              onClick={() => handleOpenConsultModal(null)}
              className="btn btn-primary"
              style={{ fontWeight: 800, padding: '10px 18px' }}
            >
              <Upload size={16} />
              <span>Upload Disease Photo & Consult Expert</span>
            </button>
          </div>

          {myConsultations.length === 0 ? (
            <EmptyState
              title="No Consultations Submitted Yet"
              description="Click 'Upload Disease Photo & Consult Expert' to upload a crop image and receive expert solutions."
              actionLabel="Submit First Consultation"
              onAction={() => handleOpenConsultModal(null)}
            />
          ) : (
            <div className="grid-2">
              {myConsultations.map((item) => (
                <div
                  key={item.id}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px'
                  }}
                >
                  <div>
                    {/* Header: ID, Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className="badge badge-gray" style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                        {item.consultation_code || `AGC-${1000 + item.id}`}
                      </span>

                      <span
                        className={`badge ${
                          item.status === 'Responded' || item.status === 'Resolved'
                            ? 'badge-green'
                            : item.status === 'In Review'
                            ? 'badge-blue'
                            : 'badge-yellow'
                        }`}
                        style={{ fontWeight: 700 }}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Crop Name & Submission Date */}
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {item.crop_name || 'Crop Disease Inquiry'}
                    </h3>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
                      Submitted on {new Date(item.created_at).toLocaleDateString()}
                    </span>

                    {/* Image Preview if available */}
                    {item.image_url && (
                      <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', height: '140px', backgroundColor: '#f1f5f9' }}>
                        <img
                          src={getImageUrl(item.image_url)}
                          alt="Crop Disease"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    {/* Problem Description */}
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
                      <strong>Observed Problem:</strong> {item.message}
                    </p>

                    {/* Expert Diagnosis if responded */}
                    {(item.status === 'Responded' || item.status === 'Resolved' || item.response) && (
                      <div style={{ padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                          ✓ Expert Diagnosis & Solution
                        </span>
                        {item.suspected_disease && (
                          <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#14532d', margin: '0 0 4px 0' }}>
                            Disease: {item.suspected_disease}
                          </p>
                        )}
                        <p style={{ fontSize: '0.84rem', color: '#166534', margin: 0, lineHeight: 1.4 }}>
                          {item.response}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setViewingConsultation(item)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', fontWeight: 700, marginTop: '8px' }}
                  >
                    <Eye size={15} />
                    <span>View Full Consultation Details</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KRISHI EXPERTS DIRECTORY */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expert by name or specialization..."
                className="form-input"
                style={{ paddingLeft: '38px', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {EXPERTISE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedExpertise(cat)}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: selectedExpertise === cat ? '1px solid var(--primary-700)' : '1px solid var(--border-light)',
                    backgroundColor: selectedExpertise === cat ? 'var(--primary-700)' : 'var(--bg-surface)',
                    color: selectedExpertise === cat ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading Krishi Officers & Agronomists..." />
          ) : professionals.length === 0 ? (
            <EmptyState
              title="No Professionals Found"
              description={`No expert profiles match '${searchQuery}'.`}
              actionLabel="View All Experts"
              onAction={() => {
                setSearchQuery('');
                setSelectedExpertise('All');
              }}
            />
          ) : (
            <div className="grid-2">
              {professionals.map((pro) => (
                <div key={pro.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pro.name}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 700 }}>{pro.designation}</p>
                      </div>
                      <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} color="#16a34a" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={15} color="#64748b" />
                        <span>{pro.institution}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={15} color="#64748b" />
                        <span>{pro.location}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                      {pro.bio}
                    </p>
                  </div>

                  <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                    <button
                      onClick={() => handleOpenConsultModal(pro)}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Send size={16} />
                      <span>Consult This Specialist</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* UPLOAD & CONSULTATION SUBMISSION MODAL */}
      <Modal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        title="Upload Disease Photo & Submit to Agriculture Expert"
      >
        {submitSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Crop Disease Consultation Submitted!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your disease photo and details have been transmitted to our Agricultural Officers. You can track status and expert responses under 'My Disease Consultations'.
            </p>
            <button onClick={() => setIsConsultModalOpen(false)} className="btn btn-primary">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendConsultation}>
            {submitError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 'var(--radius-md)', color: '#c53030', fontSize: '0.85rem', marginBottom: '16px' }}>
                {submitError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Crop Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Rice (Paddy), Black Pepper, Banana"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Crop / Plant Disease Photo</label>
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '16px', textAlign: 'center', backgroundColor: '#f8fafc', position: 'relative' }}>
                {filePreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <img src={filePreview} alt="Preview" style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                      Selected File: {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} color="#64748b" style={{ marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Click to select image file from device
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Supports JPG, PNG, WEBP (Max size: 5 MB)
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Describe Observed Problem & Symptoms</label>
              <textarea
                required
                rows={4}
                className="form-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe leaf yellowing, stem rot, spots, pest damage, soil conditions, or crop stage..."
              />
            </div>

            {selectedPro && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--primary-50)', borderRadius: '6px', fontSize: '0.84rem', color: 'var(--primary-900)' }}>
                <strong>Directing to:</strong> {selectedPro.name} ({selectedPro.institution})
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={() => setIsConsultModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting || !message.trim()} className="btn btn-primary">
                <Send size={16} />
                <span>{submitting ? 'Submitting Photo & Details...' : 'Submit to Agricultural Expert'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* VIEW CONSULTATION DETAIL MODAL */}
      {viewingConsultation && (
        <Modal
          isOpen={Boolean(viewingConsultation)}
          onClose={() => setViewingConsultation(null)}
          title={`Consultation Details: ${viewingConsultation.consultation_code || `AGC-${1000 + viewingConsultation.id}`}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {viewingConsultation.crop_name}
              </h3>
              <span className={`badge ${viewingConsultation.status === 'Responded' || viewingConsultation.status === 'Resolved' ? 'badge-green' : 'badge-yellow'}`}>
                {viewingConsultation.status}
              </span>
            </div>

            {viewingConsultation.image_url && (
              <div style={{ borderRadius: '8px', overflow: 'hidden', maxHeight: '250px', backgroundColor: '#f1f5f9', textAlign: 'center', padding: '8px' }}>
                <img src={getImageUrl(viewingConsultation.image_url)} alt="Uploaded Disease" style={{ maxWidth: '100%', maxHeight: '230px', objectFit: 'contain' }} />
              </div>
            )}

            <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Farmer Problem Description
              </span>
              <p style={{ fontSize: '0.9rem', color: '#0f172a', margin: 0, lineHeight: 1.45 }}>
                {viewingConsultation.message}
              </p>
            </div>

            {viewingConsultation.response ? (
              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <ShieldCheck size={18} />
                  Agricultural Expert Diagnosis & Advisory Solution
                </span>
                {viewingConsultation.suspected_disease && (
                  <p style={{ fontSize: '0.92rem', fontWeight: 800, color: '#14532d', marginBottom: '6px' }}>
                    Suspected Disease / Problem: {viewingConsultation.suspected_disease}
                  </p>
                )}
                <p style={{ fontSize: '0.88rem', color: '#166534', lineHeight: 1.5, marginBottom: '8px' }}>
                  <strong>Diagnosis Details:</strong> {viewingConsultation.response}
                </p>
                {viewingConsultation.treatment && (
                  <p style={{ fontSize: '0.88rem', color: '#166534', lineHeight: 1.5, marginBottom: '8px' }}>
                    <strong>Recommended Treatment:</strong> {viewingConsultation.treatment}
                  </p>
                )}
                {viewingConsultation.preventive_measures && (
                  <p style={{ fontSize: '0.88rem', color: '#166534', lineHeight: 1.5, margin: 0 }}>
                    <strong>Preventive Measures:</strong> {viewingConsultation.preventive_measures}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ padding: '14px', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', color: '#854d0e', fontSize: '0.86rem' }}>
                <strong>Status:</strong> Your inquiry is currently pending review by our agricultural officers. Check back soon for the verified diagnosis.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button onClick={() => setViewingConsultation(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfessionalsPage;
