import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { clearStoredAuthToken, getStoredAuthToken, storeAuthToken } from '../utils/authTokenStorage';

export const useCurrentUser = () => {
  const { authToken, isGuest } = useAppStore();
  return useQuery({
    queryKey: ['currentUser', authToken],
    queryFn: authApi.me,
    retry: false,
    enabled: Boolean(authToken) && !isGuest && authToken !== 'demo-guest-token',
  });
};

export const useLogin = () => {
  const { setAuthUser } = useAppStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string; remember?: boolean }) => {
      const data = await authApi.login(email, password);
      if (!data || !data.user || !data.token) {
        throw new Error('Invalid response from authentication server. Make sure the backend API is running.');
      }
      return data;
    },
    onSuccess: (data, variables) => {
      qc.clear();
      storeAuthToken(data.token, variables.remember ?? false);
      setAuthUser(data.user, data.token);
      navigate('/dashboard');
    },
  });
};

export const useRegister = () => {
  const { setAuthUser } = useAppStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ firstName, lastName, username, email, password }: { firstName: string; lastName: string; username: string; email: string; password: string }) => {
      const data = await authApi.register(firstName, lastName, username, email, password);
      if (!data || !data.user || !data.token) {
        throw new Error('Invalid response from authentication server. Make sure the backend API is running.');
      }
      return data;
    },
    onSuccess: (data) => {
      qc.clear();
      storeAuthToken(data.token, true);
      setAuthUser(data.user, data.token);
      navigate('/dashboard');
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAppStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return () => {
    clearStoredAuthToken();
    clearAuth();
    qc.clear();
    navigate('/login');
  };
};
