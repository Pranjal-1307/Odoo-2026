import api from './api';

export const allocationService = {
  getAllAllocations: (params?: any) => api.get('/allocations', { params }),
  getMyAllocations: () => api.get('/allocations/my'),
  getOverdueAllocations: () => api.get('/allocations/overdue'),
  getPendingTransfers: () => api.get('/allocations/transfers/pending'),
  allocateAsset: (data: any) => api.post('/allocations/allocate', data),
  returnAsset: (id: string, data: any) => api.patch(`/allocations/${id}/return`, data),
  requestTransfer: (data: any) => api.post('/allocations/transfer', data),
  resolveTransfer: (id: string, status: string) => api.patch(`/allocations/transfer/${id}/resolve`, { status }),
};

export default allocationService;
