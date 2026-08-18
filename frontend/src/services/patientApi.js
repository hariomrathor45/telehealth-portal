import api from './api';

const patientApi = {
  getDashboard: () => api.get('/patients/dashboard'),
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
};

export default patientApi;
