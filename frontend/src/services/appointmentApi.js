import api from './api';

const appointmentApi = {
  bookAppointment: (data) => api.post('/appointments', data),
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, status, reason) => api.patch(`/appointments/${id}/status`, { status, reason }),
};

export default appointmentApi;
