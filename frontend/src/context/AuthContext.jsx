import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('jk_user')) || null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('jk_token') || null);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('jk_user',  JSON.stringify(userData));
    localStorage.setItem('jk_token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jk_user');
    localStorage.removeItem('jk_token');
  };

  const isLoggedIn = () => !!token;
  const isAdmin    = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
