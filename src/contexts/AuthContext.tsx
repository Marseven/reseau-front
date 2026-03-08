import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginAction, logout as logoutAction } from '@/store/users';
import type { RootState } from '@/store/store';
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
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyTwoFactor: (token: string, code: string, isRecovery?: boolean) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Read auth state from Redux (persisted via redux-persist)
  const reduxUser = useSelector((state: RootState) => state.user.user);
  const reduxToken = useSelector((state: RootState) => state.user.token);
  const reduxIsLogin = useSelector((state: RootState) => state.user.isLogin);
  const rehydrated = useSelector((state: any) => state._persist?.rehydrated ?? false);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Sync user from Redux after rehydration completes
  useEffect(() => {
    if (!rehydrated) return;

    if (reduxIsLogin && reduxUser) {
      setUser(reduxUser as User);
    }
    setLoading(false);
  }, [rehydrated, reduxIsLogin, reduxUser]);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await api.post('/auth/login', { email, password });

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
      dispatch(logoutAction());
    }
  };

  // Authenticated if Redux has a valid login state OR local user is set
  const isAuthenticated = !!(reduxIsLogin && reduxToken) || !!user;

  return (
    <AuthContext.Provider value={{ user, login, verifyTwoFactor, refreshUser, logout, isAuthenticated, loading }}>
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
