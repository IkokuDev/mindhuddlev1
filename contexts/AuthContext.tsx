import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { CURRENT_USER } from '../constants';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('mindhuddle_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple mock auth - normally would verify password
    let userToLogin = CURRENT_USER;
    
    // Check if we have a stored user that matches the email (simulating DB persistence for demo)
    const storedUser = localStorage.getItem('mindhuddle_user');
    if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.email === email) {
            userToLogin = parsed;
        }
    }

    if (email === userToLogin.email) {
      setUser(userToLogin);
      localStorage.setItem('mindhuddle_user', JSON.stringify(userToLogin));
      return true;
    }
    return false; // Failed login
  };

  const signup = async (name: string, email: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create new user based on signup info
    const newUser: UserProfile = {
      ...CURRENT_USER,
      id: `u${Date.now()}`,
      name,
      email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`
    };
    
    setUser(newUser);
    localStorage.setItem('mindhuddle_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindhuddle_user');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...updates };
        localStorage.setItem('mindhuddle_user', JSON.stringify(updated));
        return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};