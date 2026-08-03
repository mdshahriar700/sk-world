import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  adminToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('sk_admin_token');
  });

  const login = (token: string) => {
    localStorage.setItem('sk_admin_token', token);
    setAdminToken(token);
  };

  const logout = () => {
    localStorage.removeItem('sk_admin_token');
    setAdminToken(null);
  };

  return (
    <AuthContext.Provider value={{ adminToken, login, logout, isAuthenticated: !!adminToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
