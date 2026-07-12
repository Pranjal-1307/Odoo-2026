import api from './api';

export const assetService = {
  getAllAssets: (params?: any) => api.get('/assets', { params }),
  getAssetById: (id: string) => api.get(`/assets/${id}`),
  getAssetByTag: (tag: string) => api.get(`/assets/tag/${tag}`),
  getAssetHistory: (id: string) => api.get(`/assets/${id}/history`),
  registerAsset: (formData: FormData) => api.post('/assets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateAsset: (id: string, data: any) => api.put(`/assets/${id}`, data),
  getStats: () => api.get('/assets/stats'),
  searchAssets: (params?: any) => api.get('/assets/search', { params }),
};

export default assetService;
