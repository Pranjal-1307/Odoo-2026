import api from './api';

export const bookingService = {
  getAllBookings: (params?: any) => api.get('/bookings', { params }),
  getMyBookings: () => api.get('/bookings/my'),
  getBookableAssets: () => api.get('/bookings/bookable-assets'),
  getBookingsForAsset: (assetId: string, startDate: string, endDate: string) => api.get(`/bookings/asset/${assetId}`, {
    params: { startDate, endDate }
  }),
  createBooking: (data: any) => api.post('/bookings', data),
  cancelBooking: (id: string) => api.patch(`/bookings/${id}/cancel`),
  rescheduleBooking: (id: string, data: any) => api.patch(`/bookings/${id}/reschedule`, data),
};

export default bookingService;
