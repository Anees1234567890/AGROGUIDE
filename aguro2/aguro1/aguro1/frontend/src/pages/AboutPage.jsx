import React from 'react';
import { Sprout } from 'lucide-react';

const AboutPage = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            backgroundColor: 'var(--primary-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(22,163,74,0.25)',
          }}
        >
          <Sprout size={36} color="#ffffff" />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}
        >
          About <span style={{ color: 'var(--primary-700)' }}>AgroGuide</span>
        </h1>

        {/* Divider */}
        <div
          style={{
            width: '60px',
            height: '4px',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-500)',
          }}
        />

        {/* Description */}
        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
          }}
        >
          AgroGuide is a smart farming platform built to help farmers make better, data-driven decisions.
          It brings together crop recommendations, live weather updates, market prices, pest diagnosis,
          and expert agronomist support — all in one simple, multilingual dashboard designed for both
          smallholder and commercial farmers across Kerala and beyond.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
