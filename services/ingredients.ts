import api from './api';

export interface Ingredient {
  id: string;
  name?: string;
  ingredientName?: string;
  [key: string]: any;
}

// Get all ingredients
export const getIngredients = async (): Promise<Ingredient[]> => {
  const response = await api.get<Ingredient[]>('/api/ingredients');
  return response.data;
};

// Get ingredient by ID
export const getIngredientById = async (id: string): Promise<Ingredient> => {
  const response = await api.get<Ingredient>(`/api/ingredients/${id}`);
  return response.data;
};

// Create ingredient
export const createIngredient = async (data: Partial<Ingredient>): Promise<Ingredient> => {
  const response = await api.post<Ingredient>('/api/ingredients', data);
  return response.data;
};

// Update ingredient
export const updateIngredient = async (id: string, data: Partial<Ingredient>): Promise<Ingredient> => {
  const response = await api.put<Ingredient>(`/api/ingredients/${id}`, data);
  return response.data;
};

// Delete ingredient
export const deleteIngredient = async (id: string): Promise<void> => {
  await api.delete(`/api/ingredients/${id}`);
};

