import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'mahasiswa' | 'dosen' | 'konselor' | 'admin';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  dosen_id?: number | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optionally fetch /api/me.php to verify session on load
    // For now we assume if localStorage has user, they are logged in
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Also notify backend to destroy session
    const url = `${import.meta.env.BASE_URL}api/logout.php`.replace(/\/+/g, '/');
    fetch(url).catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
