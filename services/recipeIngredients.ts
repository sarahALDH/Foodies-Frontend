import api from './api';

export interface RecipeIngredient {
  id: string;
  recipe_id?: string;
  ingredient_id?: string;
  quantity?: string | number;
  unit?: string;
  [key: string]: any;
}

export interface RecipeIngredientQueryParams {
  recipe_id?: string;
  ingredient_id?: string;
}

// Get all recipe ingredients (supports query params)
export const getRecipeIngredients = async (params?: RecipeIngredientQueryParams): Promise<RecipeIngredient[]> => {
  const response = await api.get<RecipeIngredient[]>('/api/recipe-ingredients', { params });
  return response.data;
};

// Get recipe ingredient by ID
export const getRecipeIngredientById = async (id: string): Promise<RecipeIngredient> => {
  const response = await api.get<RecipeIngredient>(`/api/recipe-ingredients/${id}`);
  return response.data;
};

// Get all ingredients for a recipe
export const getIngredientsByRecipe = async (recipeId: string): Promise<RecipeIngredient[]> => {
  const response = await api.get<RecipeIngredient[]>(`/api/recipe-ingredients/recipe/${recipeId}`);
  return response.data;
};

// Create recipe ingredient
export const createRecipeIngredient = async (data: Partial<RecipeIngredient>): Promise<RecipeIngredient> => {
  const response = await api.post<RecipeIngredient>('/api/recipe-ingredients', data);
  return response.data;
};

// Update recipe ingredient
export const updateRecipeIngredient = async (id: string, data: Partial<RecipeIngredient>): Promise<RecipeIngredient> => {
  const response = await api.put<RecipeIngredient>(`/api/recipe-ingredients/${id}`, data);
  return response.data;
};

// Delete recipe ingredient
export const deleteRecipeIngredient = async (id: string): Promise<void> => {
  await api.delete(`/api/recipe-ingredients/${id}`);
};

