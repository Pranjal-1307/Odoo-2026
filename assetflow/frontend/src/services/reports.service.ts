import api from './api';

export const reportsService = {
  getAssetUtilization: (params?: any) => api.get('/reports/asset-utilization', { params }),
  getMaintenanceReport: (params?: any) => api.get('/reports/maintenance', { params }),
  getDepartmentAllocation: () => api.get('/reports/department-allocation'),
  getBookingHeatmap: (params?: any) => api.get('/reports/booking-heatmap', { params }),
  getAssetLifecycle: () => api.get('/reports/asset-lifecycle'),
};

export default reportsService;
