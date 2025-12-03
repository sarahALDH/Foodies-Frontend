import api from './api';

export interface Category {
  id: string;
  categoryName?: string;
  name?: string;
  [key: string]: any;
}

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<any>('/api/categories');
  console.log('Categories API response:', JSON.stringify(response.data, null, 2));
  
  // Handle different response structures
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  } else if (data?.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data?.categories && Array.isArray(data.categories)) {
    return data.categories;
  } else {
    console.warn('Unexpected categories response structure:', data);
    return [];
  }
};

// Get category by ID
export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get<Category>(`/api/categories/${id}`);
  return response.data;
};

// Create category
export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const response = await api.post<any>('/api/categories', data);
  const categoryData = response.data?.data || response.data;
  // Map _id to id if needed
  if (categoryData && !categoryData.id && categoryData._id) {
    categoryData.id = categoryData._id;
  }
  return categoryData;
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

