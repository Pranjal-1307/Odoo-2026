import api from './api';

export const auditService = {
  getAllCycles: (params?: any) => api.get('/audits', { params }),
  getMyItems: () => api.get('/audits/my-items'),
  getCycleById: (id: string) => api.get(`/audits/${id}`),
  getDiscrepancies: (id: string) => api.get(`/audits/${id}/discrepancies`),
  createCycle: (data: any) => api.post('/audits', data),
  startCycle: (id: string) => api.patch(`/audits/${id}/start`),
  assignAuditors: (id: string, auditorIds: string[]) => api.post(`/audits/${id}/assign-auditors`, { auditorIds }),
  verifyItem: (itemId: string, data: any) => api.patch(`/audits/items/${itemId}/verify`, data),
  closeCycle: (id: string) => api.patch(`/audits/${id}/close`),
};

export default auditService;
