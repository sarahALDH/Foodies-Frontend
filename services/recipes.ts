import api from './api';
import { config } from '@/constants/config';
import * as SecureStore from 'expo-secure-store';

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string | null;
  category_id?: string;
  user_id?: string;
  servings?: number;
  cookTime?: number;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface RecipeQueryParams {
  user_id?: string;
  category_id?: string;
}

// Get all recipes (supports query params)
export const getRecipes = async (params?: RecipeQueryParams): Promise<Recipe[]> => {
  const response = await api.get<any>('/api/recipes', { params });
  console.log('Recipes API response:', JSON.stringify(response.data, null, 2));
  
  // Handle different response structures
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  } else if (data?.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data?.recipes && Array.isArray(data.recipes)) {
    return data.recipes;
  } else {
    console.warn('Unexpected recipes response structure:', data);
    return [];
  }
};

// Get recipe by ID
export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await api.get<Recipe>(`/api/recipes/${id}`);
  return response.data;
};

// Create recipe
export const createRecipe = async (data: Partial<Recipe>): Promise<Recipe> => {
  // Check if data contains an image URI (local file path, not a URL)
  const imageUri = data.image;
  const isLocalImage = imageUri && 
    typeof imageUri === 'string' && 
    !imageUri.startsWith('http://') && 
    !imageUri.startsWith('https://') &&
    (imageUri.startsWith('file://') || 
     imageUri.startsWith('content://') || 
     imageUri.startsWith('ph://') ||
     imageUri.startsWith('/'));
  
  if (isLocalImage) {
    // Send as FormData with both recipe fields and image in a single request
    const formData = new FormData();
    const uri = imageUri as string;
    
    // Explicitly append required fields (matching backend pattern)
    if (data.title) formData.append('title', String(data.title));
    if (data.description) formData.append('description', String(data.description));
    if (data.user_id) formData.append('user_id', String(data.user_id));
    if (data.category_id) formData.append('category_id', String(data.category_id));
    
    // Append any other optional fields
    Object.keys(data).forEach((key) => {
      if (key !== 'image' && 
          key !== 'title' && 
          key !== 'description' && 
          key !== 'user_id' && 
          key !== 'category_id' &&
          data[key] !== undefined && 
          data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });
    
    // Add image file - field name must be "image"
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('image', {
      uri: uri,
      name: filename,
      type,
    } as any);
    
    console.log('Sending recipe as FormData with image in single request:', {
      title: data.title,
      description: data.description,
      user_id: data.user_id,
      category_id: data.category_id,
      hasImage: true,
      filename
    });
    
    try {
      // Use fetch API for FormData in React Native
      const token = await SecureStore.getItemAsync('auth_token');
      const url = `${config.API_BASE_URL}/api/recipes`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type - React Native will set it automatically for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP error! status: ${response.status}` };
        }
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Recipe created successfully with image:', responseData);
      return responseData;
    } catch (error: any) {
      console.error('Error creating recipe with FormData:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  } else {
    // No local image, send as regular JSON
    console.log('Sending recipe as JSON (no local image)');
    const response = await api.post<Recipe>('/api/recipes', data);
    return response.data;
  }
};

// Update recipe
export const updateRecipe = async (id: string, data: Partial<Recipe>): Promise<Recipe> => {
  const response = await api.put<Recipe>(`/api/recipes/${id}`, data);
  return response.data;
};

// Delete recipe
export const deleteRecipe = async (id: string): Promise<void> => {
  await api.delete(`/api/recipes/${id}`);
};

// Upload recipe image
export const uploadRecipeImage = async (id: string, imageUri: string): Promise<Recipe> => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  // Use fetch API for FormData in React Native to avoid XMLHttpRequest issues
  const token = await SecureStore.getItemAsync('auth_token');
  const url = `${config.API_BASE_URL}/api/recipes/${id}/image`;
  
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

// Delete recipe image
export const deleteRecipeImage = async (id: string): Promise<void> => {
  await api.delete(`/api/recipes/${id}/image`);
};

