import * as React from 'react';
import { portalAuth } from '../services/api';

const AuthContext = React.createContext(null);

const TOKEN_KEY = 'opease:portal-token';

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [permissions, setPermissions] = React.useState([]);
  const [depots, setDepots] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const isAuthenticated = !!user;
  const isSuperAdmin = !!user?.isSuperAdmin;

  const hasPermission = React.useCallback((pageKey) => {
    if (isSuperAdmin) return true;
    return permissions.includes(pageKey);
  }, [permissions, isSuperAdmin]);

  const login = React.useCallback(async (email, password) => {
    const res = await portalAuth.login({ email, password });
    localStorage.setItem(TOKEN_KEY, res.token);
    // Also set the general token so API calls work
    localStorage.setItem('opease:token', res.token);
    setUser(res.user);
    // Fetch full permissions
    const meRes = await portalAuth.me();
    setPermissions(meRes.permissions || []);
    setDepots(meRes.depots || []);
    return res;
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('opease:token');
    setUser(null);
    setPermissions([]);
    setDepots([]);
  }, []);

  // Check existing token on mount
  React.useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    localStorage.setItem('opease:token', token);
    portalAuth.me()
      .then((res) => {
        setUser(res.user);
        setPermissions(res.permissions || []);
        setDepots(res.depots || []);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('opease:token');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, permissions, depots, loading, isAuthenticated, isSuperAdmin, hasPermission, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
