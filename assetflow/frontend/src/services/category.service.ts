import api from './api';

export const categoryService = {
  getAllCategories: (params?: any) => api.get('/categories', { params }),
  getCategoryById: (id: string) => api.get(`/categories/${id}`),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data),
};

export default categoryService;
