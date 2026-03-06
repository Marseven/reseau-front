import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginAction, logout as logoutAction } from '@/store/users';
import api from '@/axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  two_factor_enabled: boolean;
}

type LoginResult =
  | { success: true }
  | { requires2fa: true; twoFactorToken: string }
  | { success: false };

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  verifyTwoFactor: (token: string, code: string, isRecovery?: boolean) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser && storedToken) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      dispatch(loginAction({ user: parsed, token: storedToken }));
    }
  }, [dispatch]);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const response = await api.post('/auth/login', { username, password });

      if (response.data.status === 200 && response.data.data?.requires_2fa) {
        return {
          requires2fa: true,
          twoFactorToken: response.data.data.two_factor_token,
        };
      }

      if (response.data.status === 200 && response.data.data?.token) {
        const userData = response.data.data.user;
        const token = response.data.data.token;

        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('authToken', token);
        dispatch(loginAction({ user: userData, token }));
        return { success: true };
      }

      return { success: false };
    } catch {
      return { success: false };
    }
  };

  const verifyTwoFactor = async (
    twoFactorToken: string,
    code: string,
    isRecovery = false
  ): Promise<boolean> => {
    try {
      const payload: Record<string, string> = { two_factor_token: twoFactorToken };
      if (isRecovery) {
        payload.recovery_code = code;
      } else {
        payload.code = code;
      }

      const response = await api.post('/auth/2fa/challenge', payload);

      if (response.data.status === 200 && response.data.data?.token) {
        const userData = response.data.data.user;
        const token = response.data.data.token;

        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('authToken', token);
        dispatch(loginAction({ user: userData, token }));
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.status === 200 && response.data.data) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
    } catch {
      // Silently fail
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Token may already be expired
    } finally {
      setUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      dispatch(logoutAction());
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, verifyTwoFactor, refreshUser, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
