import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosClient } from '../lib/axiosClient';
import toast from 'react-hot-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    const unauthHandler = () => {
      setUser(null);
      toast.error('Session expired. Please log in again.');
    };
    window.addEventListener('unauthorized', unauthHandler);
    return () => window.removeEventListener('unauthorized', unauthHandler);
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);
    await fetchCurrentUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
