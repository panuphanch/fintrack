import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import type { User, LoginInput, RegisterInput } from '../types';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const hasToken = !!localStorage.getItem('token');

  const {
    data: user,
    isLoading: queryLoading,
    error,
    isError,
  } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    enabled: hasToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If there's no token, we're not loading
  // If there's an error (like 401), we're not loading either
  const isLoading = hasToken && queryLoading && !isError;

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginInput) => authApi.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('token');
      queryClient.clear();
      navigate('/login', { replace: true });
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      localStorage.removeItem('token');
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
