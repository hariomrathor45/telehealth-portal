import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Verify token validity by calling /auth/me
          const response = await authService.getMe();
          if (response.data) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      const { user: userData, token, refreshToken, redirectPath } = response.data;

      if (!token || !userData) {
        throw new Error('Authentication response did not contain token or user payload.');
      }

      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return {
        success: true,
        redirectPath: redirectPath || `/${userData.role.toLowerCase()}/dashboard`,
        user: userData,
      };
    } catch (err) {
      const message = err.message || 'Login failed. Please check your credentials.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Register Patient
  const registerPatient = useCallback(async (data) => {
    setError(null);
    try {
      const response = await authService.registerPatient(data);
      const { user: userData, token, refreshToken } = response.data;

      if (token && userData) {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }

      return { success: true, redirectPath: '/patient/dashboard' };
    } catch (err) {
      const message = err.message || 'Patient registration failed.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Register Doctor
  const registerDoctor = useCallback(async (data) => {
    setError(null);
    try {
      const response = await authService.registerDoctor(data);
      const { user: userData, token, refreshToken } = response.data;

      if (token && userData) {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }

      return { success: true, redirectPath: '/doctor/dashboard', verificationStatus: 'PENDING' };
    } catch (err) {
      const message = err.message || 'Doctor registration failed.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Refresh profile details
  const refreshProfile = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    login,
    registerPatient,
    registerDoctor,
    refreshProfile,
    logout,
    clearError,
    isAuthenticated: !!user,
    isPatient: user?.role === 'PATIENT',
    isDoctor: user?.role === 'DOCTOR',
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
