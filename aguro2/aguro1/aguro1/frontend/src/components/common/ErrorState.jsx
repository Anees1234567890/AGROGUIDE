import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  title = 'Something Went Wrong',
  message = 'Unable to fetch agricultural data. Please check your network connection or try again.',
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: '#fff5f5',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #fed7d7',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626',
          marginBottom: '16px',
        }}
      >
        <AlertTriangle size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#991b1b', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: '#7f1d1d', maxWidth: '420px', marginBottom: onRetry ? '20px' : '0' }}>
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
