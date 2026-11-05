import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ variant = 'default' }) => {
  const { language, switchLanguage } = useLanguage();
  const { user, refreshUser } = useAuth();

  const handleChange = async (event) => {
    const nextLanguage = event.target.value;
    switchLanguage(nextLanguage);
    if (user) {
      try {
        await authAPI.updateProfile({ preferred_language: nextLanguage });
        await refreshUser();
      } catch (error) {
        console.error('Unable to save preferred language:', error);
      }
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <Globe size={16} color={variant === 'dark' ? '#cbd5e1' : '#15803d'} />
      <select
        value={language}
        onChange={handleChange}
        style={{
          fontFamily: 'inherit',
          fontSize: '0.85rem',
          fontWeight: 600,
          padding: '4px 8px',
          borderRadius: '6px',
          border: variant === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border-light)',
          backgroundColor: variant === 'dark' ? 'rgba(255,255,255,0.1)' : '#ffffff',
          color: variant === 'dark' ? '#ffffff' : 'var(--text-primary)',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="en" style={{ color: '#000' }}>English</option>
        <option value="ml" style={{ color: '#000' }}>മലയാളം (Malayalam)</option>
        <option value="hi" style={{ color: '#000' }}>हिन्दी (Hindi)</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
