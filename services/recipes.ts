import api from './api';

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
  const response = await api.get<Recipe[]>('/api/recipes', { params });
  return response.data;
};

// Get recipe by ID
export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await api.get<Recipe>(`/api/recipes/${id}`);
  return response.data;
};

// Create recipe
export const createRecipe = async (data: Partial<Recipe>): Promise<Recipe> => {
  const response = await api.post<Recipe>('/api/recipes', data);
  return response.data;
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

  const response = await api.post<Recipe>(`/api/recipes/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Delete recipe image
export const deleteRecipeImage = async (id: string): Promise<void> => {
  await api.delete(`/api/recipes/${id}/image`);
};

