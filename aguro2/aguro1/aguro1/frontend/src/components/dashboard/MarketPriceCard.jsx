import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

const MarketPriceCard = ({ prices = [] }) => {
  const topPrices = prices.slice(0, 4);

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Mandi Benchmark
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Live Market Prices
            </h3>
          </div>
          <span className="badge badge-green">Daily Rates</span>
        </div>

        {/* Price List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {topPrices.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.crop_name}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.market_name}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ₹{item.price.toLocaleString()}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '3px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: item.trend === 'up' ? '#16a34a' : item.trend === 'down' ? '#dc2626' : '#64748b',
                  }}
                >
                  {item.trend === 'up' && <TrendingUp size={12} />}
                  {item.trend === 'down' && <TrendingDown size={12} />}
                  {item.trend === 'stable' && <Minus size={12} />}
                  <span>{item.trend === 'up' ? `+${item.trend_percentage}%` : item.trend === 'down' ? `${item.trend_percentage}%` : 'Stable'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/market-prices"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textDecoration: 'none',
          color: 'var(--primary-700)',
          fontWeight: 700,
          fontSize: '0.9rem',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <span>View All APMC Mandis</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default MarketPriceCard;
