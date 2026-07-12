import api from './api';

export const maintenanceService = {
  getAllRequests: (params?: any) => api.get('/maintenance', { params }),
  getMyRequests: () => api.get('/maintenance/my'),
  getStats: () => api.get('/maintenance/stats'),
  getRequestById: (id: string) => api.get(`/maintenance/${id}`),
  raiseRequest: (formData: FormData) => api.post('/maintenance', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  approveOrReject: (id: string, status: string) => api.patch(`/maintenance/${id}/approve`, { status }),
  assignTechnician: (id: string, technicianId: string) => api.patch(`/maintenance/${id}/assign`, { technicianId }),
  startWork: (id: string) => api.patch(`/maintenance/${id}/start`),
  resolveRequest: (id: string, resolutionNotes: string) => api.patch(`/maintenance/${id}/resolve`, { resolutionNotes }),
};

export default maintenanceService;
