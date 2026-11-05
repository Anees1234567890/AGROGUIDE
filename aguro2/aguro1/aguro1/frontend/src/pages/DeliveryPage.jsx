import React, { useEffect, useState } from 'react';
import { deliveryAPI } from '../services/api';
import { Truck, Calculator, PackageCheck, FileText, CreditCard, Smartphone, Building2, Banknote, Star, Clock, Phone, X, CheckCircle2 } from 'lucide-react';

const defaultForm = { crop_name: 'Tomato', quantity_quintals: 5, packaging_type: 'Plastic Crates', harvest_date: '', pickup_address: '', pickup_district: 'Palakkad', destination_mandi: 'Palakkad APMC Mandi', destination_address: 'Main APMC Yard, Palakkad', distance_km: 35, vehicle_type: 'Eco Mini-Truck (1.5 Ton)', requires_cold_chain: true };

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI', sublabel: 'GPay · PhonePe · Paytm', icon: Smartphone },
  { id: 'Card', label: 'Credit / Debit Card', sublabel: 'Visa · Mastercard · RuPay', icon: CreditCard },
  { id: 'Net Banking', label: 'Net Banking', sublabel: 'All major banks', icon: Building2 },
  { id: 'Cash', label: 'Pay at Mandi', sublabel: 'Cash on delivery (COD)', icon: Banknote },
];

const paymentStatusColor = (status) => {
  if (status === 'Paid') return 'var(--primary-700)';
  if (status === 'Pay on Delivery') return '#b45309';
  return '#b91c1c';
};

