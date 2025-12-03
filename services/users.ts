import api from './api';
import { config } from '@/constants/config';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  name?: string;
  email: string;
  profileImage?: string | null;
  userProfilePicture?: string | null;
  userName?: string;
  [key: string]: any;
}

// Get all users
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/api/users');
  return response.data;
};

// Get user by ID
export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/api/users/${id}`);
  return response.data;
};

// Create user
export const createUser = async (data: Partial<User>): Promise<User> => {
  const response = await api.post<User>('/api/users', data);
  return response.data;
};

// Update user
export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/api/users/${id}`, data);
  return response.data;
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/api/users/${id}`);
};

// Upload profile image
export const uploadProfileImage = async (id: string, imageUri: string): Promise<User> => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // Backend expects field name 'profileImage' (not 'image')
  formData.append('profileImage', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  // Use fetch API for FormData in React Native to avoid XMLHttpRequest issues
  const token = await SecureStore.getItemAsync('auth_token');
  const url = `${config.API_BASE_URL}/api/users/${id}/profile-image`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      // Don't set Content-Type - React Native will set it automatically for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

// Delete profile image
export const deleteProfileImage = async (id: string): Promise<void> => {
  await api.delete(`/api/users/${id}/profile-image`);
};

