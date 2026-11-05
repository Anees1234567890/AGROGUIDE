import React from 'react';
import { Sprout } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading agricultural data...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px' }}>
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          border: '4px solid var(--primary-100)',
          borderTopColor: 'var(--primary-600)',
          animation: 'spin 0.8s linear infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sprout size={24} color="var(--primary-700)" />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