const PaymentModal = ({ order, onClose, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  const handlePay = async () => {
    if (!selectedMethod) return;
    setProcessing(true);
    setError('');
    try {
      const response = await deliveryAPI.payOrder(order.id, { payment_method: selectedMethod });
      setReceipt(response.data);
      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: 24, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: '1.15rem' }}>{receipt ? 'Payment confirmed' : 'Payment gateway'}</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {!receipt ? (
          <>
            <div style={{ padding: 14, background: 'var(--primary-50)', borderRadius: 8, marginBottom: 18 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '.88rem' }}>{order.tracking_number} · {order.crop_name}</p>
              <strong style={{ fontSize: '1.5rem', color: 'var(--primary-800)' }}>₹{order.estimated_cost.toLocaleString('en-IN')}</strong>
            </div>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>Choose payment method</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {PAYMENT_METHODS.map(({ id, label, sublabel, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedMethod(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    border: selectedMethod === id ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                    background: selectedMethod === id ? 'var(--primary-50)' : 'white',
                  }}
                >
                  <Icon size={20} color="var(--primary-700)" />
                  <div>
                    <strong>{label}</strong>
                    <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
            {error && <p style={{ color: '#b91c1c', marginBottom: 12, fontSize: '.88rem' }}>{error}</p>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={!selectedMethod || processing} onClick={handlePay}>
              {processing ? 'Processing...' : selectedMethod === 'Cash' ? 'Confirm COD booking' : 'Pay now'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--primary-700)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-800)' }}>
              {receipt.payment_status === 'Paid' ? 'Payment successful!' : 'COD booking confirmed'}
            </p>
            {receipt.payment_id && (
              <p style={{ marginTop: 8, fontFamily: 'monospace', fontSize: '.95rem' }}>Transaction ID: {receipt.payment_id}</p>
            )}
            <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{receipt.payment_method} · {receipt.payment_status}</p>
            <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '.88rem' }}>Status: {receipt.status}</p>
            <button className="btn btn-primary" style={{ marginTop: 18, width: '100%' }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

const DeliveryPage = () => {
  const [form, setForm] = useState(defaultForm);
  const [quote, setQuote] = useState(null);
  const [orders, setOrders] = useState([]);
  const [gatePass, setGatePass] = useState(null);
  const [payOrder, setPayOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const update = (key, value) => setForm({ ...form, [key]: value });
  const refreshOrders = () => deliveryAPI.getOrders().then((response) => setOrders(response.data)).catch(() => setOrders([]));
  useEffect(() => { refreshOrders(); }, []);

  const getQuote = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await deliveryAPI.getQuote({
        crop_name: form.crop_name,
        quantity_quintals: Number(form.quantity_quintals),
        distance_km: Number(form.distance_km),
        vehicle_type: form.vehicle_type,
        requires_cold_chain: form.requires_cold_chain,
      });
      setQuote(response.data);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Unable to calculate the quote.');
    } finally {
      setLoading(false);
    }
  };

  const book = async () => {
    setLoading(true);
    setMessage('');
    try {
      await deliveryAPI.createOrder({ ...form, quantity_quintals: Number(form.quantity_quintals), distance_km: Number(form.distance_km) });
      setMessage('Dispatch booked successfully.');
      await refreshOrders();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Unable to book this dispatch.');
    } finally {
      setLoading(false);
    }
  };

  const showGatePass = async (id) => {
    const response = await deliveryAPI.getGatePass(id);
    setGatePass(response.data);
  };

  const handlePaymentSuccess = async () => {
    await refreshOrders();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--primary-700)', fontWeight: 700 }}>
          <Truck size={18} /> Farm-to-market logistics
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary-950)', marginTop: 8 }}>Move your harvest with confidence</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Get a transparent freight estimate, book dispatch, and keep the mandi gate pass in one place.</p>
      </header>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <form className="card" style={{ padding: 24 }} onSubmit={getQuote}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: 18 }}>Dispatch planner</h2>
          <div className="form-group">
            <label className="form-label">Crop</label>
            <input className="form-input" value={form.crop_name} onChange={(e) => update('crop_name', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Quantity (quintals)</label>
              <input className="form-input" type="number" min="0.1" step="0.1" value={form.quantity_quintals} onChange={(e) => update('quantity_quintals', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Distance (km)</label>
              <input className="form-input" type="number" min="1" value={form.distance_km} onChange={(e) => update('distance_km', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Pickup address</label>
            <input className="form-input" minLength="5" value={form.pickup_address} onChange={(e) => update('pickup_address', e.target.value)} placeholder="Farm or collection center address" required />
          </div>
          <div className="form-group">
            <label className="form-label">Vehicle</label>
            <select className="form-input" value={form.vehicle_type} onChange={(e) => update('vehicle_type', e.target.value)}>
              <option>Eco Mini-Truck (1.5 Ton)</option>
              <option>Light Commercial Truck (3.5 Ton)</option>
              <option>Refrigerated Reefer Van (4.0 Ton)</option>
              <option>Tractor Trolley (Agri-Haul 5.0 Ton)</option>
            </select>
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
            <input type="checkbox" checked={form.requires_cold_chain} onChange={(e) => update('requires_cold_chain', e.target.checked)} /> Cold-chain handling required
          </label>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            <Calculator size={16} /> {loading ? 'Calculating...' : 'Calculate freight'}
          </button>

          {quote && (
            <div style={{ marginTop: 18, padding: 16, background: 'var(--primary-50)', borderRadius: 8 }}>
              <p style={{ color: 'var(--text-secondary)' }}>Estimated cost</p>
              <strong style={{ fontSize: '1.8rem', color: 'var(--primary-800)' }}>₹{quote.total_estimated_cost.toLocaleString('en-IN')}</strong>
              <p style={{ marginTop: 8 }}>{quote.spoilage_risk} risk · {quote.estimated_transit_hours} hours</p>
              <p style={{ marginTop: 8, fontSize: '.88rem' }}>{quote.transit_advisory}</p>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '.88rem', color: 'var(--text-secondary)' }}>Logistics partner</p>
                <strong>{quote.delivery_partner}</strong>
                <span style={{ marginLeft: 8, fontSize: '.88rem', color: '#b45309' }}>
                  <Star size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {quote.partner_rating}/5
                </span>
                <p style={{ marginTop: 8, fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                  <Clock size={14} /> Approx. delivery: <strong style={{ color: 'var(--primary-800)' }}>{quote.estimated_delivery_time}</strong>
                </p>
              </div>

              <button type="button" className="btn btn-accent" style={{ marginTop: 14, width: '100%' }} onClick={book}>Book this dispatch</button>
            </div>
          )}

          {message && <p style={{ marginTop: 12, color: message.includes('successfully') ? 'var(--primary-700)' : '#b91c1c' }}>{message}</p>}
        </form>

        <section className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: 18 }}>Your consignments</h2>
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No dispatches booked yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((order) => (
                <div key={order.id} style={{ border: '1px solid var(--border-light)', borderRadius: 8, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <strong>{order.crop_name} · {order.quantity_quintals} qtl</strong>
                    <span style={{ color: 'var(--primary-700)', fontWeight: 700, fontSize: '.88rem' }}>{order.status}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '.86rem', marginTop: 4 }}>{order.tracking_number} · {order.current_location}</p>

                  <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '.84rem' }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)' }}>Driver</p>
                      <strong>{order.driver_name}</strong>
                      <p style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, color: 'var(--text-secondary)' }}>
                        <Phone size={12} /> {order.driver_phone}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)' }}>Vehicle</p>
                      <strong>{order.vehicle_number}</strong>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)' }}>Partner</p>
                      <strong>{order.delivery_partner || 'AgroExpress Logistics Hub'}</strong>
                      {order.partner_rating && (
                        <span style={{ marginLeft: 4, color: '#b45309', fontSize: '.82rem' }}>
                          ⭐ {order.partner_rating}/5
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)' }}>ETA</p>
                      <strong style={{ fontSize: '.82rem' }}>{order.estimated_delivery_time || 'Calculating...'}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.84rem', fontWeight: 600, color: paymentStatusColor(order.payment_status) }}>
                      {order.payment_status || 'Pending Payment'}
                      {order.payment_id && <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>({order.payment_id})</span>}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {order.payment_status === 'Pending Payment' && (
                        <button className="btn btn-accent btn-sm" onClick={() => setPayOrder(order)}>Pay now</button>
                      )}
                      <button className="btn btn-secondary btn-sm" onClick={() => showGatePass(order.id)}>
                        <FileText size={15} /> Gate pass
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {gatePass && (
        <section className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.15rem' }}><PackageCheck size={18} /> Mandi gate pass</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>Print</button>
          </div>
          <p style={{ marginTop: 12 }}><strong>{gatePass.gate_pass_id}</strong> · {gatePass.tracking_number}</p>
          <p>{gatePass.farmer_name} · {gatePass.crop_name} · {gatePass.quantity_quintals} qtl</p>
          <p>{gatePass.destination_mandi} · {gatePass.vehicle_number}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '.82rem', marginTop: 10 }}>QR payload: {gatePass.qr_code_payload}</p>
        </section>
      )}

      {payOrder && (
        <PaymentModal
          order={payOrder}
          onClose={() => setPayOrder(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default DeliveryPage;
