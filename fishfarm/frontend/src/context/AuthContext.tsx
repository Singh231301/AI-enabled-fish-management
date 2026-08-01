import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginForm } from '../types/auth.types';
import { UserSettings } from '../types/settings.types';
import * as authApi from '../api/endpoints/auth.api';
import { settingsApi } from '../api/endpoints/settings.api';
import { setGlobalSettings } from '../stores/settings.store';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userSettings: UserSettings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginForm) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  selectedPondId: string | null;
  setSelectedPondId: (id: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [selectedPondId, setSelectedPondId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('fishfarm_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response.success) {
        setUser(response.data);
        try {
          const settingsRes = await settingsApi.getUserSettings();
          if (settingsRes.success && settingsRes.data) {
            setUserSettings(settingsRes.data);
            setGlobalSettings(settingsRes.data);
            if (settingsRes.data.defaultPondId) {
              setSelectedPondId(prev => prev || settingsRes.data.defaultPondId);
            }
          }
        } catch (settingsError) {
          console.error('Failed to load user settings', settingsError);
        }
      }
    } catch (error) {
      console.error('Failed to load user', error);
      setUser(null);
      setUserSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (data: LoginForm) => {
    try {
      const response = await authApi.login(data);
      if (response.success) {
        localStorage.setItem('fishfarm_token', response.data.token);
        setUser(response.data.user);
        toast.success('Logged in successfully');
        // trigger a settings fetch by calling loadUser, or just fetch directly:
        try {
          const settingsRes = await settingsApi.getUserSettings();
          if (settingsRes.success && settingsRes.data) {
            setUserSettings(settingsRes.data);
            setGlobalSettings(settingsRes.data);
            if (settingsRes.data.defaultPondId) {
              setSelectedPondId(prev => prev || settingsRes.data.defaultPondId);
            }
          }
        } catch (settingsError) {
          console.error('Failed to load user settings after login', settingsError);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('fishfarm_token');
    setUser(null);
    setUserSettings(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userSettings, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout, 
      loadUser, 
      updateUser,
      selectedPondId,
      setSelectedPondId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
