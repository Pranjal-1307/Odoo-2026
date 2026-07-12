import api from './api';

export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  signup: (data: any) => api.post('/auth/signup', data),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
};

export default authService;
