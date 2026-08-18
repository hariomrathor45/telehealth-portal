import api from './api';

const doctorApi = {
  getApprovedDoctors: (params) => api.get('/doctors/approved', { params }),
  getDoctorProfile: (id) => api.get(`/doctors/${id}`),
  getMyDashboard: () => api.get('/doctors/me/dashboard'),
  getMyQueue: () => api.get('/doctors/me/queue'),
  getMyPatients: () => api.get('/doctors/me/patients'),
  getAvailability: () => api.get('/doctors/me/availability'),
  updateAvailability: (schedule) => api.put('/doctors/me/availability', { schedule }),
};

export default doctorApi;
