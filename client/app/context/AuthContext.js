'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state
  const router = useRouter();

  // Function to check if a user is already logged in (session persistence)
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        if (data) {
          setUser(data);
        }
      } catch (error) {
        // No user is logged in, which is fine
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/users/login', { email, password });
      setUser(data);
      router.push('/'); // Redirect to dashboard after login
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.response.data.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post('/api/users/register', { name, email, password });
      setUser(data);
      router.push('/'); // Redirect to dashboard after registration
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error(error.response.data.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/users/logout');
      setUser(null);
      router.push('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    loading, // Expose loading state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};