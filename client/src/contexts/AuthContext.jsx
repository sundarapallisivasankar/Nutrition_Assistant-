import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronously load user info from localStorage if available
  useEffect(() => {
    const checkUser = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Validate with server and get latest profile stats
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error('Verify user session failed:', error);
          // If expired and refresh failed, API interceptor handles redirect
        }
      }
      setIsLoading(false);
    };

    checkUser();
  }, []);

  // Register User
  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.success) {
        const { accessToken, refreshToken, user: newUser } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        return { success: true };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Login User
  const login = async (email, password, rememberMe) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { accessToken, refreshToken, user: loggedUser } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout User
  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error on server:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoading(false);
    }
  };

  // Update Profile Stats and Avatar
  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      let headers = { 'Content-Type': 'application/json' };
      let bodyData = profileData;

      // Handle multipart form data if profilePhoto is present (uploading image)
      if (profileData instanceof FormData) {
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      const response = await api.put('/auth/profile', bodyData, { headers });
      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
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
