import api from './api';

export interface Category {
  id: string;
  categoryName?: string;
  name?: string;
  [key: string]: any;
}

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/api/categories');
  return response.data;
};

// Get category by ID
export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get<Category>(`/api/categories/${id}`);
  return response.data;
};

// Create category
export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const response = await api.post<Category>('/api/categories', data);
  return response.data;
};

// Update category
export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  const response = await api.put<Category>(`/api/categories/${id}`, data);
  return response.data;
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/api/categories/${id}`);
};

