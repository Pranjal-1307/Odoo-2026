import api from './api';

export const userService = {
  getAllUsers: (params?: any) => api.get('/users', { params }),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  promoteUser: (id: string, role: string) => api.patch(`/users/${id}/promote`, { role }),
  deactivateUser: (id: string) => api.patch(`/users/${id}/deactivate`),
};

export default userService;
