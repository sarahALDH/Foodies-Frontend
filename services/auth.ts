import api from './api';
import { storeToken, removeToken } from './api';

export interface RegisterData {
  username?: string;
  name?: string; // Keep for backward compatibility
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
  // Backend expects username, email, and password
  // Map name to username if username is not provided
  const payload = {
    username: data.username || data.name || data.email.split('@')[0], // Use email prefix as fallback
    email: data.email,
    password: data.password,
  };
  
  const response = await api.post<any>('/api/auth/register', payload);
  
  console.log('Register response:', JSON.stringify(response.data, null, 2));
  
  // Handle different response structures
  const responseData = response.data;
  const token = responseData.token || responseData.data?.token || responseData.accessToken;
  const user = responseData.user || responseData.data?.user || responseData.data;
  
  console.log('Extracted token:', token ? 'Token found' : 'No token');
  console.log('Extracted user:', user ? 'User found' : 'No user');
  
  // If token is returned, store it
  if (token) {
    try {
      await storeToken(token);
      console.log('Token stored successfully');
    } catch (error) {
      console.error('Error storing token:', error);
    }
  } else {
    console.warn('No token in register response!');
  }
  
  return {
    token,
    user,
    message: responseData.message,
  };
};

// Login user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<any>('/api/auth/login', data);
  
  console.log('Login response:', JSON.stringify(response.data, null, 2));
  
  // Handle different response structures
  const responseData = response.data;
  const token = responseData.token || responseData.data?.token || responseData.accessToken;
  const user = responseData.user || responseData.data?.user || responseData.data;
  
  console.log('Extracted token:', token ? 'Token found' : 'No token');
  console.log('Extracted user:', user ? 'User found' : 'No user');
  
  // If token is returned, store it
  if (token) {
    try {
      await storeToken(token);
      console.log('Token stored successfully');
    } catch (error) {
      console.error('Error storing token:', error);
    }
  } else {
    console.warn('No token in login response!');
  }
  
  return {
    token,
    user,
    message: responseData.message,
  };
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
  const response = await api.get<any>('/api/auth/me');
  console.log('getCurrentUser response:', JSON.stringify(response.data, null, 2));
  
  // Handle different response structures
  const responseData = response.data;
  const user = responseData.user || responseData.data?.user || responseData.data || responseData;
  
  // Map _id to id if needed
  if (user && !user.id && user._id) {
    user.id = user._id;
  }
  
  return user;
};

