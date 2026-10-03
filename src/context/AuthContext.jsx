import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Session lives in a secure httpOnly cookie set by the server; ask the server who we are.
  useEffect(() => {
    api.me().then((r) => setUser(r.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const wrap = useCallback(async (fn) => {
    try {
      const r = await fn();
      setUser(r.user);
      return { success: true, user: r.user };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }, []);

  const loginWithGoogle = (credential) => wrap(() => api.googleLogin(credential));
  const login = (email, password) => wrap(() => api.login({ email, password }));
  const register = (name, email, phone, password) => wrap(() => api.register({ name, email, phone, password }));
  const updateProfile = (data) => wrap(() => api.updateProfile(data));

  const logout = async () => {
    try { await api.logout(); } catch { /* ignore */ }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, loginWithGoogle, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
