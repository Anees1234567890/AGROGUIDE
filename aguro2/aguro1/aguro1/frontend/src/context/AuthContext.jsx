import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('agroguide_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current logged in user if token is present on initial load
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const storedToken = localStorage.getItem('agroguide_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (isMounted) setUser(res.data);
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          localStorage.removeItem('agroguide_token');
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      }
      if (isMounted) setLoading(false);
    };
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const res = await authAPI.login({ email, password, remember_me: rememberMe });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('agroguide_token', access_token);
    setToken(access_token);
    setUser(userData);
    if (userData.preferred_language) {
      localStorage.setItem('agroguide_lang', userData.preferred_language);
      window.dispatchEvent(new CustomEvent('agroguide-language-change', { detail: userData.preferred_language }));
    }
    return userData;
  };

  const loginOTP = async (emailOrPhone, otpCode) => {
    const res = await authAPI.loginOTP({ email_or_phone: emailOrPhone, otp_code: otpCode });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('agroguide_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (registerData) => {
    const res = await authAPI.register(registerData);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('agroguide_token', access_token);
    setToken(access_token);
    setUser(userData);
    if (userData.preferred_language) {
      localStorage.setItem('agroguide_lang', userData.preferred_language);
      window.dispatchEvent(new CustomEvent('agroguide-language-change', { detail: userData.preferred_language }));
    }
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('agroguide_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isFarmer = user?.role === 'Farmer';
  const isProfessional = user?.role === 'Agricultural Professional';
  const isAdmin = user?.role === 'Admin';
  const primaryFarm = user?.farms?.[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginOTP,
        register,
        logout,
        refreshUser,
        isAuthenticated,
        isFarmer,
        isProfessional,
        isAdmin,
        primaryFarm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
