import api from './api';
import { storeToken, removeToken } from './api';

export interface RegisterData {
  name?: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  profileImage?: string | null;
  [key: string]: any;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  message?: string;
}

// Register new user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register', data);
  
  // If token is returned, store it
  if (response.data.token) {
    await storeToken(response.data.token);
  }
  
  return response.data;
};

// Login user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  
  // If token is returned, store it
  if (response.data.token) {
    await storeToken(response.data.token);
  }
  
  return response.data;
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove token locally
    await removeToken();
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/api/auth/me');
  return response.data;
};

