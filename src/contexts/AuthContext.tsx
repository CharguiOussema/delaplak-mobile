import React, { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { authService } from '../services/AuthService';
import { apiService } from '../services/api';
import { tokenStorage } from '../services/tokenStorage';
import { queryKeys } from '../services/QueryClientManager';
import { User } from '../models';

interface AuthContextType {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isUserLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // Cold start: is there already a token in SecureStore from a previous session?
  useEffect(() => {
    (async () => {
      const token = await tokenStorage.getAccessToken();
      setIsAuthenticated(!!token);
      setIsBootstrapping(false);
    })();
  }, []);

  const handleLoggedOut = useCallback(() => {
    setIsAuthenticated(false);
    queryClient.clear();
  }, [queryClient]);

  // The API layer's 401-after-failed-refresh path calls this to force the app back to Login.
  useEffect(() => {
    apiService.setUnauthorizedHandler(handleLoggedOut);
    return () => apiService.setUnauthorizedHandler(null);
  }, [handleLoggedOut]);

  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery<User>({
    queryKey: [queryKeys.CURRENT_USER],
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5,
    onError: () => handleLoggedOut(),
  });

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
    setIsAuthenticated(true);
    await queryClient.invalidateQueries(queryKeys.CURRENT_USER);
  };

  const signup = async (email: string, password: string) => {
    await authService.signup(email, password);
    setIsAuthenticated(true);
    await queryClient.invalidateQueries(queryKeys.CURRENT_USER);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      handleLoggedOut();
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isBootstrapping,
    isUserLoading,
    user: user ?? null,
    login,
    signup,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
