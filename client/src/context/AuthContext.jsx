import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Pre-configure axios default options
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure bearer token in axios
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Check login status on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setAuthHeader(storedToken);
        try {
          const res = await axios.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Session validation failed:', err.message);
          setAuthHeader(null); // Clear invalid token
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        setAuthHeader(res.data.token);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await axios.post('/auth/register', userData);
      if (res.data.success) {
        setUser(res.data.user);
        setAuthHeader(res.data.token);
        toast.success(`Account created for ${res.data.user.name}!`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await axios.get('/auth/logout');
      setUser(null);
      setAuthHeader(null);
      toast.success('Logged out successfully.');
    } catch (err) {
      console.error('Logout error:', err.message);
      setUser(null);
      setAuthHeader(null);
    }
  };

  // Manual update profile helper
  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { axios };
