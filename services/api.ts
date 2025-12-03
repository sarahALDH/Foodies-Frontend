import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '@/constants/config';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// Create axios instance
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000, // Increased timeout for network requests
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// Log the base URL for debugging
console.log('Axios instance created with baseURL:', config.API_BASE_URL);

// Token storage keys
const TOKEN_KEY = 'auth_token';

// Request interceptor - Add token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Handle Content-Type based on data type
      if (config.headers) {
        if (config.data instanceof FormData) {
          // For FormData, don't set Content-Type - React Native will set it automatically
          // with the correct multipart/form-data boundary
          delete config.headers['Content-Type'];
          delete config.headers['content-type'];
        } else if (!config.headers['Content-Type'] && !config.headers['content-type']) {
          // For non-FormData, set JSON content type if not already set
          config.headers['Content-Type'] = 'application/json';
        }
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear stored token
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        
        // Redirect to login if not already there
        if (router.canGoBack()) {
          router.replace('/sign-in');
        }
      } catch (clearError) {
        console.error('Error clearing token:', clearError);
      }
    }

    // Format error message for user-friendly display
    let errorMessage = 
      (error.response?.data as any)?.message ||
      (error.response?.data as any)?.error ||
      error.message ||
      'An unexpected error occurred';

    // Handle network errors with more helpful messages
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown';
      errorMessage = `Cannot connect to server at ${config.API_BASE_URL}. Please check:\n\n` +
        `• Your device/emulator is connected to the internet\n` +
        `• The server is running and accessible\n` +
        `• If using Android emulator, try using 10.0.2.2 instead of localhost\n` +
        `• If using physical device, ensure it's on the same network\n` +
        `• Check firewall settings if testing locally`;
      
      console.error('Network Error Details:', {
        baseURL: config.API_BASE_URL,
        url: error.config?.url,
        fullUrl,
        error: error.message,
        code: error.code,
        platform: require('react-native').Platform.OS,
      });
    }

    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

// Helper function to store token
export const storeToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log('Token stored in SecureStore successfully');
    // Verify it was stored
    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (stored === token) {
      console.log('Token verification: Successfully stored and retrieved');
    } else {
      console.warn('Token verification: Stored token does not match!');
    }
  } catch (error) {
    console.error('Error storing token:', error);
    throw error;
  }
};

// Helper function to get token
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    console.log('Token retrieved from SecureStore:', token ? 'Token found' : 'No token');
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// Helper function to remove token
export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
};

export default api;

