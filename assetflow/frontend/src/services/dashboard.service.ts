import api from './api';

export const dashboardService = {
  getKPIs: () => api.get('/dashboard/kpis'),
  getOverdueReturns: () => api.get('/dashboard/overdue-returns'),
  getUpcomingReturns: () => api.get('/dashboard/upcoming-returns'),
  getRecentActivity: (params?: any) => api.get('/dashboard/recent-activity', { params }),
};

export default dashboardService;
