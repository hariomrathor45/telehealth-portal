import api from './api';

const authService = {
  // Patient registration
  registerPatient: (data) => api.post('/auth/register/patient', data),

  // Doctor registration (starts in PENDING status)
  registerDoctor: (data) => api.post('/auth/register/doctor', data),

  // Login (supports role verification)
  login: (credentials) => api.post('/auth/login', credentials),

  // Refresh access token
  refreshToken: (token) => api.post('/auth/refresh-token', { refreshToken: token }),

  // Get current user profile
  getMe: () => api.get('/auth/me'),

  // Get active medical specializations
  getSpecializations: () => api.get('/auth/specializations'),

  // Admin one-time setup
  setupAdmin: (data) => api.post('/auth/setup-admin', data),
};

export default authService;
