import api from './api';

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

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  const response = await api.post<User>(`/api/users/${id}/profile-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Delete profile image
export const deleteProfileImage = async (id: string): Promise<void> => {
  await api.delete(`/api/users/${id}/profile-image`);
};

