import { createContext, useContext, useState, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and provides authentication state & actions
 * Token is stored in memory only (not localStorage) for security
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  /**
   * Login action — stores token in memory and attaches to axios defaults
   * @param {{ user, accessToken, refreshToken, isProfileComplete }} data
   */
  const login = useCallback((data) => {
    const { user: userData, accessToken, isProfileComplete: profileComplete } = data;
    setUser(userData);
    setToken(accessToken);
    setIsProfileComplete(profileComplete || false);
    // Attach token to all future axios requests
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }, []);

  /**
   * Logout action — clears all auth state
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsProfileComplete(false);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  /**
   * Update profile completion status (called after profile setup)
   */
  const markProfileComplete = useCallback(() => {
    setIsProfileComplete(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isProfileComplete,
        loading,
        setLoading,
        login,
        logout,
        markProfileComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — hook to access auth context
 * @returns {AuthContext}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
