import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'localsports_auth';

function readPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writePersisted({ accessToken, user, isProfileComplete }) {
  if (!accessToken || !user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken,
      user,
      isProfileComplete: !!isProfileComplete,
    })
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const isAuthenticated = !!token;

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsProfileComplete(false);
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback((data) => {
    const { user: userData, accessToken, isProfileComplete: profileComplete } = data;
    setUser(userData);
    setToken(accessToken);
    setIsProfileComplete(!!profileComplete);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    writePersisted({
      accessToken,
      user: userData,
      isProfileComplete: !!profileComplete,
    });
  }, []);

  const markProfileComplete = useCallback(() => {
    setIsProfileComplete(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const saved = readPersisted();
      if (!saved?.accessToken || !saved?.user) {
        if (!cancelled) setAuthReady(true);
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${saved.accessToken}`;
      setToken(saved.accessToken);
      setUser(saved.user);
      setIsProfileComplete(!!saved.isProfileComplete);

      try {
        const me = await api.get('/auth/me');
        if (cancelled) return;
        setUser(me.data.data.user);
        try {
          const prof = await api.get('/profile/me');
          if (cancelled) return;
          if (prof.data.data && typeof prof.data.data.isProfileComplete === 'boolean') {
            setIsProfileComplete(prof.data.data.isProfileComplete);
          }
        } catch {
          // profile might be unavailable briefly; leave flag from saved login
        }
      } catch {
        if (!cancelled) {
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
          setIsProfileComplete(false);
          localStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token || !user) return;
    writePersisted({ accessToken: token, user, isProfileComplete });
  }, [token, user, isProfileComplete]);

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
        authReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
