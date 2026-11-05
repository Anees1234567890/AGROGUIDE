import React, { useEffect, useState } from 'react';
import { pestAPI } from '../services/api';
import { ScanLine, Upload, Printer, ShieldCheck, AlertTriangle, XCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

const PestScannerPage = () => {
  const [samples, setSamples] = useState([]);
  const [form, setForm] = useState({ crop_name: 'Rice (Paddy)', plant_part: 'Leaf', observed_symptoms: '' });
  const [imageData, setImageData] = useState(null);
  const [result, setResult] = useState(null);
  const [rejection, setRejection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    pestAPI.getSamples().then((response) => setSamples(response.data)).catch(() => setSamples([]));
  }, []);

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setRejection(null);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageData(null);
    setRejection(null);
    setResult(null);
    setError('');
  };

  const parseErrorMessage = (errData) => {
    if (!errData) return 'The scanner could not complete this diagnosis.';
    if (typeof errData === 'string') return errData;
    if (typeof errData === 'object') {
      return errData.user_message || errData.detail || errData.message || JSON.stringify(errData);
    }
    return 'The scanner could not complete this diagnosis.';
  };

  const scan = async (sampleId) => {
    setLoading(true);
    setError('');
    setRejection(null);
    setResult(null);
    try {
      const payload = { ...form, sample_id: sampleId, image_data: imageData };
      
      // Use 3-step guardrail endpoint if image is attached
      if (imageData && !sampleId) {
        const response = await pestAPI.validateAndPredict(payload);
        if (response.data?.status === 'REJECTED') {
          setRejection(response.data);
        } else {
          setResult(response.data);
        }
      } else {
        const response = await pestAPI.scan(payload);
        if (response.data?.status === 'REJECTED') {
          setRejection(response.data);
        } else {
          setResult(response.data);
        }
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail && typeof detail === 'object' && detail.status === 'REJECTED') {
        setRejection(detail);
      } else {
        setError(parseErrorMessage(detail));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--primary-700)', fontWeight: 700 }}>
          <ScanLine size={18} /> AI Crop Scanner
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary-950)', marginTop: 8 }}>Diagnose crop damage</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          Upload a field image or use a reference sample to receive treatment and prevention guidance.
        </p>
      </header>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <section className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: 18 }}>New scan</h2>
          
          <div className="form-group">
            <label className="form-label">Crop</label>
            <input
              className="form-input"
              value={form.crop_name}
              onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
              placeholder="e.g. Tomato, Rice, Potato"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Affected plant part</label>
            <select
              className="form-input"
              value={form.plant_part}
              onChange={(e) => setForm({ ...form, plant_part: e.target.value })}
            >
              <option>Leaf</option>
              <option>Stem</option>
              <option>Fruit</option>
              <option>Root</option>
              <option>Flower</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Observed symptoms</label>
            <textarea
              className="form-input"
              rows="3"
              value={form.observed_symptoms}
              onChange={(e) => setForm({ ...form, observed_symptoms: e.target.value })}
              placeholder="Describe spots, wilting, insects, or discoloration"
            />
          </div>

          {/* Image Upload Box & Preview */}
          <div style={{ marginBottom: 16 }}>
            {imageData ? (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <img src={imageData} alt="Field preview" style={{ maxHeight: 180, width: 'auto', borderRadius: 6, objectFit: 'contain' }} />
                <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '.85rem', color: '#059669', display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
                    <CheckCircle size={15} /> Field image attached
                  </span>
                  <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '.8rem' }} onClick={clearImage}>
                    Clear image
                  </button>
                </div>
              </div>
            ) : (
              <label className="btn btn-secondary" style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center', cursor: 'pointer' }}>
                <Upload size={17} /> Attach field image
                <input type="file" accept="image/*" onChange={handleImage} hidden />
              </label>
            )}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => scan()}
            disabled={loading}
          >
            {loading ? 'Analyzing image...' : 'Run diagnosis'}
          </button>

          {error && (
            <p style={{ color: '#b91c1c', marginTop: 12, background: '#fef2f2', padding: 12, borderRadius: 6, fontSize: '.9rem' }}>
              {error}
            </p>
          )}
        </section>

        <section className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: 14 }}>Reference samples</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {samples.map((sample) => (
              <button
                key={sample.id}
                className="btn btn-secondary"
                style={{ justifyContent: 'space-between', textAlign: 'left' }}
                onClick={() => {
                  setForm({ ...form, crop_name: sample.crop_name, plant_part: sample.plant_part });
                  setImageData(null);
                  scan(sample.id);
                }}
              >
                <span>
                  <strong>{sample.disease_name}</strong>
                  <br />
                  <small>{sample.crop_name} · {sample.plant_part}</small>
                </span>
                <ScanLine size={16} />
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Structured Image Rejection Card */}
      {rejection && (
        <section className="card" style={{ padding: 24, borderLeft: '4px solid #ef4444', background: '#fef2f2' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
            <XCircle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: '.75rem' }}>
                  {rejection.status || 'REJECTED'}
                </span>
                {rejection.error_code && (
                  <span style={{ color: '#7f1d1d', fontWeight: 600, fontSize: '.8rem' }}>
                    {rejection.error_code}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#991b1b', marginTop: 8 }}>
                Image Rejection Guardrail
              </h3>
              <p style={{ color: '#7f1d1d', marginTop: 6, fontSize: '.95rem', lineHeight: 1.5 }}>
                {rejection.user_message || 'Invalid image detected. Please upload a clear photo of an infected plant leaf.'}
              </p>

              <div style={{ marginTop: 14, background: '#ffffff', padding: 14, borderRadius: 6, border: '1px solid #fca5a5' }}>
                <strong style={{ fontSize: '.85rem', color: '#991b1b' }}>Tips for a successful scan:</strong>
                <ul style={{ margin: '6px 0 0 18px', fontSize: '.85rem', color: '#7f1d1d' }}>
                  <li>Capture a clear, focused photo of the affected crop leaf or plant part.</li>
                  <li>Ensure good lighting and avoid blurry or moving shots.</li>
                  <li>Position the leaf clearly in the center of the photo.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Successful Diagnostic Report Card */}
      {result && (
        <section className="card" id="diagnostic-report" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
            <div>
              <span style={{ color: 'var(--primary-700)', fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center' }}>
                <CheckCircle size={16} color="#059669" /> Diagnostic report
              </span>
              <h2 style={{ fontSize: '1.5rem', marginTop: 4 }}>
                {result.detected_disease || `${result.crop} ${result.disease}`}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {result.scientific_name ? `${result.scientific_name} · ` : ''}{result.pathogen_type || 'Crop Disease'}
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={16} /> Print
            </button>
          </div>

          <div className="grid-2" style={{ marginTop: 20 }}>
            <div>
              <p><strong>Confidence:</strong> {result.confidence_score ? (typeof result.confidence_score === 'number' ? `${result.confidence_score}%` : result.confidence_score) : 'High'}</p>
              <p><strong>Severity:</strong> {result.severity || 'Moderate'} {result.severity_score ? `(${result.severity_score}/10)` : ''}</p>
              {result.symptoms_matched && result.symptoms_matched.length > 0 && (
                <p><strong>Symptoms matched:</strong> {result.symptoms_matched.join(', ')}</p>
              )}
            </div>
            
            {result.immediate_action && (
              <div style={{ background: '#fefce8', padding: 16, borderRadius: 8 }}>
                <strong style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <AlertTriangle size={17} color="#ca8a04" /> Immediate action
                </strong>
                <p style={{ marginTop: 6 }}>{result.immediate_action}</p>
              </div>
            )}
          </div>

          {/* Next Steps / Treatment Plan */}
          {result.next_steps ? (
            <div style={{ marginTop: 20, background: '#f0fdf4', padding: 16, borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <strong style={{ color: '#166534', fontSize: '1rem' }}>Recommended Next Steps:</strong>
              <ul style={{ margin: '8px 0 0 20px', color: '#15803d' }}>
                {result.next_steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{step}</li>
                ))}
              </ul>
            </div>
          ) : result.treatment_plan ? (
            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              {result.treatment_plan.organic_control && (
                <div><strong>Organic control</strong><p>{result.treatment_plan.organic_control}</p></div>
              )}
              {result.treatment_plan.chemical_control && (
                <div><strong>Chemical control</strong><p>{result.treatment_plan.chemical_control}</p></div>
              )}
              {result.treatment_plan.cultural_prevention && (
                <div><strong>Prevention and spray schedule</strong><p>{result.treatment_plan.cultural_prevention} {result.treatment_plan.spray_schedule || ''}</p></div>
              )}
            </div>
          ) : null}

          <p style={{ color: 'var(--text-muted)', fontSize: '.82rem', marginTop: 18, display: 'flex', gap: 6 }}>
            <ShieldCheck size={15} /> {result.disclaimer || 'AgroGuide ML Pest Scanner utilizes Deep Learning classification models and verified agronomic bio-controls.'}
          </p>
        </section>
      )}
    </div>
  );
};

export default PestScannerPage;
