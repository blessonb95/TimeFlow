import apiClient from './client';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

const encryptPassword = (password: string) => {
  if (!ENCRYPTION_KEY) throw new Error('Password encryption is not configured. Set VITE_ENCRYPTION_KEY for this build.');
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

export interface LoginResponse {
  token: string;
  user: {
    id: string; name: string; firstName: string; lastName: string;
    email: string; role: 'employee' | 'manager'; department: string;
    designation: string; initials: string; color: string; avatar: string; status: string;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login', { email, password: encryptPassword(password) }).then(r => r.data),

  register: (firstName: string, lastName: string, username: string, email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/register', { firstName, lastName, username, email, password: encryptPassword(password) }).then(r => r.data),

  me: () =>
    apiClient.get<LoginResponse['user']>('/auth/me').then(r => r.data),

  checkUsername: (username: string, fullName?: string) =>
    apiClient.post('/auth/check-username', { username, fullName }).then(r => r.data),
};
