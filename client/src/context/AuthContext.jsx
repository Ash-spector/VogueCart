import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginUser, registerUser, getMe } from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'voguecart_token';
const USER_KEY = 'voguecart_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const saveSession = (data) => {
    const { token, ...profile } = data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);
  
  const updateUser = (profile) => {
  const next = { _id: profile._id, name: profile.name, email: profile.email, role: profile.role };
  localStorage.setItem(USER_KEY, JSON.stringify(next));
  setUser(next);
};

  // Verify the stored token when the app loads
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    getMe()
      .then((profile) => {
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
        setUser(profile);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  // api.js fires this when the server says the token is invalid/expired
  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  const login = async (credentials) => saveSession(await loginUser(credentials));
  const register = async (details) => saveSession(await registerUser(details));

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);