import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Bell,
  CloudRain,
  TrendingUp,
  Sparkles,
  Users,
  CheckCheck,
  Check,
  Info
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Weather Alert':
        return <CloudRain size={20} color="#16a34a" />;
      case 'Market Alert':
        return <TrendingUp size={20} color="#2563eb" />;
      case 'Crop Recommendation':
        return <Sparkles size={20} color="#ca8a04" />;
      case 'Community Notification':
        return <Users size={20} color="#7c3aed" />;
      default:
        return <Info size={20} color="#64748b" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
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
            <Bell size={15} />
            <span>Farm Alert Feed</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-950)' }}>
            Notifications & Alerts
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Stay informed with weather advisories, mandi fluctuations, and agronomy alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCheck size={16} />
            <span>Mark All As Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Checking for real-time farm notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="All Caught Up!"
          description="You have no notifications or pending agricultural alerts at this time."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '18px 22px',
                backgroundColor: n.is_read ? 'var(--bg-surface)' : '#f0fdf4',
                borderLeft: n.is_read ? '4px solid #cbd5e1' : '4px solid #16a34a',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-subtle)',
                    flexShrink: 0,
                  }}
                >
                  {getIconForType(n.type)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {n.title}
                    </h4>
                    <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                      {n.type}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {n.message}
                  </p>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="btn btn-secondary btn-sm"
                  title="Mark as read"
                  style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                >
                  <Check size={14} color="#16a34a" />
                  <span>Read</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
