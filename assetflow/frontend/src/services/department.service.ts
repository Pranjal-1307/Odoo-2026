import api from './api';

export const departmentService = {
  getAllDepartments: (params?: any) => api.get('/departments', { params }),
  getDepartmentById: (id: string) => api.get(`/departments/${id}`),
  createDepartment: (data: any) => api.post('/departments', data),
  updateDepartment: (id: string, data: any) => api.put(`/departments/${id}`, data),
  deactivateDepartment: (id: string) => api.patch(`/departments/${id}/deactivate`),
  getHierarchy: () => api.get('/departments/hierarchy'),
};

export default departmentService;
